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
      title={`Switch to ${isLight ? 'Dark' : 'White'} Neumorphic Theme`}
      aria-label={`Switch to ${isLight ? 'Dark' : 'White'} Neumorphic Theme`}
      className={`neu-button relative flex items-center justify-center rounded-xl cursor-pointer transition-transform hover:scale-105 ${
        size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
      } ${className}`}
    >
      {isLight ? (
        <Sun size={size === 'sm' ? 15 : 17} className="text-amber-500 transition-transform rotate-0" />
      ) : (
        <Moon size={size === 'sm' ? 15 : 17} className="text-[#35C9FF] transition-transform -rotate-12" />
      )}
    </button>
  );
};
