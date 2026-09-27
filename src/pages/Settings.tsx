import React, { useState } from 'react';
import {
  ChevronLeft,
  Moon,
  Sun,
  Bell,
  Cpu,
  Shield,
  Trash2,
  Check,
  Sparkles,
  Download,
  Clock,
  Plus,
  X,
  Volume2,
  CheckCircle,
} from 'lucide-react';
import { ScreenType } from '../types';
import { soundFx } from '../utils/audio';
import { useTheme } from '../utils/ThemeContext';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import {
  getCheckinSettings,
  saveCheckinSettings,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendBrowserNotification,
  DailyCheckinSettings,
} from '../utils/alarmService';
import {
  getAutoResetSettings,
  saveAutoResetSettings,
  getTimeUntilNextReset,
  AutoResetSettings,
} from '../utils/autoResetService';

interface SettingsProps {
  onBack: () => void;
  onClearData: () => void;
  onOpenInstallModal?: (tab?: 'desktop' | 'android') => void;
}

export const Settings: React.FC<SettingsProps> = ({
  onBack,
  onClearData,
  onOpenInstallModal,
}) => {
  const { theme, setTheme } = useTheme();
  const [haptics, setHaptics] = useState(true);
  const [aiModel, setAiModel] = useState('gemini-3.8-flash');
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [clearedMessage, setClearedMessage] = useState(false);

  // Daily Goal Check-in Settings State
  const [checkinSettings, setCheckinSettings] = useState<DailyCheckinSettings>(() =>
    getCheckinSettings()
  );

  // 24-Hour Auto-Reset Settings State
  const [autoReset, setAutoReset] = useState<AutoResetSettings>(() => getAutoResetSettings());
  const [nextResetTimer, setNextResetTimer] = useState(() =>
    getTimeUntilNextReset(autoReset.lastResetTimestamp)
  );

  React.useEffect(() => {
    const timerId = setInterval(() => {
      setNextResetTimer(getTimeUntilNextReset(autoReset.lastResetTimestamp));
    }, 1000);
    return () => clearInterval(timerId);
  }, [autoReset.lastResetTimestamp]);

  const handleToggleAutoReset = () => {
    soundFx.playClick();
    const nextEnabled = !autoReset.enabled;
    const updated: AutoResetSettings = {
      enabled: nextEnabled,
      // If enabling for the first time, reset cycle starts from now
      lastResetTimestamp: nextEnabled ? Date.now() : autoReset.lastResetTimestamp,
    };
    setAutoReset(updated);
    saveAutoResetSettings(updated);
  };
  const [newCheckinTime, setNewCheckinTime] = useState('12:00');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermissionStatus()
  );
  const [testNotifSent, setTestNotifSent] = useState(false);

  const handleToggleCheckins = () => {
    soundFx.playClick();
    const updated = { ...checkinSettings, enabled: !checkinSettings.enabled };
    setCheckinSettings(updated);
    saveCheckinSettings(updated);

    if (updated.enabled && notifPermission !== 'granted') {
      requestNotificationPermission().then(() => {
        setNotifPermission(getNotificationPermissionStatus());
      });
    }
  };

  const handleAddCheckinTime = () => {
    if (!newCheckinTime) return;
    soundFx.playClick();
    if (!checkinSettings.times.includes(newCheckinTime)) {
      const updatedTimes = [...checkinSettings.times, newCheckinTime].sort();
      const updated = { ...checkinSettings, times: updatedTimes };
      setCheckinSettings(updated);
      saveCheckinSettings(updated);
    }
  };

  const handleRemoveCheckinTime = (timeToRemove: string) => {
    soundFx.playClick();
    const updatedTimes = checkinSettings.times.filter((t) => t !== timeToRemove);
    const updated = { ...checkinSettings, times: updatedTimes };
    setCheckinSettings(updated);
    saveCheckinSettings(updated);
  };

  const handleTestCheckinNotification = async () => {
    soundFx.playClick();
    if (notifPermission !== 'granted') {
      const granted = await requestNotificationPermission();
      setNotifPermission(getNotificationPermissionStatus());
      if (!granted) return;
    }

    sendBrowserNotification('🎯 Daily Goal Check-in Test', {
      body: 'Canova AI Check-in active! Review your daily tasks & milestone progress.',
    });
    setTestNotifSent(true);
    setTimeout(() => setTestNotifSent(false), 2500);
  };

  const handleToggleSound = () => {
    const next = !soundEffects;
    setSoundEffects(next);
    soundFx.enabled = next;
    if (next) soundFx.playSuccess();
  };

  const handleReset = () => {
    onClearData();
    setClearedMessage(true);
    setTimeout(() => setClearedMessage(false), 2000);
  };

  return (
    <div className="relative flex flex-col space-y-5 px-5 py-4 pb-28 text-left select-none max-w-2xl mx-auto w-full">
      {/* 1. Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-8 h-8 rounded-full neu-button flex items-center justify-center text-slate-700 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#9AA8C7]">
            Daily Goal Check-ins, Task Alarms & System Preferences
          </p>
        </div>
      </div>

      {/* 2. Daily Goal Check-in Times & Task Alarms */}
      <div className="neu-card rounded-2xl p-4 space-y-4 border border-purple-500/30 bg-white dark:bg-[#071329]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-purple-700 dark:text-[#A978FF]">
            <Clock size={18} className="text-purple-600 dark:text-[#8B5CFF]" />
            <span>Daily Goal Check-in Schedule</span>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30">
            Web Notifications API
          </span>
        </div>

        <p className="text-[11px] font-medium text-slate-600 dark:text-[#9AA8C7] leading-relaxed">
          Configure daily check-in times. Canova AI will alert you via browser notifications to review your goals and log progress.
        </p>

        {/* Master Check-in Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl neu-inset bg-[#F8FAFC] dark:bg-[#050d1e] border border-black/5 dark:border-white/5">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Enable Daily Goal Check-ins</h4>
            <p className="text-[10.5px] text-slate-500 dark:text-[#657394]">
              Status: {checkinSettings.enabled ? 'Active Alerts' : 'Disabled'}
            </p>
          </div>
          <button
            onClick={handleToggleCheckins}
            aria-label="Toggle Daily Goal Check-ins"
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              checkinSettings.enabled ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                checkinSettings.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Check-in Time Slots */}
        {checkinSettings.enabled && (
          <div className="space-y-3 pt-1">
            <label className="text-[11px] font-bold text-slate-800 dark:text-[#9AA8C7] block">
              Scheduled Daily Check-in Times:
            </label>

            <div className="flex flex-wrap gap-2">
              {checkinSettings.times.map((timeSlot) => (
                <div
                  key={timeSlot}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-800 dark:text-purple-200 border border-purple-500/30 text-xs font-mono font-bold shadow-2xs"
                >
                  <Bell size={12} className="text-purple-600 dark:text-purple-400" />
                  <span>{timeSlot}</span>
                  <button
                    onClick={() => handleRemoveCheckinTime(timeSlot)}
                    className="text-slate-400 hover:text-red-500 cursor-pointer ml-1"
                    title="Remove check-in time"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new check-in time slot */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="time"
                value={newCheckinTime}
                onChange={(e) => setNewCheckinTime(e.target.value)}
                className="neu-inset rounded-xl py-1.5 px-3 text-xs font-mono text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none"
              />
              <button
                onClick={handleAddCheckinTime}
                className="neu-button px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Time Slot</span>
              </button>
            </div>

            {/* Test Notification Action */}
            <div className="pt-2 flex items-center justify-between border-t border-black/5 dark:border-white/5 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-[#657394] font-medium">
                Notification Permission: <strong className="text-purple-600 dark:text-purple-300 capitalize">{notifPermission}</strong>
              </span>
              <button
                onClick={handleTestCheckinNotification}
                className="neu-primary-btn px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {testNotifSent ? <CheckCircle size={13} /> : <Bell size={13} />}
                <span>{testNotifSent ? 'Test Alert Sent!' : 'Test Notification'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2B. 24-Hour Auto-Reset Tasks Switch */}
      <div className="neu-card rounded-2xl p-4 space-y-3.5 border border-cyan-500/30 bg-white dark:bg-[#071329]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-600 dark:text-[#35C9FF]">
            <Clock size={18} className="text-cyan-500" />
            <span>24-Hour Task Auto-Reset</span>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            autoReset.enabled
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20'
          }`}>
            {autoReset.enabled ? 'Auto-Reset ON' : 'Disabled'}
          </span>
        </div>

        <p className="text-[11px] font-medium text-slate-600 dark:text-[#9AA8C7] leading-relaxed">
          When turned on, all completed tasks will automatically reset every 24 hours so you can start each day with a fresh task list.
        </p>

        {/* Master Auto-Reset Toggle Control */}
        <div className="flex items-center justify-between p-3 rounded-xl neu-inset bg-[#F8FAFC] dark:bg-[#050d1e] border border-black/5 dark:border-white/5">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Auto-Reset All Tasks Every 24 Hours</h4>
            <p className="text-[10.5px] text-slate-500 dark:text-[#657394]">
              {autoReset.enabled
                ? `Next reset cycle in: ${nextResetTimer.formatted}`
                : 'Turn on to enable 24h reset cycle'}
            </p>
          </div>
          <button
            onClick={handleToggleAutoReset}
            aria-label="Toggle 24-Hour Task Auto-Reset"
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              autoReset.enabled ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                autoReset.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {autoReset.enabled && (
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between text-xs font-medium text-cyan-800 dark:text-cyan-200">
            <span>Cycle duration: 24 Hours (86,400s)</span>
            <button
              onClick={() => {
                soundFx.playClick();
                handleReset();
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-900 dark:text-cyan-100 font-bold transition-colors cursor-pointer"
            >
              Reset Tasks Now
            </button>
          </div>
        )}
      </div>

      {/* 3. AI Intelligence Settings */}
      <div className="neu-card rounded-2xl p-4 space-y-3.5 border border-purple-500/20">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
          <Cpu size={16} className="text-[#8B5CFF]" />
          <span>AI Engine Configuration</span>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-700 dark:text-[#9AA8C7] block mb-1.5">
            Gemini Reasoning Model
          </label>
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="w-full neu-inset rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none"
          >
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (High Speed & Multimodal)</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Reasoning & Code)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra Low Latency)</option>
          </select>
        </div>
      </div>

      {/* 4. Interface Preferences */}
      <div className="neu-card rounded-2xl p-4 space-y-4 border border-black/8 dark:border-white/8">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
          <Moon size={16} className="text-[#35C9FF]" />
          <span>Interface & Aesthetics</span>
        </div>

        {/* Neumorphic Theme Mode Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/6">
          <div>
            <h4 className="text-xs font-medium text-slate-900 dark:text-white">Neumorphic Color Scheme</h4>
            <p className="text-[11px] text-slate-600 dark:text-[#657394]">
              {theme === 'light' ? 'Soft White Clay Edition' : 'Deep Space Dark Edition'}
            </p>
          </div>
          <div className="flex items-center gap-1 neu-inset p-1 rounded-xl">
            <button
              onClick={() => {
                soundFx.playClick();
                setTheme('light');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'neu-primary-btn text-white'
                  : 'text-slate-600 dark:text-[#657394] hover:text-black dark:hover:text-white'
              }`}
            >
              <Sun size={13} />
              <span>White</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setTheme('dark');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'neu-primary-btn text-white'
                  : 'text-slate-600 dark:text-[#657394] hover:text-black dark:hover:text-white'
              }`}
            >
              <Moon size={13} />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Sound Effects */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-medium text-slate-900 dark:text-white">Interface Audio Tones</h4>
            <p className="text-[11px] text-slate-600 dark:text-[#657394]">Acoustic feedback on actions</p>
          </div>
          <button
            onClick={handleToggleSound}
            aria-label="Toggle sound effects"
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              soundEffects ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                soundEffects ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. Native Applications Installation */}
      {onOpenInstallModal && (
        <div className="neu-card rounded-2xl p-4 space-y-3.5 border border-purple-500/20">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
            <Download size={16} className="text-purple-600 dark:text-[#8B5CFF]" />
            <span>Install Standalone App (PC & Mobile)</span>
          </div>
          <p className="text-[11px] font-medium text-slate-600 dark:text-[#9AA8C7]">
            Get the full standalone experience on your PC or Android smartphone.
          </p>
          <PWAInstallButton onOpenModal={(tab) => onOpenInstallModal(tab)} variant="full" />
        </div>
      )}

      {/* 6. Clear Local Data */}
      <div className="neu-card rounded-2xl p-4 border border-red-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Reset Local Workspace</h4>
            <p className="text-[11px] text-slate-600 dark:text-[#657394]">
              Clear cached tasks, files, and chat messages
            </p>
          </div>
          <button
            onClick={handleReset}
            className="neu-button px-3.5 py-1.5 rounded-xl text-xs text-red-500 hover:text-red-400 flex items-center gap-1.5 cursor-pointer"
          >
            {clearedMessage ? <Check size={13} className="text-emerald-400" /> : <Trash2 size={13} />}
            <span>{clearedMessage ? 'Reset!' : 'Reset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
