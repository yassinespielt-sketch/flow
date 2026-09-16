import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Key,
  CreditCard,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Entitlement, PayPalConfig } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, entitlement: Entitlement) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'checkout' | 'activate'>('checkout');
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Checkout form state
  const [payerEmail, setPayerEmail] = useState('');
  const [payerName, setPayerName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // License Activation state
  const [inputLicenseKey, setInputLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  // Success state
  const [completedEntitlement, setCompletedEntitlement] = useState<Entitlement | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Fetch PayPal configuration on mount
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchConfig() {
      try {
        setIsLoadingConfig(true);
        const res = await fetch('/api/paypal/config');
        const data = await res.json();
        if (isMounted) {
          setPaypalConfig(data);
        }
      } catch (err) {
        console.error('Failed to load PayPal configuration:', err);
      } finally {
        if (isMounted) setIsLoadingConfig(false);
      }
    }

    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Real PayPal Order Flow ($19.00 USD One-Time)
  const handleInitiatePayPalPayment = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      // 1. Create order on backend
      const createRes = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!createRes.ok) {
        const errJson = await createRes.json();
        throw new Error(errJson.error || 'Failed to initialize PayPal order.');
      }

      const createData = await createRes.json();
      const orderID = createData.orderID;

      if (!orderID) {
        throw new Error('No order ID received from payment gateway.');
      }

      // 2. Capture and verify payment on backend
      const captureRes = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID,
          payerEmail: payerEmail.trim() || 'customer@clientflow.ai',
          payerName: payerName.trim() || 'ClientFlow Member',
        }),
      });

      if (!captureRes.ok) {
        const errJson = await captureRes.json();
        throw new Error(errJson.error || 'Payment capture failed.');
      }

      const captureData = await captureRes.json();
      if (!captureData.success || !captureData.token || !captureData.entitlement) {
        throw new Error('Payment verification succeeded but failed to generate license token.');
      }

      // Save and finish
      setCompletedEntitlement(captureData.entitlement);
      onSuccess(captureData.token, captureData.entitlement);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentError(err.message || 'Payment processing encountered an error. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Activating via Existing License Key or PayPal Order ID
  const handleActivateLicense = async () => {
    const key = inputLicenseKey.trim();
    if (!key) {
      setActivationError('Please enter your License Key or PayPal Order ID.');
      return;
    }

    try {
      setIsActivating(true);
      setActivationError(null);

      const res = await fetch('/api/auth/activate-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or unrecognized License Key / Order ID.');
      }

      setCompletedEntitlement(data.entitlement);
      onSuccess(data.token, data.entitlement);
    } catch (err: any) {
      setActivationError(err.message || 'Activation failed.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleCopyToken = () => {
    if (completedEntitlement?.token) {
      navigator.clipboard.writeText(completedEntitlement.token);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div
      id="checkout-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/80 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Verified PayPal Checkout ✨</span>
            </div>
            <h3 className="text-xl font-black text-neutral-950 dark:text-white">
              ClientFlow AI Lifetime License 🌸
            </h3>
          </div>
          <button
            id="checkout-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Purchase vs Existing License */}
        {!completedEntitlement && (
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-[#faf8f5] dark:bg-neutral-950">
            <button
              onClick={() => setActiveTab('checkout')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-colors ${
                activeTab === 'checkout'
                  ? 'border-pink-500 text-pink-600 dark:text-pink-400 bg-white dark:bg-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>PayPal Purchase ($19) 💖</span>
            </button>
            <button
              onClick={() => setActiveTab('activate')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-colors ${
                activeTab === 'activate'
                  ? 'border-pink-500 text-pink-600 dark:text-pink-400 bg-white dark:bg-neutral-900'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Already Purchased? Activate 🔑</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {completedEntitlement ? (
            /* Success / Receipt View */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  Payment Verified & License Activated!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  Full lifetime access to all 3 tools has been securely provisioned to your device.
                </p>
              </div>

              {/* License Details Card */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 dark:text-neutral-400">Order ID:</span>
                  <span className="font-mono font-medium text-neutral-900 dark:text-white">
                    {completedEntitlement.orderId}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 dark:text-neutral-400">Payer Email:</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {completedEntitlement.payerEmail}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500 dark:text-neutral-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {completedEntitlement.amount} {completedEntitlement.currency} (One-Time)
                  </span>
                </div>

                <div>
                  <span className="text-neutral-500 dark:text-neutral-400 block mb-1.5">
                    Your Secret License Token:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={completedEntitlement.token}
                      className="w-full font-mono text-[11px] p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 select-all"
                    />
                    <button
                      onClick={handleCopyToken}
                      className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
                      title="Copy License Token"
                    >
                      {copiedKey ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Save this key if you ever want to restore your license on another device or browser.
                  </p>
                </div>
              </div>

              <button
                id="enter-dashboard-btn"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
              >
                <span>Enter Workspace & Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : activeTab === 'checkout' ? (
            /* PayPal Checkout View */
            <div className="space-y-4">
              {/* Pricing breakdown */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    Total Due Today
                  </div>
                  <div className="text-3xl font-black text-neutral-950 dark:text-white mt-0.5">
                    $19<span className="text-xs font-normal text-neutral-500 ml-1">USD</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    One-time payment
                  </span>
                  <div className="text-[10px] text-neutral-400 mt-1">Never any subscriptions</div>
                </div>
              </div>

              {/* Included Checklist */}
              <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Portfolio Conversion & 8-Point Audit (PDF & Screenshots)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Tailored Proposal Generator + Shorter/Confident Tone AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>3-Angle Cold DM Outreach Generator (Soft, Direct, Value)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Lifetime commercial license + all future tool updates</span>
                </div>
              </div>

              {/* Customer Receipt Info */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Your PayPal / Receipt Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. alex.freelancer@gmail.com"
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-blue-500"
                  />
                </div>
              </div>

              {paymentError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* PayPal Checkout Button */}
              <button
                id="paypal-checkout-btn"
                type="button"
                onClick={handleInitiatePayPalPayment}
                disabled={isProcessingPayment}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-black py-4 px-6 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white shadow-lg shadow-pink-500/25 transition-all cursor-pointer disabled:opacity-75 hover:scale-[1.01] active:scale-95"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    <span>Verifying PayPal Payment ($19.00 USD)...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay with PayPal — $19 One-Time 🌸</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  SSL Encrypted
                </span>
                <span>•</span>
                <span>No recurring charges 💖</span>
                <span>•</span>
                <span>Official PayPal REST API</span>
              </div>
            </div>
          ) : (
            /* License Activation View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/50 text-xs text-pink-900 dark:text-pink-300">
                <p className="font-bold mb-1">Already bought ClientFlow AI? ✨</p>
                <p>
                  Paste your HMAC License Key (<code className="font-mono">cf_lic_...</code>) or your PayPal Order ID below to unlock access immediately.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  License Key or PayPal Order ID
                </label>
                <input
                  type="text"
                  placeholder="Paste cf_lic_... or PayPal Order ID"
                  value={inputLicenseKey}
                  onChange={(e) => setInputLicenseKey(e.target.value)}
                  className="w-full text-xs font-mono p-3 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-pink-500"
                />
              </div>

              {activationError && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{activationError}</span>
                </div>
              )}

              <button
                id="activate-license-btn"
                type="button"
                onClick={handleActivateLicense}
                disabled={isActivating || !inputLicenseKey.trim()}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-black py-4 px-6 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white shadow-md shadow-pink-500/20 transition-all cursor-pointer disabled:opacity-75 hover:scale-[1.01] active:scale-95"
              >
                {isActivating ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    <span>Verifying Entitlement...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Activate License</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
