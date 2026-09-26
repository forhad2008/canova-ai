import React, { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setTime(`${hours % 12 || 12}:${formattedMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold text-[#F7F8FF] z-30 select-none">
      {/* Time */}
      <span className="tracking-tight text-[13px]">{time}</span>

      {/* Dynamic Island cutout placeholder on modern iOS */}
      <div className="w-24 h-4 bg-black/60 rounded-full mx-auto hidden sm:block border border-white/5" />

      {/* Right icons: Signal, Wifi, Battery */}
      <div className="flex items-center gap-2">
        {/* Cellular signal bars */}
        <div className="flex items-end gap-0.5 h-3">
          <span className="w-0.5 h-1 bg-white/90 rounded-xs" />
          <span className="w-0.5 h-1.5 bg-white/90 rounded-xs" />
          <span className="w-0.5 h-2 bg-white/90 rounded-xs" />
          <span className="w-0.5 h-2.5 bg-white/90 rounded-xs" />
        </div>

        {/* Wifi */}
        <Wifi size={13} className="text-white/90 stroke-[2.5]" />

        {/* Battery */}
        <div className="flex items-center">
          <div className="w-5 h-2.5 rounded-[3px] border border-white/80 p-0.5 flex items-center">
            <div className="w-3.5 h-full bg-white rounded-[1.5px]" />
          </div>
          <div className="w-0.5 h-1 bg-white/80 rounded-r-xs -ml-[0.5px]" />
        </div>
      </div>
    </div>
  );
};
