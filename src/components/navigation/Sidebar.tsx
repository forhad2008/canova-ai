import React from 'react';
import {
  Home,
  Bot,
  CheckSquare,
  BarChart3,
  Compass,
  FolderClosed,
  User,
  Settings,
  Sparkles,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { ScreenType } from '../../types';
import { NovaStar } from '../common/NovaStar';
import { ThemeToggle } from '../common/ThemeToggle';
import logo7Img from '../../assets/logo7.png';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenProModal?: () => void;
  onOpenInstallModal?: (tab?: 'desktop' | 'android') => void;
  pendingTasksCount?: number;
}

/**
 * Adaptive Professional Sidebar
 * Tablet-optimized:
 * - On md-to-lg (768px - 1024px): Slim, icon-first compact sidebar (w-20) with tooltip-like clarity
 * - On xl+ (1280px+): Full luxury 64-width sidebar with expanded labels & badges
 */
export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onOpenProModal,
  onOpenInstallModal,
  pendingTasksCount = 4,
}) => {
  const navItems: {
    id: ScreenType;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: Bot,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount,
      badgeColor: 'bg-cyan-500/20 text-[#35C9FF] border-cyan-500/30',
    },
    { id: 'analytics', label: 'Overview', icon: BarChart3 },
    { id: 'explore', label: 'Explore Tools', icon: Compass },
    { id: 'files', label: 'Files Library', icon: FolderClosed },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-18 md:w-20 lg:w-60 xl:w-64 bg-[#EEF2F9] dark:bg-[#071226]/95 border-r border-[#CBD5E1]/60 dark:border-white/8 backdrop-blur-2xl h-full flex flex-col justify-between p-3 md:p-3.5 lg:p-4 shrink-0 select-none transition-all duration-300 shadow-[6px_0_20px_rgba(166,180,204,0.35)] dark:shadow-none">
      {/* Brand logo & status (Click to return to Home Dashboard) */}
      <div>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          title="Return to Home Dashboard"
          aria-label="Return to Home Dashboard"
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-1 lg:px-2 py-2 mb-4 lg:mb-5 border-b border-black/5 dark:border-white/6 pb-3 lg:pb-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all duration-200 cursor-pointer text-left group"
        >
          <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(139,92,255,0.35)] shrink-0 flex items-center justify-center bg-white/5 dark:bg-black/20 border border-purple-500/20 group-hover:border-purple-500/50 group-hover:shadow-[0_4px_20px_rgba(139,92,255,0.5)] transition-all duration-200">
            <img
              src={logo7Img}
              alt="Canova AI Logo"
              className="w-full h-full object-contain p-0.5 rounded-2xl transition-transform group-hover:scale-105 duration-200"
            />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <h1 className="text-base font-black tracking-tight flex items-center gap-1.5 leading-none">
              <span className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-700 dark:from-white dark:via-[#E0E7FF] dark:to-[#A978FF] bg-clip-text text-transparent drop-shadow-sm dark:drop-shadow-[0_2px_10px_rgba(139,92,255,0.45)] group-hover:opacity-90 transition-opacity">
                Canova
              </span>
              <span className="text-[10.5px] font-mono font-extrabold tracking-wide px-2 py-0.5 rounded-md bg-purple-500/15 dark:bg-gradient-to-r dark:from-purple-500/25 dark:to-cyan-500/20 text-purple-700 dark:text-[#38BDF8] border border-purple-500/30 dark:border-cyan-400/40 shadow-sm dark:shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                AI
              </span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-[#8F9FBC] flex items-center gap-1.5 truncate mt-1">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
              </span>
              <span className="tracking-wide">Smart Companion</span>
            </p>
          </div>
        </button>

        {/* Section title (Visible on desktop, hidden on compact tablet) */}
        <span className="hidden lg:block text-[10px] font-bold text-slate-400 dark:text-[#657394] uppercase tracking-wider px-3 mb-2">
          Workspace Navigation
        </span>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-center lg:justify-between px-2.5 lg:px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group relative ${
                  isActive
                    ? 'neu-inset border border-purple-500/40 text-purple-700 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-[#9AA8C7] hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 neu-card-subtle'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-purple-600 dark:text-[#A978FF]' : 'text-slate-500 dark:text-[#657394]'
                    }`}
                  />
                  <span className="hidden lg:inline truncate">{item.label}</span>
                </div>

                {/* Desktop badge */}
                {item.badge !== undefined && (
                  <span
                    className={`hidden lg:inline text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white border-slate-300 dark:border-white/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tablet badge pip */}
                {item.badge !== undefined && (
                  <span className="lg:hidden absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600 dark:bg-[#A978FF] ring-2 ring-[#EEF2F9] dark:ring-[#071226]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Storage, Install App, and Pro Plan Card */}
      <div className="space-y-2.5">
        {/* Install Apps Button */}
        {onOpenInstallModal && (
          <button
            onClick={() => onOpenInstallModal('desktop')}
            title="Install App (PC & Mobile)"
            aria-label="Install App"
            style={{ backgroundColor: '#340ec4' }}
            className="w-full px-3 py-2 rounded-xl flex items-center justify-center lg:justify-between text-xs font-bold text-[#f2f0f4] border border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <Download size={15} style={{ color: '#f2f0f4' }} className="group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden lg:inline text-[#f2f0f4]">Install Apps</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-[#f2f0f4] font-extrabold border border-white/30">
                PC & Mobile
              </span>
            </div>
          </button>
        )}

        {/* Cloud Security Indicator & Theme Quick Switch */}
        <div className="hidden lg:flex px-3 py-2 neu-inset rounded-xl items-center justify-between text-[11px] text-slate-500 dark:text-[#657394] border border-black/5 dark:border-white/5">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck size={13} className="text-emerald-500 dark:text-emerald-400" /> Cloud Encrypted
          </span>
          <ThemeToggle size="sm" />
        </div>

        {/* Pro Plan Card - Full on Desktop, Compact on Tablet */}
        <div className="neu-card rounded-2xl p-2 lg:p-3.5 relative overflow-hidden border border-purple-500/25 dark:border-purple-500/30 bg-gradient-to-br from-[#F5F8FE] to-[#E9EFF8] dark:from-[#121f42] dark:to-[#071126] flex flex-col items-center lg:items-stretch text-center lg:text-left">
          <div className="absolute -right-4 -bottom-4 w-16 lg:w-20 h-16 lg:h-20 bg-purple-400/20 dark:bg-purple-600/25 rounded-full blur-xl pointer-events-none" />

          {/* Desktop Pro layout */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-purple-700 dark:text-purple-300">
              <Sparkles size={14} className="text-[#35C9FF]" />
              <span>Canova Pro</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-[#9AA8C7] mb-2.5 leading-snug">
              Unlimited Gemini 3.8 reasoning and creative tools.
            </p>
            <button
              onClick={onOpenProModal}
              className="w-full neu-primary-btn py-1.5 px-3 rounded-lg text-xs font-semibold text-white cursor-pointer shadow-md"
            >
              Upgrade Plan
            </button>
          </div>

          {/* Tablet Pro layout (Compact icon button) */}
          <div className="lg:hidden">
            <button
              onClick={onOpenProModal}
              title="Upgrade to Canova Pro"
              className="w-10 h-10 rounded-xl neu-primary-btn flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shadow-md"
            >
              <Sparkles size={16} className="text-yellow-300" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
