import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, CheckCircle2, Target, Zap, Clock, Sparkles, Volume2, VolumeX, Headphones, Radio, BarChart3 } from 'lucide-react';
import { Task } from '../../types';
import { soundFx } from '../../utils/audio';
import { useHaptics } from '../../utils/useHaptics';
import { ambientEngine, SOUNDSCAPE_OPTIONS, SoundscapeType } from '../../utils/ambientAudio';
import { DeepWorkSummaryChart, logCompletedDeepWorkSession, getDeepWorkLogs, DailyDeepWorkLog } from './DeepWorkSummaryChart';

export type FocusMood = 'violet' | 'forest' | 'ocean' | 'sunset' | 'midnight';

export interface FocusMoodOption {
  id: FocusMood;
  label: string;
  icon: string;
  bgGradient: string;
  ringColor: string;
  accentText: string;
  badgeBg: string;
  borderTint: string;
}

export const FOCUS_MOODS: FocusMoodOption[] = [
  {
    id: 'violet',
    label: 'Cyber Violet',
    icon: '🔮',
    bgGradient: 'from-purple-900/15 via-purple-600/5 to-cyan-500/10',
    ringColor: '#A978FF',
    accentText: 'text-purple-600 dark:text-purple-300',
    badgeBg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    borderTint: 'border-purple-500/20',
  },
  {
    id: 'forest',
    label: 'Deep Forest',
    icon: '🌲',
    bgGradient: 'from-emerald-950/25 via-emerald-800/10 to-teal-500/15',
    ringColor: '#10B981',
    accentText: 'text-emerald-600 dark:text-emerald-300',
    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    borderTint: 'border-emerald-500/25',
  },
  {
    id: 'ocean',
    label: 'Ocean Breeze',
    icon: '🌊',
    bgGradient: 'from-cyan-950/25 via-sky-800/10 to-blue-500/15',
    ringColor: '#06B6D4',
    accentText: 'text-cyan-600 dark:text-cyan-300',
    badgeBg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    borderTint: 'border-cyan-500/25',
  },
  {
    id: 'sunset',
    label: 'Sunset Glow',
    icon: '🌅',
    bgGradient: 'from-amber-950/25 via-orange-800/10 to-rose-500/15',
    ringColor: '#F59E0B',
    accentText: 'text-amber-600 dark:text-amber-300',
    badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    borderTint: 'border-amber-500/25',
  },
  {
    id: 'midnight',
    label: 'Midnight Cyber',
    icon: '🌙',
    bgGradient: 'from-indigo-950/35 via-slate-900/30 to-blue-900/20',
    ringColor: '#6366F1',
    accentText: 'text-indigo-600 dark:text-indigo-300',
    badgeBg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    borderTint: 'border-indigo-500/25',
  },
];

const MOOD_STORAGE_KEY = 'nova_focus_mood_v1';

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

  // Tab & Analytics state
  const [activeTab, setActiveTab] = useState<'timer' | 'analytics'>('timer');
  const [logs, setLogs] = useState<DailyDeepWorkLog[]>(getDeepWorkLogs());

  // Focus Mood state
  const [focusMood, setFocusMood] = useState<FocusMood>(() => {
    try {
      const saved = localStorage.getItem(MOOD_STORAGE_KEY);
      if (saved && FOCUS_MOODS.some((m) => m.id === saved)) {
        return saved as FocusMood;
      }
    } catch {}
    return 'violet';
  });

  const handleSelectMood = (mood: FocusMood) => {
    vibrateLight();
    soundFx.playClick();
    setFocusMood(mood);
    try {
      localStorage.setItem(MOOD_STORAGE_KEY, mood);
    } catch {}
  };

  const activeMood = FOCUS_MOODS.find((m) => m.id === focusMood) || FOCUS_MOODS[0];

  // Ambient soundscape state
  const [soundscape, setSoundscape] = useState<SoundscapeType>('off');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  // Soundscape switch handler
  const handleSelectSoundscape = (type: SoundscapeType) => {
    vibrateLight();
    soundFx.playClick();
    setSoundscape(type);
    ambientEngine.setSoundscape(type);
  };

  const handleVolumeChange = (newVol: number) => {
    setAmbientVolume(newVol);
    ambientEngine.setVolume(newVol);
  };

  // Cleanup soundscape on unmount
  useEffect(() => {
    return () => {
      ambientEngine.stopAll();
    };
  }, []);

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

      const updated = logCompletedDeepWorkSession(blockMinutes);
      setLogs(updated);

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
    const nextState = !isActive;
    setIsActive(nextState);

    // Auto-start ambient soundscape when timer starts if currently muted
    if (nextState && soundscape === 'off') {
      handleSelectSoundscape('rain');
    }
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
    <div className={`neu-glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden transition-all duration-500 border shadow-xl space-y-4 bg-gradient-to-br ${activeMood.bgGradient} ${activeMood.borderTint}`}>
      {/* Module Header & View Mode Switcher */}
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

        {/* Tab Switcher: Timer vs Visual Analytics Summary */}
        <div className="flex items-center gap-1 neu-inset p-1 rounded-xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5">
          <button
            onClick={() => {
              vibrateLight();
              soundFx.playClick();
              setActiveTab('timer');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'timer'
                ? 'neu-primary-btn text-white shadow-xs'
                : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
            }`}
          >
            <Clock size={12} />
            <span>Timer</span>
          </button>

          <button
            onClick={() => {
              vibrateLight();
              soundFx.playClick();
              setActiveTab('analytics');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'analytics'
                ? 'neu-primary-btn text-white shadow-xs'
                : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
            }`}
          >
            <BarChart3 size={12} />
            <span>Summary</span>
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <DeepWorkSummaryChart logs={logs} />
      ) : (
        <>
      {/* Focus Mood Ambient Tint Selector & Preset Block Selection */}
      <div className="space-y-2">
        {/* Mood Ambient UI Toggle Bar */}
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-[#9AA8C7] flex items-center gap-1">
            <span>🎨 Focus Mood:</span>
            <span className={`font-mono ${activeMood.accentText}`}>{activeMood.label}</span>
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl neu-inset bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5">
          {FOCUS_MOODS.map((m) => {
            const isSelected = focusMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMood(m.id)}
                title={`Switch to ${m.label}`}
                className={`py-1.5 px-1 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
                  isSelected
                    ? `${m.badgeBg} shadow-sm border scale-105 font-black`
                    : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
                }`}
              >
                <span>{m.icon}</span>
                <span className="hidden sm:inline truncate">{m.label.split(' ')[0]}</span>
              </button>
            );
          })}
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
      </div>

      {/* Center Circular Timer & Direct Task Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
        {/* SVG Circular Timer Display */}
        <div className="neu-inset rounded-2xl p-4 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 border border-black/5 dark:border-white/5 relative">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="deepWorkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={activeMood.ringColor} />
                  <stop
                    offset="100%"
                    stopColor={activeMood.ringColor === '#A978FF' ? '#35C9FF' : activeMood.ringColor}
                    stopOpacity={0.7}
                  />
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

      {/* Background Ambient Soundscape Player Section */}
      <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Headphones size={13} className="text-cyan-500" />
            <span>Focus Ambient Soundscape Layer</span>
          </label>

          {/* Equalizer Wave Indicator when playing */}
          {soundscape !== 'off' ? (
            <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              <div className="flex items-center gap-0.5">
                <div className="w-1 h-3 rounded-full bg-cyan-500 animate-pulse" />
                <div className="w-1 h-4 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-1 h-2 rounded-full bg-cyan-300 animate-pulse" />
              </div>
              <span className="text-[10px] font-extrabold text-cyan-700 dark:text-cyan-300">
                Synthesizing
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400">Tap preset to play</span>
          )}
        </div>

        {/* Liquid Glass Soundscape Selector Chips */}
        <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl neu-inset bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5">
          {SOUNDSCAPE_OPTIONS.map((opt) => {
            const isSelected = soundscape === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectSoundscape(opt.id)}
                title={opt.description}
                className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'neu-primary-btn text-white shadow-md scale-105 border border-white/20'
                    : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-base">{opt.icon}</span>
                <span className="truncate max-w-full">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Soundscape Description & Volume Control Bar */}
        {soundscape !== 'off' && (
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900/40 border border-cyan-500/30 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-cyan-200 flex items-center gap-1">
                <Radio size={12} className="text-cyan-400 animate-pulse" />
                <span>
                  {SOUNDSCAPE_OPTIONS.find((s) => s.id === soundscape)?.description}
                </span>
              </span>

              <button
                onClick={() => handleSelectSoundscape('off')}
                className="text-[10px] font-extrabold text-rose-300 hover:text-rose-200 underline cursor-pointer"
              >
                Mute Ambient
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVolumeChange(ambientVolume === 0 ? 0.5 : 0)}
                className="text-cyan-400 hover:text-cyan-300 cursor-pointer shrink-0"
              >
                {ambientVolume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-black/20 dark:bg-white/20"
              />

              <span className="text-[10px] font-mono font-black text-cyan-300 w-8 text-right shrink-0">
                {Math.round(ambientVolume * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};
