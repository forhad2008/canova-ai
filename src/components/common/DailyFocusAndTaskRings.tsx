import React, { useState, useId, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Flame,
  Zap,
  TrendingUp,
  Plus,
  Play,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Task, ScreenType } from '../../types';
import { soundFx } from '../../utils/audio';

import confetti from 'canvas-confetti';

interface DailyFocusAndTaskRingsProps {
  tasks?: Task[];
  onNavigate: (screen: ScreenType) => void;
  initialFocusHours?: number;
  targetFocusHours?: number;
}

export const DailyFocusAndTaskRings: React.FC<DailyFocusAndTaskRingsProps> = ({
  tasks = [],
  onNavigate,
  initialFocusHours = 3.5,
  targetFocusHours = 5.0,
}) => {
  const [loggedFocusHours, setLoggedFocusHours] = useState<number>(() => {
    const saved = localStorage.getItem('canova_daily_focus_hours');
    return saved ? parseFloat(saved) : initialFocusHours;
  });

  const [focusTarget, setFocusTarget] = useState<number>(() => {
    const saved = localStorage.getItem('canova_daily_focus_target');
    return saved ? parseFloat(saved) : targetFocusHours;
  });

  const uniqueId = useId().replace(/:/g, '_');
  const focusGradId = `focusGradient_${uniqueId}`;
  const taskGradId = `taskGradient_${uniqueId}`;
  const focusGlowId = `focusGlow_${uniqueId}`;
  const taskGlowId = `taskGlow_${uniqueId}`;

  // 1. Daily Focus Calculation
  const focusPct = Math.min(100, Math.round((loggedFocusHours / focusTarget) * 100));

  // 2. Tasks Completed Calculation
  const todayTasks = tasks.filter((t) => t.dueDate === 'today' || !t.dueDate);
  const activeTaskList = todayTasks.length > 0 ? todayTasks : tasks;
  const completedCount = activeTaskList.filter((t) => t.completed).length;
  const totalCount = Math.max(1, activeTaskList.length);
  const tasksPct = Math.min(100, Math.round((completedCount / totalCount) * 100));

  // Circle Dimensions
  const radius = 34;
  const circumference = 2 * Math.PI * radius; // ~213.62
  const focusOffset = circumference - (focusPct / 100) * circumference;
  const taskOffset = circumference - (tasksPct / 100) * circumference;

  const handleAddFocusSession = () => {
    soundFx.playSuccess();
    const updated = Math.min(focusTarget + 2, Math.round((loggedFocusHours + 0.5) * 10) / 10);
    if (updated >= focusTarget && loggedFocusHours < focusTarget) {
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#35C9FF', '#8B5CFF', '#10B981', '#FFD700'],
      });
    }
    setLoggedFocusHours(updated);
    localStorage.setItem('canova_daily_focus_hours', updated.toString());
  };

  const handleResetFocus = () => {
    soundFx.playClick();
    setLoggedFocusHours(0);
    localStorage.setItem('canova_daily_focus_hours', '0');
  };

  return (
    <div className="neu-glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden liquid-shimmer border border-black/5 dark:border-white/10 shadow-xl space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 dark:bg-purple-500/25 text-purple-700 dark:text-[#A978FF] flex items-center justify-center border border-purple-500/20">
            <Zap size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Daily Pulse & Focus Rings
            </h3>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-[#9AA8C7]">
              Real-time focus hours & task completion momentum
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('analytics');
          }}
          className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>Analytics</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Side-by-side Circular SVG Progress Rings */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Ring 1: Daily Focus */}
        <div className="neu-inset rounded-2xl p-3.5 flex flex-col items-center justify-between border border-black/5 dark:border-zinc-800 bg-white/40 dark:bg-black/60 relative group hover:border-cyan-500/40 transition-all">
          <div className="w-full flex items-center justify-between text-[10px] font-extrabold text-slate-700 dark:text-[#9AA8C7] mb-1">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-cyan-600 dark:text-[#35C9FF]" />
              <span>Daily Focus</span>
            </span>
            <span className="text-cyan-600 dark:text-[#35C9FF] font-bold tabular-nums">{focusPct}%</span>
          </div>

          {/* SVG Circular Ring for Focus */}
          <div className="relative w-24 h-24 my-1 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
              <defs>
                <linearGradient id={focusGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#35C9FF" />
                  <stop offset="100%" stopColor="#8B5CFF" />
                </linearGradient>
                <filter id={focusGlowId} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Track Circle */}
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="stroke-slate-200 dark:stroke-zinc-800"
                strokeWidth="7"
                fill="none"
              />

              {/* Animated Progress Circle */}
              <circle
                cx="45"
                cy="45"
                r={radius}
                stroke={`url(#${focusGradId})`}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={focusOffset}
                strokeLinecap="round"
                fill="none"
                filter={`url(#${focusGlowId})`}
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Center Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight tabular-nums font-mono">
                {loggedFocusHours}h
              </span>
              <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 tabular-nums">
                / {focusTarget} hrs
              </span>
            </div>
          </div>

          {/* Quick Action Button for Focus */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-black/5 dark:border-zinc-800/80">
            <button
              onClick={handleAddFocusSession}
              aria-label="Add 30 mins Focus"
              className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-[#35C9FF] text-[10px] font-bold flex items-center gap-1 border border-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={10} />
              <span>+30m Focus</span>
            </button>

            <button
              onClick={handleResetFocus}
              title="Reset Focus Timer"
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <RotateCcw size={11} />
            </button>
          </div>
        </div>

        {/* Ring 2: Tasks Completed */}
        <div className="neu-inset rounded-2xl p-3.5 flex flex-col items-center justify-between border border-black/5 dark:border-zinc-800 bg-white/40 dark:bg-black/60 relative group hover:border-purple-500/40 transition-all">
          <div className="w-full flex items-center justify-between text-[10px] font-extrabold text-slate-700 dark:text-[#9AA8C7] mb-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-purple-600 dark:text-[#8B5CFF]" />
              <span>Tasks Done</span>
            </span>
            <span className="text-purple-600 dark:text-[#8B5CFF] font-bold">{tasksPct}%</span>
          </div>

          {/* SVG Circular Ring for Tasks */}
          <div className="relative w-24 h-24 my-1 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
              <defs>
                <linearGradient id={taskGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CFF" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <filter id={taskGlowId} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Track Circle */}
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="stroke-slate-200 dark:stroke-zinc-800"
                strokeWidth="7"
                fill="none"
              />

              {/* Animated Progress Circle */}
              <circle
                cx="45"
                cy="45"
                r={radius}
                stroke={`url(#${taskGradId})`}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={taskOffset}
                strokeLinecap="round"
                fill="none"
                filter={`url(#${taskGlowId})`}
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Center Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                {completedCount}
              </span>
              <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400">
                / {totalCount} tasks
              </span>
            </div>
          </div>

          {/* Quick Action Button for Tasks */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-black/5 dark:border-zinc-800/80">
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('tasks');
              }}
              className="w-full py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-[#8B5CFF] text-[10px] font-bold flex items-center justify-center gap-1 border border-purple-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Manage Tasks</span>
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
