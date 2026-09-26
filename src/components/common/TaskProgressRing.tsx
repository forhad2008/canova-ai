import React, { useId } from 'react';
import { CheckCircle2, Sparkles, Flame, Trophy, TrendingUp } from 'lucide-react';

interface TaskProgressRingProps {
  total: number;
  completed: number;
  highPriorityPending?: number;
  activeTabLabel?: string;
}

export const TaskProgressRing: React.FC<TaskProgressRingProps> = ({
  total,
  completed,
  highPriorityPending = 0,
  activeTabLabel = 'Tasks',
}) => {
  const uniqueId = useId().replace(/:/g, '_');
  const gradientId = `taskCompletionGradient_${uniqueId}`;
  const successGradientId = `taskSuccessGradient_${uniqueId}`;
  const glowId = `progressGlow_${uniqueId}`;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isComplete = total > 0 && completed === total;

  // Dynamic status badges and messages
  const getStatusInfo = () => {
    if (total === 0) {
      return {
        badge: 'No Tasks Yet',
        badgeColor: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
        message: 'Add your first task to start tracking momentum',
        icon: <Sparkles size={13} className="text-purple-400" />,
      };
    }
    if (isComplete) {
      return {
        badge: 'Goal Crushed! 🎉',
        badgeColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30 font-bold',
        message: 'All scheduled tasks completed. Great job!',
        icon: <Trophy size={13} className="text-emerald-500" />,
      };
    }
    if (percentage >= 75) {
      return {
        badge: 'Almost Done! 🔥',
        badgeColor: 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border-rose-500/30 font-bold',
        message: 'Final stretch! Finish strong today.',
        icon: <Flame size={13} className="text-rose-500" />,
      };
    }
    if (percentage >= 50) {
      return {
        badge: 'Over Halfway ⚡',
        badgeColor: 'text-indigo-700 dark:text-indigo-300 bg-indigo-500/15 border-indigo-500/30 font-bold',
        message: 'Steady progress, keep the flow going.',
        icon: <TrendingUp size={13} className="text-indigo-500" />,
      };
    }
    if (percentage > 0) {
      return {
        badge: 'In Progress 🚀',
        badgeColor: 'text-purple-700 dark:text-purple-300 bg-purple-500/15 border-purple-500/30 font-bold',
        message: 'Momentum is building, tackle the next item.',
        icon: <TrendingUp size={13} className="text-purple-500" />,
      };
    }
    return {
      badge: 'Ready to Start 📋',
      badgeColor: 'text-slate-700 dark:text-slate-300 bg-slate-500/15 border-slate-500/30 font-bold',
      message: 'Choose your first priority and dive in.',
      icon: <Sparkles size={13} className="text-purple-400" />,
    };
  };

  const status = getStatusInfo();
  const pendingCount = Math.max(0, total - completed);

  return (
    <div className="neu-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-6 border border-black/8 dark:border-white/8 relative overflow-hidden transition-all duration-300">
      {/* Background ambient glow effect */}
      <div
        className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20 dark:opacity-30"
        style={{
          background: isComplete
            ? 'radial-gradient(circle, #10B981 0%, transparent 70%)'
            : 'radial-gradient(circle, #8B5CF6 0%, #38BDF8 100%)',
        }}
      />

      {/* 1. Circular Progress Bar SVG Ring */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Soft Neumorphic Outer Ring Ring Plate */}
        <div className="w-[96px] h-[96px] sm:w-[104px] sm:h-[104px] rounded-full neu-inset flex items-center justify-center p-1.5 shadow-inner">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <defs>
              {/* Vibrant dynamic gradient */}
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="60%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
              <linearGradient id={successGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              {/* Drop shadow for glow on stroke */}
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={isComplete ? '#10B981' : '#8B5CF6'} floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-200 dark:text-slate-800/60"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />

            {/* Animated Foreground Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={isComplete ? `url(#${successGradientId})` : `url(#${gradientId})`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              filter={`url(#${glowId})`}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Percentage Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            {isComplete ? (
              <div className="flex flex-col items-center animate-scale-in">
                <CheckCircle2 size={24} className="text-emerald-500 drop-shadow-sm" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                  100%
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  {percentage}
                  <span className="text-xs font-bold text-purple-600 dark:text-[#A978FF]">%</span>
                </span>
                <span className="text-[9px] font-bold text-slate-500 dark:text-[#9AA8C7] uppercase tracking-wider mt-0.5">
                  Done
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Progress Breakdown & Contextual Metrics */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Status Badge & Tab Context */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border ${status.badgeColor}`}>
            {status.icon}
            <span>{status.badge}</span>
          </div>

          <span className="text-[11px] font-bold text-slate-500 dark:text-[#9AA8C7]">
            {activeTabLabel} Overview
          </span>
        </div>

        {/* Motivational Message */}
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight truncate">
            {completed} of {total} Tasks Completed
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#9AA8C7] mt-0.5 line-clamp-1">
            {status.message}
          </p>
        </div>

        {/* Quick Metric Pills */}
        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
          <div className="neu-card-subtle px-2 py-0.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{completed} Completed</span>
          </div>

          <div className="neu-card-subtle px-2 py-0.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold text-slate-700 dark:text-[#9AA8C7]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span>{pendingCount} Remaining</span>
          </div>

          {highPriorityPending > 0 && (
            <div className="neu-card-subtle px-2 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300">
              <Flame size={11} className="text-rose-500" />
              <span>{highPriorityPending} High Priority</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
