import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Sparkles, CheckCircle2, Flame, Target } from 'lucide-react';
import { Task } from '../../types';
import { soundFx } from '../../utils/audio';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  tasks?: Task[];
  onSelectTask?: (task: Task | null) => void;
  onTaskCompleted?: (taskId: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  task,
  tasks = [],
  onSelectTask,
  onTaskCompleted,
}) => {
  if (!isOpen) return null;

  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [initialMinutes, setInitialMinutes] = useState(25);

  const pendingTasks = tasks.filter((t) => !t.completed);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => prev - 1);
      }, 1000);
    } else if (totalSeconds === 0) {
      setIsActive(false);
      soundFx.playSuccess();
      if (mode === 'focus' && task && onTaskCompleted) {
        onTaskCompleted(task.id);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, totalSeconds, mode, task, onTaskCompleted]);

  const toggleTimer = () => {
    soundFx.playClick();
    setIsActive(!isActive);
  };

  const resetTimer = (newMinutes: number) => {
    soundFx.playClick();
    setIsActive(false);
    setInitialMinutes(newMinutes);
    setTotalSeconds(newMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const maxSecs = initialMinutes * 60;
  const progressPercent = maxSecs > 0 ? ((maxSecs - totalSeconds) / maxSecs) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="rounded-2xl p-6 w-full max-w-sm border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0F172A] text-center relative shadow-2xl space-y-4">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X size={15} />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 text-xs font-semibold">
          <Flame size={13} className="text-orange-500" />
          <span>Pomodoro Focus Session</span>
        </div>

        {/* Task Selector Dropdown if tasks exist */}
        {pendingTasks.length > 0 && onSelectTask && (
          <div className="text-left">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Select Goal to Track Progress:
            </label>
            <select
              value={task ? task.id : ''}
              onChange={(e) => {
                soundFx.playClick();
                const selected = pendingTasks.find((t) => t.id === e.target.value) || null;
                onSelectTask(selected);
              }}
              className="w-full rounded-xl py-2 px-3 text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Custom Focus Goal --</option>
              {pendingTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
            {task ? task.title : 'Uninterrupted Focus Sprint'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {task ? `${task.category} • Progress syncs to Daily Goals` : 'Block distractions and achieve velocity'}
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#timerGrad)"
              strokeWidth="8"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progressPercent) / 100}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
              {formatTime(totalSeconds)}
            </span>
            <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium mt-1">
              {isActive ? 'Concentrating' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Timer Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => resetTimer(initialMinutes)}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Reset Timer"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={toggleTimer}
            className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer shadow-sm active:scale-[0.98] transition-all"
          >
            {isActive ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>

          {task && (
            <button
              onClick={() => {
                soundFx.playSuccess();
                if (onTaskCompleted) onTaskCompleted(task.id);
                onClose();
              }}
              className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 flex items-center justify-center cursor-pointer transition-colors"
              title="Mark Task Completed & Sync to Daily Goals"
            >
              <CheckCircle2 size={18} />
            </button>
          )}
        </div>

        {/* Preset Time Buttons */}
        <div className="flex justify-center gap-1.5 pt-3 border-t border-slate-200/60 dark:border-white/10 text-xs">
          <button
            onClick={() => {
              setMode('focus');
              resetTimer(25);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium text-xs cursor-pointer ${
              mode === 'focus' && initialMinutes === 25
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => {
              setMode('focus');
              resetTimer(50);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium text-xs cursor-pointer ${
              mode === 'focus' && initialMinutes === 50
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            50m Deep
          </button>
          <button
            onClick={() => {
              setMode('break');
              resetTimer(5);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium text-xs cursor-pointer ${
              mode === 'break'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            5m Break
          </button>
        </div>
      </div>
    </div>
  );
};
