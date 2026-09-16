import React, { useState } from 'react';
import { X, Sparkles, Calculator, Kanban, BookOpen, CalendarCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  title,
  description,
  onClose,
}) => {
  // Mini interactive calculator state if "Pricing Calculator" is selected
  const isPricingCalc = title === 'Pricing Calculator';
  const [targetIncome, setTargetIncome] = useState(60000);
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState(25);
  const [expensesAndTaxes, setExpensesAndTaxes] = useState(30); // 30%

  if (!isOpen) return null;

  // Real formula for US beginner freelancers
  const annualTotal = targetIncome * (1 + expensesAndTaxes / 100);
  const totalBillableHoursYear = billableHoursPerWeek * 48; // 48 weeks allowing for vacations/sick days
  const recommendedHourlyRate = Math.round(annualTotal / totalBillableHoursYear);
  const recommendedProjectMin = Math.round(recommendedHourlyRate * 15); // typical 15-hour minimum project

  return (
    <div
      id="coming-soon-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900/60">
              {title === 'Pricing Calculator' ? (
                <Calculator className="w-5 h-5" />
              ) : title === 'Client Tracker' ? (
                <Kanban className="w-5 h-5" />
              ) : title === '50 Client Prompts' ? (
                <BookOpen className="w-5 h-5" />
              ) : (
                <CalendarCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-950 dark:text-white">{title}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Preview Mode
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Included in next weekly release
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {description}
          </p>

          {/* If Pricing Calculator, show functional interactive preview */}
          {isPricingCalc ? (
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 space-y-4 text-xs">
              <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                <span>Try the Quick Rate Estimator</span>
                <span className="text-blue-600 dark:text-blue-400 text-[11px]">Active Formula</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Desired Annual Income (Take-Home):</span>
                  <span className="font-bold font-mono">${targetIncome.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="150000"
                  step="5000"
                  value={targetIncome}
                  onChange={(e) => setTargetIncome(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Billable Client Hours / Week:</span>
                  <span className="font-bold font-mono">{billableHoursPerWeek} hrs/week</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="1"
                  value={billableHoursPerWeek}
                  onChange={(e) => setBillableHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                    Target Hourly Rate
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ${recommendedHourlyRate}
                    <span className="text-xs font-normal text-neutral-400">/hr</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                    Min. Project Size
                  </div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ${recommendedProjectMin}
                    <span className="text-xs font-normal text-neutral-400">/pkg</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Early Access Status</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                As a ClientFlow AI member, this feature will be unlocked in your dashboard automatically upon full rollout with zero added charge.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
