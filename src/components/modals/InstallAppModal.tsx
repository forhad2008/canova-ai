import React, { useState } from 'react';
import {
  X,
  Download,
  Monitor,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Laptop,
  Layers,
  Zap,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Share2,
  PlusSquare,
  HelpCircle,
  Copy,
  Check,
  Apple,
} from 'lucide-react';
import { usePWAInstall } from '../../utils/usePWAInstall';
import { soundFx } from '../../utils/audio';
import { NovaStar } from '../common/NovaStar';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'desktop' | 'android' | 'ios';
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'desktop',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isDesktop, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return defaultTab;
  });
  const [installing, setInstalling] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    soundFx.playClick();
    setInstalling(true);

    let success = false;
    if (isInstallable) {
      success = await install();
    }

    if (success) {
      soundFx.playSuccess();
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 2500);
    } else {
      // Fallback: Launch top-level standalone window and copy URL for installation
      if (typeof window !== 'undefined') {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl);
        window.open(currentUrl, '_blank', 'width=1280,height=850,resizable=yes,scrollbars=yes');
      }
      soundFx.playSuccess();
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 3500);
    }
    setInstalling(false);
  };

  const handleCopyLink = () => {
    soundFx.playClick();
    const url = typeof window !== 'undefined' ? window.location.href : 'https://canova-ai.app';
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="neu-card rounded-3xl p-5 sm:p-6 w-full max-w-lg border border-black/10 dark:border-purple-500/40 bg-white dark:bg-gradient-to-b dark:from-[#0d1838] dark:via-[#071329] dark:to-[#040a18] text-left relative overflow-hidden shadow-2xl transition-all max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-purple-500/15 via-blue-500/15 to-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-black/5 dark:border-white/8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C4DFF] via-[#3B72FF] to-[#0284C7] dark:from-[#8B5CFF] dark:via-[#4C7DFF] dark:to-[#35C9FF] p-[1.5px] shadow-sm flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white dark:bg-[#071226] rounded-[14px] flex items-center justify-center">
                <NovaStar size={20} glow={false} />
              </div>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Install Canova AI App</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  PWA Native
                </span>
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-[#9AA8C7]">
                Standalone high-performance workspace & offline engine
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            aria-label="Close Install App modal"
            className="w-8 h-8 rounded-full neu-button flex items-center justify-center text-slate-600 dark:text-[#9AA8C7] hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-xs"
          >
            <X size={16} />
          </button>
        </div>

        {/* Device Platform Tabs: Desktop / Android / iOS */}
        <div className="my-4 neu-inset bg-[#F8FAFC] dark:bg-[#060e20] p-1 rounded-2xl flex items-center gap-1 border border-black/5 dark:border-white/8">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('desktop');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'desktop'
                ? 'neu-primary-btn text-white shadow-md'
                : 'text-slate-600 dark:text-[#657394] hover:text-slate-900 dark:hover:text-[#9AA8C7]'
            }`}
          >
            <Monitor size={14} />
            <span>Desktop (PC/Mac)</span>
            {isDesktop && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('android');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'neu-primary-btn text-white shadow-md'
                : 'text-slate-600 dark:text-[#657394] hover:text-slate-900 dark:hover:text-[#9AA8C7]'
            }`}
          >
            <Smartphone size={14} />
            <span>Android</span>
            {isAndroid && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('ios');
            }}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'neu-primary-btn text-white shadow-md'
                : 'text-slate-600 dark:text-[#657394] hover:text-slate-900 dark:hover:text-[#9AA8C7]'
            }`}
          >
            <Apple size={14} />
            <span>iOS</span>
            {isIOS && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />}
          </button>
        </div>

        {/* TAB CONTENT 1: DESKTOP APP */}
        {activeTab === 'desktop' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="neu-card-subtle bg-white dark:bg-[#0b1834] p-3 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 text-xs font-bold">
                  <Laptop size={14} />
                  <span>Dedicated Window</span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 dark:text-[#9AA8C7]">
                  Runs without browser tabs or address bar clutter.
                </p>
              </div>

              <div className="neu-card-subtle bg-white dark:bg-[#0b1834] p-3 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-600 dark:text-[#35C9FF] text-xs font-bold">
                  <Zap size={14} />
                  <span>Fast Launch</span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 dark:text-[#9AA8C7]">
                  Instant taskbar shortcut with offline cache support.
                </p>
              </div>
            </div>

            {/* Desktop Action Box */}
            <div className="neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-2xl p-4 border border-purple-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-[#A978FF] uppercase tracking-wider block">
                    Supported Browsers
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Google Chrome, Microsoft Edge, Brave, Opera
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {isInstalled ? 'Installed' : 'Ready to Install'}
                </span>
              </div>

              {isInstalled ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle2 size={16} />
                  <span>Canova AI Desktop is installed and active on this device!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full neu-primary-btn py-3 px-4 rounded-xl text-xs font-black text-white tracking-wide cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    <Download size={15} />
                    <span>{installing ? 'Preparing Installation...' : 'Install Canova AI App Now'}</span>
                  </button>

                  <div className="space-y-2 text-xs font-medium text-slate-700 dark:text-[#9AA8C7]">
                    <div className="flex items-start gap-2 bg-white/70 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/5">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Or click the <strong>Install / App icon (⊕ or ⬇)</strong> in your browser's top address bar.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: ANDROID APP */}
        {activeTab === 'android' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="neu-card-subtle bg-white dark:bg-[#0b1834] p-3 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <Smartphone size={14} />
                  <span>Full Screen App</span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 dark:text-[#9AA8C7]">
                  Seamless mobile UI with smooth tactile neumorphic touch.
                </p>
              </div>

              <div className="neu-card-subtle bg-white dark:bg-[#0b1834] p-3 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-fuchsia-600 dark:text-[#D66BFF] text-xs font-bold">
                  <ShieldCheck size={14} />
                  <span>Offline Intelligence</span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 dark:text-[#9AA8C7]">
                  Instant access to tasks, files vault & cached AI notes.
                </p>
              </div>
            </div>

            {/* Android Action Box */}
            <div className="neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-2xl p-4 border border-purple-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-[#A978FF] uppercase tracking-wider block">
                    Android WebAPK & PWA
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Chrome, Samsung Internet, Firefox, Edge
                  </p>
                </div>
                <span className="text-xs font-bold text-cyan-600 dark:text-[#35C9FF] bg-cyan-500/15 px-2.5 py-1 rounded-full border border-cyan-500/30">
                  Android 8.0+
                </span>
              </div>

              {isInstalled ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <CheckCircle2 size={16} />
                  <span>Canova AI is installed on this device!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full neu-primary-btn py-3 px-4 rounded-xl text-xs font-black text-white tracking-wide cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    <Download size={15} />
                    <span>{installing ? 'Installing WebAPK...' : 'Install Canova AI on Android Now'}</span>
                  </button>

                  <div className="space-y-2 text-xs font-medium text-slate-700 dark:text-[#9AA8C7]">
                    <div className="flex items-start gap-2 bg-white/70 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Or tap the <strong>three dots menu (⋮)</strong> and select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: iOS (iPhone / iPad) */}
        {activeTab === 'ios' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="neu-card-subtle bg-white dark:bg-[#0b1834] p-4 rounded-2xl border border-purple-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Apple size={16} className="text-purple-600 dark:text-[#A978FF]" />
                <span>iPhone & iPad Safari Installation</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-[#9AA8C7]">
                Follow these simple steps in Safari to add Canova AI to your Home Screen:
              </p>

              <div className="space-y-2.5 text-xs text-slate-800 dark:text-white font-medium">
                <div className="flex items-start gap-2.5 bg-[#F8FAFC] dark:bg-[#060e20] p-3 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <span>Tap the <strong>Share button</strong> in Safari toolbar</span>
                    <p className="text-[11px] text-slate-500 dark:text-[#657394] mt-0.5">
                      The square icon with an arrow pointing up at bottom or top of screen.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#F8FAFC] dark:bg-[#060e20] p-3 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <span>Scroll down and select <strong>"Add to Home Screen"</strong></span>
                    <p className="text-[11px] text-slate-500 dark:text-[#657394] mt-0.5">
                      Look for the square icon with a plus (+) symbol.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-[#F8FAFC] dark:bg-[#060e20] p-3 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <span>Tap <strong>"Add"</strong> in the top right corner</span>
                    <p className="text-[11px] text-slate-500 dark:text-[#657394] mt-0.5">
                      Canova AI will immediately appear on your Home Screen as a native app!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Copy App Link helper */}
        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/8 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-[#657394] text-[11px] font-medium truncate">
            Share link to install on other devices
          </span>
          <button
            onClick={handleCopyLink}
            className="neu-card-subtle px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/8 text-slate-700 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white flex items-center gap-1.5 font-bold cursor-pointer transition-all shrink-0"
          >
            {copiedUrl ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedUrl ? 'Copied!' : 'Copy App URL'}</span>
          </button>
        </div>

        {/* Success Toast Banner */}
        {showSuccessToast && (
          <div className="absolute inset-x-4 bottom-4 p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl animate-bounce">
            <CheckCircle2 size={16} />
            <span>Canova AI successfully installed on your device!</span>
          </div>
        )}
      </div>
    </div>
  );
};
