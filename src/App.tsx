import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { DashboardHome } from './components/DashboardHome';
import { PortfolioAnalyzer } from './components/PortfolioAnalyzer';
import { ProposalGenerator } from './components/ProposalGenerator';
import { ColdDmGenerator } from './components/ColdDmGenerator';
import { ComingSoonModal } from './components/ComingSoonModal';
import { CheckoutModal } from './components/CheckoutModal';
import { PaywallGate } from './components/PaywallGate';
import {
  AppView,
  SavedActivity,
  PortfolioAnalysisResult,
  ProposalResult,
  ColdDmResult,
  Entitlement,
} from './types';
import { Menu, ChevronRight, LayoutDashboard, ShieldCheck, Lock } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('clientflow_theme');
    if (saved) return saved === 'dark';
    return true; // Dark-first visual identity as requested
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
  });

  // License and Entitlement state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [licenseToken, setLicenseToken] = useState<string>('');
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(true);

  // Saved activities in localStorage
  const [savedActivities, setSavedActivities] = useState<SavedActivity[]>(() => {
    const saved = localStorage.getItem('clientflow_activities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Current active data for prefilling tools when clicked from dashboard
  const [activePortfolioData, setActivePortfolioData] = useState<PortfolioAnalysisResult | null>(null);
  const [activeProposalData, setActiveProposalData] = useState<ProposalResult | null>(null);
  const [activeColdDmData, setActiveColdDmData] = useState<ColdDmResult | null>(null);

  // Synchronize dark class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('clientflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('clientflow_theme', 'light');
    }
  }, [isDark]);

  // Save activities to localStorage
  useEffect(() => {
    localStorage.setItem('clientflow_activities', JSON.stringify(savedActivities));
  }, [savedActivities]);

  // Verify entitlement & clean url on mount
  useEffect(() => {
    // 1. Remove any fake query parameters like ?license=granted or ?paid=true
    try {
      const url = new URL(window.location.href);
      if (
        url.searchParams.has('license') ||
        url.searchParams.has('paid') ||
        url.searchParams.has('status') ||
        url.searchParams.has('authorized')
      ) {
        url.searchParams.delete('license');
        url.searchParams.delete('paid');
        url.searchParams.delete('status');
        url.searchParams.delete('authorized');
        window.history.replaceState({}, '', url.pathname);
      }
    } catch {
      // ignore
    }

    // 2. Read stored token and verify cryptographically with backend
    const storedToken = localStorage.getItem('clientflow_license_token');
    if (!storedToken) {
      setIsVerifyingLicense(false);
      return;
    }

    async function verifyStoredToken(token: string) {
      try {
        const res = await fetch('/api/auth/verify-entitlement', {
          headers: { 'x-license-token': token },
        });
        const data = await res.json();
        if (res.ok && data.active && data.entitlement) {
          setLicenseToken(token);
          setEntitlement(data.entitlement);
        } else {
          // Token is invalid, expired, or revoked
          localStorage.removeItem('clientflow_license_token');
          setLicenseToken('');
          setEntitlement(null);
        }
      } catch (err) {
        console.error('License verification error:', err);
      } finally {
        setIsVerifyingLicense(false);
      }
    }

    verifyStoredToken(storedToken);
  }, []);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenComingSoon = (title: string, description: string) => {
    setComingSoon({ isOpen: true, title, description });
  };

  const handleSignOut = async () => {
    if (licenseToken) {
      try {
        await fetch('/api/auth/revoke-entitlement', {
          method: 'POST',
          headers: { 'x-license-token': licenseToken },
        });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem('clientflow_license_token');
    setLicenseToken('');
    setEntitlement(null);
    setCurrentView('landing');
  };

  const handleSaveActivity = (
    type: 'portfolio' | 'proposal' | 'cold-dm',
    title: string,
    subtitle: string,
    data: any
  ) => {
    const newActivity: SavedActivity = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      subtitle,
      date: 'Just now',
      data,
    };
    setSavedActivities((prev) => [newActivity, ...prev.slice(0, 19)]);
  };

  const handleSelectActivity = (activity: SavedActivity) => {
    if (activity.type === 'portfolio') {
      setActivePortfolioData(activity.data);
      setCurrentView('portfolio-analyzer');
    } else if (activity.type === 'proposal') {
      setActiveProposalData(activity.data);
      setCurrentView('proposal-generator');
    } else if (activity.type === 'cold-dm') {
      setActiveColdDmData(activity.data);
      setCurrentView('cold-dm-generator');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getToolTitle = () => {
    switch (currentView) {
      case 'portfolio-analyzer':
        return 'Portfolio Analyzer';
      case 'proposal-generator':
        return 'Proposal Generator';
      case 'cold-dm-generator':
        return 'Cold DM Generator';
      case 'dashboard':
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased transition-colors flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        entitlement={entitlement}
        onSignOut={handleSignOut}
      />

      {/* Main View Router */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          <LandingPage
            onNavigate={handleNavigate}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
            entitlement={entitlement}
          />
        </main>
      ) : (
        <div className="flex-1 flex">
          {/* App Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            isOpen={isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
            onSelectComingSoon={handleOpenComingSoon}
            entitlement={entitlement}
            onSignOut={handleSignOut}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />

          {/* Main Workspace Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
            {/* Strict Access Gating: Paywall Gate if user is unauthorized */}
            {!entitlement && !isVerifyingLicense ? (
              <PaywallGate
                toolName={getToolTitle()}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
                onOpenActivate={() => setIsCheckoutOpen(true)}
                onBackToLanding={() => setCurrentView('landing')}
              />
            ) : isVerifyingLicense ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mb-4" />
                <p className="text-xs text-neutral-500">Verifying secure license entitlement...</p>
              </div>
            ) : (
              <>
                {/* Top Workspace Bar */}
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    {/* Mobile sidebar trigger */}
                    <button
                      id="mobile-sidebar-toggle-btn"
                      onClick={() => setIsSidebarOpen(true)}
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 md:hidden text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 mr-2 cursor-pointer"
                      aria-label="Open sidebar"
                    >
                      <Menu className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>

                    {currentView !== 'dashboard' && (
                      <>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {getToolTitle()}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Status Indicator with Lifetime License */}
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="hidden sm:inline">Verified Lifetime License</span>
                      <span className="sm:hidden">$19 Active</span>
                    </span>
                  </div>
                </div>

                {/* Dynamic Tool Component Rendering */}
                {currentView === 'dashboard' && (
                  <DashboardHome
                    onNavigate={handleNavigate}
                    savedActivities={savedActivities}
                    onSelectActivity={handleSelectActivity}
                  />
                )}

                {currentView === 'portfolio-analyzer' && (
                  <PortfolioAnalyzer
                    onSaveActivity={handleSaveActivity}
                    initialData={activePortfolioData}
                    licenseToken={licenseToken}
                  />
                )}

                {currentView === 'proposal-generator' && (
                  <ProposalGenerator
                    onSaveActivity={handleSaveActivity}
                    initialData={activeProposalData}
                    licenseToken={licenseToken}
                  />
                )}

                {currentView === 'cold-dm-generator' && (
                  <ColdDmGenerator
                    onSaveActivity={handleSaveActivity}
                    initialData={activeColdDmData}
                    licenseToken={licenseToken}
                  />
                )}
              </>
            )}
          </main>
        </div>
      )}

      {/* Modals */}
      <ComingSoonModal
        isOpen={comingSoon.isOpen}
        title={comingSoon.title}
        description={comingSoon.description}
        onClose={() => setComingSoon((prev) => ({ ...prev, isOpen: false }))}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(token, ent) => {
          setLicenseToken(token);
          setEntitlement(ent);
          localStorage.setItem('clientflow_license_token', token);
          setCurrentView('dashboard');
        }}
      />
    </div>
  );
}
