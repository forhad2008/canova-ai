import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Bell, Clock, CheckCircle2, Flame, Volume2, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { soundFx } from '../../utils/audio';
import { useHaptics } from '../../utils/useHaptics';
import confetti from 'canvas-confetti';

interface TaskRoutineTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onCompleteTask?: (taskId: string) => void;
}

export const TaskRoutineTimerModal: React.FC<TaskRoutineTimerModalProps> = ({
  isOpen,
  onClose,
  task,
  onCompleteTask,
}) => {
  if (!isOpen || !task) return null;

  const { vibrateLight, vibrateMedium, vibrateSuccess } = useHaptics();

  const durationMins = task.routineDurationMins || 25;
  const [totalSeconds, setTotalSeconds] = useState<number>(durationMins * 60);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isVoiceAnnounced, setIsVoiceAnnounced] = useState<boolean>(false);

  // Play Pirates chime & Speech announcement on opening
  useEffect(() => {
    soundFx.playPiratesTheme();

    if ('speechSynthesis' in window && !isVoiceAnnounced) {
      try {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(
          `It's time for your task: ${task.title}. ${durationMins} minute routine starting now!`
        );
        msg.rate = 1.0;
        msg.pitch = 1.05;
        window.speechSynthesis.speak(msg);
        setIsVoiceAnnounced(true);
      } catch {}
    }
  }, [task, durationMins, isVoiceAnnounced]);

  // Countdown timer loop
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
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
      });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, totalSeconds, vibrateSuccess]);

  const toggleTimer = () => {
    vibrateMedium();
    soundFx.playClick();
    setIsActive(!isActive);
  };

  const addExtraMinutes = (mins: number) => {
    vibrateLight();
    soundFx.playClick();
    setTotalSeconds((prev) => prev + mins * 60);
  };

  const handleComplete = () => {
    vibrateSuccess();
    soundFx.playSuccess();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
    });
    if (onCompleteTask) {
      onCompleteTask(task.id);
    }
    onClose();
  };

  // Time calculations
  const minsLeft = Math.floor(totalSeconds / 60);
  const secsLeft = totalSeconds % 60;
  const timeFormatted = `${minsLeft.toString().padStart(2, '0')}:${secsLeft.toString().padStart(2, '0')}`;

  const maxSecs = durationMins * 60;
  const progressPct = Math.min(100, Math.max(0, ((maxSecs - totalSeconds) / maxSecs) * 100));

  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89
  const strokeOffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="rounded-3xl p-6 w-full max-w-md border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#070e1c]/90 backdrop-blur-xl text-center relative shadow-2xl space-y-5 border-t-purple-500/30">
        {/* Close button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl neu-inset hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-black dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
          <Bell size={13} className="text-purple-500 animate-bounce" />
          <span>Routine Time Alert!</span>
        </div>

        {/* Task Title & Details */}
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            It's time for "{task.title}"
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-[#9AA8C7] flex items-center justify-center gap-2">
            <span>Category: {task.category}</span>
            <span>•</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              Scheduled {task.routineTime || task.scheduledTime || 'Now'}
            </span>
          </p>
        </div>

        {/* SVG Circular Timer */}
        <div className="neu-inset rounded-3xl p-6 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/5 relative">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="routineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A978FF" />
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
                stroke="url(#routineGrad)"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
                {timeFormatted}
              </span>
              <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase mt-1">
                {durationMins}m Goal Routine
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 mt-4 w-full justify-center">
            <button
              onClick={toggleTimer}
              className={`px-6 py-2.5 rounded-xl font-black text-xs text-white flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  : 'neu-primary-btn'
              }`}
            >
              {isActive ? <Pause size={15} /> : <Play size={15} />}
              <span>{isActive ? 'Pause Routine' : 'Resume Routine'}</span>
            </button>

            <button
              onClick={() => addExtraMinutes(5)}
              className="px-3 py-2.5 rounded-xl neu-inset hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white font-extrabold text-xs flex items-center gap-1 transition-all cursor-pointer"
              title="Add 5 Minutes"
            >
              <Plus size={13} />
              <span>5m</span>
            </button>
          </div>
        </div>

        {/* 24-Hour Reset Notice & Completion Action */}
        <div className="space-y-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5">
            <AlertCircle size={13} className="shrink-0 text-amber-500" />
            <span>Completing task automatically resets alarm & schedule for 24h later.</span>
          </div>

          <button
            onClick={handleComplete}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <CheckCircle2 size={16} />
            <span>Mark Task Complete & Reset 24h</span>
          </button>
        </div>
      </div>
    </div>
  );
};
