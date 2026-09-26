import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../utils/ThemeContext';
import { soundFx } from '../../utils/audio';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={() => {
        soundFx.playClick();
        toggleTheme();
      }}
      title={`Switch theme: Currently ${isLight ? 'Light' : 'Dark'} Mode`}
      aria-label={`Switch to ${isLight ? 'Dark' : 'White'} Neumorphic Theme`}
      className={`relative flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 bg-gradient-to-r from-[#2563EB] via-[#4121C7] to-[#8B5CF6] text-white shadow-[0_4px_18px_rgba(65,33,199,0.55)] hover:shadow-[0_6px_24px_rgba(65,33,199,0.75)] border border-[#818cf8]/50 ring-2 ring-[#4121c7]/40 ${
        size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
      } ${className}`}
      style={{
        backgroundColor: '#4121c7',
        backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #4121c7 50%, #7c3aed 100%)',
      }}
    >
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38bdf8] animate-pulse pointer-events-none ring-1 ring-white/60" />
      {isLight ? (
        <Sun size={size === 'sm' ? 16 : 18} className="text-amber-200 drop-shadow-[0_0_8px_rgba(253,230,138,0.9)] transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon size={size === 'sm' ? 16 : 18} className="text-cyan-200 drop-shadow-[0_0_8px_rgba(165,243,252,0.9)] transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
};
