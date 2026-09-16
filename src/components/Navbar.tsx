import React from 'react';
import {
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Key,
} from 'lucide-react';
import { AppView, Entitlement } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCheckout: () => void;
  entitlement: Entitlement | null;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCheckout,
  entitlement,
  onSignOut,
}) => {
  const isLanding = currentView === 'landing';

  const handleCtaClick = () => {
    if (entitlement) {
      onNavigate('dashboard');
    } else {
      onOpenCheckout();
    }
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0D0D0F]/85 border-b border-white/[0.07] text-[#F6F5F2] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          id="nav-logo-btn"
          onClick={() => onNavigate(entitlement ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-7 h-7 rounded-lg bg-[#19191D] border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-[#FF9F43]/40 transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#FF9F43] shadow-[0_0_8px_#FF9F43]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-base tracking-tight text-[#F6F5F2] group-hover:text-white transition-colors">
              ClientFlow
            </span>
            <span className="text-[11px] font-medium tracking-wide text-[#949089] border border-white/10 rounded-md px-1.5 py-0.2 bg-[#141416]">
              AI
            </span>
          </div>
        </button>

        {/* Center Links (Landing only) */}
        {isLanding ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#949089]">
            <a
              href="#product"
              className="hover:text-[#F6F5F2] transition-colors"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#F6F5F2] transition-colors"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="hover:text-[#F6F5F2] transition-colors"
            >
              Pricing
            </a>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#949089] bg-[#141416] py-1.5 px-3.5 rounded-full border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F43] animate-pulse"></span>
            <span className="font-medium text-[#F6F5F2]">
              {entitlement ? '7-Day Sprint Active' : 'Preview Mode'}
            </span>
            <span className="mx-1 text-white/20">•</span>
            <button
              onClick={() => onNavigate('landing')}
              className="text-[#949089] hover:text-[#F6F5F2] cursor-pointer transition-colors"
            >
              Website
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {entitlement ? (
            /* Licensed User Header Actions */
            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#19191D] border border-white/10 text-[#949089] text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF9F43]" />
                <span className="text-[#F6F5F2]">Lifetime Access</span>
              </div>
              {isLanding ? (
                <button
                  id="nav-dashboard-open-btn"
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-[#FF9F43] hover:bg-[#ffb066] text-[#0D0D0F] shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
              ) : (
                <button
                  id="nav-signout-btn"
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-500/40 text-[#949089] hover:text-red-400 cursor-pointer transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          ) : isLanding ? (
            /* Unlicensed Landing Actions */
            <div className="flex items-center gap-3">
              <button
                id="nav-pricing-btn"
                onClick={onOpenCheckout}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#949089] hover:text-[#F6F5F2] cursor-pointer transition-colors px-2 py-1.5"
              >
                <Key className="w-3.5 h-3.5 text-[#FF9F43]" />
                <span>Enter Key</span>
              </button>
              <button
                id="nav-cta-btn"
                onClick={handleCtaClick}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-lg bg-[#FF9F43] hover:bg-[#ffb066] text-[#0D0D0F] shadow-[0_0_20px_rgba(255,159,67,0.2)] hover:shadow-[0_0_25px_rgba(255,159,67,0.35)] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Start Sprint</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            /* Unlicensed in Workspace */
            <button
              id="nav-buy-workspace-btn"
              onClick={onOpenCheckout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-[#FF9F43] hover:bg-[#ffb066] text-[#0D0D0F] shadow-sm cursor-pointer hover:scale-[1.02] transition-all"
            >
              <span>Unlock System ($19)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

