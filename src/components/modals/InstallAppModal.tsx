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

  const handleInstallClick = async (platformType: 'desktop' | 'android' | 'ios') => {
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
      if (typeof window !== 'undefined') {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl);

        if (platformType === 'desktop') {
          window.open(currentUrl, '_blank', 'width=1280,height=850,resizable=yes,scrollbars=yes');
        } else {
          window.open(currentUrl, '_blank');
        }
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="rounded-2xl p-6 w-full max-w-lg border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0F172A] text-left relative overflow-hidden shadow-2xl transition-all max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-500/30 flex items-center justify-center shrink-0">
              <NovaStar size={20} glow={false} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Install Canova AI App</span>
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">· PWA Native</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Device Platform Tabs: Segmented Control */}
        <div className="my-5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60 dark:border-white/10">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('desktop');
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Monitor size={14} />
            <span>Desktop</span>
            {isDesktop && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('android');
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            <span>Android</span>
            {isAndroid && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />}
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('ios');
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Apple size={14} />
            <span>iOS</span>
            {isIOS && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />}
          </button>
        </div>

        {/* TAB CONTENT 1: DESKTOP APP */}
        {activeTab === 'desktop' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  <Laptop size={14} />
                  <span>Dedicated Window</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Runs cleanly without browser tabs or address bar clutter.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  <Zap size={14} />
                  <span>Fast Launch</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Instant taskbar shortcut with offline cache support.
                </p>
              </div>
            </div>

            {/* Desktop Action Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/60 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                    Supported Browsers
                  </span>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Chrome, Edge, Brave, Opera
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {isInstalled ? 'Installed' : 'Ready to Install'}
                </span>
              </div>

              {isInstalled ? (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-500/30 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                  <CheckCircle2 size={16} />
                  <span>Canova AI Desktop is installed and active on this device!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => handleInstallClick('desktop')}
                    disabled={installing}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Download size={15} />
                    <span>{installing ? 'Preparing Installation...' : 'Install Canova AI Desktop App'}</span>
                  </button>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Tip:</span>
                    <span>Click the <strong>Install / App icon (⊕ or ⬇)</strong> in your browser's top address bar.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: ANDROID APP */}
        {activeTab === 'android' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  <Smartphone size={14} />
                  <span>Full Screen App</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Seamless mobile UI with fluid touch performance.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  <ShieldCheck size={14} />
                  <span>Offline Intelligence</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Instant access to tasks, files vault & cached AI notes.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/60 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                    Android WebAPK & PWA
                  </span>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Chrome, Samsung Internet, Firefox, Edge
                  </p>
                </div>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  Android 8.0+
                </span>
              </div>

              {isInstalled ? (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-500/30 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                  <CheckCircle2 size={16} />
                  <span>Canova AI is installed on this device!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => handleInstallClick('android')}
                    disabled={installing}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Download size={15} />
                    <span>{installing ? 'Installing WebAPK...' : 'Install Canova AI on Android'}</span>
                  </button>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Tip:</span>
                    <span>Tap <strong>menu (⋮)</strong> and select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: iOS */}
        {activeTab === 'ios' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                <Apple size={16} className="text-slate-700 dark:text-slate-300" />
                <span>iPhone & iPad Safari Installation</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Follow these simple steps in Safari to add Canova AI to your Home Screen:
              </p>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/60 dark:border-white/10">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">Tap the Share button in Safari</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Square icon with arrow pointing up in Safari toolbar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/60 dark:border-white/10">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">Select "Add to Home Screen"</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Scroll down in the share menu until you see the plus (+) option.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200/60 dark:border-white/10">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">Tap "Add" in top right</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Canova AI will immediately launch as a native app on your Home Screen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Copy App Link helper */}
        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-xs truncate">
            Share link to install on other devices
          </span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 font-medium cursor-pointer transition-colors shrink-0"
          >
            {copiedUrl ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            <span>{copiedUrl ? 'Copied!' : 'Copy App URL'}</span>
          </button>
        </div>

        {/* Success Toast Banner */}
        {showSuccessToast && (
          <div className="absolute inset-x-4 bottom-4 p-3 rounded-xl bg-emerald-600 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
            <CheckCircle2 size={16} />
            <span>Canova AI successfully installed on your device!</span>
          </div>
        )}
      </div>
    </div>
  );
};
