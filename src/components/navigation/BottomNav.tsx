import React from 'react';
import { Home, Search, FolderClosed, User } from 'lucide-react';
import { ScreenType } from '../../types';
import { NovaStar } from '../common/NovaStar';
import { soundFx } from '../../utils/audio';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
}) => {
  // Don't show bottom nav on splash or assistant screens (assistant has bottom composer)
  if (currentScreen === 'splash' || currentScreen === 'assistant') return null;

  return (
    <div className="relative w-full z-40 select-none">
      {/* Background container with rounded top and neumorphic glass finish */}
      <div className="relative bg-[#EEF2F9]/95 dark:bg-[#071329]/95 backdrop-blur-xl border-t border-[#CBD5E1]/70 dark:border-white/10 rounded-t-[32px] px-4 pt-2 pb-2.5 shadow-[0_-8px_24px_rgba(166,180,204,0.45)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.7)] transition-colors duration-200">
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          {/* 1. Home */}
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('home');
            }}
            aria-label="Home"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              currentScreen === 'home'
                ? 'text-[#7C4DFF] dark:text-[#8B5CFF] drop-shadow-[0_0_8px_rgba(124,77,255,0.4)] dark:drop-shadow-[0_0_10px_rgba(139,92,255,0.7)] scale-105 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-[#657394] dark:hover:text-[#9AA8C7]'
            }`}
          >
            <Home size={19} className={currentScreen === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] font-medium tracking-wide mt-1">Home</span>
          </button>

          {/* 2. Explore */}
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('explore');
            }}
            aria-label="Explore"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              currentScreen === 'explore'
                ? 'text-[#7C4DFF] dark:text-[#8B5CFF] drop-shadow-[0_0_8px_rgba(124,77,255,0.4)] dark:drop-shadow-[0_0_10px_rgba(139,92,255,0.7)] scale-105 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-[#657394] dark:hover:text-[#9AA8C7]'
            }`}
          >
            <Search size={19} className={currentScreen === 'explore' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] font-medium tracking-wide mt-1">Explore</span>
          </button>

          {/* 3. Center Elevated AI Button (Pulsing Star) */}
          <div className="relative -top-5 flex flex-col items-center px-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('assistant');
              }}
              aria-label="AI Assistant"
              className="group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              {/* Outer pulsing glow aura */}
              <div className="absolute inset-0 rounded-full blur-md opacity-85 group-hover:opacity-100 bg-gradient-to-r from-[#7C4DFF] via-[#3B72FF] to-[#0284C7] dark:from-[#8B5CFF] dark:via-[#4C7DFF] dark:to-[#35C9FF] animate-pulse" />

              {/* Neumorphic ring border */}
              <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-b from-white dark:from-white/40 via-[#7C4DFF]/40 dark:via-[#8B5CFF]/50 to-transparent shadow-md">
                <div className="w-full h-full rounded-full bg-[#EEF2F9] dark:bg-[#071226]" />
              </div>

              {/* Center button core with vivid gradient and 4-point star */}
              <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#9B72FF] via-[#7C4DFF] to-[#3B72FF] dark:from-[#A978FF] dark:via-[#8B5CFF] dark:to-[#4C7DFF] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_6px_20px_rgba(124,77,255,0.45)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_6px_20px_rgba(139,92,255,0.7)]">
                <NovaStar size={26} glow={false} />
              </div>
            </button>
          </div>

          {/* 4. Library / Files */}
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('files');
            }}
            aria-label="Library"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              currentScreen === 'files'
                ? 'text-[#7C4DFF] dark:text-[#8B5CFF] drop-shadow-[0_0_8px_rgba(124,77,255,0.4)] dark:drop-shadow-[0_0_10px_rgba(139,92,255,0.7)] scale-105 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-[#657394] dark:hover:text-[#9AA8C7]'
            }`}
          >
            <FolderClosed size={19} className={currentScreen === 'files' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] font-medium tracking-wide mt-1">Library</span>
          </button>

          {/* 5. Profile */}
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('profile');
            }}
            aria-label="Profile"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              currentScreen === 'profile'
                ? 'text-[#7C4DFF] dark:text-[#8B5CFF] drop-shadow-[0_0_8px_rgba(124,77,255,0.4)] dark:drop-shadow-[0_0_10px_rgba(139,92,255,0.7)] scale-105 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-[#657394] dark:hover:text-[#9AA8C7]'
            }`}
          >
            <User size={19} className={currentScreen === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] font-medium tracking-wide mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
