import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Sparkles,
  Target,
  Search,
  FileText,
  Send,
  Kanban,
  ShieldCheck,
  ChevronRight,
  Layers,
  Zap,
  CheckCircle2,
  Sliders,
  Maximize2,
  TrendingUp,
} from 'lucide-react';
import { AppView, Entitlement } from '../types';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  onOpenCheckout: () => void;
  entitlement: Entitlement | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenCheckout,
  entitlement,
}) => {
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<
    'offer' | 'opportunity' | 'outreach' | 'proposal'
  >('offer');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrimaryCta = () => {
    if (entitlement) {
      onNavigate('dashboard');
    } else {
      onOpenCheckout();
    }
  };

  // Pipeline story steps
  const journeySteps = [
    {
      step: '01',
      label: 'Skills',
      tag: 'Input',
      description: 'Web design, copywriting, video, or social management.',
      output: 'Raw capability identified',
    },
    {
      step: '02',
      label: 'Offer',
      tag: 'Day 1',
      description: 'Turn your skill into a high-ticket, specific outcome.',
      output: '1-line irresistible value proposition',
    },
    {
      step: '03',
      label: 'Portfolio',
      tag: 'Day 3',
      description: 'Audit live prospect profiles to find friction points.',
      output: '3 verified business opportunities',
    },
    {
      step: '04',
      label: 'Proposal',
      tag: 'Day 6',
      description: 'Generate concise, non-fluff proposals that convert.',
      output: 'High-confidence scope & contract',
    },
    {
      step: '05',
      label: 'Client',
      tag: 'Day 7',
      description: 'Handle objections with calm closing strategies.',
      output: 'First paid client deposit secured',
    },
  ];

  return (
    <div className="relative w-full bg-[#0D0D0F] text-[#F6F5F2] selection:bg-[#FF9F43]/30 selection:text-white min-h-screen overflow-hidden">
      {/* ========================================================================= */}
      {/* AMBIENT BACKGROUND LAYER (Subtle, Slow, Warm Amber & Coral Drift) */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle noise grain */}
        <div className="absolute inset-0 bg-grain" />

        {/* Ambient Warm Blob 1 - Top Center/Right */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/3 w-[650px] h-[550px] rounded-full bg-gradient-to-tr from-[#FF9F43]/12 via-[#FF6B6B]/8 to-transparent blur-[140px] animate-ambient-1" />

        {/* Ambient Warm Blob 2 - Mid Left */}
        <div className="absolute top-[40%] -left-32 w-[550px] h-[500px] rounded-full bg-gradient-to-br from-[#FF9F43]/8 via-[#9333ea]/5 to-transparent blur-[150px] animate-ambient-2" />

        {/* Ambient Warm Blob 3 - Bottom Right */}
        <div className="absolute bottom-10 -right-20 w-[600px] h-[500px] rounded-full bg-gradient-to-tl from-[#FF9F43]/10 via-[#FF6B6B]/5 to-transparent blur-[160px] animate-pulse-glow" />

        {/* Subtle geometric hairline grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-24 px-5 sm:px-8 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            {/* Subtle Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#19191D] border border-white/10 text-xs text-[#949089] mb-8 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F43] shadow-[0_0_8px_#FF9F43]" />
              <span className="font-medium text-[#F6F5F2]">7-Day Execution System</span>
              <span className="text-white/20">•</span>
              <span className="text-[#FF9F43] font-medium">$19 One-Time</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F6F5F2] leading-[1.08]">
              Turn your skills <br className="hidden sm:block" />
              into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9F43] via-[#ffa857] to-[#FF6B6B]">clients.</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-[#949089] max-w-2xl mx-auto font-normal leading-relaxed">
              Your AI-powered freelance launch system. No courses. No endless theory. A daily step-by-step sprint to your first paid deal.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="hero-primary-cta"
                onClick={handlePrimaryCta}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#FF9F43] hover:bg-[#ffb066] text-[#0D0D0F] font-semibold text-sm shadow-[0_0_30px_rgba(255,159,67,0.25)] hover:shadow-[0_0_35px_rgba(255,159,67,0.4)] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{entitlement ? 'Open Sprint Workspace' : 'Start your 7-Day Sprint →'}</span>
              </button>

              <a
                href="#product"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#141416] hover:bg-[#19191D] border border-white/10 text-[#949089] hover:text-[#F6F5F2] font-medium text-sm transition-all"
              >
                <span>See how it works</span>
              </a>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PRODUCT UI HERO FOCUS (Realistic, High-Fidelity ClientFlow OS Interface) */}
          {/* ========================================================================= */}
          <div className="mt-14 sm:mt-20 max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-[#141416] border border-white/10 p-1.5 sm:p-2.5 shadow-[0_20px_70px_rgba(0,0,0,0.7)]">
              {/* Subtle top border illumination */}
              <div className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#FF9F43]/40 to-transparent" />

              {/* Product Chrome Top Bar */}
              <div className="bg-[#19191D] rounded-xl px-4 py-3 flex items-center justify-between border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="ml-2 text-xs font-mono text-[#949089] hidden sm:inline">
                    clientflow.app/sprint
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#FF9F43] animate-pulse" />
                  <span className="text-[#949089] font-medium">Sprint Active: Day 1</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#F6F5F2] font-mono text-[11px]">
                    4 / 10 Contacted
                  </span>
                </div>
              </div>

              {/* Realistic Hero Interface Body */}
              <div className="p-4 sm:p-7 bg-[#0D0D0F] rounded-xl mt-1.5 border border-white/[0.04]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Today's Mission & Metric */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-5 rounded-xl bg-[#141416] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#FF9F43] font-medium tracking-wide uppercase text-[10px]">
                          Today's Mission
                        </span>
                        <span className="text-[#949089]">Day 1 of 7</span>
                      </div>
                      <h3 className="text-base font-semibold text-[#F6F5F2] leading-snug">
                        Turn raw web design capability into a $1,500 emergency booking offer.
                      </h3>
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs text-[#949089]">
                          <span>Sprint Progress</span>
                          <span className="text-[#F6F5F2] font-medium">75%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FF9F43] rounded-full w-3/4" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 rounded-lg bg-[#141416] border border-white/5">
                        <div className="text-xs text-[#949089]">Prospects</div>
                        <div className="text-lg font-bold text-[#F6F5F2] mt-0.5">14</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[#141416] border border-white/5">
                        <div className="text-xs text-[#949089]">Contacted</div>
                        <div className="text-lg font-bold text-[#FF9F43] mt-0.5">8</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[#141416] border border-white/5">
                        <div className="text-xs text-[#949089]">Replies</div>
                        <div className="text-lg font-bold text-emerald-400 mt-0.5">3</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Generated Asset Preview */}
                  <div className="lg:col-span-7 p-5 rounded-xl bg-[#141416] border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                        <div className="flex items-center gap-2 text-xs text-[#949089]">
                          <Zap className="w-3.5 h-3.5 text-[#FF9F43]" />
                          <span className="text-[#F6F5F2] font-medium">Generated High-Ticket Offer</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#949089]">Target: $1,500</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-lg bg-[#0D0D0F] border border-white/5 text-[#F6F5F2] font-medium leading-relaxed">
                          "I help local emergency contractors capture 3–5 missed weekend calls per month with a 24/7 tap-to-call mobile speed overhaul."
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[#949089]">
                          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                            <span className="text-white/40 block">Ideal Target:</span>
                            <span className="text-[#F6F5F2]">Austin Plumbing & HVAC</span>
                          </div>
                          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                            <span className="text-white/40 block">Immediate Hook:</span>
                            <span className="text-[#F6F5F2]">Broken mobile click-to-call</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[#949089]">Generated in 1.4s by ClientFlow Engine</span>
                      <button
                        onClick={handlePrimaryCta}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF9F43] hover:text-[#ffb066] cursor-pointer"
                      >
                        <span>Apply to Sprint</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* VISUAL STORY: Skills → Offer → Portfolio → Proposal → Client */}
        {/* ========================================================================= */}
        <section id="story" className="py-20 sm:py-28 border-y border-white/[0.07] bg-[#141416]/40">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#FF9F43]">
                The Pipeline
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F6F5F2] mt-2">
                From capability to paying client.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#949089]">
                ClientFlow connects the entire chain without theoretical gaps.
              </p>
            </div>

            {/* Horizontal Timeline Chain */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {journeySteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-[#141416] border border-white/10 hover:border-[#FF9F43]/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs text-[#949089] group-hover:text-[#FF9F43] transition-colors">
                        {step.step}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#949089]">
                        {step.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#F6F5F2] mb-1">
                      {step.label}
                    </h3>
                    <p className="text-xs text-[#949089] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/[0.06] text-[11px] font-medium text-[#FF9F43]/90">
                    → {step.output}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PRODUCT SHOWCASE: Realistic Interactive Workflow */}
        {/* ========================================================================= */}
        <section id="product" className="py-24 sm:py-32 max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF9F43]">
              Realistic Product Showcase
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F6F5F2] mt-2">
              See what ClientFlow generates for a real lead.
            </h2>
            <p className="mt-3 text-base text-[#949089]">
              Sample scenario: A freelancer targeting local commercial plumbing companies.
            </p>
          </div>

          {/* Interactive Showcase Container */}
          <div className="rounded-2xl bg-[#141416] border border-white/10 overflow-hidden shadow-2xl">
            {/* Tab Bar */}
            <div className="flex flex-wrap border-b border-white/10 bg-[#19191D]/80">
              <button
                onClick={() => setActiveShowcaseTab('offer')}
                className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeShowcaseTab === 'offer'
                    ? 'text-[#FF9F43] border-b-2 border-[#FF9F43] bg-[#141416]'
                    : 'text-[#949089] hover:text-[#F6F5F2]'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>1. Offer Generated</span>
              </button>

              <button
                onClick={() => setActiveShowcaseTab('opportunity')}
                className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeShowcaseTab === 'opportunity'
                    ? 'text-[#FF9F43] border-b-2 border-[#FF9F43] bg-[#141416]'
                    : 'text-[#949089] hover:text-[#F6F5F2]'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>2. Opportunity Audit</span>
              </button>

              <button
                onClick={() => setActiveShowcaseTab('outreach')}
                className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeShowcaseTab === 'outreach'
                    ? 'text-[#FF9F43] border-b-2 border-[#FF9F43] bg-[#141416]'
                    : 'text-[#949089] hover:text-[#F6F5F2]'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>3. Outreach DM</span>
              </button>

              <button
                onClick={() => setActiveShowcaseTab('proposal')}
                className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeShowcaseTab === 'proposal'
                    ? 'text-[#FF9F43] border-b-2 border-[#FF9F43] bg-[#141416]'
                    : 'text-[#949089] hover:text-[#F6F5F2]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>4. High-Close Proposal</span>
              </button>
            </div>

            {/* Showcase Dynamic Content Panel */}
            <div className="p-6 sm:p-10">
              {activeShowcaseTab === 'offer' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                    <div>
                      <span className="text-xs font-mono text-[#FF9F43]">Core Value Proposition</span>
                      <h4 className="text-xl font-bold text-[#F6F5F2] mt-0.5">
                        High-Converting Emergency Tap-to-Call Website Overhaul
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#949089]">Target Rate:</span>
                      <span className="text-base font-bold text-[#F6F5F2] bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                        $1,500 fixed
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 space-y-1.5">
                      <span className="text-xs text-[#949089] block">One-Line Offer</span>
                      <p className="text-sm font-medium text-[#F6F5F2]">
                        "I rebuild slow local contractor websites into 60-second mobile emergency booking pages that stop leaking after-hours service calls."
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 space-y-1.5">
                      <span className="text-xs text-[#949089] block">Ideal Prospect Profile</span>
                      <p className="text-sm font-medium text-[#F6F5F2]">
                        Emergency plumbers, 24/7 HVAC, water damage restorers with high search traffic but outdated WordPress sites.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#19191D] border border-white/5 flex items-center justify-between">
                    <div className="text-xs text-[#949089]">
                      <span className="text-[#FF9F43] font-semibold">Sprint Advantage:</span> Gives beginners instant positioning clarity so you never sound like an unproven generalist.
                    </div>
                    <button
                      onClick={() =>
                        handleCopy(
                          "I rebuild slow local contractor websites into 60-second mobile emergency booking pages that stop leaking after-hours service calls.",
                          'offer-copy'
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#F6F5F2] hover:text-[#FF9F43] cursor-pointer"
                    >
                      {copiedKey === 'offer-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'offer-copy' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeShowcaseTab === 'opportunity' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                    <div>
                      <span className="text-xs font-mono text-[#FF9F43]">Prospect Profile Audit</span>
                      <h4 className="text-xl font-bold text-[#F6F5F2] mt-0.5">
                        Target: Austin Rapid Rooter & Plumbing
                      </h4>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[#FF9F43]">
                      High Conversion Opportunity
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        1
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#F6F5F2]">
                          Mobile Tap-To-Call Header is Missing
                        </div>
                        <p className="text-xs text-[#949089] mt-0.5">
                          Prospects on mobile devices must manually scroll 4 sections to find a telephone number, resulting in high bounce rates during urgent leaks.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        2
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#F6F5F2]">
                          Page Load Speed 5.2s on 4G
                        </div>
                        <p className="text-xs text-[#949089] mt-0.5">
                          Uncompressed PNG hero images and legacy scripts add 3.4 seconds of latency before the viewport renders.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        3
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#F6F5F2]">
                          Best Outreach Angle
                        </div>
                        <p className="text-xs text-[#949089] mt-0.5">
                          Send a 15-second Loom or screenshot showing that clicking their header button does not trigger dialer on iOS.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeShowcaseTab === 'outreach' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                    <div>
                      <span className="text-xs font-mono text-[#FF9F43]">Direct & Low-Friction DM</span>
                      <h4 className="text-xl font-bold text-[#F6F5F2] mt-0.5">
                        Specific, Helpful, Non-Spammy Outreach
                      </h4>
                    </div>
                    <span className="text-xs text-[#949089]">Channel: Instagram / LinkedIn / Direct Email</span>
                  </div>

                  <div className="p-5 rounded-xl bg-[#0D0D0F] border border-white/10 space-y-3 font-mono text-xs sm:text-sm text-[#F6F5F2] leading-relaxed">
                    <p>Hey Mark — noticed your crew handles 24/7 burst pipe calls across Austin.</p>
                    <p>
                      Was checking your site on my iPhone and noticed the top "Call Dispatch" button isn't linking to the phone dialer. It just refreshes the homepage.
                    </p>
                    <p>
                      Since emergency calls usually happen on mobile, you're likely losing 2–3 homeowners to competitors each weekend who can't tap through.
                    </p>
                    <p>
                      I sketched a quick 60-second fix layout that keeps the call button sticky. Happy to send the screenshot over if you'd like your web guy to pop it in.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#949089]">
                    <span>Why it works: Leads with real value, zero hard selling, proves genuine observation.</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          "Hey Mark — noticed your crew handles 24/7 burst pipe calls across Austin. Was checking your site on my iPhone and noticed the top 'Call Dispatch' button isn't linking to the phone dialer...",
                          'dm-copy'
                        )
                      }
                      className="inline-flex items-center gap-1 font-medium text-[#F6F5F2] hover:text-[#FF9F43] cursor-pointer"
                    >
                      {copiedKey === 'dm-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'dm-copy' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeShowcaseTab === 'proposal' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                    <div>
                      <span className="text-xs font-mono text-[#FF9F43]">Concise 1-Page Proposal</span>
                      <h4 className="text-xl font-bold text-[#F6F5F2] mt-0.5">
                        High-Confidence Conversion Scope
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                      $1,500 • 5-Day Delivery
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 space-y-2">
                      <div className="font-semibold text-[#F6F5F2]">1. Deliverables</div>
                      <ul className="space-y-1 text-[#949089]">
                        <li>• Mobile tap-to-call sticky header</li>
                        <li>• 60-second emergency booking form</li>
                        <li>• Asset compression under 1.5s</li>
                        <li>• Google Maps embed & review badge</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 space-y-2">
                      <div className="font-semibold text-[#F6F5F2]">2. Payment Schedule</div>
                      <ul className="space-y-1 text-[#949089]">
                        <li>• 50% deposit to begin ($750)</li>
                        <li>• 50% upon final staging signoff</li>
                        <li>• Direct Stripe / PayPal transfer</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 space-y-2">
                      <div className="font-semibold text-[#F6F5F2]">3. Execution Guarantee</div>
                      <p className="text-[#949089] leading-relaxed">
                        Complete staging build deployed within 5 business days without disturbing existing domain or business email.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* THE 4 CORE CAPABILITIES (Refined, Editorial, No generic cards) */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 border-t border-white/[0.07] bg-[#141416]/20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#FF9F43]">
                Core System
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F6F5F2] mt-2">
                Four tools. One purpose.
              </h2>
              <p className="mt-3 text-base text-[#949089]">
                Everything you need to locate, evaluate, contact, and close your first client.
              </p>
            </div>

            <div className="space-y-16">
              {/* Feature 1: Profile Analyzer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <div className="text-xs font-mono text-[#FF9F43]">01 / Profile Analyzer</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#F6F5F2]">
                    Know what clients see.
                  </h3>
                  <p className="text-sm text-[#949089] leading-relaxed">
                    Upload screenshots, URLs, or PDFs. Gemini vision analyzes visual hierarchy, conversion flaws, and missing trust signals in seconds.
                  </p>
                </div>
                <div className="lg:col-span-7 p-5 sm:p-7 rounded-2xl bg-[#141416] border border-white/10">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-[#949089] mb-4">
                    <span>Opportunity Detection Output</span>
                    <span className="text-[#FF9F43]">Confidence: 94%</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Identified 3 conversion blockers in hero viewport</span>
                    </div>
                    <p className="text-[#949089]">
                      "Primary CTA blends into background photograph. Replacing with high-contrast amber button will recover estimated 18% bounce traffic."
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2: Proposal Builder */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 order-2 lg:order-1 p-5 sm:p-7 rounded-2xl bg-[#141416] border border-white/10">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-[#949089] mb-4">
                    <span>Structured Deliverable Schedule</span>
                    <span className="text-emerald-400">Fixed $1,200 – $2,500</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 space-y-2 text-xs">
                    <div className="font-mono text-[#F6F5F2]">Scope: 3-Stage Landing Page Optimization</div>
                    <p className="text-[#949089]">
                      Zero boilerplate. Strict milestones, explicit boundaries, clear delivery dates, and professional acceptance terms.
                    </p>
                  </div>
                </div>
                <div className="lg:col-span-5 order-1 lg:order-2 space-y-3">
                  <div className="text-xs font-mono text-[#FF9F43]">02 / Proposal Builder</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#F6F5F2]">
                    Proposals that close.
                  </h3>
                  <p className="text-sm text-[#949089] leading-relaxed">
                    Clients don't read 10-page documents. Generate concise, high-confidence single-page proposals designed for fast decisions.
                  </p>
                </div>
              </div>

              {/* Feature 3: DM Generator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <div className="text-xs font-mono text-[#FF9F43]">03 / DM Generator</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#F6F5F2]">
                    Personalized, not spam.
                  </h3>
                  <p className="text-sm text-[#949089] leading-relaxed">
                    Three distinct angles (Soft, Direct, Value-First). Every message references real observed friction instead of generic compliments.
                  </p>
                </div>
                <div className="lg:col-span-7 p-5 sm:p-7 rounded-2xl bg-[#141416] border border-white/10">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-[#949089] mb-4">
                    <span>Outreach Angles</span>
                    <span className="text-[#949089]">3 Generated</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="p-3 rounded-lg bg-[#0D0D0F] border border-white/5 text-[#F6F5F2]">
                      <span className="text-[#FF9F43] block text-[10px]">01</span> Soft Hook
                    </div>
                    <div className="p-3 rounded-lg bg-[#0D0D0F] border border-[#FF9F43]/30 text-[#F6F5F2]">
                      <span className="text-[#FF9F43] block text-[10px]">02</span> Value-First
                    </div>
                    <div className="p-3 rounded-lg bg-[#0D0D0F] border border-white/5 text-[#F6F5F2]">
                      <span className="text-[#FF9F43] block text-[10px]">03</span> Direct Audit
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 4: Client Tracker */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 order-2 lg:order-1 p-5 sm:p-7 rounded-2xl bg-[#141416] border border-white/10">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-[#949089] mb-4">
                    <span>Active Pipeline State</span>
                    <span className="text-[#FF9F43]">3 Negotiations</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0D0D0F] border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#F6F5F2] font-medium">Austin Dental Studio</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">Proposal Sent ($1,800)</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Follow-up scheduled: Tomorrow 10:00 AM</span>
                      <span>Channel: Direct Email</span>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-5 order-1 lg:order-2 space-y-3">
                  <div className="text-xs font-mono text-[#FF9F43]">04 / Client Tracker</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#F6F5F2]">
                    Never lose a lead.
                  </h3>
                  <p className="text-sm text-[#949089] leading-relaxed">
                    Track every conversation from initial discovery to signed deal. Know exactly who to follow up with and what to say next.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PRICING: $19 ONE-TIME (Crystal clear, no subscription clutter) */}
        {/* ========================================================================= */}
        <section id="pricing" className="py-24 sm:py-32 border-t border-white/[0.07]">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF9F43]">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#F6F5F2] mt-2">
              Start your 7-Day Sprint for $19.
            </h2>
            <p className="mt-3 text-base text-[#949089]">
              One single payment. Full lifetime access. Zero recurring fees.
            </p>

            <div className="mt-10 p-8 sm:p-12 rounded-2xl bg-[#141416] border border-white/10 relative overflow-hidden shadow-2xl">
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF9F43]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#FF9F43] mb-6">
                ONE-TIME PAYMENT
              </div>

              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl sm:text-7xl font-bold text-[#F6F5F2] tracking-tight">
                  $19
                </span>
                <span className="text-sm font-medium text-[#949089]">
                  USD
                </span>
              </div>

              <div className="mt-8 space-y-3 text-sm text-[#949089] max-w-md mx-auto text-left border-y border-white/[0.08] py-6">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#FF9F43] shrink-0" />
                  <span className="text-[#F6F5F2]">Full 7-Day First Client execution system</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#FF9F43] shrink-0" />
                  <span className="text-[#F6F5F2]">Offer builder & niche positioning generator</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#FF9F43] shrink-0" />
                  <span className="text-[#F6F5F2]">Prospect Opportunity & Vision Analyzer</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#FF9F43] shrink-0" />
                  <span className="text-[#F6F5F2]">Personalized outreach & follow-up generator</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#FF9F43] shrink-0" />
                  <span className="text-[#F6F5F2]">Lifetime commercial license — no monthly bill</span>
                </div>
              </div>

              <div className="mt-8 max-w-md mx-auto">
                <button
                  id="pricing-cta-btn"
                  onClick={handlePrimaryCta}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 px-8 rounded-xl bg-[#FF9F43] hover:bg-[#ffb066] text-[#0D0D0F] font-semibold text-base shadow-[0_0_30px_rgba(255,159,67,0.3)] hover:shadow-[0_0_40px_rgba(255,159,67,0.45)] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{entitlement ? 'Open Dashboard' : 'Start your 7-Day Sprint →'}</span>
                </button>
                <p className="mt-3 text-xs text-[#949089]">
                  Instant access • Official PayPal buyer protection
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CTA: Confident & Modern */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-36 border-t border-white/[0.07] text-center relative overflow-hidden bg-[#0D0D0F]">
          <div className="absolute inset-0 bg-grain opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[#FF9F43]/15 to-[#FF6B6B]/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="relative max-w-3xl mx-auto px-5 sm:px-8">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F6F5F2] leading-tight">
              Your first client <br />
              starts here.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#949089] max-w-md mx-auto">
              Stop watching tutorials. Start running the 7-day workflow today.
            </p>

            <div className="mt-9">
              <button
                id="final-cta-btn"
                onClick={handlePrimaryCta}
                className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl bg-[#FF9F43] hover:bg-[#ffb066] text-[#0D0D0F] font-semibold text-base shadow-[0_0_35px_rgba(255,159,67,0.3)] hover:shadow-[0_0_45px_rgba(255,159,67,0.5)] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{entitlement ? 'Open Sprint Workspace' : 'Start your 7-Day Sprint →'}</span>
              </button>
            </div>

            <p className="mt-4 text-xs text-[#949089]">
              $19 One-time • Instant access
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FOOTER */}
        {/* ========================================================================= */}
        <footer className="py-10 border-t border-white/[0.07] bg-[#0D0D0F] text-xs text-[#949089]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF9F43]" />
              <span className="font-semibold text-[#F6F5F2]">ClientFlow AI</span>
              <span className="text-white/20">—</span>
              <span>Turn your skills into clients.</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#product" className="hover:text-[#F6F5F2] transition-colors">
                Product
              </a>
              <a href="#how-it-works" className="hover:text-[#F6F5F2] transition-colors">
                How it works
              </a>
              <a href="#pricing" className="hover:text-[#F6F5F2] transition-colors">
                Pricing
              </a>
              <button
                onClick={handlePrimaryCta}
                className="hover:text-[#FF9F43] transition-colors cursor-pointer"
              >
                {entitlement ? 'Dashboard' : 'Start Sprint'}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
