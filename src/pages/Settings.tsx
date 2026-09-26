import React, { useState } from 'react';
import {
  ChevronLeft,
  Moon,
  Sun,
  Bell,
  Cpu,
  Shield,
  Volume2,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';
import { ScreenType } from '../types';
import { soundFx } from '../utils/audio';
import { useTheme } from '../utils/ThemeContext';

interface SettingsProps {
  onBack: () => void;
  onClearData: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack, onClearData }) => {
  const { theme, setTheme } = useTheme();
  const [haptics, setHaptics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [aiModel, setAiModel] = useState('gemini-3.8-flash');
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [clearedMessage, setClearedMessage] = useState(false);

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
          className="w-8 h-8 rounded-full neu-button flex items-center justify-center text-[#9AA8C7] hover:text-white cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Settings
          </h2>
          <p className="text-xs text-[#9AA8C7]">
            Preferences & system configuration
          </p>
        </div>
      </div>

      {/* 2. AI Intelligence Settings */}
      <div className="neu-card rounded-2xl p-4 space-y-3.5 border border-purple-500/20">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
          <Cpu size={16} className="text-[#8B5CFF]" />
          <span>AI Engine Configuration</span>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-[#9AA8C7] block mb-1.5">
            Gemini Reasoning Model
          </label>
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="w-full neu-inset rounded-xl py-2 px-3 text-xs text-white bg-[#060e20] focus:outline-none"
          >
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (High Speed & Creative)</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Reasoning & Code)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra Low Latency)</option>
          </select>
        </div>
      </div>

      {/* 3. Interface Preferences */}
      <div className="neu-card rounded-2xl p-4 space-y-4 border border-white/8">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Moon size={16} className="text-[#35C9FF]" />
          <span>Interface & Aesthetics</span>
        </div>

        {/* Neumorphic Theme Mode Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/6">
          <div>
            <h4 className="text-xs font-medium text-white">Neumorphic Color Scheme</h4>
            <p className="text-[11px] text-[#657394]">
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
                  : 'text-[#657394] hover:text-white'
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
                  : 'text-[#657394] hover:text-white'
              }`}
            >
              <Moon size={13} />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-medium text-white">Soft Ambient Glow</h4>
            <p className="text-[11px] text-[#657394]">Luminescent radial backdrops</p>
          </div>
          <button
            onClick={() => setAmbientGlow(!ambientGlow)}
            aria-label="Toggle ambient glow"
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              ambientGlow ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                ambientGlow ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Haptics & Feedback */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-medium text-white">Haptic & Press States</h4>
            <p className="text-[11px] text-[#657394]">Micro-vibrations on button taps</p>
          </div>
          <button
            onClick={() => setHaptics(!haptics)}
            aria-label="Toggle haptics"
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              haptics ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                haptics ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sound Effects */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-medium text-white">Interface Audio</h4>
            <p className="text-[11px] text-[#657394]">Subtle acoustic tones on actions</p>
          </div>
          <button
            onClick={handleToggleSound}
            aria-label="Toggle sound effects"
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              soundEffects ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-800'
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

      {/* 4. Privacy & Notifications */}
      <div className="neu-card rounded-2xl p-4 space-y-4 border border-white/8">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Shield size={16} className="text-emerald-400" />
          <span>Security & Notifications</span>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-medium text-white">Task Reminders</h4>
            <p className="text-[11px] text-[#657394]">Daily schedule & milestone alerts</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            aria-label="Toggle notifications"
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              notifications ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                notifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. Clear Local Data */}
      <div className="neu-card rounded-2xl p-4 border border-red-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white">Reset Local Workspace</h4>
            <p className="text-[11px] text-[#657394]">
              Clear cached tasks, files, and chat messages
            </p>
          </div>
          <button
            onClick={handleReset}
            className="neu-button px-3.5 py-1.5 rounded-xl text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
          >
            {clearedMessage ? <Check size={13} className="text-emerald-400" /> : <Trash2 size={13} />}
            <span>{clearedMessage ? 'Reset!' : 'Reset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
