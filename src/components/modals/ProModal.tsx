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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="neu-card rounded-3xl p-6 w-full max-w-sm border border-black/10 dark:border-purple-500/40 bg-white dark:bg-gradient-to-b dark:from-[#121c3b] dark:via-[#09142d] dark:to-[#050b18] text-center relative overflow-hidden shadow-2xl transition-all">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/15 dark:bg-purple-600/30 rounded-full blur-[70px] pointer-events-none" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full neu-button flex items-center justify-center text-black dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white cursor-pointer shadow-sm"
        >
          <X size={16} />
        </button>

        {/* Pro Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#7C4DFF] via-[#3B72FF] to-[#0284C7] dark:from-[#8B5CFF] dark:via-[#4C7DFF] dark:to-[#35C9FF] p-[2.5px] shadow-[0_4px_20px_rgba(124,77,255,0.4)] dark:shadow-[0_0_24px_rgba(139,92,255,0.6)] flex items-center justify-center mt-2 mb-3">
          <div className="w-full h-full bg-white dark:bg-[#071226] rounded-full flex items-center justify-center">
            <NovaStar size={30} glow={false} />
          </div>
        </div>

        <h3 className="text-xl font-black text-black dark:text-white tracking-tight">
          Upgrade to Canova Pro
        </h3>
        <p className="text-xs font-semibold text-slate-700 dark:text-[#9AA8C7] mt-1">
          Unleash the full potential of your smart companion
        </p>

        {/* Pricing badge */}
        <div className="my-4 neu-inset bg-[#F8FAFC] dark:bg-[#050d1e] rounded-2xl p-3.5 border border-purple-500/25 shadow-[inset_2px_3px_6px_rgba(166,180,204,0.35),inset_-2px_-2px_6px_rgba(255,255,255,0.9)] dark:shadow-none">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-3xl font-black text-black dark:text-white tracking-tight">$9.99</span>
            <span className="text-xs font-bold text-slate-800 dark:text-[#9AA8C7]">/ month</span>
          </div>
          <span className="text-[11px] text-purple-700 dark:text-purple-300 font-extrabold block mt-0.5">
            Cancel anytime • 7-day free trial included
          </span>
        </div>

        {/* Features list */}
        <div className="space-y-2.5 text-left mb-5">
          {features.map((feat, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-700 dark:text-[#A978FF] border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={11} className="stroke-[3]" />
              </div>
              <span className="text-[12px] font-bold text-black dark:text-[#E2E8F0] leading-snug">{feat}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={onUpgrade}
          className="w-full neu-primary-btn py-3 px-4 rounded-xl text-xs font-black text-white tracking-wide cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_4px_20px_rgba(124,77,255,0.4)]"
        >
          Activate Pro Trial
        </button>
      </div>
    </div>
  );
};
