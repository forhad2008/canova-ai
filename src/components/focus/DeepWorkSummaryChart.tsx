import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Flame, TrendingUp, Trophy, Calendar, Sparkles, Clock } from 'lucide-react';
import { soundFx } from '../../utils/audio';

const STORAGE_KEY = 'nova_deep_work_logs_v1';

export interface DailyDeepWorkLog {
  day: string;       // e.g. 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  minutes: number;   // accumulated deep work minutes
  fullDate?: string; // YYYY-MM-DD
}

const DEFAULT_WEEKLY_DATA: DailyDeepWorkLog[] = [
  { day: 'Mon', minutes: 75 },
  { day: 'Tue', minutes: 110 },
  { day: 'Wed', minutes: 90 },
  { day: 'Thu', minutes: 135 },
  { day: 'Fri', minutes: 80 },
  { day: 'Sat', minutes: 45 },
  { day: 'Sun', minutes: 60 },
];

export function getDeepWorkLogs(): DailyDeepWorkLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return DEFAULT_WEEKLY_DATA;
}

export function saveDeepWorkLogs(logs: DailyDeepWorkLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {}
}

export function logCompletedDeepWorkSession(minutes: number): DailyDeepWorkLog[] {
  const logs = getDeepWorkLogs();
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  const updated = logs.map((item) => {
    if (item.day === todayDayName) {
      return { ...item, minutes: item.minutes + minutes };
    }
    return item;
  });

  saveDeepWorkLogs(updated);
  return updated;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: DailyDeepWorkLog }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const hours = (data.minutes / 60).toFixed(1);
    return (
      <div className="p-3 rounded-2xl bg-black/90 dark:bg-[#081020]/95 backdrop-blur-md border border-purple-500/30 text-white shadow-xl text-xs space-y-1">
        <p className="font-extrabold text-purple-300 flex items-center gap-1">
          <Calendar size={12} />
          <span>{data.day} Deep Work</span>
        </p>
        <p className="font-black text-lg text-white font-mono">
          {data.minutes} <span className="text-xs text-cyan-300">mins ({hours} hrs)</span>
        </p>
      </div>
    );
  }
  return null;
};

export const DeepWorkSummaryChart: React.FC<{ logs?: DailyDeepWorkLog[] }> = ({
  logs: propLogs,
}) => {
  const [logs, setLogs] = useState<DailyDeepWorkLog[]>(propLogs || getDeepWorkLogs());

  useEffect(() => {
    if (!propLogs) {
      setLogs(getDeepWorkLogs());
    } else {
      setLogs(propLogs);
    }
  }, [propLogs]);

  // Calculate stats
  const totalMinutesThisWeek = logs.reduce((sum, item) => sum + item.minutes, 0);
  const totalHoursThisWeek = (totalMinutesThisWeek / 60).toFixed(1);
  const avgMinutesPerDay = Math.round(totalMinutesThisWeek / logs.length);

  // Peak day
  const peakLog = logs.reduce((max, item) => (item.minutes > max.minutes ? item : max), logs[0]);

  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todayLog = logs.find((l) => l.day === todayDayName) || { day: todayDayName, minutes: 0 };

  return (
    <div className="space-y-4">
      {/* Visual Header Badges */}
      <div className="grid grid-cols-3 gap-2 text-left">
        <div className="p-3 rounded-2xl neu-inset bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/5 space-y-0.5">
          <span className="text-[10px] font-extrabold text-slate-500 dark:text-[#9AA8C7] uppercase tracking-wider block">
            Today
          </span>
          <p className="text-sm font-black text-purple-600 dark:text-purple-400 font-mono">
            {todayLog.minutes}m
          </p>
          <span className="text-[9px] text-slate-400 font-bold block">
            {(todayLog.minutes / 60).toFixed(1)} hrs logged
          </span>
        </div>

        <div className="p-3 rounded-2xl neu-inset bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/5 space-y-0.5">
          <span className="text-[10px] font-extrabold text-slate-500 dark:text-[#9AA8C7] uppercase tracking-wider block">
            Weekly Peak
          </span>
          <p className="text-sm font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {peakLog.day} ({peakLog.minutes}m)
          </p>
          <span className="text-[9px] text-slate-400 font-bold block">Highest focus</span>
        </div>

        <div className="p-3 rounded-2xl neu-inset bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/5 space-y-0.5">
          <span className="text-[10px] font-extrabold text-slate-500 dark:text-[#9AA8C7] uppercase tracking-wider block">
            Daily Avg
          </span>
          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {avgMinutesPerDay}m
          </p>
          <span className="text-[9px] text-slate-400 font-bold block">
            {totalHoursThisWeek}h total
          </span>
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="p-3.5 rounded-2xl neu-inset bg-white/60 dark:bg-black/60 border border-black/5 dark:border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white px-1">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <TrendingUp size={14} className="text-purple-500" />
            <span>Daily Focus Accumulated (Minutes)</span>
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-300 font-mono font-extrabold bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/20">
            {totalHoursThisWeek} Hours
          </span>
        </div>

        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A978FF" stopOpacity={1} />
                  <stop offset="100%" stopColor="#35C9FF" stopOpacity={0.8} />
                </linearGradient>

                <linearGradient id="barGradientStandard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CFF" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#35C9FF" stopOpacity={0.4} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />

              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9AA8C7', fontSize: 11, fontWeight: 700 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#9AA8C7', fontSize: 10 }}
                unit="m"
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                {logs.map((entry, index) => {
                  const isToday = entry.day === todayDayName;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isToday ? 'url(#barGradientActive)' : 'url(#barGradientStandard)'}
                      stroke={isToday ? '#A978FF' : 'transparent'}
                      strokeWidth={isToday ? 1.5 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
