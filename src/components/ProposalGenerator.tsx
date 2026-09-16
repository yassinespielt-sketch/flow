import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Scissors,
  Zap,
  AlertCircle,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  ChevronRight,
  Send,
} from 'lucide-react';
import { ProposalInput, ProposalResult, ToneOption } from '../types';
import { SAMPLE_PROPOSAL } from '../utils/sampleData';

interface ProposalGeneratorProps {
  onSaveActivity?: (type: 'proposal', title: string, subtitle: string, data: any) => void;
  initialData?: ProposalResult | null;
  licenseToken?: string;
}

export const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({
  onSaveActivity,
  initialData,
  licenseToken = '',
}) => {
  const [formData, setFormData] = useState<ProposalInput>(SAMPLE_PROPOSAL);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState<'shorter' | 'more_confident' | null>(null);
  const [result, setResult] = useState<ProposalResult | null>(initialData || null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'structured'>('formatted');

  const tones: { id: ToneOption; label: string; desc: string }[] = [
    { id: 'Confident', label: 'Confident', desc: 'Authoritative, decisive, zero timid hedge words' },
    { id: 'Professional', label: 'Professional', desc: 'Corporate, structured, polished business tone' },
    { id: 'Friendly', label: 'Friendly', desc: 'Approachable, warm, collaborative relationship' },
    { id: 'Concise', label: 'Concise', desc: 'Minimalist, fast-scan bullet points for busy execs' },
  ];

  const handleInputChange = (field: keyof ProposalInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoadSample = () => {
    setFormData(SAMPLE_PROPOSAL);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!formData.jobDescription.trim()) {
      setError('Please provide the job description or client problem.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate-proposal', {
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
            'proposal',
            `Proposal for ${formData.clientCompany || formData.clientName || 'Client'}`,
            `${formData.projectPrice} • ${formData.freelancerService}`,
            json.data
          );
        }
      } else {
        throw new Error(json.error || 'Failed to generate proposal');
      }
    } catch (err: any) {
      console.error('Proposal generation error:', err);
      setError(err.message || 'An error occurred while generating your proposal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjust = async (mode: 'shorter' | 'more_confident') => {
    if (!result) return;
    setIsAdjusting(mode);

    try {
      const res = await fetch('/api/adjust-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-license-token': licenseToken,
        },
        body: JSON.stringify({
          proposalText: result.fullProposalText,
          mode,
        }),
      });

      const json = await res.json();
      if (json.success && json.updatedProposalText) {
        setResult((prev) => (prev ? { ...prev, fullProposalText: json.updatedProposalText } : null));
        // Switch to formatted view to show adjusted text
        setViewMode('formatted');
      } else {
        throw new Error(json.error || 'Failed to adjust proposal');
      }
    } catch (err: any) {
      console.error('Adjust proposal error:', err);
      setError(err.message || 'Failed to adjust proposal.');
    } finally {
      setIsAdjusting(null);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.fullProposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Tool 2 of 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Proposal Generator
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Turn job postings into winning, high-converting freelance proposals.
          </p>
        </div>

        <button
          id="proposal-sample-btn"
          onClick={handleLoadSample}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Load Sample Job Post</span>
        </button>
      </div>

      {/* Main Input Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
        {/* Row 1: Client Name & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Client Name *
            </label>
            <input
              id="proposal-client-name"
              type="text"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="e.g. Dr. Marcus Vance or Sarah"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Client / Company *
            </label>
            <input
              id="proposal-client-company"
              type="text"
              value={formData.clientCompany}
              onChange={(e) => handleInputChange('clientCompany', e.target.value)}
              placeholder="e.g. Apex Smiles Dental Care"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 2: Job Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Job Description / Client Problem *
            </label>
            <span className="text-[11px] text-neutral-400">
              Paste the Upwork, LinkedIn, or email requirement
            </span>
          </div>
          <textarea
            id="proposal-job-desc"
            rows={4}
            value={formData.jobDescription}
            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
            placeholder="Paste the client's job posting, pain points, or project expectations..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Row 3: Freelancer Service & Relevant Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Freelancer Service *
            </label>
            <input
              id="proposal-service"
              type="text"
              value={formData.freelancerService}
              onChange={(e) => handleInputChange('freelancerService', e.target.value)}
              placeholder="e.g. High-Converting Webflow Design & Local SEO"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Relevant Experience / Results Proof
            </label>
            <input
              id="proposal-experience"
              type="text"
              value={formData.relevantExperience}
              onChange={(e) => handleInputChange('relevantExperience', e.target.value)}
              placeholder="e.g. Built 3 dental clinics, increased booking conversion 38%"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 4: Project Price & Delivery Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Project Price *
            </label>
            <div className="relative">
              <input
                id="proposal-price"
                type="text"
                value={formData.projectPrice}
                onChange={(e) => handleInputChange('projectPrice', e.target.value)}
                placeholder="e.g. $1,500 or $2,400 fixed"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Estimated Delivery Time *
            </label>
            <input
              id="proposal-delivery-time"
              type="text"
              value={formData.estimatedDeliveryTime}
              onChange={(e) => handleInputChange('estimatedDeliveryTime', e.target.value)}
              placeholder="e.g. 10 business days"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 5: Tone Selector (Required: Professional, Friendly, Confident, Concise) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2.5">
            Proposal Tone *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {tones.map((t) => {
              const isSelected = formData.tone === t.id;
              return (
                <button
                  key={t.id}
                  id={`proposal-tone-${t.id.toLowerCase()}`}
                  type="button"
                  onClick={() => handleInputChange('tone', t.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="font-bold text-xs">{t.label}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 leading-tight line-clamp-2">
                    {t.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <div>
          <button
            id="generate-proposal-submit-btn"
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-60 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Assembling high-converting proposal...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Proposal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Proposal Output Section */}
      {result && (
        <div id="proposal-results-card" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
          {/* Header & Action Buttons (Copy, Regenerate, Make shorter, Make more confident) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Ready to Send
                </span>
                <span className="text-xs text-neutral-400">• Tone: {formData.tone}</span>
              </div>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white mt-0.5">
                Client Proposal for {formData.clientCompany || formData.clientName}
              </h2>
            </div>

            {/* Explicit Action Buttons required by prompt */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Copy */}
              <button
                id="proposal-copy-btn"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy'}</span>
              </button>

              {/* Regenerate */}
              <button
                id="proposal-regenerate-btn"
                onClick={handleGenerate}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>

              {/* Make shorter */}
              <button
                id="proposal-make-shorter-btn"
                onClick={() => handleAdjust('shorter')}
                disabled={isAdjusting !== null}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                <Scissors className={`w-3.5 h-3.5 ${isAdjusting === 'shorter' ? 'animate-spin' : ''}`} />
                <span>{isAdjusting === 'shorter' ? 'Condensing...' : 'Make shorter'}</span>
              </button>

              {/* Make more confident */}
              <button
                id="proposal-make-confident-btn"
                onClick={() => handleAdjust('more_confident')}
                disabled={isAdjusting !== null}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-500 ${isAdjusting === 'more_confident' ? 'animate-spin' : ''}`} />
                <span>{isAdjusting === 'more_confident' ? 'Polishing...' : 'Make more confident'}</span>
              </button>
            </div>
          </div>

          {/* View Mode Toggle: Formatted Text vs Structured Breakdown */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Format Preview
            </span>
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewMode('formatted')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'formatted'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Clean Formatted Text
              </button>
              <button
                onClick={() => setViewMode('structured')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'structured'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                8-Part Structure Breakdown
              </button>
            </div>
          </div>

          {/* Formatted View (Directly ready to paste into email, Upwork, or Doc) */}
          {viewMode === 'formatted' ? (
            <div className="p-5 sm:p-6 rounded-xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 font-sans text-sm leading-relaxed whitespace-pre-line select-all">
              {result.fullProposalText}
            </div>
          ) : (
            /* Structured View matching all 8 requested components */
            <div className="space-y-4 text-xs">
              {/* 1. Personalized opening */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  1. Personalized Opening
                </span>
                <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {result.personalizedOpening}
                </p>
              </div>

              {/* 2. Understanding of client's problem */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  2. Understanding of Client's Problem
                </span>
                <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {result.understandingOfProblem}
                </p>
              </div>

              {/* 3. Relevant experience */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  3. Relevant Experience
                </span>
                <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {result.relevantExperience}
                </p>
              </div>

              {/* 4. Proposed solution */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  4. Proposed Solution
                </span>
                <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {result.proposedSolution}
                </p>
              </div>

              {/* 5. Deliverables */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-2">
                  5. Deliverables
                </span>
                <ul className="space-y-1 text-neutral-800 dark:text-neutral-200">
                  {result.deliverables.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 6. Timeline & 7. Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                    6. Timeline
                  </span>
                  <p className="text-neutral-800 dark:text-neutral-200">{result.timeline}</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                    7. Price & Terms
                  </span>
                  <p className="text-neutral-800 dark:text-neutral-200">{result.price}</p>
                </div>
              </div>

              {/* 8. Call to action */}
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-1">
                  8. Call To Action (Low Friction Next Step)
                </span>
                <p className="text-indigo-950 dark:text-indigo-100 font-medium">
                  {result.callToAction}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
