import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, Flame, Trophy, X } from 'lucide-react';
import { NovaStar } from './NovaStar';
import { soundFx } from '../../utils/audio';
import { triggerHaptic } from '../../utils/useHaptics';

interface GlowUpConfettiCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: 'all_tasks' | 'daily_goal';
}

export const GlowUpConfettiCelebration: React.FC<GlowUpConfettiCelebrationProps> = ({
  isOpen,
  onClose,
  title = 'Goal Achieved!',
  message = 'Outstanding momentum! You have completed all your daily focus tasks.',
  type = 'all_tasks',
}) => {
  useEffect(() => {
    if (isOpen) {
      soundFx.playSuccess();
      triggerHaptic('success');

      // 1. Initial Confetti Burst
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#8B5CFF', '#35C9FF', '#10B981', '#FFD700', '#C026D3', '#FFFFFF'],
        disableForReducedMotion: true,
      });

      // 2. Secondary Side Cannons
      const timer = setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 70,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#8B5CFF', '#35C9FF', '#FFD700'],
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 70,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#10B981', '#C026D3', '#FFFFFF'],
        });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Framer Motion Glow-Up Card */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30, rotateX: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className="relative w-full max-w-sm rounded-3xl p-6 neu-glass-card border-2 border-purple-500/40 dark:border-purple-400/50 shadow-[0_0_50px_rgba(139,92,255,0.4)] text-center overflow-hidden z-10 bg-white/90 dark:bg-black/90"
          >
            {/* Background Radial Glow */}
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-purple-500/30 blur-2xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-cyan-500/30 blur-2xl pointer-events-none animate-pulse" />

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close celebration modal"
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Glowing Trophy / Star Icon */}
            <div className="relative my-3 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.12, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <NovaStar size={68} glow={true} />
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-lg border-2 border-white dark:border-black font-black"
              >
                {type === 'daily_goal' ? <Flame size={20} /> : <Trophy size={20} />}
              </motion.div>
            </div>

            {/* Header Content */}
            <div className="space-y-1 mt-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px] font-extrabold uppercase tracking-widest"
              >
                <Sparkles size={12} className="text-amber-500" />
                <span>Level Up Momentum</span>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-black text-slate-900 dark:text-white tracking-tight"
              >
                {title}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-xs font-semibold text-slate-600 dark:text-zinc-300 px-2 leading-relaxed"
              >
                {message}
              </motion.p>
            </div>

            {/* Action CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl neu-primary-btn font-extrabold text-xs tracking-wider uppercase shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                <CheckCircle2 size={16} />
                <span>Claim Reward & Continue</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
