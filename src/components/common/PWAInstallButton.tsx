import React, { useState } from 'react';
import { Download, Monitor, Smartphone, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../utils/usePWAInstall';
import { soundFx } from '../../utils/audio';

interface PWAInstallButtonProps {
  onOpenModal: (tab?: 'desktop' | 'android') => void;
  variant?: 'compact' | 'full' | 'icon' | 'badge' | 'banner';
  className?: string;
  onSuccess?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenModal,
  variant = 'compact',
  className = '',
  onSuccess,
}) => {
  const { isInstallable, isInstalled, isAndroid, isDesktop, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleDirectOrModalClick = async (preferredTab?: 'desktop' | 'android') => {
    soundFx.playClick();
    const targetTab = preferredTab || (isAndroid ? 'android' : 'desktop');

    // If native prompt is ready and we can trigger 1-click install:
    if (isInstallable) {
      setInstalling(true);
      const success = await install();
      setInstalling(false);
      if (success) {
        soundFx.playSuccess();
        if (onSuccess) onSuccess();
        return;
      }
    }

    // Otherwise open guided installation modal
    onOpenModal(targetTab);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={() => handleDirectOrModalClick()}
        title={isAndroid ? 'Install Android App' : isDesktop ? 'Install Desktop App' : 'Install App'}
        aria-label="Install App"
        className={`w-9 h-9 rounded-full neu-button flex items-center justify-center text-purple-700 dark:text-[#A978FF] hover:text-purple-900 dark:hover:text-white cursor-pointer shadow-xs relative group ${className}`}
      >
        <Download size={16} className="group-hover:scale-110 transition-transform" />
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-[#071226] animate-pulse" />
      </button>
    );
  }

  if (variant === 'badge') {
    return (
      <button
        onClick={() => handleDirectOrModalClick()}
        className={`px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15 dark:from-purple-500/25 dark:to-cyan-500/20 border border-purple-500/30 text-purple-700 dark:text-[#38BDF8] hover:border-purple-500/60 flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all shadow-xs ${className}`}
      >
        <Download size={13} className="text-purple-600 dark:text-[#38BDF8] animate-bounce" />
        <span>{isAndroid ? 'Get Android App' : isDesktop ? 'Get Desktop App' : 'Install App'}</span>
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`neu-card rounded-2xl p-4 border border-purple-500/25 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 dark:from-[#0f1d3f] dark:via-[#071329] dark:to-[#050b18] flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-700 dark:text-[#A978FF] flex items-center justify-center shrink-0 border border-purple-500/30">
            {isAndroid ? <Smartphone size={20} /> : <Monitor size={20} />}
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Install Canova AI Native App</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 font-extrabold">
                {isAndroid ? 'Android' : 'Desktop'}
              </span>
            </h4>
            <p className="text-[11px] font-medium text-slate-600 dark:text-[#9AA8C7]">
              Instant standalone launch, keyboard shortcuts & offline engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => handleDirectOrModalClick('desktop')}
            className="flex-1 sm:flex-none neu-button px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-[#F7F8FF] hover:text-black dark:hover:text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Monitor size={14} className="text-purple-600 dark:text-[#A978FF]" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => handleDirectOrModalClick('android')}
            className="flex-1 sm:flex-none neu-primary-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Smartphone size={14} />
            <span>Android / Mobile</span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
        {/* Desktop Card */}
        <button
          onClick={() => handleDirectOrModalClick('desktop')}
          className="neu-card rounded-2xl p-4 flex items-center gap-3.5 border border-black/8 dark:border-purple-500/30 group hover:border-purple-500/60 cursor-pointer text-left transition-all hover:scale-[1.01]"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-700 dark:text-[#A978FF] flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform shrink-0">
            <Monitor size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300">
                Install Desktop App
              </h5>
              <span className="text-[10px] font-bold text-purple-700 dark:text-[#A978FF] bg-purple-500/10 px-1.5 py-0.5 rounded">
                PC / Mac / Linux
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394] mt-0.5">
              Dedicated window without browser tab clutter & fast taskbar launch.
            </p>
          </div>
        </button>

        {/* Android Card */}
        <button
          onClick={() => handleDirectOrModalClick('android')}
          className="neu-card rounded-2xl p-4 flex items-center gap-3.5 border border-black/8 dark:border-cyan-500/30 group hover:border-cyan-500/60 cursor-pointer text-left transition-all hover:scale-[1.01]"
        >
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-[#35C9FF] flex items-center justify-center border border-cyan-500/30 group-hover:scale-105 transition-transform shrink-0">
            <Smartphone size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                Install Android App
              </h5>
              <span className="text-[10px] font-bold text-cyan-700 dark:text-[#35C9FF] bg-cyan-500/10 px-1.5 py-0.5 rounded">
                WebAPK / Mobile
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394] mt-0.5">
              Full-screen smooth touch app with offline task & workspace caching.
            </p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => handleDirectOrModalClick()}
      disabled={installing}
      className={`neu-card-subtle px-3 py-1.5 rounded-xl border border-purple-500/30 text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all shadow-xs ${className}`}
    >
      <Download size={13} className="text-purple-600 dark:text-[#8B5CFF]" />
      <span>
        {installing
          ? 'Installing...'
          : isAndroid
          ? 'Install Android App'
          : isDesktop
          ? 'Install Desktop App'
          : 'Install App'}
      </span>
    </button>
  );
};
