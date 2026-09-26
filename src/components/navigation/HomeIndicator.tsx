import React from 'react';

export const HomeIndicator: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-center pt-2 pb-2 select-none pointer-events-none">
      <div className="w-32 h-1 bg-slate-400/60 dark:bg-white/40 hover:bg-slate-500/80 dark:hover:bg-white/60 rounded-full transition-colors" />
    </div>
  );
};
