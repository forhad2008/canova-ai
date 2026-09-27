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
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ScreenType } from '../types';
import { soundFx } from '../utils/audio';

interface AnalyticsProps {
  onNavigate: (screen: ScreenType) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ onNavigate }) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

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

      {/* 3. Recharts Daily Completion Trend Chart */}
      <div className="neu-card rounded-3xl p-5 relative overflow-hidden bg-gradient-to-b from-[#F4F7FC] via-[#EEF2F9] to-[#E5ECF6] dark:from-[#0e1d3d] dark:via-[#09152e] dark:to-[#060e20] border border-black/5 dark:border-white/10 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 size={16} className="text-purple-600 dark:text-purple-400" />
              <span>Daily Completion Trend</span>
            </h3>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-[#9AA8C7]">
              Task productivity & completion rate per day
            </p>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <TrendingUp size={12} /> {current.delta}
          </span>
        </div>

        {/* Big percentage headline */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {current.progress}%
            </span>
            <span className="text-xs font-bold text-slate-500">Average Rate</span>
          </div>

          <div className="neu-inset px-3 py-1 rounded-xl border border-purple-500/30 text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
            <Zap size={12} className="text-cyan-500" />
            <span>{current.tasksDone} Tasks Completed</span>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="w-full h-48 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={current.chartPoints.map((pt) => ({
                day: pt.day,
                completionRate: parseInt(pt.pct),
                hours: parseFloat(pt.hrs),
              }))}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rechartsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CFF" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#35C9FF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 10 }}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-2xl bg-white/95 dark:bg-[#071329]/95 backdrop-blur-md border border-purple-500/30 shadow-2xl text-xs space-y-1">
                        <p className="font-extrabold text-slate-900 dark:text-white">{data.day}</p>
                        <p className="text-purple-600 dark:text-purple-300 font-bold">
                          Completion Rate: {data.completionRate}%
                        </p>
                        <p className="text-cyan-600 dark:text-cyan-400 font-semibold">
                          Logged Focus: {data.hours} hrs
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#8B5CFF"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#rechartsGradient)"
                activeDot={{ r: 6, fill: '#35C9FF', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
