import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';
import { soundFx } from '../../utils/audio';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onTaskCompleted?: (taskId: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  task,
  onTaskCompleted,
}) => {
  if (!isOpen) return null;

  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

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
    setTotalSeconds(newMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent =
    ((mode === 'focus' ? 25 * 60 - totalSeconds : 5 * 60 - totalSeconds) /
      (mode === 'focus' ? 25 * 60 : 5 * 60)) *
    100;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="neu-card rounded-3xl p-6 w-full max-w-sm border border-purple-500/30 bg-[#071328] text-center relative shadow-2xl">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full neu-button flex items-center justify-center text-[#9AA8C7] hover:text-white cursor-pointer"
        >
          <X size={15} />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
          <Sparkles size={12} />
          <span>Deep Focus Sprint</span>
        </div>

        <h3 className="text-base font-bold text-white mb-0.5">
          {task ? task.title : 'Uninterrupted Sprint'}
        </h3>
        <p className="text-xs text-[#9AA8C7] mb-6">
          {task ? `${task.category} • Stay immersed` : 'Block distractions and achieve velocity'}
        </p>

        {/* Circular Progress Ring with Digital Display */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-6">
          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />

          {/* SVG Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="rgba(255,255,255,0.06)"
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
                <stop offset="0%" stopColor="#8B5CFF" />
                <stop offset="100%" stopColor="#35C9FF" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner Content */}
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
              {formatTime(totalSeconds)}
            </span>
            <span className="text-[11px] text-[#A978FF] uppercase font-semibold mt-1">
              {isActive ? 'In Progress' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => resetTimer(25)}
            className="w-10 h-10 rounded-full neu-button flex items-center justify-center text-[#9AA8C7] hover:text-white cursor-pointer"
            title="Reset to 25m"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={toggleTimer}
            className="w-14 h-14 rounded-full neu-primary-btn flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            {isActive ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
          </button>

          {task && (
            <button
              onClick={() => {
                soundFx.playSuccess();
                if (onTaskCompleted) onTaskCompleted(task.id);
                onClose();
              }}
              className="w-10 h-10 rounded-full neu-button flex items-center justify-center text-emerald-400 hover:text-emerald-300 cursor-pointer"
              title="Mark Task Complete"
            >
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>

        {/* Mode presets */}
        <div className="flex justify-center gap-2 pt-2 border-t border-white/6 text-xs">
          <button
            onClick={() => {
              setMode('focus');
              resetTimer(25);
            }}
            className={`px-3 py-1 rounded-full transition-all ${
              mode === 'focus' ? 'neu-inset text-purple-300 border border-purple-500/30' : 'text-[#657394]'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => {
              setMode('focus');
              resetTimer(50);
            }}
            className="px-3 py-1 rounded-full text-[#657394] hover:text-white"
          >
            50m Deep
          </button>
          <button
            onClick={() => {
              setMode('break');
              resetTimer(5);
            }}
            className={`px-3 py-1 rounded-full transition-all ${
              mode === 'break' ? 'neu-inset text-cyan-300 border border-cyan-500/30' : 'text-[#657394]'
            }`}
          >
            5m Break
          </button>
        </div>
      </div>
    </div>
  );
};
