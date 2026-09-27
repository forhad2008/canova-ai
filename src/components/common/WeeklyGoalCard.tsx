import React, { useId, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Target, CheckCircle2, Flame, Calendar, Trophy, ArrowUpRight, TrendingUp, Sparkles, ChevronRight, Sparkle } from 'lucide-react';
import { Task, ScreenType } from '../../types';
import { soundFx } from '../../utils/audio';

interface WeeklyGoalCardProps {
  tasks: Task[];
  onNavigate: (screen: ScreenType) => void;
  weeklyTarget?: number;
}

export const WeeklyGoalCard: React.FC<WeeklyGoalCardProps> = ({
  tasks = [],
  onNavigate,
  weeklyTarget = 15,
}) => {
  const [targetGoal, setTargetGoal] = useState<number>(() => {
    const saved = localStorage.getItem('canova_weekly_target_goal');
    return saved ? parseInt(saved, 10) : weeklyTarget;
  });

  const hasFiredConfettiRef = useRef(false);

  const uniqueId = useId().replace(/:/g, '_');
  const gradientId = `weeklyGoalGrad_${uniqueId}`;
  const successGradientId = `weeklySuccessGrad_${uniqueId}`;
  const glowId = `weeklyGlow_${uniqueId}`;

  // Filter tasks for this week or overall task completion count
  const weeklyTasks = tasks.filter((t) => t.dueDate === 'week' || t.dueDate === 'today');
  const completedWeeklyCount = tasks.filter((t) => t.completed).length;

  // Use the higher of total weekly tasks or targetGoal
  const totalTarget = Math.max(weeklyTasks.length, targetGoal);
  const percentage = Math.min(100, Math.round((completedWeeklyCount / totalTarget) * 100));

  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isGoalReached = completedWeeklyCount >= totalTarget || percentage >= 100;

  // Trigger confetti burst when 100% completion is reached
  useEffect(() => {
    if (isGoalReached && !hasFiredConfettiRef.current) {
      hasFiredConfettiRef.current = true;
      soundFx.playSuccess();
      
      // Launch vibrant confetti explosion
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6', '#34D399', '#38BDF8'],
      });

      // Secondary delay burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10B981', '#34D399', '#F59E0B'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#3B82F6', '#8B5CF6', '#EC4899'],
        });
      }, 250);
    } else if (!isGoalReached) {
      hasFiredConfettiRef.current = false;
    }
  }, [isGoalReached]);

  const triggerManualCelebration = () => {
    soundFx.playSuccess();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#8B5CF6', '#34D399'],
    });
  };

  // Days of current week indicator (Mon - Sun)
  const daysOfWeek = [
    { label: 'M', full: 'Mon', active: true },
    { label: 'T', full: 'Tue', active: true },
    { label: 'W', full: 'Wed', active: true },
    { label: 'T', full: 'Thu', active: true },
    { label: 'F', full: 'Fri', active: true },
    { label: 'S', full: 'Sat', active: false },
    { label: 'S', full: 'Sun', active: false },
  ];

  const handleTargetChange = (newTarget: number) => {
    soundFx.playClick();
    setTargetGoal(newTarget);
    localStorage.setItem('canova_weekly_target_goal', newTarget.toString());
  };

  return (
    <div className="neu-glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden liquid-shimmer transition-all duration-300">
      {/* Background ambient glow */}
      <div
        className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20 dark:opacity-30"
        style={{
          background: isGoalReached
            ? 'radial-gradient(circle, #10B981 0%, transparent 70%)'
            : 'radial-gradient(circle, #3B82F6 0%, #8B5CF6 100%)',
        }}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-black/5 dark:border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-500 dark:via-purple-500 dark:to-cyan-400 p-[1px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-[#071226] rounded-[11px] flex items-center justify-center text-blue-600 dark:text-cyan-300">
              <Target size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Weekly Goal Progress</span>
              {isGoalReached && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Goal Met 🎉
                </span>
              )}
            </h3>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-[#9AA8C7]">
              {completedWeeklyCount} of {totalTarget} target tasks completed
            </p>
          </div>
        </div>

        {/* Target Goal Selector Pill */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#050e20] neu-inset p-1 rounded-xl border border-black/5 dark:border-white/5">
          {[10, 15, 20].map((num) => (
            <button
              key={num}
              onClick={() => handleTargetChange(num)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                targetGoal === num
                  ? 'neu-primary-btn text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#657394] hover:text-slate-900 dark:hover:text-white'
              }`}
              title={`Set target to ${num} tasks/week`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Ring & Stats Grid */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* 1. Circular Progress Ring (Click to re-fire confetti celebration) */}
        <div
          onClick={triggerManualCelebration}
          title="Click to celebrate progress!"
          className="relative shrink-0 flex items-center justify-center cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="w-[92px] h-[92px] sm:w-[100px] sm:h-[100px] rounded-full neu-inset flex items-center justify-center p-1.5 shadow-inner">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="50%" stopColor="#7C4DFF" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
                <linearGradient id={successGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
                <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={isGoalReached ? '#10B981' : '#3B82F6'} floodOpacity="0.4" />
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

              {/* Foreground Animated Ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={isGoalReached ? `url(#${successGradientId})` : `url(#${gradientId})`}
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
              {isGoalReached ? (
                <div className="flex flex-col items-center animate-scale-in">
                  <Trophy size={22} className="text-emerald-500 drop-shadow-xs" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Target Met
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                    {percentage}
                    <span className="text-xs font-bold text-blue-600 dark:text-[#35C9FF]">%</span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-[#9AA8C7] uppercase tracking-wider mt-0.5">
                    Weekly
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Stats & Days Streak Bar */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Days Streak Badges (Mon - Sun) */}
          <div>
            <span className="text-[10px] font-bold text-slate-600 dark:text-[#9AA8C7] uppercase tracking-wider block mb-1">
              Active Days Streak
            </span>
            <div className="flex items-center gap-1">
              {daysOfWeek.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex-1 py-1 rounded-lg text-center text-[10px] font-black transition-all ${
                    day.active
                      ? 'bg-blue-500/15 text-blue-700 dark:text-cyan-300 border border-blue-500/30'
                      : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-slate-600 border border-transparent'
                  }`}
                  title={`${day.full}: ${day.active ? 'Task Completed' : 'Pending'}`}
                >
                  {day.label}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Pill Line */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-extrabold">
            <div className="neu-card-subtle px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-blue-700 dark:text-cyan-300 border border-blue-500/20">
              <TrendingUp size={12} className="text-blue-500" />
              <span>{totalTarget - completedWeeklyCount} to Goal</span>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('tasks');
              }}
              className="neu-button px-2.5 py-1 rounded-lg flex items-center gap-1 text-purple-700 dark:text-[#A978FF] hover:text-purple-900 dark:hover:text-white cursor-pointer shadow-xs transition-colors"
            >
              <span>View Tasks</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
