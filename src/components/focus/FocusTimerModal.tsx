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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="neu-card rounded-3xl p-6 w-full max-w-sm border border-black/10 dark:border-purple-500/30 bg-white dark:bg-[#071328] text-center relative shadow-2xl space-y-4">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full neu-button flex items-center justify-center text-slate-700 dark:text-[#9AA8C7] hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-xs"
        >
          <X size={15} />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30 text-orange-700 dark:text-orange-300 text-xs font-extrabold">
          <Flame size={13} className="text-orange-500 animate-pulse" />
          <span>Pomodoro Focus Session</span>
        </div>

        {/* Task Selector Dropdown if tasks exist */}
        {pendingTasks.length > 0 && onSelectTask && (
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-[#9AA8C7] block mb-1">
              Select Goal to Track Progress:
            </label>
            <select
              value={task ? task.id : ''}
              onChange={(e) => {
                soundFx.playClick();
                const selected = pendingTasks.find((t) => t.id === e.target.value) || null;
                onSelectTask(selected);
              }}
              className="w-full neu-inset rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none border border-purple-500/20"
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
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
            {task ? task.title : 'Uninterrupted Focus Sprint'}
          </h3>
          <p className="text-xs font-medium text-slate-600 dark:text-[#9AA8C7]">
            {task ? `${task.category} • Progress syncs to Daily Goals` : 'Block distractions and achieve velocity'}
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-2">
          <div className="absolute inset-0 rounded-full bg-purple-500/15 blur-xl animate-pulse" />

          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              className="text-slate-200 dark:text-white/10"
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
                <stop offset="0%" stopColor="#FF6B00" />
                <stop offset="50%" stopColor="#7C4DFF" />
                <stop offset="100%" stopColor="#35C9FF" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {formatTime(totalSeconds)}
            </span>
            <span className="text-[10px] text-orange-600 dark:text-orange-400 uppercase font-extrabold mt-1 tracking-wider">
              {isActive ? 'Concentrating' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Timer Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => resetTimer(initialMinutes)}
            className="w-10 h-10 rounded-full neu-button flex items-center justify-center text-slate-700 dark:text-[#9AA8C7] hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-xs"
            title="Reset Timer"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={toggleTimer}
            className="w-13 h-13 rounded-full neu-primary-btn flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            {isActive ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </button>

          {task && (
            <button
              onClick={() => {
                soundFx.playSuccess();
                if (onTaskCompleted) onTaskCompleted(task.id);
                onClose();
              }}
              className="w-10 h-10 rounded-full neu-button flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer shadow-xs"
              title="Mark Task Completed & Sync to Daily Goals"
            >
              <CheckCircle2 size={18} />
            </button>
          )}
        </div>

        {/* Preset Time Buttons */}
        <div className="flex justify-center gap-1.5 pt-2 border-t border-black/5 dark:border-white/6 text-xs">
          <button
            onClick={() => {
              setMode('focus');
              resetTimer(25);
            }}
            className={`px-2.5 py-1 rounded-full transition-all font-bold text-[11px] cursor-pointer ${
              mode === 'focus' && initialMinutes === 25
                ? 'neu-inset text-orange-600 dark:text-orange-300 border border-orange-500/30'
                : 'text-slate-600 dark:text-[#657394]'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => {
              setMode('focus');
              resetTimer(50);
            }}
            className={`px-2.5 py-1 rounded-full transition-all font-bold text-[11px] cursor-pointer ${
              mode === 'focus' && initialMinutes === 50
                ? 'neu-inset text-purple-600 dark:text-purple-300 border border-purple-500/30'
                : 'text-slate-600 dark:text-[#657394]'
            }`}
          >
            50m Deep
          </button>
          <button
            onClick={() => {
              setMode('break');
              resetTimer(5);
            }}
            className={`px-2.5 py-1 rounded-full transition-all font-bold text-[11px] cursor-pointer ${
              mode === 'break'
                ? 'neu-inset text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                : 'text-slate-600 dark:text-[#657394]'
            }`}
          >
            5m Break
          </button>
        </div>
      </div>
    </div>
  );
};
