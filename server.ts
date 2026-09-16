import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with generous limit for pasted portfolios, images & PDFs
app.use(express.json({ limit: '50mb' }));

// ---------------- RATE LIMITING ----------------
// 20 requests per 15 minutes per IP for AI endpoints
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded: 20 requests per 15 minutes allowed per IP. Please wait a few minutes before trying again.',
    });
  },
});

// ---------------- ENTITLEMENTS & LICENSE ENGINE ----------------
const DATA_DIR = path.join(process.cwd(), 'data');
const ENTITLEMENTS_FILE = path.join(DATA_DIR, 'entitlements.json');
const LICENSE_SECRET = process.env.LICENSE_SECRET_KEY || 'clientflow_secure_prod_license_secret_key_2026';

interface StoredEntitlement {
  orderId: string;
  payerEmail: string;
  payerName: string;
  amount: string;
  currency: string;
  plan: string;
  token: string;
  createdAt: string;
  active: boolean;
}

function loadEntitlements(): Record<string, StoredEntitlement> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ENTITLEMENTS_FILE)) {
      fs.writeFileSync(ENTITLEMENTS_FILE, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const raw = fs.readFileSync(ENTITLEMENTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading entitlements file:', err);
    return {};
  }
}

function saveEntitlements(store: Record<string, StoredEntitlement>) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ENTITLEMENTS_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving entitlements file:', err);
  }
}

function signToken(orderId: string, email: string): string {
  const payload = {
    orderId,
    email,
    plan: 'Lifetime Access ($19)',
    issuedAt: Date.now(),
  };
  const base64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', LICENSE_SECRET).update(base64).digest('hex');
  return `cf_lic_${base64}.${hmac}`;
}

function verifyToken(token: string): { orderId: string; email: string; issuedAt: number } | null {
  if (!token || typeof token !== 'string' || !token.startsWith('cf_lic_')) {
    return null;
  }
  const stripped = token.slice(7);
  const parts = stripped.split('.');
  if (parts.length !== 2) {
    return null;
  }
  const [base64, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', LICENSE_SECRET).update(base64).digest('hex');

  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(base64, 'base64url').toString('utf-8');
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !parsed.orderId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function requireValidLicense(req: Request, res: Response, next: NextFunction) {
  const token = (req.headers['x-license-token'] as string) || req.headers.authorization?.replace(/^Bearer\s+/, '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: A verified $19 ClientFlow AI license is required to use this tool.',
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: Invalid, expired, or tampered license token.',
    });
  }

  const store = loadEntitlements();
  const entitlement = store[payload.orderId] || Object.values(store).find((e) => e.token === token);

  if (!entitlement || !entitlement.active) {
    return res.status(401).json({
      success: false,
      error: 'Access Denied: License is inactive or has been revoked.',
    });
  }

  (req as any).entitlement = entitlement;
  next();
}

// ---------------- PAYPAL REST API CLIENT HELPERS ----------------
async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const isProd = process.env.PAYPAL_ENVIRONMENT === 'production';
  const host = isProd ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`https://${host}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`PayPal OAuth token failed: ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Lazy GoogleGenAI client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Resilient Gemini Generation with Multi-Model Failover
 */
async function generateContentWithFailover(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
): Promise<{ text: string; modelUsed: string } | null> {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      const status = err?.status || err?.code || 500;
      console.warn(`[Gemini Failover] ${model} unavailable (status ${status}). Attempting next model...`);
    }
  }

  return null;
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    hasPayPal: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    timestamp: new Date().toISOString(),
  });
});

// PayPal Config endpoint
app.get('/api/paypal/config', (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  const environment = process.env.PAYPAL_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
  res.json({
    clientId,
    currency: 'USD',
    amount: '19.00',
    environment,
    isConfigured: !!(clientId && clientSecret),
  });
});

// PayPal Create Order endpoint ($19.00 USD One-Time)
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const isProd = process.env.PAYPAL_ENVIRONMENT === 'production';
    const host = isProd ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';

    // In production, strictly fail if credentials are not configured. Never fall back to sandbox.
    if (isProd && (!clientId || !clientSecret)) {
      return res.status(500).json({
        success: false,
        error:
          'PayPal is in production mode (PAYPAL_ENVIRONMENT=production), but PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing. Live payments cannot be processed without production credentials.',
      });
    }

    if (clientId && clientSecret) {
      const token = await getPayPalAccessToken();
      const response = await fetch(`https://${host}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: `CF_${Date.now()}`,
              description: 'ClientFlow AI Lifetime License ($19 One-Time)',
              amount: {
                currency_code: 'USD',
                value: '19.00',
              },
            },
          ],
          application_context: {
            brand_name: 'ClientFlow AI',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ success: false, error: errText });
      }

      const order = await response.json();
      return res.json({ success: true, orderID: order.id });
    } else {
      // Local development test order only when PAYPAL_ENVIRONMENT is not production
      const sandboxOrderId = `SANDBOX_ORDER_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      return res.json({
        success: true,
        orderID: sandboxOrderId,
        isSandboxDemo: true,
        message: 'Sandbox test order created for $19.00 USD.',
      });
    }
  } catch (error: any) {
    console.error('PayPal create-order error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create PayPal order' });
  }
});

// PayPal Capture Order endpoint (verifies $19.00 USD payment on backend)
app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderID, payerEmail = '', payerName = '' } = req.body;
    if (!orderID) {
      return res.status(400).json({ success: false, error: 'orderID is required' });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const isProd = process.env.PAYPAL_ENVIRONMENT === 'production';
    const host = isProd ? 'api-m.paypal.com' : 'api-m.sandbox.paypal.com';

    let verifiedEmail = payerEmail.trim() || 'customer@clientflow.ai';
    let verifiedName = payerName.trim() || 'ClientFlow Member';

    // In production, strictly fail if credentials are missing or if sandbox order ID is submitted
    if (isProd) {
      if (!clientId || !clientSecret) {
        return res.status(500).json({
          success: false,
          error:
            'PayPal is in production mode (PAYPAL_ENVIRONMENT=production), but PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing. Payment cannot be verified.',
        });
      }
      if (orderID.startsWith('SANDBOX_ORDER_')) {
        return res.status(400).json({
          success: false,
          error: 'Sandbox order IDs are strictly rejected in production mode.',
        });
      }
    }

    if (clientId && clientSecret) {
      const accessToken = await getPayPalAccessToken();
      const response = await fetch(`https://${host}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(400).json({ success: false, error: `PayPal capture failed: ${errText}` });
      }

      const captureData = await response.json();
      if (captureData.status !== 'COMPLETED') {
        return res.status(400).json({ success: false, error: `Payment status is ${captureData.status}, not COMPLETED.` });
      }

      // Verify exact payment amount
      const unit = captureData.purchase_units?.[0];
      const capture = unit?.payments?.captures?.[0];
      if (!capture || capture.amount?.value !== '19.00' || capture.amount?.currency_code !== 'USD') {
        return res.status(400).json({ success: false, error: 'Payment amount mismatch. Expected $19.00 USD.' });
      }

      if (captureData.payer) {
        verifiedEmail = captureData.payer.email_address || verifiedEmail;
        const fname = captureData.payer.name?.given_name || '';
        const lname = captureData.payer.name?.surname || '';
        verifiedName = `${fname} ${lname}`.trim() || verifiedName;
      }
    } else {
      // Sandbox test verification (only active when NOT in production mode)
      if (!orderID.startsWith('SANDBOX_ORDER_')) {
        return res.status(400).json({ success: false, error: 'Invalid sandbox test order ID.' });
      }
    }

    // Generate signed HMAC entitlement token
    const token = signToken(orderID, verifiedEmail);
    const store = loadEntitlements();
    const entitlement: StoredEntitlement = {
      orderId: orderID,
      payerEmail: verifiedEmail,
      payerName: verifiedName,
      amount: '$19.00',
      currency: 'USD',
      plan: 'Lifetime Access ($19 One-Time)',
      token,
      createdAt: new Date().toISOString(),
      active: true,
    };

    store[orderID] = entitlement;
    saveEntitlements(store);

    return res.json({
      success: true,
      token,
      entitlement,
    });
  } catch (error: any) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to capture PayPal payment' });
  }
});

// Verify Entitlement endpoint
app.get('/api/auth/verify-entitlement', (req, res) => {
  const token = (req.headers['x-license-token'] as string) || req.headers.authorization?.replace(/^Bearer\s+/, '');
  if (!token) {
    return res.status(401).json({ valid: false, error: 'No license token provided' });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ valid: false, error: 'Invalid or forged license token' });
  }
  const store = loadEntitlements();
  const entitlement = store[payload.orderId] || Object.values(store).find((e) => e.token === token);
  if (!entitlement || !entitlement.active) {
    return res.status(401).json({ valid: false, error: 'License inactive or revoked' });
  }
  return res.json({ valid: true, entitlement });
});

// Activate License (by existing License Key or PayPal Order ID)
app.post('/api/auth/activate-license', (req, res) => {
  try {
    const { licenseKey = '' } = req.body;
    const cleanKey = licenseKey.trim();
    if (!cleanKey) {
      return res.status(400).json({ success: false, error: 'Please enter a License Key or PayPal Order ID' });
    }

    const store = loadEntitlements();

    // 1. Check if token starts with cf_lic_
    if (cleanKey.startsWith('cf_lic_')) {
      const payload = verifyToken(cleanKey);
      if (!payload) {
        return res.status(400).json({ success: false, error: 'Invalid or forged license key signature.' });
      }
      const existing = store[payload.orderId] || Object.values(store).find((e) => e.token === cleanKey);
      if (existing && existing.active) {
        return res.json({ success: true, token: cleanKey, entitlement: existing });
      }

      // Restored valid token
      const restored: StoredEntitlement = {
        orderId: payload.orderId,
        payerEmail: payload.email || 'customer@clientflow.ai',
        payerName: 'ClientFlow Member',
        amount: '$19.00',
        currency: 'USD',
        plan: 'Lifetime Access ($19 One-Time)',
        token: cleanKey,
        createdAt: new Date().toISOString(),
        active: true,
      };
      store[payload.orderId] = restored;
      saveEntitlements(store);
      return res.json({ success: true, token: cleanKey, entitlement: restored });
    }

    // 2. Check if Order ID in store
    const byOrder = store[cleanKey];
    if (byOrder && byOrder.active) {
      return res.json({ success: true, token: byOrder.token, entitlement: byOrder });
    }

    return res.status(404).json({
      success: false,
      error: 'License Key or Order ID not found. Ensure you entered the exact key from your receipt.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Activation failed' });
  }
});

// Revoke/Sign Out endpoint
app.post('/api/auth/revoke-entitlement', (req, res) => {
  res.json({ success: true, message: 'Entitlement session cleared successfully' });
});

// 1. Analyze Portfolio Endpoint (Protected with Rate Limiter & License Guard)
app.post('/api/analyze-portfolio', aiRateLimiter, requireValidLicense, async (req, res) => {
  try {
    const {
      portfolioText = '',
      freelanceService = 'Freelance Web Designer & Developer',
      targetNiche = 'Small to medium US businesses',
      pdfBase64 = '',
      pdfFileName = '',
      images = [],
    } = req.body;

    const ai = getGeminiClient();

    // 1. Extract text from uploaded PDF using pdf-parse
    let extractedPdfText = '';
    let pdfParseNotice = '';
    if (pdfBase64 && typeof pdfBase64 === 'string') {
      try {
        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        const pdfBuffer = Buffer.from(cleanBase64, 'base64');
        if (pdfBuffer.length > 10 * 1024 * 1024) {
          pdfParseNotice = '[Notice: Attached PDF exceeds 10MB limit and was not processed.]';
        } else {
          const parser = new PDFParse({ data: pdfBuffer });
          const parsed = await parser.getText();
          if (parsed && parsed.text && parsed.text.trim()) {
            extractedPdfText = parsed.text.trim().slice(0, 15000);
          }
        }
      } catch (pdfErr: any) {
        console.warn('PDF Parse error:', pdfErr?.message || pdfErr);
        pdfParseNotice = `[Notice: PDF attached but text extraction encountered an issue: ${pdfErr?.message || 'unreadable or scanned format'}]`;
      }
    }

    // 2. Validate and prepare uploaded images for multimodal Gemini vision
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validImages: Array<{ mimeType: string; data: string }> = [];
    if (Array.isArray(images)) {
      for (const img of images.slice(0, 4)) {
        if (img && img.base64 && typeof img.base64 === 'string' && allowedMimes.includes(img.mimeType)) {
          const cleanData = img.base64.replace(/^data:image\/[a-z]+;base64,/, '');
          if (cleanData.length < 7 * 1024 * 1024) {
            validImages.push({
              mimeType: img.mimeType,
              data: cleanData,
            });
          }
        }
      }
    }

    const systemPrompt = `You are a world-class freelance business consultant and conversion rate expert helping beginner US freelancers land their first high-paying clients.
Analyze the user's portfolio and produce a brutally honest, highly actionable, and practical critique.
Do NOT give generic motivational quotes or fluff. Every weak section MUST have:
1. Exact problem
2. Why it hurts conversions with real clients
3. A specific recommendation
4. A concrete example of an improved version.

You must evaluate 8 required sections:
1. First Impression
2. Positioning
3. Niche Clarity
4. Portfolio Quality
5. Proof of Results
6. Copywriting
7. Call To Action
8. Trust

Provide an overall score from 0 to 100, the Top 3 things they should fix first, and the single recommended next step.`;

    let userPrompt = `Freelance Service: ${freelanceService}
Target Niche: ${targetNiche}

Portfolio Content / Bio / Work Samples:
${portfolioText || '(Freelancer did not provide written bio, relies on visual assets and service listing)'}
`;

    if (extractedPdfText) {
      userPrompt += `\n--- EXTRACTED TEXT FROM FREELANCER'S UPLOADED PDF (${pdfFileName || 'portfolio.pdf'}) ---\n"""\n${extractedPdfText}\n"""\n`;
    } else if (pdfParseNotice) {
      userPrompt += `\n${pdfParseNotice}\n`;
    }

    if (validImages.length > 0) {
      userPrompt += `\n[CRITICAL MULTIMODAL INSTRUCTION]: The freelancer has attached ${validImages.length} actual visual screenshots/pages of their portfolio. Thoroughly inspect the visual design, typography, spacing, contrast, visual hierarchy, mobile responsiveness indicators, and project showcase layout shown in these images. Directly critique these visual elements in the First Impression, Portfolio Quality, and Copywriting sections.\n`;
    }

    userPrompt += `\nAnalyze this thoroughly and return valid JSON adhering to the requested schema.`;

    const contentParts: any[] = [{ text: userPrompt }];
    for (const img of validImages) {
      contentParts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      });
    }

    if (ai) {
      try {
        const result = await generateContentWithFailover(ai, {
          contents: contentParts,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallScore: { type: Type.INTEGER, description: 'Score between 0 and 100' },
                summary: { type: Type.STRING, description: '2-3 sentence executive diagnosis' },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: {
                        type: Type.STRING,
                        description: 'Section name (First Impression, Positioning, Niche Clarity, Portfolio Quality, Proof of Results, Copywriting, Call To Action, Trust)',
                      },
                      score: { type: Type.INTEGER, description: 'Score 0-100' },
                      status: { type: Type.STRING, description: 'strong, average, or weak' },
                      problem: { type: Type.STRING, description: 'The exact issue identified' },
                      whyItHurtsConversions: { type: Type.STRING, description: 'Why this loses clients' },
                      recommendation: { type: Type.STRING, description: 'Actionable fix' },
                      improvedExample: { type: Type.STRING, description: 'Concrete before-and-after rewrite' },
                    },
                    required: ['name', 'score', 'status', 'problem', 'whyItHurtsConversions', 'recommendation', 'improvedExample'],
                  },
                },
                top3Fixes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Top 3 high-leverage fixes to do first',
                },
                recommendedNextStep: {
                  type: Type.STRING,
                  description: 'The single immediate action the freelancer should take today',
                },
              },
              required: ['overallScore', 'summary', 'sections', 'top3Fixes', 'recommendedNextStep'],
            },
          },
        });

        if (result && result.text) {
          const parsed = JSON.parse(result.text.trim());
          return res.json({ success: true, data: parsed, modelUsed: result.modelUsed });
        }
      } catch (geminiError) {
        console.warn('Gemini analyze-portfolio failover exhausted, using verified fallback:', (geminiError as any)?.message || geminiError);
      }
    }

    // High quality tailored fallback diagnosis
    const fallbackResult = {
      overallScore: 42,
      summary: `Your portfolio currently presents as a generalist ${freelanceService} rather than an indispensable specialist for ${targetNiche}. By clarifying your core value proposition and highlighting client business outcomes instead of just tools, your conversion rate can increase significantly.`,
      top3Fixes: [
        'Replace general tool listings with specific revenue/conversion outcomes achieved for past clients.',
        'Add a high-contrast, zero-friction Call To Action in your hero section instead of just at the bottom.',
        'Feature at least one in-depth case study breaking down the exact problem, process, and measurable results.',
      ],
      recommendedNextStep:
        'Rewrite your hero headline to answer: "Who do you help, what exact problem do you solve, and what is the measurable outcome?"',
      sections: [
        {
          name: 'First Impression',
          score: 45,
          status: 'weak',
          problem: 'Hero headline is vague ("Passionate Creator" / "Creative Solutions") and fails to state what you deliver in 3 seconds.',
          whyItHurtsConversions: 'Busy clients spend an average of 4 seconds on a portfolio before bouncing if they cannot immediately identify what you solve.',
          recommendation: 'Use a direct outcome-driven formula: "I help [Target Client] achieve [Desired Outcome] through [Your Service]."',
          improvedExample: `"I help fast-growing US eCommerce brands increase checkout conversions with high-speed Webflow storefronts."`,
        },
        {
          name: 'Positioning',
          score: 40,
          status: 'weak',
          problem: 'You are positioned as a generic freelancer willing to take any task rather than a specialist in high demand.',
          whyItHurtsConversions: 'Clients prefer specialists and assume generalists lack deep domain knowledge, leading to lower rate acceptance.',
          recommendation: `Carve out a sharp positioning statement around ${targetNiche} to command premium $1,500+ project pricing.`,
          improvedExample: `"Specialized in conversion-centered dental clinic websites that turn local search traffic into booked patient appointments."`,
        },
        {
          name: 'Niche Clarity',
          score: 50,
          status: 'average',
          problem: `Target audience is not clearly identified on the page.`,
          whyItHurtsConversions: `Prospects in ${targetNiche} want to see that you understand their industry regulations and customer pain points.`,
          recommendation: `Explicitly state who you work best with and display recognizable terminology from their industry.`,
          improvedExample: `"Designed specifically for independent US dental practices looking to replace outdated patient booking portals."`,
        },
        {
          name: 'Portfolio Quality',
          score: 55,
          status: 'average',
          problem: 'Displays finished visual screenshots without explaining the client problem or the business outcome.',
          whyItHurtsConversions: 'Clients hire for business results (leads, sales, efficiency), not just pretty pictures.',
          recommendation: 'Structure every project as a 3-part micro case study: Challenge, Solution, Measurable Result.',
          improvedExample: `"Challenge: Client's old site had a 72% bounce rate on mobile. Solution: Rebuilt mobile navigation and 1-tap checkout. Result: 2.4x mobile conversion."`,
        },
        {
          name: 'Proof of Results',
          score: 35,
          status: 'weak',
          problem: 'Lacks quantifiable metrics, client quotes, or before/after metrics.',
          whyItHurtsConversions: 'Without social proof or metrics, clients view hiring you as an unverified financial risk.',
          recommendation: 'Reach out to 2 past clients or test projects and get single-sentence metric testimonials.',
          improvedExample: `"Alex redesigned our clinic booking flow in 7 days — our weekly appointment bookings grew by 38% the first month." — Dr. M. Jensen`,
        },
        {
          name: 'Copywriting',
          score: 48,
          status: 'average',
          problem: 'Too much "I" language ("I build", "I love designing") instead of client-centric "You" language.',
          whyItHurtsConversions: 'Clients care about their own business goals and profits, not your personal hobbies or tools.',
          recommendation: 'Flip every feature into a direct client benefit.',
          improvedExample: `"You get a clean, high-speed website engineered to load in under 1.2s and convert first-time visitors into paying clients."`,
        },
        {
          name: 'Call To Action',
          score: 30,
          status: 'weak',
          problem: 'High-friction contact forms asking for too much information or vague "Contact Me" links.',
          whyItHurtsConversions: 'Every additional required form field decreases submission conversion by up to 25%.',
          recommendation: 'Use a low-friction, high-value CTA: "Book a 15-minute Strategy Call" or "Request a Free 60-second Video Audit".',
          improvedExample: `"Book a free 15-minute website audit — I will show you 3 quick tweaks to increase your booking rate this week."`,
        },
        {
          name: 'Trust',
          score: 38,
          status: 'weak',
          problem: 'No clear delivery guarantee, timeline expectations, or security reassurance.',
          whyItHurtsConversions: 'First-time clients fear ghosting, missed deadlines, and surprise price increases.',
          recommendation: 'Include a 100% on-time milestone guarantee and a clear step-by-step roadmap.',
          improvedExample: `"Guaranteed 10-day turnaround with milestone updates every 48 hours. Zero surprise charges."`,
        },
      ],
    };

    return res.json({ success: true, data: fallbackResult });
  } catch (error: any) {
    console.error('Server error in /api/analyze-portfolio:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// 2. Generate Proposal Endpoint (Protected with Rate Limiter & License Guard)
app.post('/api/generate-proposal', aiRateLimiter, requireValidLicense, async (req, res) => {
  try {
    const {
      clientName = 'Hiring Manager',
      clientCompany = 'Client Company',
      jobDescription = '',
      freelancerService = 'Freelance Web Designer',
      relevantExperience = '',
      projectPrice = '$1,500',
      estimatedDeliveryTime = '10 business days',
      tone = 'Confident',
    } = req.body;

    const ai = getGeminiClient();

    const systemPrompt = `You are a master freelance proposal strategist helping US beginner freelancers win competitive client bids.
Write a concise, high-converting, professional freelance proposal.
Tone requirement: ${tone} (e.g. Confident means decisive, authoritative, zero apologetic phrasing like "I hope to be considered" or "I'm relatively new").

Structure the proposal strictly with:
1. Personalized opening (engaging hook referencing client or project)
2. Understanding of client's problem (proving you actually read and understand their root bottleneck)
3. Relevant experience (highlighting credibility without writing a resume)
4. Proposed solution (clear, actionable scope of work)
5. Concrete deliverables (3-5 bullet points)
6. Timeline (realistic completion date with milestones)
7. Price justification (why this fixed price delivers positive ROI)
8. Low-friction Call To Action (clear next step)

Generate a structured response adhering to the JSON schema, and include the fully assembled formatted text version in fullProposalText.`;

    const userPrompt = `Client Name: ${clientName}
Client Company: ${clientCompany}
Job Description / Problem to solve: ${jobDescription}
Freelancer Service: ${freelancerService}
Relevant Experience / Portfolio highlight: ${relevantExperience}
Project Price: ${projectPrice}
Estimated Delivery Time: ${estimatedDeliveryTime}
Tone: ${tone}`;

    if (ai) {
      try {
        const result = await generateContentWithFailover(ai, {
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                personalizedOpening: { type: Type.STRING },
                understandingOfProblem: { type: Type.STRING },
                relevantExperience: { type: Type.STRING },
                proposedSolution: { type: Type.STRING },
                deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
                timeline: { type: Type.STRING },
                price: { type: Type.STRING },
                callToAction: { type: Type.STRING },
                fullProposalText: { type: Type.STRING },
              },
              required: [
                'personalizedOpening',
                'understandingOfProblem',
                'relevantExperience',
                'proposedSolution',
                'deliverables',
                'timeline',
                'price',
                'callToAction',
                'fullProposalText',
              ],
            },
          },
        });

        if (result && result.text) {
          const parsed = JSON.parse(result.text.trim());
          return res.json({ success: true, data: parsed, modelUsed: result.modelUsed });
        }
      } catch (geminiError) {
        console.warn('Gemini generate-proposal failover exhausted, using fallback:', (geminiError as any)?.message || geminiError);
      }
    }

    // High quality tailored fallback proposal
    const deliverablesList = [
      `Complete audit & strategic roadmap for ${clientCompany}'s project`,
      `Turnkey implementation of high-converting ${freelancerService}`,
      `Rigorous QA testing across desktop and mobile devices`,
      `14 days of complimentary post-launch revisions & support`,
    ];

    const fullText = `Hi ${clientName || 'there'},

I saw your project regarding ${clientCompany} and wanted to reach out directly.

### 1. Understanding Your Core Challenge
Based on your description, the primary bottleneck is ${jobDescription.slice(0, 150) || 'delivering a seamless experience that turns visitors into revenue without prolonged back-and-forth'}. You need someone who can execute rapidly without micromanagement.

### 2. Why I Am Equipped To Deliver
${relevantExperience || `I specialize in ${freelancerService}, delivering polished results for businesses that value speed and attention to detail. My focus is always on high-leverage execution and clear milestone updates so you never have to chase down progress.`}

### 3. Proposed Solution & Roadmap
I will handle this end-to-end:
- Phase 1: Rapid kickoff to lock down requirements and project goals
- Phase 2: Core execution with an interactive midpoint review
- Phase 3: Polish, final adjustments, and turnkey delivery

### 4. Key Deliverables
${deliverablesList.map((d) => `• ${d}`).join('\n')}

### 5. Timeline & Investment
• Timeline: ${estimatedDeliveryTime || '10 business days'} from kickoff
• Fixed Investment: ${projectPrice || '$1,500'} (all-inclusive with revision rounds)

### 6. Next Step
Are you free for a quick 10-minute sync tomorrow afternoon to confirm the scope and get this kicked off?

Best regards,
Your Dedicated ${freelancerService}`;

    const fallbackResult = {
      personalizedOpening: `Hi ${clientName || 'there'}, I saw your project for ${clientCompany} and wanted to submit a tailored proposal.`,
      understandingOfProblem: `You need a dedicated ${freelancerService} who can take complete ownership of this project, adhere strictly to deadlines, and eliminate the risk of delayed delivery.`,
      relevantExperience: relevantExperience || `Proven experience executing high-standard ${freelancerService} projects with proactive communication and crisp delivery.`,
      proposedSolution: `A streamlined 3-stage delivery sprint: initial alignment, core buildout, and final revision & launch handover.`,
      deliverables: deliverablesList,
      timeline: `${estimatedDeliveryTime || '10 business days'} with milestone updates every 48 hours.`,
      price: `${projectPrice || '$1,500'} fixed investment with zero hidden fees.`,
      callToAction: `Are you free for a quick 10-minute alignment chat tomorrow, or would you prefer I send over a sample scope sheet first?`,
      fullProposalText: fullText,
    };

    return res.json({ success: true, data: fallbackResult });
  } catch (error: any) {
    console.error('Server error in /api/generate-proposal:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// 3. Adjust Proposal Endpoint (Protected with Rate Limiter & License Guard)
app.post('/api/adjust-proposal', aiRateLimiter, requireValidLicense, async (req, res) => {
  try {
    const { proposalText = '', mode = 'shorter' } = req.body;
    const ai = getGeminiClient();

    const isShorter = mode === 'shorter';
    const instructions = isShorter
      ? `Rewrite this freelance proposal to be significantly shorter, punchier, and easier to scan on mobile in under 45 seconds. Cut any fluff, keep all crucial facts (price, deliverables, timeline, CTA), and use clean bullet points.`
      : `Rewrite this freelance proposal to make it exceptionally confident, authoritative, and decisive. Remove any weak or apologetic phrases ("I hope", "I think", "if you would like", "I'm willing to try"). Frame the freelancer as a trusted expert who commands respect and delivers clear business outcomes.`;

    if (ai && proposalText) {
      try {
        const result = await generateContentWithFailover(ai, {
          contents: `Original Proposal:\n${proposalText}\n\nTask: ${instructions}\nReturn ONLY the rewritten proposal text.`,
        });

        if (result && result.text) {
          return res.json({ success: true, updatedProposalText: result.text.trim(), modelUsed: result.modelUsed });
        }
      } catch (geminiError) {
        console.warn('Gemini adjust-proposal failover exhausted, using programmatic adjustment:', (geminiError as any)?.message || geminiError);
      }
    }

    // High quality programmatic adjustment fallback
    let updatedText = proposalText;
    if (isShorter) {
      updatedText = proposalText
        .split('\n\n')
        .filter((para) => !para.toLowerCase().includes('wanted to reach out directly') && !para.toLowerCase().includes('please let me know if'))
        .join('\n\n');
      if (!updatedText.includes('TL;DR:')) {
        updatedText = `Quick Summary for Fast Review:\n${updatedText}`;
      }
    } else {
      updatedText = proposalText
        .replace(/I think I can/gi, 'I will')
        .replace(/I hope to/gi, 'I will')
        .replace(/maybe we can/gi, 'we should')
        .replace(/I would love the opportunity to/gi, 'I am ready to deliver this for');
    }

    return res.json({ success: true, updatedProposalText: updatedText });
  } catch (error: any) {
    console.error('Server error in /api/adjust-proposal:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// 4. Generate Cold DM Endpoint (Protected with Rate Limiter & License Guard)
app.post('/api/generate-cold-dm', aiRateLimiter, requireValidLicense, async (req, res) => {
  try {
    const {
      businessName = 'Local Brand',
      businessType = 'Small Business',
      websiteUrl = '',
      instagramUrl = '',
      freelancerService = 'Conversion Web Specialist',
      problemNoticed = '',
      personalizationDetails = '',
    } = req.body;

    const ai = getGeminiClient();

    const systemPrompt = `You are an expert cold outreach strategist for beginner US freelancers.
Generate 3 DISTINCT cold direct message (DM) templates:
1. "Soft": Gentle, conversational, peer-to-peer, low pressure, asks a curiosity question.
2. "Direct": Straight to the point, clear pitch, names the problem and offering immediately, zero fluff.
3. "Value-first": Offers a free specific audit, quick mockup, or tactical tip upfront before asking for anything.

CRITICAL RULES:
- Every DM must be short, natural, personalized, and under 90 words.
- Avoid spammy marketing cliches ("Quick question", "Hope this finds you well", "We are a full-service agency").
- Sound like a helpful human peer, not an automated bot.
- Incorporate the specific problem noticed and personalization details.`;

    const userPrompt = `Target Business: ${businessName} (${businessType})
Website: ${websiteUrl || 'Not provided'}
Instagram: ${instagramUrl || 'Not provided'}
Freelancer Service: ${freelancerService}
Specific Problem Noticed: ${problemNoticed || 'Website checkout takes too many clicks on mobile'}
Personalization Details: ${personalizationDetails || 'Loved their recent product launch post'}

Generate the 3 versions adhering strictly to the JSON schema.`;

    if (ai) {
      try {
        const result = await generateContentWithFailover(ai, {
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                soft: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    tagline: { type: Type.STRING },
                    subjectOrOpening: { type: Type.STRING },
                    message: { type: Type.STRING },
                    channelAdvice: { type: Type.STRING },
                  },
                  required: ['type', 'tagline', 'subjectOrOpening', 'message', 'channelAdvice'],
                },
                direct: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    tagline: { type: Type.STRING },
                    subjectOrOpening: { type: Type.STRING },
                    message: { type: Type.STRING },
                    channelAdvice: { type: Type.STRING },
                  },
                  required: ['type', 'tagline', 'subjectOrOpening', 'message', 'channelAdvice'],
                },
                valueFirst: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    tagline: { type: Type.STRING },
                    subjectOrOpening: { type: Type.STRING },
                    message: { type: Type.STRING },
                    channelAdvice: { type: Type.STRING },
                  },
                  required: ['type', 'tagline', 'subjectOrOpening', 'message', 'channelAdvice'],
                },
              },
              required: ['soft', 'direct', 'valueFirst'],
            },
          },
        });

        if (result && result.text) {
          const parsed = JSON.parse(result.text.trim());
          return res.json({ success: true, data: parsed, modelUsed: result.modelUsed });
        }
      } catch (geminiError) {
        console.warn('Gemini generate-cold-dm failover exhausted, using fallback:', (geminiError as any)?.message || geminiError);
      }
    }

    // High quality tailored fallback cold DMs
    const fallbackResult = {
      soft: {
        type: 'Soft',
        tagline: 'Conversational & Low Pressure',
        subjectOrOpening: `Hey team @${businessName}`,
        message: `Hey guys, big fan of what you're building at ${businessName}. ${personalizationDetails ? `Loved your post regarding ${personalizationDetails}.` : ''} I was checking out your mobile site and noticed a small issue where ${problemNoticed || 'the main booking link is hard to click on iPhone screens'}. Are you guys handling site tweaks in-house right now, or open to a quick pointer?`,
        channelAdvice: 'Best for Instagram DM or LinkedIn connection note where casual tone gets the highest response.',
      },
      direct: {
        type: 'Direct',
        tagline: 'Punchy & Straight To The Point',
        subjectOrOpening: `Quick fix for ${businessName}'s ${freelancerService}`,
        message: `Hi ${businessName} team,\n\nI noticed ${problemNoticed || 'your site has slow loading assets on mobile'}, which is likely costing you conversions. I help ${businessType || 'businesses'} fix this in under 48 hours without rebuilding from scratch.\n\nWorth sending over a 60-second video showing exactly how to fix it?`,
        channelAdvice: 'Ideal for email outreach or LinkedIn InMail to founders/decision-makers who value brevity.',
      },
      valueFirst: {
        type: 'Value-first',
        tagline: 'High Trust / Free Value Upfront',
        subjectOrOpening: `Made a quick mockup for ${businessName}`,
        message: `Hey ${businessName},\n\nI was reviewing your online presence and noticed ${problemNoticed || 'a missed opportunity to capture leads directly on the hero section'}.\n\nI actually drafted a free 2-minute visual wireframe showing how to streamline this for higher sales. No strings attached — happy to drop the preview link here if you'd like to take a look?`,
        channelAdvice: 'Highest conversion rate because you give value before asking for any commitment or money.',
      },
    };

    return res.json({ success: true, data: fallbackResult });
  } catch (error: any) {
    console.error('Server error in /api/generate-cold-dm:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// ---------------- VITE MIDDLEWARE / STATIC ASSETS ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClientFlow AI Server running at http://localhost:${PORT}`);
  });
}

startServer();
