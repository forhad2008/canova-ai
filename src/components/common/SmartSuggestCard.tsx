import React, { useState } from 'react';
import { Sparkles, Clock, CheckCircle2, ArrowRight, RefreshCw, Zap, FolderOpen, Target, Calendar } from 'lucide-react';
import { Task, ScreenType } from '../../types';
import { soundFx } from '../../utils/audio';
import { LiquidGlass } from './LiquidGlass';

interface SmartSuggestCardProps {
  tasks: Task[];
  onNavigate: (screen: ScreenType) => void;
  onQuickPrompt?: (prompt: string) => void;
  className?: string;
}

interface SuggestionPrimary {
  badgeText: string;
  badgeGradient: string;
  title: string;
  description: string;
  actionText: string;
  icon: React.ElementType;
  screen: ScreenType;
  prompt?: string;
  timeContext: string;
}

export const SmartSuggestCard: React.FC<SmartSuggestCardProps> = ({
  tasks,
  onNavigate,
  onQuickPrompt,
  className = '',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Simple heuristic engine
  const getHeuristicSuggestions = () => {
    const now = new Date();
    const hour = now.getHours();
    const pending = tasks.filter((t) => !t.completed);
    const highPriority = pending.find((t) => t.priority === 'high') || pending[0];

    let timeContext = 'Morning';
    if (hour >= 12 && hour < 17) timeContext = 'Afternoon';
    else if (hour >= 17 && hour < 21) timeContext = 'Evening';
    else if (hour >= 21 || hour < 5) timeContext = 'Night';

    // Primary suggestion heuristic
    let primary: SuggestionPrimary = {
      badgeText: 'Smart Recommend',
      badgeGradient: 'from-amber-500/20 via-orange-500/20 to-purple-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      title: 'Plan Your Day',
      description: 'Ask AI to organize your priorities.',
      actionText: 'Launch Assistant',
      icon: Sparkles,
      screen: 'assistant' as ScreenType,
      prompt: 'Help me plan my schedule for today',
      timeContext,
    };

    if (timeContext === 'Morning') {
      if (highPriority) {
        primary = {
          badgeText: '⚡ Morning Priority',
          badgeGradient: 'from-amber-500/20 via-red-500/20 to-purple-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
          title: `Focus on: "${highPriority.title}"`,
          description: `High priority item due today. Start early while your energy is fresh.`,
          actionText: 'Open Task',
          icon: Target,
          screen: 'tasks' as ScreenType,
          prompt: undefined,
          timeContext,
        };
      } else if (pending.length > 0) {
        primary = {
          badgeText: '🌅 Morning Momentum',
          badgeGradient: 'from-purple-500/20 via-indigo-500/20 to-cyan-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
          title: `Tackle ${pending.length} Pending Tasks`,
          description: `You have ${pending.length} action items scheduled for today.`,
          actionText: 'View Task Board',
          icon: CheckCircle2,
          screen: 'tasks' as ScreenType,
          prompt: undefined,
          timeContext,
        };
      } else {
        primary = {
          badgeText: '✨ Fresh Start',
          badgeGradient: 'from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
          title: 'Draft Today\'s Sprint Plan',
          description: 'No pending tasks! Ask AI to structure your goals for today.',
          actionText: 'Draft Plan with AI',
          icon: Sparkles,
          screen: 'assistant' as ScreenType,
          prompt: 'Help me set up 3 clear sprint goals for today',
          timeContext,
        };
      }
    } else if (timeContext === 'Afternoon') {
      if (highPriority) {
        primary = {
          badgeText: '🎯 Midday Action',
          badgeGradient: 'from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
          title: `Complete: "${highPriority.title}"`,
          description: 'Knock out your top priority item before the afternoon wraps up.',
          actionText: 'Jump to Task',
          icon: Zap,
          screen: 'tasks' as ScreenType,
          prompt: undefined,
          timeContext,
        };
      } else if (pending.length > 0) {
        primary = {
          badgeText: '⚡ Afternoon Drive',
          badgeGradient: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
          title: `Finish ${pending.length} Remaining Tasks`,
          description: 'Maintain steady progress toward your daily completion target.',
          actionText: 'Check Tasks',
          icon: CheckCircle2,
          screen: 'tasks' as ScreenType,
          prompt: undefined,
          timeContext,
        };
      } else {
        primary = {
          badgeText: '📁 Knowledge Hub',
          badgeGradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          title: 'Organize Files & Notes',
          description: 'All tasks clear! Review project assets or upload new reference files.',
          actionText: 'Manage Files',
          icon: FolderOpen,
          screen: 'files' as ScreenType,
          prompt: undefined,
          timeContext,
        };
      }
    } else if (timeContext === 'Evening') {
      if (pending.length > 0) {
        primary = {
          badgeText: '🌙 Evening Wrap-Up',
          badgeGradient: 'from-purple-500/20 via-indigo-500/20 to-blue-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
          title: `Review ${pending.length} Unfinished Items`,
          description: 'Wrap up quick tasks or reschedule remaining items for tomorrow.',
          actionText: 'Review Board',
          icon: Clock,
          screen: 'tasks' as ScreenType,
          prompt: undefined,
          timeContext,
        };
      } else {
        primary = {
          badgeText: '🎉 Daily Achievement',
          badgeGradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
          title: 'Generate Daily Progress Summary',
          description: 'All daily tasks completed! Let AI craft a quick summary of your wins.',
          actionText: 'Summarize Today',
          icon: Sparkles,
          screen: 'assistant' as ScreenType,
          prompt: 'Summarize my achievements and key tasks completed today',
          timeContext,
        };
      }
    } else {
      // Night
      if (pending.length > 0) {
        primary = {
          badgeText: '🌃 Night Sweep',
          badgeGradient: 'from-indigo-500/20 via-slate-500/20 to-purple-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
          title: `Reschedule ${pending.length} Open Items`,
          description: 'Clean up your board so you wake up to a fresh workspace.',
          actionText: 'Reschedule Tasks',
          icon: Calendar,
          screen: 'tasks' as ScreenType,
          prompt: undefined,
          timeContext,
        };
      } else {
        primary = {
          badgeText: '🌌 Quiet Hours',
          badgeGradient: 'from-purple-500/20 via-fuchsia-500/20 to-indigo-500/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30',
          title: 'Brainstorm Ideas for Tomorrow',
          description: 'Zero pending items! Capture early thoughts or outline upcoming projects.',
          actionText: 'Brainstorm with AI',
          icon: Sparkles,
          screen: 'assistant' as ScreenType,
          prompt: 'Help me brainstorm 3 creative ideas for my upcoming projects',
          timeContext,
        };
      }
    }

    // Secondary options
    const secondaries = [
      {
        id: 'sec-ai',
        label: 'Ask AI Assistant',
        icon: Sparkles,
        screen: 'assistant' as ScreenType,
        prompt: 'Give me 3 high-impact suggestions for my current workflow',
      },
      {
        id: 'sec-tasks',
        label: `${pending.length} Pending Tasks`,
        icon: CheckCircle2,
        screen: 'tasks' as ScreenType,
      },
    ];

    return { primary, secondaries };
  };

  const { primary, secondaries } = getHeuristicSuggestions();
  const IconComponent = primary.icon;

  const handlePrimaryClick = () => {
    soundFx.playClick();
    if (primary.prompt && onQuickPrompt) {
      onQuickPrompt(primary.prompt);
    }
    onNavigate(primary.screen);
  };

  const handleRefresh = () => {
    soundFx.playClick();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  if (dismissed) return null;

  return (
    <LiquidGlass tint="purple" intensity="medium" className={`p-4.5 space-y-3 ${className}`}>
      {/* Background ambient liquid blur gradient */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-purple-500/10 via-amber-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header with Smart Suggest badge and refresh action */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-600 dark:text-[#A978FF] flex items-center justify-center border border-purple-500/25 shadow-xs">
            <Zap size={14} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#9AA8C7]">
              Smart Suggest • {primary.timeContext}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            aria-label="Refresh recommendation"
            title="Re-evaluate recommendation"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Recommended Action Box */}
      <div className="relative z-10 p-3.5 rounded-2xl bg-white/40 dark:bg-zinc-900/90 backdrop-blur-md border border-white/60 dark:border-zinc-800 shadow-inner space-y-2.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-700 dark:text-[#A978FF] flex items-center justify-center shrink-0 border border-purple-500/30">
            <IconComponent size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1 bg-gradient-to-r ${primary.badgeGradient}`}>
              {primary.badgeText}
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
              {primary.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-[#9AA8C7] leading-relaxed mt-0.5 line-clamp-2">
              {primary.description}
            </p>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={handlePrimaryClick}
          className="w-full py-2.5 px-4 rounded-xl neu-primary-btn text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>{primary.actionText}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Quick Secondary Recommendations */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 relative z-10">
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-0.5">
          Alternatives:
        </span>
        {secondaries.map((sec) => {
          const SecIcon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => {
                soundFx.playClick();
                if (sec.prompt && onQuickPrompt) {
                  onQuickPrompt(sec.prompt);
                }
                onNavigate(sec.screen);
              }}
              className="px-2.5 py-1 rounded-xl bg-white/60 dark:bg-white/8 hover:bg-purple-500/15 border border-black/8 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white flex items-center gap-1.5 transition-all cursor-pointer max-w-full min-w-0 shadow-xs"
            >
              <SecIcon size={12} className="text-purple-600 dark:text-[#A978FF] shrink-0" />
              <span className="truncate">{sec.label}</span>
            </button>
          );
        })}
      </div>
    </LiquidGlass>
  );
};
