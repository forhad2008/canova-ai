import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, CheckCircle2, Target, Zap, Clock, Sparkles } from 'lucide-react';
import { Task } from '../../types';
import { soundFx } from '../../utils/audio';
import { useHaptics } from '../../utils/useHaptics';

interface DeepWorkTimerModuleProps {
  tasks?: Task[];
  onToggleTask?: (id: string) => void;
  onSessionComplete?: (minutesLogged: number, taskId?: string) => void;
}

export const DeepWorkTimerModule: React.FC<DeepWorkTimerModuleProps> = ({
  tasks = [],
  onToggleTask,
  onSessionComplete,
}) => {
  const { vibrateLight, vibrateMedium, vibrateSuccess } = useHaptics();

  const activeTasks = tasks.filter((t) => !t.completed);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    activeTasks.length > 0 ? activeTasks[0].id : ''
  );

  const [blockMinutes, setBlockMinutes] = useState<25 | 50 | 5>(25);
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  // Sync timer when preset block changes and timer is idle
  const handleSelectBlock = (mins: 25 | 50 | 5) => {
    vibrateLight();
    soundFx.playClick();
    setIsActive(false);
    setBlockMinutes(mins);
    setTotalSeconds(mins * 60);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => prev - 1);
      }, 1000);
    } else if (totalSeconds === 0 && isActive) {
      setIsActive(false);
      vibrateSuccess();
      soundFx.playSuccess();

      if (onSessionComplete) {
        onSessionComplete(blockMinutes, selectedTaskId || undefined);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, totalSeconds, blockMinutes, selectedTaskId, onSessionComplete, vibrateSuccess]);

  const toggleTimer = () => {
    vibrateMedium();
    soundFx.playClick();
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    vibrateLight();
    soundFx.playClick();
    setIsActive(false);
    setTotalSeconds(blockMinutes * 60);
  };

  const handleMarkTaskComplete = () => {
    if (selectedTaskId && onToggleTask) {
      vibrateSuccess();
      soundFx.playSuccess();
      onToggleTask(selectedTaskId);
      // Select next available task if any
      const nextRemaining = activeTasks.filter((t) => t.id !== selectedTaskId);
      if (nextRemaining.length > 0) {
        setSelectedTaskId(nextRemaining[0].id);
      } else {
        setSelectedTaskId('');
      }
    }
  };

  // Format MM:SS
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Progress Percentage
  const maxSecs = blockMinutes * 60;
  const progressPct = Math.min(100, Math.max(0, ((maxSecs - totalSeconds) / maxSecs) * 100));

  // Circular SVG offset
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeOffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="neu-glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden liquid-shimmer border border-black/5 dark:border-white/10 shadow-xl space-y-4">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20 shadow-xs">
            <Flame size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Deep Work Pomodoro Block
            </h3>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-[#9AA8C7]">
              Liquid glass sprint timer for focused execution
            </p>
          </div>
        </div>

        {/* Live Active Status Badge */}
        <div
          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 border ${
            isActive
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 animate-pulse'
              : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-500 dark:text-zinc-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <span>{isActive ? 'In Session' : 'Ready'}</span>
        </div>
      </div>

      {/* Preset Block Selection Tabs */}
      <div className="flex items-center gap-2 neu-inset p-1 rounded-2xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5">
        <button
          onClick={() => handleSelectBlock(25)}
          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            blockMinutes === 25
              ? 'neu-primary-btn text-white shadow-md'
              : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
          }`}
        >
          <Zap size={13} />
          <span>25m Block</span>
        </button>

        <button
          onClick={() => handleSelectBlock(50)}
          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            blockMinutes === 50
              ? 'neu-primary-btn text-white shadow-md'
              : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
          }`}
        >
          <Sparkles size={13} />
          <span>50m Sprint</span>
        </button>

        <button
          onClick={() => handleSelectBlock(5)}
          className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
            blockMinutes === 5
              ? 'neu-primary-btn text-white shadow-md'
              : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
          }`}
        >
          <Clock size={13} />
          <span>5m Break</span>
        </button>
      </div>

      {/* Center Circular Timer & Direct Task Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
        {/* SVG Circular Timer Display */}
        <div className="neu-inset rounded-2xl p-4 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/5 relative">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="deepWorkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CFF" />
                  <stop offset="100%" stopColor="#35C9FF" />
                </linearGradient>
              </defs>

              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-200 dark:stroke-zinc-800"
                strokeWidth="7"
                fill="none"
              />

              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#deepWorkGrad)"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Time Countdown Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                {timeFormatted}
              </span>
              <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 tracking-wider uppercase mt-0.5">
                {blockMinutes} Min Session
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2 mt-3 w-full justify-center">
            <button
              onClick={toggleTimer}
              className={`px-5 py-2 rounded-xl font-black text-xs text-white flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  : 'neu-primary-btn'
              }`}
            >
              {isActive ? <Pause size={14} /> : <Play size={14} />}
              <span>{isActive ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={resetTimer}
              title="Reset Timer"
              className="p-2 rounded-xl neu-inset hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Task Selection directly from Task List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Target size={13} className="text-purple-600 dark:text-purple-400" />
              <span>Target Task Goal</span>
            </label>
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
              {activeTasks.length} pending
            </span>
          </div>

          {activeTasks.length > 0 ? (
            <div className="space-y-2">
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  soundFx.playClick();
                  vibrateLight();
                  setSelectedTaskId(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl neu-inset bg-white/70 dark:bg-black/70 border border-black/10 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {activeTasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
                    {t.title} ({t.duration || '30m'})
                  </option>
                ))}
              </select>

              {/* Selected Task Details Preview */}
              {selectedTask && (
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 truncate max-w-[170px]">
                      {selectedTask.title}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-800 dark:text-purple-200">
                      {selectedTask.category}
                    </span>
                  </div>

                  <button
                    onClick={handleMarkTaskComplete}
                    className="w-full py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center justify-center gap-1 border border-emerald-500/30 transition-all cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 size={12} />
                    <span>Mark Task Completed</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl neu-inset bg-white/40 dark:bg-black/40 text-center space-y-1 border border-black/5 dark:border-white/5">
              <CheckCircle2 size={20} className="mx-auto text-emerald-500" />
              <p className="text-xs font-bold text-slate-800 dark:text-white">All Tasks Completed!</p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-zinc-400">
                Pick a free-form focus block or add new tasks in Task Manager.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
