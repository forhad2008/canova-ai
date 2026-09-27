import React from 'react';
import { X, Check, Sparkles, Zap, ShieldCheck, HeartHandshake } from 'lucide-react';
import { NovaStar } from '../common/NovaStar';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
}) => {
  if (!isOpen) return null;

  const features = [
    'Unlimited Gemini 3.1 Pro & Flash-thinking generation',
    'Real-time voice chat & low latency audio streaming',
    'Unlimited cloud file library & automatic encrypted backups',
    'Advanced neumorphic theme customizer & custom accent glows',
    'Priority high-throughput processing & zero rate limits',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="rounded-2xl p-6 w-full max-w-sm border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0F172A] text-center relative overflow-hidden shadow-2xl transition-all">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        {/* Pro Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-500/30 flex items-center justify-center mt-2 mb-3">
          <NovaStar size={28} glow={false} />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Upgrade to Canova Pro
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Unleash the full potential of your smart companion
        </p>

        {/* Pricing badge */}
        <div className="my-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/60 dark:border-white/10">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">$9.99</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium block mt-0.5">
            Cancel anytime • 7-day free trial included
          </span>
        </div>

        {/* Features list */}
        <div className="space-y-2.5 text-left mb-5">
          {features.map((feat, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={11} className="stroke-[2.5]" />
              </div>
              <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{feat}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={onUpgrade}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
        >
          Activate Pro Trial
        </button>
      </div>
    </div>
  );
};
