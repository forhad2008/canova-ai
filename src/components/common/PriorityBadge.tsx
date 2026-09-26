import React from 'react';
import { TaskPriority } from '../../types';
import { AlertCircle, Flame, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority?: TaskPriority;
  size?: 'sm' | 'md';
  onClick?: (e: React.MouseEvent) => void;
  showIcon?: boolean;
  interactive?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority = 'medium',
  size = 'sm',
  onClick,
  showIcon = true,
  interactive = false,
  className = '',
}) => {
  const configs = {
    high: {
      label: 'High',
      badgeClass:
        'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35 hover:bg-rose-500/25',
      dotClass: 'bg-rose-500 animate-pulse',
      icon: <Flame size={size === 'sm' ? 10 : 12} className="text-rose-600 dark:text-rose-400" />,
    },
    medium: {
      label: 'Medium',
      badgeClass:
        'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35 hover:bg-amber-500/25',
      dotClass: 'bg-amber-500',
      icon: <AlertCircle size={size === 'sm' ? 10 : 12} className="text-amber-600 dark:text-amber-400" />,
    },
    low: {
      label: 'Low',
      badgeClass:
        'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/35 hover:bg-emerald-500/25',
      dotClass: 'bg-emerald-500',
      icon: <ArrowDown size={size === 'sm' ? 10 : 12} className="text-emerald-600 dark:text-emerald-400" />,
    },
  };

  const config = configs[priority] || configs.medium;
  const isSmall = size === 'sm';

  const baseClasses = `inline-flex items-center gap-1 font-bold rounded-full border transition-all select-none ${
    isSmall ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
  } ${config.badgeClass} ${interactive || onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={`Priority: ${config.label} (Click to cycle)`}
        className={baseClasses}
      >
        {showIcon && config.icon}
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        <span>{config.label}</span>
      </button>
    );
  }

  return (
    <span className={baseClasses} title={`Priority: ${config.label}`}>
      {showIcon && config.icon}
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
};
