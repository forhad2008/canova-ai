import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface OverdueBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const OverdueBadge: React.FC<OverdueBadgeProps> = ({
  label = 'OVERDUE',
  size = 'sm',
  pulse = true,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-extrabold uppercase tracking-wider text-rose-100 bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 border border-rose-400/50 shadow-[0_0_12px_rgba(225,29,72,0.5)] ${
        size === 'sm' ? 'px-2 py-0.5 text-[9.5px]' : 'px-2.5 py-1 text-[11px]'
      }`}
    >
      <AlertTriangle size={size === 'sm' ? 10 : 12} className={pulse ? 'animate-bounce text-yellow-200' : 'text-yellow-200'} />
      <span>{label}</span>
    </span>
  );
};
