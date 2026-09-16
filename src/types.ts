export type AppView =
  | 'landing'
  | 'dashboard'
  | 'portfolio-analyzer'
  | 'proposal-generator'
  | 'cold-dm-generator'
  | 'pricing-calculator'
  | 'client-tracker'
  | 'prompts-library'
  | 'client-system';

export type ToneOption = 'Professional' | 'Friendly' | 'Confident' | 'Concise';

export interface PortfolioSectionFeedback {
  name:
    | 'First Impression'
    | 'Positioning'
    | 'Niche Clarity'
    | 'Portfolio Quality'
    | 'Proof of Results'
    | 'Copywriting'
    | 'Call To Action'
    | 'Trust';
  score: number; // 0 to 100
  status: 'strong' | 'average' | 'weak';
  problem: string;
  whyItHurtsConversions: string;
  recommendation: string;
  improvedExample: string;
}

export interface PortfolioAnalysisResult {
  overallScore: number;
  summary: string;
  sections: PortfolioSectionFeedback[];
  top3Fixes: string[];
  recommendedNextStep: string;
  timestamp?: number;
}

export interface ProposalInput {
  clientName: string;
  clientCompany: string;
  jobDescription: string;
  freelancerService: string;
  relevantExperience: string;
  projectPrice: string;
  estimatedDeliveryTime: string;
  tone: ToneOption;
}

export interface ProposalResult {
  personalizedOpening: string;
  understandingOfProblem: string;
  relevantExperience: string;
  proposedSolution: string;
  deliverables: string[];
  timeline: string;
  price: string;
  callToAction: string;
  fullProposalText: string;
  timestamp?: number;
}

export interface ColdDmInput {
  businessName: string;
  businessType: string;
  websiteUrl?: string;
  instagramUrl?: string;
  freelancerService: string;
  problemNoticed: string;
  personalizationDetails: string;
}

export interface ColdDmVersion {
  type: 'Soft' | 'Direct' | 'Value-first';
  tagline: string;
  subjectOrOpening: string;
  message: string;
  channelAdvice: string;
}

export interface ColdDmResult {
  soft: ColdDmVersion;
  direct: ColdDmVersion;
  valueFirst: ColdDmVersion;
  timestamp?: number;
}

export interface SavedActivity {
  id: string;
  type: 'portfolio' | 'proposal' | 'cold-dm';
  title: string;
  subtitle: string;
  date: string;
  data: any;
}

export interface Entitlement {
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

export interface PayPalConfig {
  clientId: string;
  currency: string;
  environment: 'sandbox' | 'production';
  isConfigured: boolean;
}
