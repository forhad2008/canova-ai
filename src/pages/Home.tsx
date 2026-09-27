import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  FolderOpen,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  CloudFog,
  RotateCw,
  Activity,
  Wind,
  Palette,
  X,
  FileText,
  CheckSquare,
} from 'lucide-react';
import { ScreenType, UserProfile, Task } from '../types';
import { SphereOrb, SmokePattern, SmokeColor } from '../components/common/SphereOrb';
import { NeumorphicDensitySlider } from '../components/common/NeumorphicDensitySlider';
import { TaskProgressRing } from '../components/common/TaskProgressRing';
import { WeeklyGoalCard } from '../components/common/WeeklyGoalCard';
import { soundFx } from '../utils/audio';
import { useRecentSearches } from '../utils/useRecentSearches';
import { RecentSearchChips } from '../components/common/RecentSearchChips';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import { getTimeBasedGreeting } from '../utils/greeting';
import photoAvatar from '../assets/photo.png';

interface HomeProps {
  user: UserProfile;
  tasks?: Task[];
  onNavigate: (screen: ScreenType) => void;
  onQuickPrompt?: (prompt: string) => void;
  onOpenInstallModal?: (tab?: 'desktop' | 'android') => void;
}

export const Home: React.FC<HomeProps> = ({
  user,
  tasks = [],
  onNavigate,
  onQuickPrompt,
  onOpenInstallModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [vapeOpacity, setVapeOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('nova_vape_opacity');
    return saved !== null ? parseFloat(saved) : 0.75;
  });
  const [smokePattern, setSmokePattern] = useState<SmokePattern>(() => {
    const saved = localStorage.getItem('nova_smoke_pattern') as SmokePattern;
    return saved === 'pulse' || saved === 'stream' ? saved : 'swirl';
  });
  const [smokeColor, setSmokeColor] = useState<SmokeColor>(() => {
    const saved = localStorage.getItem('nova_smoke_color') as SmokeColor;
    return saved === 'white' || saved === 'neon-purple' || saved === 'deep-blue' || saved === 'cyan'
      ? saved
      : 'neon-purple';
  });

  const handleVapeOpacityChange = (val: number) => {
    setVapeOpacity(val);
    localStorage.setItem('nova_vape_opacity', val.toString());
  };

  const handleSmokePatternChange = (pattern: SmokePattern) => {
    soundFx.playClick();
    setSmokePattern(pattern);
    localStorage.setItem('nova_smoke_pattern', pattern);
  };

  const handleSmokeColorChange = (color: SmokeColor) => {
    soundFx.playClick();
    setSmokeColor(color);
    localStorage.setItem('nova_smoke_color', color);
  };

  const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches(
    'nova_recent_searches_home',
    ['Brand concept idea', 'Finish website design', 'TypeScript schema']
  );

  const quickCards = [
    {
      id: 'chat',
      title: 'Chat',
      subtitle: 'Ask anything',
      screen: 'assistant' as ScreenType,
      icon: MessageSquare,
      iconColor: 'text-[#A978FF]',
      glowColor: 'rgba(169,120,255,0.25)',
    },
    {
      id: 'tasks',
      title: 'Tasks',
      subtitle: 'Plan & Organize',
      screen: 'tasks' as ScreenType,
      icon: CheckCircle2,
      iconColor: 'text-[#35C9FF]',
      glowColor: 'rgba(53,201,255,0.25)',
    },
    {
      id: 'files',
      title: 'Files',
      subtitle: 'Manage Files',
      screen: 'files' as ScreenType,
      icon: FolderOpen,
      iconColor: 'text-[#8B5CFF]',
      glowColor: 'rgba(139,92,255,0.25)',
    },
    {
      id: 'tools',
      title: 'Tools',
      subtitle: 'More Apps',
      screen: 'explore' as ScreenType,
      icon: LayoutGrid,
      iconColor: 'text-[#D66BFF]',
      glowColor: 'rgba(214,107,255,0.25)',
    },
  ];

  const executeSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    soundFx.playClick();
    addSearch(trimmed);
    setIsSearchFocused(false);
    if (onQuickPrompt) {
      onQuickPrompt(trimmed);
    }
    onNavigate('assistant');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  // Calculate today's task metrics for Daily Goal progress ring
  const todayTasks = (tasks || []).filter((t) => t.dueDate === 'today');
  const activeTaskList = todayTasks.length > 0 ? todayTasks : tasks || [];
  const completedTodayCount = activeTaskList.filter((t) => t.completed).length;
  const highPriorityPendingCount = activeTaskList.filter((t) => !t.completed && t.priority === 'high').length;

  return (
    <div className="relative flex flex-col space-y-4 px-5 py-4 pb-24 text-left select-none max-w-2xl mx-auto w-full">
      {/* 1. Header with greeting and avatar */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-semibold text-slate-800 dark:text-[#9AA8C7] tracking-wide block">
            {getTimeBasedGreeting()},
          </span>
          <h2 className="text-xl font-black text-black dark:text-white tracking-tight flex items-center gap-1.5 mt-0.5">
            {user.name} <span className="text-lg">👋</span>
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Install App Quick Button */}
          {onOpenInstallModal && (
            <PWAInstallButton onOpenModal={(tab) => onOpenInstallModal(tab)} variant="icon" />
          )}

          <ThemeToggle size="sm" />

          {/* Profile Avatar with glowing rim */}
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('profile');
            }}
            aria-label="View Profile"
            className="relative group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#7C4DFF] via-[#3B72FF] to-[#0284C7] dark:from-[#8B5CFF] dark:via-[#4C7DFF] dark:to-[#35C9FF] shadow-[0_4px_14px_rgba(124,77,255,0.3)] dark:shadow-[0_0_14px_rgba(139,92,255,0.4)] group-hover:shadow-[0_4px_18px_rgba(124,77,255,0.5)] transition-all">
              <img
                src={user.avatar || photoAvatar}
                alt={user.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = photoAvatar;
                }}
                className="w-full h-full object-cover rounded-full border-2 border-white dark:border-[#0B1730]"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-[#071226] rounded-full shadow-xs" />
          </button>
        </div>
      </div>

      {/* 2. Neumorphic Capsule Search Input with Recent Searches & Live Suggestions */}
      <div className="relative w-full z-30">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <Search
              size={17}
              className="absolute left-4 text-purple-600 dark:text-[#A978FF] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything, ask AI, or find tools..."
              className="w-full bg-[#EEF2F9] dark:bg-[#050d1e] neu-inset rounded-full py-3.5 pl-11 pr-20 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-[#657394] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-[inset_3px_3px_6px_rgba(166,180,204,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] dark:shadow-none"
            />

            <div className="absolute right-2.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSearchQuery('');
                  }}
                  aria-label="Clear search"
                  className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}

              <button
                type="submit"
                aria-label="Submit search"
                className="w-7 h-7 rounded-full neu-primary-btn flex items-center justify-center text-white cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xs"
              >
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </form>

        {/* Live Search Suggestions Dropdown when typing */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="w-full mt-2 neu-card rounded-2xl p-2.5 border border-black/10 dark:border-purple-500/25 bg-white/95 dark:bg-[#081226]/95 backdrop-blur-xl shadow-xl space-y-1 animate-fadeIn">
            {/* Direct Ask AI Option */}
            <div
              onClick={() => executeSearch(searchQuery)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-purple-500/10 cursor-pointer text-purple-700 dark:text-purple-300 font-bold text-xs transition-colors group"
            >
              <Sparkles size={14} className="text-purple-600 dark:text-[#A978FF] shrink-0" />
              <span className="truncate flex-1">
                Ask Canova AI: <span className="text-slate-900 dark:text-white font-semibold">"{searchQuery}"</span>
              </span>
              <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Quick Filter Shortcuts */}
            <div className="pt-1 border-t border-black/5 dark:border-white/5 flex items-center gap-2 px-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-[#657394]">Filter by:</span>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('tasks');
                }}
                className="neu-card-subtle px-2 py-0.5 rounded-lg text-[10px] font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1 cursor-pointer hover:bg-cyan-500/10"
              >
                <CheckSquare size={10} />
                <span>Tasks</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('files');
                }}
                className="neu-card-subtle px-2 py-0.5 rounded-lg text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 cursor-pointer hover:bg-blue-500/10"
              >
                <FileText size={10} />
                <span>Files</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('explore');
                }}
                className="neu-card-subtle px-2 py-0.5 rounded-lg text-[10px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 cursor-pointer hover:bg-purple-500/10"
              >
                <LayoutGrid size={10} />
                <span>Tools</span>
              </button>
            </div>
          </div>
        )}

        {/* Recent Searches Chips below search bar (when empty) */}
        {isSearchFocused && !searchQuery && recentSearches.length > 0 && (
          <RecentSearchChips
            searches={recentSearches}
            onSelect={(item) => {
              setSearchQuery(item);
              executeSearch(item);
            }}
            onRemove={removeSearch}
            onClear={clearSearches}
            onClose={() => setIsSearchFocused(false)}
          />
        )}
      </div>

      {/* 3. Hero Card: AI Assistant */}
      <div className="relative rounded-3xl p-5 overflow-hidden neu-glass-card liquid-shimmer transition-all">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/20 via-cyan-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="space-y-2 max-w-[62%]">
            <span className="text-[11px] font-black text-purple-700 dark:text-[#A978FF] uppercase tracking-wider block">
              Canova AI
            </span>
            <h3 className="text-lg font-black text-black dark:text-white leading-tight">
              Ready to help you today?
            </h3>
            <p className="text-[11px] text-slate-800 dark:text-[#9AA8C7] font-semibold leading-relaxed line-clamp-2">
              Ask, create, plan, or get things done — I'm here for you.
            </p>

            <div className="pt-1">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('assistant');
                }}
                aria-label="Start Assistant"
                className="w-8 h-8 rounded-full neu-primary-btn flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shadow-md"
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* 3D Iridescent Glowing Sphere Orb */}
          <div className="pr-1 flex items-center justify-center">
            <SphereOrb
              size={88}
              interactive={true}
              vapeOpacity={vapeOpacity}
              smokePattern={smokePattern}
              smokeColor={smokeColor}
            />
          </div>
        </div>

        {/* Smokey Vape Controls: Color Palette + Pattern Selector + Opacity Slider (Hidden on mobile) */}
        <div className="hidden md:block mt-4 pt-3 border-t border-black/5 dark:border-white/5 relative z-10 space-y-3 bg-[#F1F5F9] dark:bg-black/25 -mx-1 px-3.5 py-3 rounded-2xl border border-white/70 dark:border-white/5 shadow-[inset_3px_3px_8px_rgba(166,180,204,0.35),inset_-3px_-3px_8px_rgba(255,255,255,0.95)] dark:shadow-none">
          {/* Color Palette Selector: Standard White, Neon Purple, Deep Blue, Cyan */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black text-black dark:text-[#9AA8C7] flex items-center gap-1.5 shrink-0">
              <Palette size={12} className="text-black dark:text-[#A978FF]" />
              Color Palette
            </span>

            <div className="flex items-center gap-1.5 bg-white dark:bg-[#050B18]/70 p-1 rounded-xl border border-black/8 dark:border-white/5 shadow-[2px_3px_8px_rgba(166,180,204,0.25),-2px_-2px_6px_rgba(255,255,255,0.9)] dark:shadow-none">
              {[
                {
                  id: 'white' as SmokeColor,
                  label: 'White',
                  dotBg: 'bg-white border border-black/40',
                  glow: 'shadow-[0_0_8px_rgba(0,0,0,0.35)] dark:shadow-[0_0_8px_rgba(255,255,255,0.6)]',
                  activeBorder: 'border-black dark:border-white/50 text-black dark:text-white bg-black/10 dark:bg-white/10 font-black',
                },
                {
                  id: 'neon-purple' as SmokeColor,
                  label: 'Purple',
                  dotBg: 'bg-[#9333EA] dark:bg-[#C084FC]',
                  glow: 'shadow-[0_0_8px_rgba(147,51,234,0.5)] dark:shadow-[0_0_8px_rgba(192,132,252,0.7)]',
                  activeBorder: 'border-black dark:border-purple-400/50 text-black dark:text-purple-200 bg-purple-500/15 font-black',
                },
                {
                  id: 'deep-blue' as SmokeColor,
                  label: 'Blue',
                  dotBg: 'bg-[#2563EB] dark:bg-[#3B82F6]',
                  glow: 'shadow-[0_0_8px_rgba(37,99,235,0.5)] dark:shadow-[0_0_8px_rgba(59,130,246,0.7)]',
                  activeBorder: 'border-black dark:border-blue-400/50 text-black dark:text-blue-200 bg-blue-500/15 font-black',
                },
                {
                  id: 'cyan' as SmokeColor,
                  label: 'Cyan',
                  dotBg: 'bg-[#0891B2] dark:bg-[#22D3EE]',
                  glow: 'shadow-[0_0_8px_rgba(8,145,178,0.5)] dark:shadow-[0_0_8px_rgba(34,211,238,0.7)]',
                  activeBorder: 'border-black dark:border-cyan-400/50 text-black dark:text-cyan-200 bg-cyan-500/15 font-black',
                },
              ].map((colorItem) => {
                const isActive = smokeColor === colorItem.id;
                return (
                  <button
                    key={colorItem.id}
                    type="button"
                    onClick={() => handleSmokeColorChange(colorItem.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer border ${
                      isActive
                        ? `${colorItem.activeBorder} scale-102`
                        : 'border-transparent text-black dark:text-[#657394] hover:text-black dark:hover:text-[#9AA8C7] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${colorItem.dotBg} ${
                        isActive ? colorItem.glow : 'opacity-80'
                      }`}
                    />
                    <span className="text-black dark:text-inherit font-black">{colorItem.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pattern Cycle Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5 dark:border-white/5">
            <span className="text-[11px] font-black text-black dark:text-[#9AA8C7] flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-[#8B5CFF] animate-pulse" />
              Pattern
            </span>

            <div className="flex items-center gap-1.5 bg-white dark:bg-[#050B18]/70 p-1 rounded-xl border border-black/8 dark:border-white/5 shadow-[2px_3px_8px_rgba(166,180,204,0.25),-2px_-2px_6px_rgba(255,255,255,0.9)] dark:shadow-none">
              {[
                { id: 'swirl' as SmokePattern, label: 'Swirl', icon: RotateCw },
                { id: 'pulse' as SmokePattern, label: 'Pulse', icon: Activity },
                { id: 'stream' as SmokePattern, label: 'Stream', icon: Wind },
              ].map(({ id, label, icon: Icon }) => {
                const isActive = smokePattern === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSmokePatternChange(id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      isActive
                        ? 'bg-black text-white dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 shadow-sm border border-black dark:border-purple-400/40 scale-102'
                        : 'text-black dark:text-[#657394] hover:text-black dark:hover:text-[#9AA8C7] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon size={11} className={isActive ? 'animate-spin-slow text-white' : 'text-black dark:text-inherit'} />
                    <span className={isActive ? 'text-white' : 'text-black dark:text-inherit font-black'}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Neumorphic Smoke Density Opacity Slider */}
          <div className="pt-2 border-t border-black/5 dark:border-white/5">
            <NeumorphicDensitySlider
              value={vapeOpacity}
              onChange={handleVapeOpacityChange}
            />
          </div>
        </div>
      </div>

      {/* 4. Daily & Weekly Goal Progress Section */}
      <div className="space-y-4">
        <div
          onClick={() => {
            soundFx.playClick();
            onNavigate('tasks');
          }}
          className="cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-purple-600 dark:text-[#8B5CFF]" />
              <span>Daily Goal Progress</span>
            </span>
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 group-hover:underline flex items-center gap-0.5">
              Manage Tasks <ArrowRight size={12} />
            </span>
          </div>

          <TaskProgressRing
            total={activeTaskList.length}
            completed={completedTodayCount}
            highPriorityPending={highPriorityPendingCount}
            activeTabLabel="Daily Goal"
          />
        </div>

        {/* Weekly Goal Progress Component with Circular Ring */}
        <WeeklyGoalCard tasks={tasks} onNavigate={onNavigate} />
      </div>

      {/* 5. 2-Column Grid of 4 Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {quickCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => {
                soundFx.playClick();
                onNavigate(card.screen);
              }}
              className="neu-card rounded-2xl p-3.5 text-left flex items-center gap-3 cursor-pointer group active:scale-[0.98] transition-transform hover:border-black/15 dark:hover:border-white/15"
            >
              <div
                className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5 group-hover:scale-105 transition-transform"
                style={{
                  boxShadow: `inset 2px 2px 6px rgba(0,0,0,0.15), 0 0 12px ${card.glowColor}`,
                }}
              >
                <Icon size={18} className={card.iconColor} />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-black dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors truncate">
                  {card.title}
                </h4>
                <p className="text-[10px] text-slate-800 dark:text-[#657394] mt-0.5 font-medium truncate">
                  {card.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 5. Install App Smart Banner (Desktop & Mobile 1-click access) */}
      {onOpenInstallModal && (
        <PWAInstallButton onOpenModal={(tab) => onOpenInstallModal(tab)} variant="banner" />
      )}

      {/* 6. Overview Shortcut Banner (Links to Screen 5 Overview) */}
      <button
        onClick={() => {
          soundFx.playClick();
          onNavigate('analytics');
        }}
        className="neu-card rounded-2xl p-3.5 flex items-center justify-between gap-3 border border-black/5 dark:border-purple-500/20 bg-white dark:bg-gradient-to-r dark:from-purple-900/20 dark:via-[#0a1632] dark:to-[#060e20] cursor-pointer hover:border-purple-500/40 transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-700 dark:text-[#A978FF] flex items-center justify-center shrink-0 border border-purple-500/30">
            <TrendingUp size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-black dark:text-white">Daily Productivity Pulse</h4>
            <p className="text-[11px] text-slate-800 dark:text-[#9AA8C7] font-medium">68% completed • 14 tasks done</p>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full neu-button flex items-center justify-center text-slate-900 dark:text-[#9AA8C7]">
          <ArrowRight size={13} />
        </div>
      </button>

      {/* 7. Recommended Quick Starters */}
      <div className="pt-0.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-900 dark:text-[#9AA8C7] mb-2 px-1">
          <Sparkles size={13} className="text-cyan-600 dark:text-[#35C9FF]" />
          <span className="font-bold text-[11px]">Recommended for you</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            'Brainstorm creative brand concept',
            'Finish website design',
            'Review TypeScript architecture',
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => {
                soundFx.playClick();
                if (onQuickPrompt) onQuickPrompt(promptText);
                onNavigate('assistant');
              }}
              className="neu-card-subtle shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-slate-900 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white border border-black/5 dark:border-white/5 hover:border-purple-500/30 transition-all cursor-pointer whitespace-nowrap"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
