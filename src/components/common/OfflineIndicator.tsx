import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../utils/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 text-white px-3.5 py-2 text-xs font-bold shadow-2xl backdrop-blur-md border border-amber-400/40 animate-bounce select-none">
      <WifiOff size={15} className="animate-pulse text-amber-200" />
      <span>Offline Mode — Cached data & offline engine active</span>
    </div>
  );
};
