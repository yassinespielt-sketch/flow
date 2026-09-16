import React from 'react';
import { Lock, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Key } from 'lucide-react';

interface PaywallGateProps {
  toolName: string;
  onOpenCheckout: () => void;
  onOpenActivate: () => void;
  onBackToLanding: () => void;
}

export const PaywallGate: React.FC<PaywallGateProps> = ({
  toolName,
  onOpenCheckout,
  onOpenActivate,
  onBackToLanding,
}) => {
  return (
    <div
      id="paywall-gate-card"
      className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl text-center animate-fadeIn"
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-5 shadow-xs">
        <Lock className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Verified $19 License Required</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
        {toolName} is Locked
      </h2>

      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
        To use ClientFlow AI's conversion engines and Gemini AI capabilities, a one-time verified $19 PayPal license is required. No subscriptions or recurring fees.
      </p>

      {/* Feature checklist */}
      <div className="my-6 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 text-xs text-neutral-700 dark:text-neutral-300 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Full Portfolio 8-Point Audits</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>High-Converting Proposals</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>3-Angle Cold Outreach DMs</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>One-time $19 payment for life</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
        <button
          id="paywall-buy-btn"
          onClick={onOpenCheckout}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.01]"
        >
          <span>Get ClientFlow AI — $19</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="paywall-activate-btn"
          onClick={onOpenActivate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Activate License</span>
        </button>
      </div>

      <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-6 text-xs text-neutral-400">
        <button
          onClick={onBackToLanding}
          className="hover:text-neutral-600 dark:hover:text-neutral-300 underline cursor-pointer"
        >
          &larr; Back to Landing Page
        </button>
        <span>•</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Instant Access via PayPal
        </span>
      </div>
    </div>
  );
};
