import React, { useState } from 'react';
import {
  FileCheck2,
  Upload,
  FileText,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  X,
  ShieldAlert,
  HelpCircle,
  Download,
} from 'lucide-react';
import { PortfolioAnalysisResult, PortfolioSectionFeedback } from '../types';
import { SAMPLE_PORTFOLIO } from '../utils/sampleData';

interface PortfolioAnalyzerProps {
  onSaveActivity?: (type: 'portfolio', title: string, subtitle: string, data: any) => void;
  initialData?: PortfolioAnalysisResult | null;
  licenseToken?: string;
}

export const PortfolioAnalyzer: React.FC<PortfolioAnalyzerProps> = ({
  onSaveActivity,
  initialData,
  licenseToken = '',
}) => {
  const [freelanceService, setFreelanceService] = useState('');
  const [targetNiche, setTargetNiche] = useState('');
  const [portfolioText, setPortfolioText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [images, setImages] = useState<{ name: string; preview: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<PortfolioAnalysisResult | null>(initialData || null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'weak' | 'action-plan'>('all');

  // Popular quick tags for beginner freelancers
  const serviceChips = [
    'Webflow & Web Design',
    'Direct-Response Copywriting',
    'Short-form Video Editing',
    'SEO & Content Strategy',
    'Shopify E-commerce Specialist',
  ];

  const nicheChips = [
    'US Local Dental & MedSpas',
    'B2B SaaS Startups',
    'Direct-to-Consumer Brands',
    'Real Estate Agents & Brokers',
    'Fitness Coaches & Gyms',
  ];

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      setError(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      newFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => [
            ...prev,
            { name: file.name, preview: reader.result as string },
          ]);
        };
        reader.readAsDataURL(file);
      });
      setError(null);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const loadSample = () => {
    setFreelanceService(SAMPLE_PORTFOLIO.service);
    setTargetNiche(SAMPLE_PORTFOLIO.niche);
    setPortfolioText(SAMPLE_PORTFOLIO.text);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!freelanceService.trim() && !portfolioText.trim() && !pdfFile && images.length === 0) {
      setError('Please provide your service and some portfolio text or upload an asset to analyze.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      // 1. Read PDF as base64 if present
      let pdfBase64 = '';
      if (pdfFile) {
        pdfBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(pdfFile);
        });
      }

      // 2. Prepare images
      const formattedImages = images.map((img) => {
        const match = img.preview.match(/^data:(image\/[a-z]+);base64,/);
        const mimeType = match ? match[1] : 'image/png';
        return {
          mimeType,
          base64: img.preview,
        };
      });

      const res = await fetch('/api/analyze-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-license-token': licenseToken,
        },
        body: JSON.stringify({
          portfolioText,
          freelanceService: freelanceService || 'Freelance Service',
          targetNiche: targetNiche || 'General Business Clients',
          pdfBase64,
          pdfFileName: pdfFile ? pdfFile.name : '',
          images: formattedImages,
        }),
      });

      const json = await res.json();
      clearInterval(stepInterval);

      if (json.success && json.data) {
        setResult(json.data);
        if (onSaveActivity) {
          onSaveActivity(
            'portfolio',
            `Portfolio Audit: ${freelanceService || 'General Freelancer'}`,
            `Overall Score: ${json.data.overallScore}/100 • Target: ${targetNiche || 'General'}`,
            json.data
          );
        }
      } else {
        throw new Error(json.error || 'Failed to analyze portfolio');
      }
    } catch (err: any) {
      console.error('Portfolio analysis error:', err);
      setError(err.message || 'An error occurred during analysis. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const copyFullReport = () => {
    if (!result) return;
    const text = `ClientFlow AI — Portfolio Analysis Report
Overall Score: ${result.overallScore}/100

Diagnosis:
${result.summary}

Top 3 Fixes to Do First:
${result.top3Fixes.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Recommended Next Step:
${result.recommendedNextStep}

Detailed Section Critique:
${result.sections
  .map(
    (s) => `
[${s.name.toUpperCase()}] - Score: ${s.score}/100 (${s.status})
Problem: ${s.problem}
Why It Hurts Conversions: ${s.whyItHurtsConversions}
Recommendation: ${s.recommendation}
Improved Example: ${s.improvedExample}
`
  )
  .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400 border-amber-500 bg-amber-50 dark:bg-amber-950/40';
    return 'text-rose-600 dark:text-rose-400 border-rose-500 bg-rose-50 dark:bg-rose-950/40';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'strong') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" /> Strong
        </span>
      );
    }
    if (status === 'average') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-3 h-3" /> Needs Refinement
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <AlertCircle className="w-3 h-3" /> Conversion Killer
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Tool 1 of 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Portfolio Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Get an objective 8-point critique from a US freelance client perspective.
          </p>
        </div>

        <button
          id="portfolio-sample-btn"
          onClick={loadSample}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Load Sample Portfolio</span>
        </button>
      </div>

      {/* Main Input Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
        {/* Service & Niche */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Freelance Service */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Your Freelance Service *
            </label>
            <input
              id="portfolio-service-input"
              type="text"
              value={freelanceService}
              onChange={(e) => setFreelanceService(e.target.value)}
              placeholder="e.g. Webflow Designer & SEO Specialist"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Quick chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {serviceChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setFreelanceService(chip)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Target Niche */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
              Target Niche / Ideal Client *
            </label>
            <input
              id="portfolio-niche-input"
              type="text"
              value={targetNiche}
              onChange={(e) => setTargetNiche(e.target.value)}
              placeholder="e.g. US Dental Clinics, B2B SaaS Startups"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Quick chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {nicheChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setTargetNiche(chip)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Paste Portfolio Text */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Paste Portfolio Text / Bio / Project Summaries
            </label>
            <span className="text-[11px] text-neutral-400">
              {portfolioText.length} characters
            </span>
          </div>
          <textarea
            id="portfolio-text-textarea"
            rows={5}
            value={portfolioText}
            onChange={(e) => setPortfolioText(e.target.value)}
            placeholder="Paste your homepage headline, bio, project descriptions, pricing statement, or call-to-action here..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Upload Portfolio PDF & Images (Per Prompt Requirements) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* PDF Upload */}
          <div className="p-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-colors text-center">
            <input
              type="file"
              id="portfolio-pdf-upload"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="hidden"
            />
            <label
              htmlFor="portfolio-pdf-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {pdfFile ? pdfFile.name : 'Upload Portfolio PDF'}
              </span>
              <span className="text-[11px] text-neutral-400 mt-0.5">
                {pdfFile
                  ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace`
                  : 'Click or drop PDF resume or deck'}
              </span>
            </label>
            {pdfFile && (
              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="mt-2 text-[10px] text-rose-500 hover:underline cursor-pointer"
              >
                Remove PDF
              </button>
            )}
          </div>

          {/* Image Upload */}
          <div className="p-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-colors text-center">
            <input
              type="file"
              id="portfolio-image-upload"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <label
              htmlFor="portfolio-image-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Upload Portfolio Images
              </span>
              <span className="text-[11px] text-neutral-400 mt-0.5">
                Screenshots, Figma exports, or case studies
              </span>
            </label>

            {/* Thumbnail previews */}
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {images.map((img, i) => (
                  <div key={i} className="relative group w-12 h-12 rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    <img src={img.preview} alt="Sample" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Analyze Button */}
        <div className="pt-2">
          <button
            id="analyze-portfolio-submit-btn"
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-60 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {loadingStep === 1
                    ? 'Scanning portfolio content...'
                    : loadingStep === 2
                    ? 'Auditing 8 conversion vectors...'
                    : 'Benchmarking against US client standards...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze My Portfolio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div id="portfolio-results-section" className="space-y-6 pt-2">
          {/* Executive Score & Diagnosis Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-5">
                {/* Score Circle */}
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 flex flex-col items-center justify-center font-black shrink-0 ${getScoreColor(
                    result.overallScore
                  )}`}
                >
                  <span className="text-3xl sm:text-4xl">{result.overallScore}</span>
                  <span className="text-[11px] uppercase tracking-wider font-semibold opacity-80">
                    / 100 Score
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                    Conversion Health Score
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white">
                    {result.overallScore >= 80
                      ? 'High Commercial Appeal'
                      : result.overallScore >= 60
                      ? 'Promising with High Friction Points'
                      : 'High Bounce Risk — Requires Positioning Overhaul'}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="copy-analysis-report-btn"
                  onClick={copyFullReport}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Full Report!' : 'Copy Full Analysis'}</span>
                </button>
              </div>
            </div>

            {/* Top 3 Things To Fix First & Recommended Next Step (Explicit Prompt Requirement) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {/* Top 3 Fixes */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">
                    !
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                    Top 3 things you should fix first
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {result.top3Fixes.map((fix, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{fix}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Next Step */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      &rarr;
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                      Recommended next step
                    </h3>
                  </div>
                  <p className="text-xs text-blue-950 dark:text-blue-100 leading-relaxed font-medium">
                    {result.recommendedNextStep}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-400 flex items-center justify-between">
                  <span>Implement this before sending outreach</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Section-by-Section In-Depth Audit (The 8 Required Sections) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                  Detailed 8-Section Diagnostic
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Every section includes problem breakdown, conversion impact, and concrete rewrites.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  All 8 Sections
                </button>
                <button
                  onClick={() => setActiveTab('weak')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'weak'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Weak Only
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {result.sections
                .filter((s) => (activeTab === 'weak' ? s.status === 'weak' || s.score < 65 : true))
                .map((section, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl bg-white dark:bg-neutral-900 border transition-all ${
                      section.status === 'weak'
                        ? 'border-rose-200/80 dark:border-rose-900/40 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                          {idx + 1}. {section.name}
                        </span>
                        {getStatusBadge(section.status)}
                      </div>
                      <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                        Section Score: <span className="text-neutral-900 dark:text-neutral-100">{section.score}/100</span>
                      </div>
                    </div>

                    {/* Problem & Why it hurts conversions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* The Problem */}
                      <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                        <div className="font-bold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>The Problem</span>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {section.problem}
                        </p>
                      </div>

                      {/* Why it hurts conversions */}
                      <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                        <div className="font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Why It Hurts Conversions</span>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {section.whyItHurtsConversions}
                        </p>
                      </div>
                    </div>

                    {/* Specific Recommendation */}
                    <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                      <div className="font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Specific Recommendation</span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {section.recommendation}
                      </p>
                    </div>

                    {/* Concrete Improved Version Example */}
                    <div className="mt-4 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-blue-900 dark:text-blue-200">
                          Improved Version (Ready to copy & paste)
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(section.improvedExample);
                          }}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy snippet</span>
                        </button>
                      </div>
                      <div className="font-mono text-[11px] p-2.5 rounded-lg bg-white dark:bg-neutral-950 border border-blue-200/40 dark:border-blue-900/30 text-neutral-800 dark:text-neutral-200 leading-relaxed">
                        {section.improvedExample}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
