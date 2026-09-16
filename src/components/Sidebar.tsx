import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  FileText,
  Send,
  Calculator,
  Kanban,
  BookOpen,
  CalendarCheck,
  Sparkles,
  ArrowLeft,
  X,
} from 'lucide-react';
import { AppView, Entitlement } from '../types';
import { ShieldCheck, LogOut, Lock } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onSelectComingSoon: (title: string, description: string) => void;
  entitlement: Entitlement | null;
  onSignOut: () => void;
  onOpenCheckout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onCloseMobile,
  onSelectComingSoon,
  entitlement,
  onSignOut,
  onOpenCheckout,
}) => {
  const activeNavClasses =
    'bg-blue-600 text-white font-medium shadow-sm shadow-blue-500/20';
  const defaultNavClasses =
    'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/80 hover:text-neutral-950 dark:hover:text-white transition-colors';

  const mainTools = [
    {
      id: 'dashboard' as AppView,
      name: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'portfolio-analyzer' as AppView,
      name: 'Portfolio Analyzer',
      icon: FileCheck2,
      badge: 'Tool 1',
    },
    {
      id: 'proposal-generator' as AppView,
      name: 'Proposal Generator',
      icon: FileText,
      badge: 'Tool 2',
    },
    {
      id: 'cold-dm-generator' as AppView,
      name: 'Cold DM Generator',
      icon: Send,
      badge: 'Tool 3',
    },
  ];

  const comingSoonItems = [
    {
      name: 'Pricing Calculator',
      icon: Calculator,
      desc: 'Calculate competitive project & hourly rates based on US market data, expenses, and desired profit margins.',
    },
    {
      name: 'Client Tracker',
      icon: Kanban,
      desc: 'Visual Kanban pipeline to track leads from first cold DM to paid contract and invoice delivery.',
    },
    {
      name: '50 Client Prompts',
      icon: BookOpen,
      desc: 'Curated library of battle-tested outreach hooks, objection-handling templates, and follow-up sequences.',
    },
    {
      name: '7-Day Client System',
      icon: CalendarCheck,
      desc: 'Step-by-step daily sprint system designed for beginner freelancers to secure client discovery calls in 7 days.',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-72 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col h-full overflow-y-auto">
          {/* Sidebar Header with Logo */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-6">
            <button
              id="sidebar-logo-btn"
              onClick={() => {
                onNavigate('dashboard');
                onCloseMobile();
              }}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-neutral-950 dark:text-white">
                    ClientFlow AI
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Freelance Client Engine
                </p>
              </div>
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 md:hidden cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Navigation */}
          <div className="space-y-1 mb-8">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Core Workspace
            </div>
            {mainTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = currentView === tool.id;
              return (
                <button
                  key={tool.id}
                  id={`sidebar-link-${tool.id}`}
                  onClick={() => {
                    onNavigate(tool.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                    isActive ? activeNavClasses : defaultNavClasses
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    />
                    <span>{tool.name}</span>
                  </div>
                  {tool.badge && !isActive && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                      {tool.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Coming Soon Section */}
          <div className="space-y-1">
            <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              <span>Roadmap</span>
              <span className="text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded">
                Soon
              </span>
            </div>
            {comingSoonItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => onSelectComingSoon(item.name, item.desc)}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900/60 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-blue-500 transition-colors" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                    Coming Soon
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Card / License & Onboarding Goal */}
          <div className="mt-auto pt-5 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            {entitlement ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    $19 Lifetime Active
                  </span>
                  <button
                    onClick={onSignOut}
                    className="text-[10px] text-neutral-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer flex items-center gap-1"
                    title="Sign Out / Switch License"
                  >
                    <LogOut className="w-2.5 h-2.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80 truncate font-mono">
                  {entitlement.payerEmail}
                </p>
              </div>
            ) : (
              <button
                onClick={onOpenCheckout}
                className="w-full p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock All Tools ($19)</span>
              </button>
            )}

            {/* Back to landing page button */}
            <button
              id="sidebar-back-landing-btn"
              onClick={() => {
                onNavigate('landing');
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Landing Page</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
