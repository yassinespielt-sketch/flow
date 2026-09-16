import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Zap,
  Gift,
  HelpCircle,
  Info,
} from 'lucide-react';
import { ColdDmInput, ColdDmResult, ColdDmVersion } from '../types';
import { SAMPLE_COLD_DM } from '../utils/sampleData';

interface ColdDmGeneratorProps {
  onSaveActivity?: (type: 'cold-dm', title: string, subtitle: string, data: any) => void;
  initialData?: ColdDmResult | null;
  licenseToken?: string;
}

export const ColdDmGenerator: React.FC<ColdDmGeneratorProps> = ({
  onSaveActivity,
  initialData,
  licenseToken = '',
}) => {
  const [formData, setFormData] = useState<ColdDmInput>(SAMPLE_COLD_DM);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ColdDmResult | null>(initialData || null);
  const [error, setError] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleInputChange = (field: keyof ColdDmInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoadSample = () => {
    setFormData(SAMPLE_COLD_DM);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!formData.businessName.trim()) {
      setError('Please provide the business name to reach out to.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate-cold-dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-license-token': licenseToken,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        if (onSaveActivity) {
          onSaveActivity(
            'cold-dm',
            `Cold DMs for ${formData.businessName}`,
            `${formData.businessType} • 3 Angles Generated`,
            json.data
          );
        }
      } else {
        throw new Error(json.error || 'Failed to generate cold DMs');
      }
    } catch (err: any) {
      console.error('Cold DM generation error:', err);
      setError(err.message || 'An error occurred while generating cold DMs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const countWords = (str: string) => {
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Send className="w-3.5 h-3.5" />
            <span>Tool 3 of 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Cold DM Generator
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Generate 3 non-spammy, highly personalized outreach versions tailored to any business.
          </p>
        </div>

        <button
          id="cold-dm-sample-btn"
          onClick={handleLoadSample}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Load Sample Prospect</span>
        </button>
      </div>

      {/* Main Input Form (Strictly containing all 7 requested fields) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
        {/* Row 1: Business Name & Business Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Business Name *
            </label>
            <input
              id="cold-dm-biz-name"
              type="text"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="e.g. Radiant Glow MedSpa"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Business Type *
            </label>
            <input
              id="cold-dm-biz-type"
              type="text"
              value={formData.businessType}
              onChange={(e) => handleInputChange('businessType', e.target.value)}
              placeholder="e.g. Medical Spa / Boutique Dental Clinic"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Row 2: Website URL (optional) & Instagram URL (optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Website URL <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="cold-dm-website"
              type="text"
              value={formData.websiteUrl || ''}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              placeholder="https://examplemedspa.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Instagram URL / Handle <span className="text-neutral-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="cold-dm-instagram"
              type="text"
              value={formData.instagramUrl || ''}
              onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
              placeholder="@radiantglow_denver"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Row 3: Freelancer Service */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
            Freelancer Service *
          </label>
          <input
            id="cold-dm-service"
            type="text"
            value={formData.freelancerService}
            onChange={(e) => handleInputChange('freelancerService', e.target.value)}
            placeholder="e.g. Website Speed & Mobile Booking Optimization"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Row 4: Problem Noticed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Problem Noticed *
            </label>
            <span className="text-[11px] text-neutral-400">
              Specific friction or flaw on their site/socials
            </span>
          </div>
          <input
            id="cold-dm-problem"
            type="text"
            value={formData.problemNoticed}
            onChange={(e) => handleInputChange('problemNoticed', e.target.value)}
            placeholder="e.g. The main booking link on their mobile site is broken or takes 6 clicks to schedule"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Row 5: Personalization Details */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Personalization Details *
            </label>
            <span className="text-[11px] text-neutral-400">
              Proves you are a real human who actually checked their business
            </span>
          </div>
          <textarea
            id="cold-dm-personalization"
            rows={2}
            value={formData.personalizationDetails}
            onChange={(e) => handleInputChange('personalizationDetails', e.target.value)}
            placeholder="e.g. Loved their recent post about their new treatment; great customer reviews on Google Maps"
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <div>
          <button
            id="generate-cold-dm-submit-btn"
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 disabled:opacity-60 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating 3 tailored DM angles...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Cold DM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Cold DM Output Section (3 Versions: Soft, Direct, Value-first) */}
      {result && (
        <div id="cold-dm-results-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Generated Outreach Angles
              </div>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white mt-0.5">
                3 Outreach Styles for {formData.businessName}
              </h2>
            </div>

            {/* Global Regenerate Button */}
            <button
              id="cold-dm-regenerate-btn"
              onClick={handleGenerate}
              disabled={isLoading}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate All 3</span>
            </button>
          </div>

          {/* Cards for the 3 versions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Version 1: Soft */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      1. Soft Version
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {countWords(result.soft.message)} words
                  </span>
                </div>

                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {result.soft.tagline}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-4 font-mono bg-neutral-100 dark:bg-neutral-800/80 px-2 py-1 rounded">
                  Hook: {result.soft.subjectOrOpening}
                </div>

                {/* Message Body */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed select-all">
                  {result.soft.message}
                </div>

                {/* Channel advice */}
                <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                  💡 {result.soft.channelAdvice}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  id="copy-soft-dm-btn"
                  onClick={() => handleCopy(result.soft.message, 'soft')}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 transition-colors cursor-pointer"
                >
                  {copiedType === 'soft' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'soft' ? 'Copied to Clipboard!' : 'Copy Soft Version'}</span>
                </button>
              </div>
            </div>

            {/* Version 2: Direct */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      2. Direct Version
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {countWords(result.direct.message)} words
                  </span>
                </div>

                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {result.direct.tagline}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-4 font-mono bg-neutral-100 dark:bg-neutral-800/80 px-2 py-1 rounded">
                  Subject: {result.direct.subjectOrOpening}
                </div>

                {/* Message Body */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed select-all">
                  {result.direct.message}
                </div>

                {/* Channel advice */}
                <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                  💡 {result.direct.channelAdvice}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  id="copy-direct-dm-btn"
                  onClick={() => handleCopy(result.direct.message, 'direct')}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 transition-colors cursor-pointer"
                >
                  {copiedType === 'direct' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'direct' ? 'Copied to Clipboard!' : 'Copy Direct Version'}</span>
                </button>
              </div>
            </div>

            {/* Version 3: Value-first */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-emerald-500/50 dark:border-emerald-500/40 flex flex-col justify-between shadow-sm shadow-emerald-500/5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Gift className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      3. Value-First (Highest Response)
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {countWords(result.valueFirst.message)} words
                  </span>
                </div>

                <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  {result.valueFirst.tagline}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-4 font-mono bg-neutral-100 dark:bg-neutral-800/80 px-2 py-1 rounded">
                  Hook: {result.valueFirst.subjectOrOpening}
                </div>

                {/* Message Body */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed select-all">
                  {result.valueFirst.message}
                </div>

                {/* Channel advice */}
                <p className="mt-3 text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                  💡 {result.valueFirst.channelAdvice}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  id="copy-valuefirst-dm-btn"
                  onClick={() => handleCopy(result.valueFirst.message, 'valueFirst')}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  {copiedType === 'valueFirst' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'valueFirst' ? 'Copied to Clipboard!' : 'Copy Value-First Version'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Outreach Rules */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="font-bold text-neutral-900 dark:text-neutral-100 mb-1.5 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-500" />
              <span>Beginner Freelancer Cold Outreach Golden Rule:</span>
            </div>
            <p>
              Never pitch your services in the first DM. Always offer value first (e.g. a 45-second screen recording audit or wireframe) and ask permission to share it. That transforms you from an annoying spammer into an authoritative partner.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
