import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  BookOpen,
  Clock,
  Target,
  ArrowRight,
  Star,
  Flame,
  Zap,
} from 'lucide-react';
import { ScreenType } from '../types';
import { soundFx } from '../utils/audio';

interface AnalyticsProps {
  onNavigate: (screen: ScreenType) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onNavigate }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [activeHoverPoint, setActiveHoverPoint] = useState<number | null>(4); // default active Fri

  const statsByPeriod = {
    weekly: {
      progress: 68,
      delta: '+12%',
      tasksDone: 14,
      studyTime: '12h',
      focusTime: '8h',
      goalsAchieved: 3,
      chartPoints: [
        { x: 10, y: 70, day: 'Mon', pct: '45%', hrs: '1.2h' },
        { x: 50, y: 60, day: 'Tue', pct: '52%', hrs: '1.5h' },
        { x: 90, y: 65, day: 'Wed', pct: '48%', hrs: '1.4h' },
        { x: 130, y: 50, day: 'Thu', pct: '60%', hrs: '2.0h' },
        { x: 170, y: 35, day: 'Fri', pct: '75%', hrs: '2.8h' },
        { x: 210, y: 40, day: 'Sat', pct: '70%', hrs: '2.2h' },
        { x: 260, y: 20, day: 'Sun', pct: '88%', hrs: '3.1h' },
      ],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    monthly: {
      progress: 84,
      delta: '+24%',
      tasksDone: 58,
      studyTime: '48h',
      focusTime: '36h',
      goalsAchieved: 11,
      chartPoints: [
        { x: 10, y: 80, day: 'W1', pct: '62%', hrs: '8h' },
        { x: 90, y: 55, day: 'W2', pct: '74%', hrs: '12h' },
        { x: 170, y: 40, day: 'W3', pct: '82%', hrs: '14h' },
        { x: 260, y: 22, day: 'W4', pct: '90%', hrs: '16h' },
      ],
      days: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    },
    yearly: {
      progress: 92,
      delta: '+38%',
      tasksDone: 420,
      studyTime: '310h',
      focusTime: '245h',
      goalsAchieved: 48,
      chartPoints: [
        { x: 10, y: 85, day: 'Q1', pct: '78%', hrs: '65h' },
        { x: 90, y: 60, day: 'Q2', pct: '84%', hrs: '78h' },
        { x: 170, y: 35, day: 'Q3', pct: '89%', hrs: '88h' },
        { x: 260, y: 15, day: 'Q4', pct: '95%', hrs: '98h' },
      ],
      days: ['Q1', 'Q2', 'Q3', 'Q4'],
    },
  };

  const current = statsByPeriod[period];

  const buildSvgPath = () => {
    const pts = current.chartPoints;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const mx = (p0.x + p1.x) / 2;
      path += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = buildSvgPath();
  const fillPath = `${linePath} L 280 95 L 0 95 Z`;

  return (
    <div className="relative flex flex-col space-y-4 px-5 py-4 pb-28 text-left select-none max-w-2xl mx-auto w-full">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">
            Overview
          </h2>
          <p className="text-xs font-semibold text-slate-800 dark:text-[#9AA8C7]">
            Productivity intelligence & analytics
          </p>
        </div>

        {/* 7-Day streak badge */}
        <div className="neu-card-subtle px-3 py-1.5 rounded-full border border-orange-500/30 flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-bold shadow-sm">
          <Flame size={14} className="fill-orange-500" />
          <span>7-Day Streak</span>
        </div>
      </div>

      {/* 2. Tabs: Weekly, Monthly, Yearly */}
      <div className="neu-inset p-1 rounded-full flex items-center gap-1">
        {(['weekly', 'monthly', 'yearly'] as const).map((tab) => {
          const isActive = period === tab;
          const label =
            tab === 'weekly' ? 'Weekly' : tab === 'monthly' ? 'Monthly' : 'Yearly';
          return (
            <button
              key={tab}
              onClick={() => {
                soundFx.playClick();
                setPeriod(tab);
                setActiveHoverPoint(0);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'neu-primary-btn text-white shadow-md'
                  : 'text-slate-800 dark:text-[#657394] hover:text-black dark:hover:text-[#9AA8C7]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 3. Hero Card: Total Progress with interactive wave chart */}
      <div className="neu-card rounded-3xl p-5 relative overflow-hidden bg-gradient-to-b from-[#F4F7FC] via-[#EEF2F9] to-[#E5ECF6] dark:from-[#0e1d3d] dark:via-[#09152e] dark:to-[#060e20] border border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-slate-900 dark:text-[#9AA8C7]">
            Total Progress
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <TrendingUp size={12} /> {current.delta}
          </span>
        </div>

        {/* Big percentage & interactive tooltip */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-3xl font-extrabold text-black dark:text-white tracking-tight">
            {current.progress}%
          </span>

          {activeHoverPoint !== null && current.chartPoints[activeHoverPoint] && (
            <div className="neu-inset px-2.5 py-1 rounded-lg border border-purple-500/30 text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 animate-fadeIn">
              <Zap size={11} className="text-cyan-600 dark:text-[#35C9FF]" />
              <span>
                {current.chartPoints[activeHoverPoint].day}: {current.chartPoints[activeHoverPoint].pct} ({current.chartPoints[activeHoverPoint].hrs})
              </span>
            </div>
          )}
        </div>

        {/* Wave SVG Chart with hoverable datapoints */}
        <div className="w-full h-24 pt-1 relative">
          <svg
            viewBox="0 0 280 95"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGlow2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4C7DFF" />
                <stop offset="50%" stopColor="#8B5CFF" />
                <stop offset="100%" stopColor="#35C9FF" />
              </linearGradient>

              <linearGradient id="chartFill2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B5CFF" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#4C7DFF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0B1730" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gradient Fill under wave */}
            <path d={fillPath} fill="url(#chartFill2)" />

            {/* Stroke Line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#chartGlow2)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="drop-shadow-[0_4px_12px_rgba(139,92,255,0.7)] transition-all duration-500"
            />

            {/* Data points with interactive hover */}
            {current.chartPoints.map((pt, idx) => (
              <g
                key={idx}
                className="cursor-pointer"
                onClick={() => {
                  soundFx.playClick();
                  setActiveHoverPoint(idx);
                }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activeHoverPoint === idx ? 6 : 4}
                  fill={activeHoverPoint === idx ? '#35C9FF' : '#8B5CFF'}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-all duration-200 drop-shadow-[0_0_8px_rgba(53,201,255,0.8)]"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Bottom scale labels */}
        <div className="flex justify-between items-center text-[10px] text-slate-800 dark:text-[#657394] pt-2 px-1 border-t border-black/5 dark:border-white/5">
          {current.days.map((d, i) => (
            <span
              key={i}
              onClick={() => {
                soundFx.playClick();
                setActiveHoverPoint(i);
              }}
              className={`cursor-pointer transition-colors font-medium ${
                activeHoverPoint === i ? 'text-purple-700 dark:text-purple-300 font-bold' : 'hover:text-black dark:hover:text-white'
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* 4. 2x2 Grid of Stat Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Tasks Done */}
        <div className="neu-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-[#9AA8C7] flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#8B5CFF]" /> Tasks Done
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-black dark:text-white">{current.tasksDone}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">↑ +1</span>
          </div>
        </div>

        {/* Study Time */}
        <div className="neu-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-[#9AA8C7] flex items-center gap-1.5">
              <BookOpen size={14} className="text-[#35C9FF]" /> Study Time
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-black dark:text-white">{current.studyTime}</span>
          </div>
        </div>

        {/* Focus Time */}
        <div className="neu-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-[#9AA8C7] flex items-center gap-1.5">
              <Clock size={14} className="text-[#D66BFF]" /> Focus Time
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-black dark:text-white">{current.focusTime}</span>
          </div>
        </div>

        {/* Goals Achieved */}
        <div className="neu-card rounded-2xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-[#9AA8C7] flex items-center gap-1.5">
              <Target size={14} className="text-[#4C7DFF]" /> Goals Achieved
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-black dark:text-white">{current.goalsAchieved}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">↑ +1</span>
          </div>
        </div>
      </div>

      {/* 5. Motivation bottom card */}
      <div className="neu-card rounded-2xl p-4 flex items-center justify-between gap-3 border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-[#F4F7FC] to-[#EEF2F9] dark:from-purple-900/15 dark:via-[#09152e] dark:to-[#060e20]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-700 dark:text-[#A978FF] flex items-center justify-center shrink-0 border border-purple-500/30">
            <Star size={18} fill="#7C4DFF" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-black dark:text-white">Small steps</h4>
            <p className="text-[11px] text-slate-800 dark:text-[#9AA8C7] font-medium">make big dreams.</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('tasks');
          }}
          aria-label="View Tasks"
          className="w-8 h-8 rounded-full neu-button flex items-center justify-center text-slate-900 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white cursor-pointer"
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
