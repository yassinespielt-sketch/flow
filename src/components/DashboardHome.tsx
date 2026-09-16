import React from 'react';
import {
  FileCheck2,
  FileText,
  Send,
  ArrowRight,
  Sparkles,
  Target,
  CheckCircle2,
  TrendingUp,
  Clock,
  History,
  Copy,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { AppView, SavedActivity } from '../types';

interface DashboardHomeProps {
  onNavigate: (view: AppView) => void;
  savedActivities: SavedActivity[];
  onSelectActivity: (activity: SavedActivity) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onNavigate,
  savedActivities,
  onSelectActivity,
}) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Onboarding Banner with exact required message */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to ClientFlow AI</span>
          </div>

          {/* Explicit onboarding message */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Get your first client faster.
          </h1>

          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Follow the 3-step freelance conversion engine below: audit your portfolio for commercial readiness, generate personalized cold DMs that get replies, and send winning proposals.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              id="dash-quickstart-btn"
              onClick={() => onNavigate('portfolio-analyzer')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 transition-all shadow-xs cursor-pointer"
            >
              <span>Step 1: Audit Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="dash-quickdm-btn"
              onClick={() => onNavigate('cold-dm-generator')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer"
            >
              <span>Step 2: Generate Cold DM</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* The 3 Core Required Dashboard Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>Primary Client Acquisition Tools</span>
          </h2>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Select an action to begin
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Analyze your portfolio */}
          <div
            id="dash-card-portfolio"
            onClick={() => onNavigate('portfolio-analyzer')}
            className="group relative p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60 group-hover:scale-105 transition-transform">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  Tool 1
                </span>
              </div>

              {/* Exact required title */}
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Analyze your portfolio
              </h3>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Upload your PDF, project images, or paste bio text. Get an 8-point commercial critique with score /100 and rewritten copy.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>Start Analysis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Create a proposal */}
          <div
            id="dash-card-proposal"
            onClick={() => onNavigate('proposal-generator')}
            className="group relative p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900/60 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                  Tool 2
                </span>
              </div>

              {/* Exact required title */}
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Create a proposal
              </h3>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Generate high-converting freelance proposals with deliverables, timelines, pricing, and tone refinement buttons.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Generate Proposal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Generate a personalized cold DM */}
          <div
            id="dash-card-colddm"
            onClick={() => onNavigate('cold-dm-generator')}
            className="group relative p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/60 group-hover:scale-105 transition-transform">
                  <Send className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  Tool 3
                </span>
              </div>

              {/* Exact required title */}
              <h3 className="text-lg font-bold text-neutral-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Generate a personalized cold DM
              </h3>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Generate 3 high-converting outreach angles (Soft, Direct, Value-first) tailored to any business to spark warm conversations.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Generate DMs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Beginner Freelancer Action Playbook */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span>The Beginner Freelancer Roadmap to $1k - $3k First Client</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Tested milestones to secure a client within 14 days
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900/50">
            Sprint Mode
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Phase 1: Readiness
            </div>
            <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
              Audit Portfolio &gt; 75/100
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Ensure you speak to business outcomes rather than student tools.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Phase 2: Outreach
            </div>
            <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
              Send 5 Value-First DMs Daily
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Offer a free quick mockup or pointer to warm up the prospect.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Phase 3: Closing
            </div>
            <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
              Submit a Confident Proposal
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Send within 3 hours of interest with clear scope, timeline, and deposit terms.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Generations & Activity Feed */}
      {savedActivities.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-neutral-400" />
              <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                Recent Saved Drafts & Analyses
              </h3>
            </div>
            <span className="text-xs text-neutral-400">
              Saved automatically in your browser
            </span>
          </div>

          <div className="space-y-2.5">
            {savedActivities.slice(0, 4).map((activity) => (
              <div
                key={activity.id}
                onClick={() => onSelectActivity(activity)}
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      activity.type === 'portfolio'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        : activity.type === 'proposal'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    }`}
                  >
                    {activity.type === 'portfolio' ? (
                      <FileCheck2 className="w-4 h-4" />
                    ) : activity.type === 'proposal' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      {activity.title}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {activity.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>{activity.date}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
