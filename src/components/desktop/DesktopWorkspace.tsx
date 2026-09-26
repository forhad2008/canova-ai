import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Command,
  Clock,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  Plus,
  Layers,
  Copy,
  Check,
  Cpu,
  BarChart3,
  Calendar,
  MessageSquare,
  FileCode,
  Zap,
  TrendingUp,
  BookOpen,
  Target,
  Image as ImageIcon,
  Languages,
  FileEdit,
  Video,
  Globe,
  MoreVertical,
  Download,
  Trash2,
  Send,
  User,
  Settings as SettingsIcon,
  Shield,
  Moon,
  Sun,
  Volume2,
  Bell,
  Camera,
  Edit3,
  ChevronLeft,
} from 'lucide-react';
import { ScreenType, Task, FileItem, AITool, UserProfile, ChatMessage } from '../../types';
import { NovaStar } from '../common/NovaStar';
import { SphereOrb } from '../common/SphereOrb';
import { sendChatMessage } from '../../services/gemini';
import { useRecentSearches } from '../../utils/useRecentSearches';
import { RecentSearchesList } from '../common/RecentSearchesList';
import { QuickAccessSidebar } from './QuickAccessSidebar';
import { ThemeToggle } from '../common/ThemeToggle';
import { useTheme } from '../../utils/ThemeContext';
import { soundFx } from '../../utils/audio';
import photoAvatar from '../../assets/photo.png';

interface DesktopWorkspaceProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  user: UserProfile;
  tasks: Task[];
  files: FileItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onDeleteTask: (id: string) => void;
  onAddFile: (file: Omit<FileItem, 'id'>) => void;
  onDeleteFile: (id: string) => void;
  onSelectTool: (tool: AITool) => void;
  onOpenProModal: () => void;
  onQuickPrompt: (prompt: string) => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onClearData: () => void;
}

export const DesktopWorkspace: React.FC<DesktopWorkspaceProps> = ({
  currentScreen,
  onNavigate,
  user,
  tasks,
  files,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onAddFile,
  onDeleteFile,
  onSelectTool,
  onOpenProModal,
  onQuickPrompt,
  onUpdateUser,
  onClearData,
}) => {
  const { theme, setTheme } = useTheme();
  const [globalSearch, setGlobalSearch] = useState('');
  const [isGlobalSearchFocused, setIsGlobalSearchFocused] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [exploreCategory, setExploreCategory] = useState('All');
  const [fileFilter, setFileFilter] = useState<'all' | 'documents' | 'images' | 'others'>('all');
  const [showQuickAccess, setShowQuickAccess] = useState(() => {
    // Default open on wide desktop (>= 1280px), but clean/hidden on tablet (< 1280px)
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1280;
    }
    return true;
  });

  const {
    recentSearches: globalRecentSearches,
    addSearch: addGlobalSearch,
    removeSearch: removeGlobalSearch,
    clearSearches: clearGlobalSearches,
  } = useRecentSearches('nova_recent_searches_desktop', [
    'Brand identity design',
    'Generate TypeScript schema',
    'Finish website design',
  ]);
  
  // Desktop AI Assistant chat state
  const [desktopMessages, setDesktopMessages] = useState<ChatMessage[]>([
    {
      id: 'd-m1',
      sender: 'user',
      text: 'Can you help me with a creative brand concept idea?',
      timestamp: '09:41',
    },
    {
      id: 'd-m2',
      sender: 'assistant',
      text: "Of course! Here is a luxury creative concept tailored to your aesthetic:",
      timestamp: '09:42',
      structuredCard: {
        kicker: 'Brand Concept',
        title: 'Identity in Every Detail',
        description:
          "Your brand isn't just about products, it's about an authentic lifestyle. Focus on minimal, premium, and authentic designs that speak to your individuality.",
        tags: ['Minimal', 'Premium', 'Creative', 'Dark Neumorphic'],
        followUp: 'Would you like me to generate visual moodboard tokens or CSS variables?',
      },
      suggestionChips: ['Generate color palette', 'Draft mission statement', 'Export to Files'],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [profileHeadline, setProfileHeadline] = useState(user.headline);

  // Settings states
  const [aiModel, setAiModel] = useState('gemini-3.8-flash');
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [clearedNotice, setClearedNotice] = useState(false);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleSendChat = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDesktopMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await sendChatMessage(desktopMessages, text);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredCard: res.structuredCard,
        suggestionChips: res.suggestionChips,
      };
      setDesktopMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Graceful fallback
    } finally {
      setIsTyping(false);
    }
  };

  const allTools: AITool[] = [
    {
      id: 'image-gen',
      title: 'Image Generator',
      description: 'Create stunning images with neural prompts',
      category: 'Design',
      accentColor: '#D66BFF',
    },
    {
      id: 'code-assistant',
      title: 'Code Assistant',
      description: 'Write TypeScript, Tailwind & algorithms',
      category: 'Development',
      accentColor: '#35C9FF',
    },
    {
      id: 'note-maker',
      title: 'Note Maker',
      description: 'Capture thoughts & sync to files',
      category: 'Productivity',
      accentColor: '#8B5CFF',
    },
    {
      id: 'translator',
      title: 'Translator',
      description: 'Break language barriers in seconds',
      category: 'Productivity',
      accentColor: '#35C9FF',
    },
    {
      id: 'video-editor',
      title: 'Video Editor',
      description: 'Storyboard & motion direction',
      category: 'Design',
      accentColor: '#D66BFF',
    },
    {
      id: 'web-search',
      title: 'Web Search',
      description: 'Fast verified intelligence research',
      category: 'Search',
      accentColor: '#35C9FF',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden text-left select-none bg-[#EEF2F9] dark:bg-[#030712] transition-colors duration-200">
      {/* 1. Global Desktop Workspace Header */}
      <div className="px-4 md:px-6 lg:px-8 py-3.5 border-b border-[#CBD5E1]/60 dark:border-white/8 bg-[#EEF2F9]/90 dark:bg-[#071226]/75 backdrop-blur-2xl flex items-center justify-between gap-3 lg:gap-4 shrink-0 shadow-[0_4px_16px_rgba(166,180,204,0.35)] dark:shadow-md">
        {/* Breadcrumb / Title */}
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#657394]">
            <span className="hidden sm:inline">Workspace</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-slate-900 dark:text-white font-bold capitalize truncate max-w-[140px] md:max-w-none">
              {currentScreen === 'assistant'
                ? 'AI Assistant Studio'
                : currentScreen === 'home'
                ? 'Executive Dashboard'
                : currentScreen}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-300 dark:border-white/8">
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gemini 3.8 Flash Online
            </span>
            <span className="text-[11px] text-slate-600 dark:text-[#9AA8C7] neu-card-subtle px-2.5 py-0.5 rounded-full border border-black/5 dark:border-white/5 font-medium">
              Sync: Encrypted
            </span>
          </div>
        </div>

        {/* Global Search Bar (⌘K) */}
        <div className="flex-1 max-w-md relative hidden md:block z-30">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#657394]" />
          <input
            type="text"
            value={globalSearch}
            onFocus={() => setIsGlobalSearchFocused(true)}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && globalSearch.trim()) {
                addGlobalSearch(globalSearch.trim());
                setIsGlobalSearchFocused(false);
                onQuickPrompt(globalSearch.trim());
                onNavigate('assistant');
              }
            }}
            placeholder="Search across files, tasks, or ask Canova AI (Press Enter)..."
            className="w-full neu-inset rounded-xl py-2 pl-9 pr-14 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-500 dark:text-[#657394] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/8 pointer-events-none font-semibold">
            <Command size={10} />
            <span>K</span>
          </div>

          {/* Desktop Global Recent Searches */}
          {isGlobalSearchFocused && globalRecentSearches.length > 0 && (
            <RecentSearchesList
              searches={globalRecentSearches}
              onSelect={(term) => {
                setGlobalSearch(term);
                addGlobalSearch(term);
                setIsGlobalSearchFocused(false);
                onQuickPrompt(term);
                onNavigate('assistant');
              }}
              onRemove={removeGlobalSearch}
              onClear={clearGlobalSearches}
              onClose={() => setIsGlobalSearchFocused(false)}
            />
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 neu-card-subtle px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/6 text-xs">
            <Clock size={14} className="text-cyan-600 dark:text-[#35C9FF]" />
            <span className="text-slate-600 dark:text-[#9AA8C7]">Focus Sprint:</span>
            <span className="text-slate-900 dark:text-white font-bold">68% Done</span>
          </div>

          {/* Theme Mode Toggle (White / Dark Neumorphic) */}
          <ThemeToggle size="sm" />

          {/* Quick Access Toggle Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowQuickAccess(!showQuickAccess);
            }}
            title={showQuickAccess ? 'Hide Quick Access' : 'Show Quick Access'}
            className={`neu-card-subtle px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
              showQuickAccess
                ? 'border-purple-500/50 text-purple-700 dark:text-purple-300 shadow-[0_0_12px_rgba(139,92,255,0.25)] font-bold'
                : 'border-black/5 dark:border-white/6 text-slate-600 dark:text-[#657394] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap size={13} className={showQuickAccess ? 'text-purple-600 dark:text-[#8B5CFF]' : ''} />
            <span className="hidden xl:inline">Quick Access</span>
          </button>

          <button
            onClick={onOpenProModal}
            className="neu-primary-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles size={13} />
            <span>{user.plan === 'Pro' ? 'Pro Member' : 'Upgrade to Pro'}</span>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className="relative cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#8B5CFF] to-[#35C9FF] group-hover:shadow-[0_0_12px_rgba(139,92,255,0.6)] transition-all">
              <img
                src={user.avatar || photoAvatar}
                alt={user.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = photoAvatar;
                }}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </button>
        </div>
      </div>

      {/* 2. Main Content Body with Quick Access Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        {/* ================= HOME DASHBOARD (DESKTOP) ================= */}
        {currentScreen === 'home' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Row: AI Hero Banner (2/3) + Focus Sprint Widget (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Hero Banner */}
              <div className="lg:col-span-2 neu-card rounded-3xl p-7 relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-[#101e40] dark:via-[#09152e] dark:to-[#050c1c] border border-black/8 dark:border-purple-500/25 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between gap-6 relative z-10">
                  <div className="space-y-3 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-purple-700 dark:text-[#A978FF] uppercase tracking-wider bg-purple-500/15 px-2.5 py-1 rounded-md border border-purple-500/30">
                        AI Companion Studio
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-[#9AA8C7]">Good Morning, {user.name}</span>
                    </div>

                    <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                      Ready to help you build, design & plan today?
                    </h2>

                    <p className="text-xs font-medium text-slate-700 dark:text-[#9AA8C7] leading-relaxed">
                      Ask anything, create visual moodboards, optimize code architectures, or manage your daily sprints with seamless soft-white neumorphic fluidity.
                    </p>
                  </div>

                  <div className="shrink-0 hidden sm:flex items-center justify-center p-2">
                    <SphereOrb size={104} />
                  </div>
                </div>

                <div className="pt-6 flex flex-wrap items-center justify-between gap-3 relative z-10 border-t border-black/5 dark:border-white/5 mt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      'Brainstorm creative brand concept',
                      'Review TypeScript architecture',
                      'Schedule today’s 3.5h sprint',
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          onQuickPrompt(prompt);
                          onNavigate('assistant');
                        }}
                        className="neu-card-subtle px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white hover:border-purple-500/40 transition-all cursor-pointer shadow-2xs"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => onNavigate('assistant')}
                    className="neu-primary-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Launch AI Assistant</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Focus Sprint & Next Up Widget */}
              <div className="neu-card rounded-3xl p-6 flex flex-col justify-between border border-black/8 dark:border-white/8 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-700 dark:text-[#35C9FF] flex items-center justify-center border border-cyan-500/30">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Daily Focus Sprint</h4>
                      <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394]">3 of 5 goals completed</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">68%</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-[#9AA8C7]">
                    <span>Sprint Progress</span>
                    <span>3.5h / 5.0h</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full neu-inset overflow-hidden p-0.5 bg-[#F8FAFC] dark:bg-[#050d1e]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7C4DFF] to-[#3B72FF] dark:from-[#8B5CFF] dark:to-[#35C9FF] transition-all duration-500"
                      style={{ width: '68%' }}
                    />
                  </div>
                </div>

                <div className="neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-2xl p-3.5 space-y-2 border border-black/5 dark:border-white/5">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-[#A978FF] uppercase tracking-wider block">
                    Next Priority Task
                  </span>
                  {pendingTasks[0] ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="overflow-hidden">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {pendingTasks[0].title}
                        </h5>
                        <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394]">
                          {pendingTasks[0].category} • {pendingTasks[0].duration}
                        </p>
                      </div>
                      <button
                        onClick={() => onToggleTask(pendingTasks[0].id)}
                        className="neu-button px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 shrink-0 cursor-pointer shadow-xs"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">All tasks completed! 🎉</p>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('tasks')}
                  className="w-full neu-button py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white cursor-pointer shadow-xs"
                >
                  Manage All Tasks
                </button>
              </div>
            </div>

            {/* 4 Large Neumorphic Workspace Hubs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-purple-600 dark:text-[#8B5CFF]" />
                  <span>Workspace Hubs</span>
                </h3>
                <span className="text-xs font-semibold text-slate-600 dark:text-[#657394]">4 Modules Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Chat */}
                <button
                  onClick={() => onNavigate('assistant')}
                  className="neu-card rounded-2xl p-5 text-left flex flex-col justify-between space-y-4 group cursor-pointer hover:border-purple-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-700 dark:text-[#A978FF] flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
                      <MessageSquare size={18} />
                    </div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      Live
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300">
                      AI Assistant Studio
                    </h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-[#657394] mt-0.5">
                      Chat with Gemini 3.8 reasoning engine
                    </p>
                  </div>
                </button>

                {/* 2. Tasks */}
                <button
                  onClick={() => onNavigate('tasks')}
                  className="neu-card rounded-2xl p-5 text-left flex flex-col justify-between space-y-4 group cursor-pointer hover:border-cyan-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-[#35C9FF] flex items-center justify-center border border-cyan-500/30 group-hover:scale-105 transition-transform">
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {pendingTasks.length} pending
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
                      Task Cadence
                    </h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-[#657394] mt-0.5">
                      Stay productive and hit daily milestones
                    </p>
                  </div>
                </button>

                {/* 3. Files */}
                <button
                  onClick={() => onNavigate('files')}
                  className="neu-card rounded-2xl p-5 text-left flex flex-col justify-between space-y-4 group cursor-pointer hover:border-blue-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-700 dark:text-[#8B5CFF] flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
                      <FolderOpen size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {files.length} assets
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-purple-300">
                      Cloud Vault
                    </h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-[#657394] mt-0.5">
                      Secure encrypted storage for project files
                    </p>
                  </div>
                </button>

                {/* 4. Tools */}
                <button
                  onClick={() => onNavigate('explore')}
                  className="neu-card rounded-2xl p-5 text-left flex flex-col justify-between space-y-4 group cursor-pointer hover:border-fuchsia-500/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 text-fuchsia-700 dark:text-[#D66BFF] flex items-center justify-center border border-fuchsia-500/30 group-hover:scale-105 transition-transform">
                      <Zap size={18} />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">6 tools</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300">
                      Tool Studio
                    </h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-[#657394] mt-0.5">
                      Image generator, code helper & translator
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= AI ASSISTANT STUDIO (DESKTOP / TABLET 3-PANE) ================= */}
        {currentScreen === 'assistant' && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 min-h-[78vh] lg:h-[78vh]">
            {/* Left: Chat history & Presets (3 cols on desktop, compact on tablet) */}
            <div className="lg:col-span-3 neu-card rounded-3xl p-4 lg:p-5 flex flex-col justify-between border border-black/8 dark:border-white/8 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/6">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Conversations
                  </h4>
                  <button
                    onClick={() => {
                      setDesktopMessages([
                        {
                          id: `init-${Date.now()}`,
                          sender: 'assistant',
                          text: "Hello Abdullah! What can I help you create, plan, or solve today?",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                      ]);
                    }}
                    className="neu-button px-2.5 py-1 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Plus size={13} />
                    <span>New Chat</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'Brand Identity in Detail', tag: 'Creative', active: true },
                    { title: 'TypeScript Box-Shadow Math', tag: 'Code', active: false },
                    { title: 'Sprint Schedule & Milestones', tag: 'Productivity', active: false },
                    { title: 'Design System Tokens', tag: 'Design', active: false },
                  ].map((conv, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendChat(`Review ${conv.title}`)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                        conv.active
                          ? 'neu-inset border border-purple-500/40 text-purple-700 dark:text-white font-bold bg-[#F8FAFC] dark:bg-[#060e20]'
                          : 'neu-card-subtle text-slate-700 dark:text-[#9AA8C7] hover:text-slate-900 dark:hover:text-white font-medium'
                      }`}
                    >
                      <h5 className="text-xs font-bold truncate">{conv.title}</h5>
                      <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold mt-1 inline-block">
                        #{conv.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Model Spec */}
              <div className="neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-2xl p-3.5 border border-black/5 dark:border-white/5 space-y-1.5 text-xs text-slate-700 dark:text-[#9AA8C7]">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <Cpu size={14} className="text-purple-600 dark:text-[#8B5CFF]" />
                  <span>Model: Gemini 3.8 Flash</span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394]">
                  Tuned for structured cards, speed & multimodal creative synthesis.
                </p>
              </div>
            </div>

            {/* Middle: Interactive Chat Stream & Composer (5 cols on desktop, responsive height) */}
            <div className="lg:col-span-5 neu-card rounded-3xl p-4 border border-black/8 dark:border-white/8 flex flex-col justify-between overflow-hidden min-h-[420px] lg:min-h-0">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/6 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C4DFF] to-[#35C9FF] p-[1.5px]">
                    <div className="w-full h-full bg-white dark:bg-[#071226] rounded-full flex items-center justify-center">
                      <NovaStar size={16} glow={false} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Canova AI Studio</h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Online • Real-time</span>
                  </div>
                </div>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar my-2">
                {desktopMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-tr-xs shadow-md font-medium'
                            : 'neu-inset bg-[#F8FAFC] dark:bg-[#060e20] text-slate-900 dark:text-[#F7F8FF] rounded-tl-xs border border-black/8 dark:border-white/8 font-medium'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        {msg.structuredCard && (
                          <div className="mt-2.5 neu-card-subtle bg-white dark:bg-[#0b1834] p-3 rounded-xl border border-purple-500/30 text-slate-900 dark:text-white">
                            <span className="text-[10px] text-purple-700 dark:text-[#A978FF] font-extrabold uppercase tracking-wider block">
                              {msg.structuredCard.kicker}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                              {msg.structuredCard.title}
                            </h5>
                            <p className="text-[11px] font-medium text-slate-700 dark:text-[#9AA8C7] mt-1">
                              {msg.structuredCard.description}
                            </p>
                          </div>
                        )}
                        <span className="text-[9px] opacity-70 block text-right mt-1 font-semibold">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Suggestion Chips */}
                      {msg.suggestionChips && !isUser && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.suggestionChips.map((chip, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendChat(chip)}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-full neu-button text-slate-800 dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white cursor-pointer shadow-2xs"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="text-xs text-purple-700 dark:text-[#9AA8C7] font-semibold flex items-center gap-1.5 p-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Composer */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/6"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Canova AI anything..."
                  className="flex-1 neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-xl py-2 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50 font-medium"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="neu-primary-btn w-9 h-9 rounded-xl flex items-center justify-center text-white cursor-pointer disabled:opacity-50 shadow-md"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>

            {/* Right: Live Concept & Artifact Inspector (4 cols) */}
            <div className="lg:col-span-4 neu-card rounded-3xl p-6 border border-black/8 dark:border-white/8 flex flex-col justify-between bg-white dark:bg-gradient-to-br dark:from-[#0c1836] dark:to-[#060d1e]">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/8">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Concept Inspector
                  </h4>
                  <button
                    onClick={() => {
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 1500);
                    }}
                    className="neu-button px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Structured Brand Concept Card */}
                <div className="neu-inset rounded-2xl p-5 border border-purple-500/25 bg-[#F8FAFC] dark:bg-[#060e20] space-y-3">
                  <span className="text-xs font-extrabold text-purple-700 dark:text-[#A978FF] uppercase tracking-wider block">
                    Brand Concept Specification
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Identity in Every Detail</h3>
                  <p className="text-xs font-medium text-slate-700 dark:text-[#9AA8C7] leading-relaxed">
                    Your brand isn't just about products, it's about an authentic lifestyle. Focus on minimal, premium, and authentic designs that speak to your individuality.
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Minimal', 'Premium', 'Creative', 'White Neumorphic'].map((tag, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Palette Swatches */}
                  <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-[#657394]">
                      Brand Color Scale
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'Canvas Clay', hex: '#EEF2F9' },
                        { name: 'Pure White', hex: '#FFFFFF' },
                        { name: 'Royal Purple', hex: '#7C4DFF' },
                        { name: 'Electric Cyan', hex: '#0284C7' },
                      ].map((c, i) => (
                        <div key={i} className="neu-card-subtle p-2 rounded-xl text-center bg-white dark:bg-[#0b1834] border border-black/5 dark:border-white/10">
                          <div
                            className="w-full h-5 rounded-lg mb-1 border border-black/10 dark:border-white/10"
                            style={{ backgroundColor: c.hex }}
                          />
                          <p className="text-[10px] text-slate-900 dark:text-white font-bold truncate">{c.name}</p>
                          <p className="text-[9px] text-slate-600 dark:text-[#657394] font-mono">{c.hex}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-4 border-t border-black/5 dark:border-white/8 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700 dark:text-[#9AA8C7]">Export concept to files</p>
                <button
                  onClick={() => {
                    onAddFile({
                      name: 'Brand_Identity_Concept.txt',
                      size: '84 KB',
                      date: 'Just now',
                      category: 'documents',
                      extension: 'txt',
                      color: '#8B5CFF',
                    });
                    onNavigate('files');
                  }}
                  className="neu-primary-btn px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md"
                >
                  Save to Vault
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TASKS MANAGEMENT (DESKTOP) ================= */}
        {currentScreen === 'tasks' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Metric KPI Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Tasks', value: tasks.length, color: 'text-slate-900 dark:text-white' },
                { label: 'Completed', value: completedTasks.length, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Pending Queue', value: pendingTasks.length, color: 'text-cyan-600 dark:text-[#35C9FF]' },
                { label: 'Estimated Work', value: '6.5 Hours', color: 'text-purple-600 dark:text-[#A978FF]' },
              ].map((kpi, i) => (
                <div key={i} className="neu-card rounded-2xl p-4 flex flex-col justify-between border border-black/8 dark:border-white/8">
                  <span className="text-xs font-semibold text-slate-700 dark:text-[#9AA8C7]">{kpi.label}</span>
                  <span className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</span>
                </div>
              ))}
            </div>

            {/* Quick Add Bar */}
            <div className="neu-card rounded-2xl p-3 flex items-center gap-3 border border-black/8 dark:border-white/8">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && taskInput.trim()) {
                    onAddTask({
                      title: taskInput.trim(),
                      category: 'Design',
                      duration: '1 hour',
                      completed: false,
                      dueDate: 'today',
                    });
                    setTaskInput('');
                  }
                }}
                placeholder="Type a new task title and press Enter..."
                className="flex-1 neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-xl py-2 px-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50 font-medium"
              />
              <button
                onClick={() => {
                  if (taskInput.trim()) {
                    onAddTask({
                      title: taskInput.trim(),
                      category: 'Design',
                      duration: '1 hour',
                      completed: false,
                      dueDate: 'today',
                    });
                    setTaskInput('');
                  }
                }}
                className="neu-primary-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>

            {/* 2-Column Task Grid: In-Progress vs Completed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* In-Progress Column */}
              <div className="neu-card rounded-3xl p-5 space-y-3 border border-black/8 dark:border-white/8">
                <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/6">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span>In-Progress Queue ({pendingTasks.length})</span>
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {pendingTasks.map((t) => (
                    <div
                      key={t.id}
                      className="neu-card-subtle p-3.5 rounded-xl flex items-center justify-between gap-3 group border border-black/5 dark:border-white/5"
                    >
                      <button
                        onClick={() => onToggleTask(t.id)}
                        className="w-6 h-6 rounded-full neu-inset bg-[#F8FAFC] dark:bg-[#060e20] border border-black/10 dark:border-white/10 flex items-center justify-center cursor-pointer hover:border-purple-400 shadow-2xs"
                      />
                      <div className="flex-1 overflow-hidden">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.title}</h5>
                        <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394]">
                          {t.category} • {t.duration}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 text-xs px-2 py-1 font-semibold cursor-pointer transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Column */}
              <div className="neu-card rounded-3xl p-5 space-y-3 border border-black/8 dark:border-white/8">
                <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/6">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Completed Milestones ({completedTasks.length})</span>
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {completedTasks.length === 0 ? (
                    <p className="text-xs font-medium text-slate-500 dark:text-[#657394] py-8 text-center">
                      No completed tasks yet. Check off an item from the queue!
                    </p>
                  ) : (
                    completedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="neu-card-subtle p-3.5 rounded-xl flex items-center justify-between gap-3 opacity-75 border border-black/5 dark:border-white/5"
                      >
                        <button
                          onClick={() => onToggleTask(t.id)}
                          className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#7C4DFF] to-[#35C9FF] text-white flex items-center justify-center cursor-pointer shadow-xs"
                        >
                          <Check size={13} className="stroke-[3]" />
                        </button>
                        <div className="flex-1 overflow-hidden">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white line-through truncate">
                            {t.title}
                          </h5>
                          <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394]">
                            {t.category} • Completed
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ANALYTICS DASHBOARD (DESKTOP) ================= */}
        {currentScreen === 'analytics' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header + Period Selector */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Performance Analytics & Insights</h3>
                <p className="text-xs font-medium text-slate-700 dark:text-[#9AA8C7]">Deep productivity metrics and milestone cadence</p>
              </div>

              <div className="neu-inset bg-[#F8FAFC] dark:bg-[#060e20] p-1 rounded-full flex items-center gap-1 border border-black/5 dark:border-white/5">
                {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAnalyticsPeriod(p)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                      analyticsPeriod === p ? 'neu-primary-btn text-white shadow-xs' : 'text-slate-600 dark:text-[#657394] hover:text-slate-900 dark:hover:text-[#9AA8C7]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Progress Widescreen Card */}
            <div className="neu-card rounded-3xl p-6 relative overflow-hidden bg-white dark:bg-gradient-to-b dark:from-[#0e1d3d] dark:to-[#060e20] border border-black/8 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-[#9AA8C7] uppercase tracking-wider">
                  Total Productivity Output
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <TrendingUp size={13} /> {analyticsPeriod === 'weekly' ? '+12% this week' : '+24% this period'}
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {analyticsPeriod === 'weekly' ? '68%' : analyticsPeriod === 'monthly' ? '84%' : '92%'}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-[#9AA8C7]">Completion Velocity</span>
              </div>

              {/* Dynamic Widescreen SVG Wave Chart */}
              <div className="w-full h-36 relative">
                <svg viewBox="0 0 800 120" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="deskChartGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B72FF" />
                      <stop offset="50%" stopColor="#7C4DFF" />
                      <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>
                    <linearGradient id="deskChartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#EEF2F9" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 0 90 C 100 80, 200 40, 300 65 C 400 90, 500 30, 600 45 C 700 60, 750 20, 800 15 L 800 120 L 0 120 Z"
                    fill="url(#deskChartFill)"
                  />
                  <path
                    d="M 0 90 C 100 80, 200 40, 300 65 C 400 90, 500 30, 600 45 C 700 60, 750 20, 800 15"
                    fill="none"
                    stroke="url(#deskChartGlow)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="drop-shadow-[0_4px_12px_rgba(124,77,255,0.4)]"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-[#657394] pt-2 border-t border-black/5 dark:border-white/5">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="neu-card rounded-2xl p-4 space-y-1 border border-black/8 dark:border-white/8">
                <span className="text-xs font-bold text-slate-700 dark:text-[#9AA8C7] flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-purple-600 dark:text-[#8B5CFF]" /> Tasks Done
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">14</span>
              </div>

              <div className="neu-card rounded-2xl p-4 space-y-1 border border-black/8 dark:border-white/8">
                <span className="text-xs font-bold text-slate-700 dark:text-[#9AA8C7] flex items-center gap-1.5">
                  <BookOpen size={14} className="text-cyan-600 dark:text-[#35C9FF]" /> Study Time
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">12h</span>
              </div>

              <div className="neu-card rounded-2xl p-4 space-y-1 border border-black/8 dark:border-white/8">
                <span className="text-xs font-bold text-slate-700 dark:text-[#9AA8C7] flex items-center gap-1.5">
                  <Clock size={14} className="text-fuchsia-600 dark:text-[#D66BFF]" /> Focus Time
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">8h</span>
              </div>

              <div className="neu-card rounded-2xl p-4 space-y-1 border border-black/8 dark:border-white/8">
                <span className="text-xs font-bold text-slate-700 dark:text-[#9AA8C7] flex items-center gap-1.5">
                  <Target size={14} className="text-blue-600 dark:text-[#4C7DFF]" /> Goals Achieved
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">3</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= EXPLORE TOOL SUITE (DESKTOP) ================= */}
        {currentScreen === 'explore' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Creative & Developer Tool Suite</h3>
                <p className="text-xs font-medium text-slate-700 dark:text-[#9AA8C7]">Launch specialized AI tools with high-throughput models</p>
              </div>

              <div className="flex gap-2">
                {['All', 'Productivity', 'Design', 'Development'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setExploreCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      exploreCategory === cat
                        ? 'neu-primary-btn text-white shadow-xs'
                        : 'neu-card-subtle text-slate-700 dark:text-[#9AA8C7] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 3-Column Tool Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTools
                .filter(
                  (t) =>
                    exploreCategory === 'All' ||
                    t.category.toLowerCase().includes(exploreCategory.toLowerCase())
                )
                .map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => onSelectTool(tool)}
                    className="neu-card rounded-3xl p-6 flex flex-col justify-between space-y-5 cursor-pointer group hover:border-purple-500/40 transition-all border border-black/8 dark:border-white/8"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 rounded-2xl neu-inset bg-[#F8FAFC] dark:bg-[#060e20] flex items-center justify-center border border-black/5 dark:border-white/10 group-hover:scale-105 transition-transform"
                        style={{ color: tool.accentColor }}
                      >
                        <Sparkles size={22} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-[#9AA8C7] bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-md border border-black/5 dark:border-white/6">
                        {tool.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                        {tool.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-600 dark:text-[#9AA8C7] mt-1 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-black/5 dark:border-white/6 flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-bold group-hover:text-purple-900 dark:group-hover:text-white">
                      <span>Launch Studio</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================= FILES VAULT (DESKTOP) ================= */}
        {currentScreen === 'files' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="neu-card rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-black/8 dark:border-white/8">
              <div className="space-y-1 max-w-sm">
                <div className="flex items-center gap-2">
                  <FolderOpen size={18} className="text-purple-600 dark:text-[#8B5CFF]" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Cloud Workspace Storage</h4>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-[#9AA8C7]">
                  18.4 GB used of 50 GB encrypted cloud storage.
                </p>
              </div>

              <div className="flex-1 w-full max-w-md space-y-1">
                <div className="w-full h-3 rounded-full neu-inset bg-[#F8FAFC] dark:bg-[#060e20] overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7C4DFF] via-[#3B72FF] to-[#0284C7] dark:from-[#8B5CFF] dark:via-[#4C7DFF] dark:to-[#35C9FF]"
                    style={{ width: '36.8%' }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-[#657394]">
                  <span>36.8% Used</span>
                  <span>31.6 GB Remaining</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onAddFile({
                    name: `Asset_${Date.now().toString().slice(-4)}.zip`,
                    size: '14.2 MB',
                    date: 'Just now',
                    category: 'others',
                    extension: 'zip',
                    color: '#f59e0b',
                  });
                }}
                className="neu-primary-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md"
              >
                <Plus size={14} />
                <span>Upload File</span>
              </button>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="neu-card rounded-2xl p-4 flex items-center justify-between gap-3 group border border-black/8 dark:border-white/8"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-[#A978FF] flex items-center justify-center shrink-0">
                    <FileCode size={18} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{file.name}</h5>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394]">
                      {file.size} • {file.date}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 cursor-pointer transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= PROFILE SUITE (DESKTOP) ================= */}
        {currentScreen === 'profile' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Card: Avatar & Stats */}
            <div className="neu-card rounded-3xl p-6 flex flex-col items-center text-center space-y-4 border border-black/8 dark:border-white/8">
              <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#7C4DFF] via-[#3B72FF] to-[#0284C7] dark:from-[#8B5CFF] dark:via-[#4C7DFF] dark:to-[#35C9FF] shadow-[0_4px_20px_rgba(124,77,255,0.4)] dark:shadow-[0_0_25px_rgba(139,92,255,0.5)]">
                <img
                  src={user.avatar || photoAvatar}
                  alt={user.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = photoAvatar;
                  }}
                  className="w-full h-full object-cover rounded-full border-2 border-white dark:border-[#0B1730]"
                />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{user.name}</h3>
                <p className="text-xs font-bold text-purple-700 dark:text-[#9AA8C7]">{user.username}</p>
                <p className="text-xs font-medium text-slate-600 dark:text-[#657394] mt-1">{user.headline}</p>
              </div>

              {/* Stats */}
              <div className="w-full neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-2xl p-3 flex justify-around text-center border border-black/5 dark:border-white/5">
                <div>
                  <span className="text-base font-black text-slate-900 dark:text-white block">{user.projectsCount}</span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-[#657394]">Projects</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-300 dark:bg-white/10" />
                <div>
                  <span className="text-base font-black text-slate-900 dark:text-white block">{user.followersCount}</span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-[#657394]">Followers</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-300 dark:bg-white/10" />
                <div>
                  <span className="text-base font-black text-slate-900 dark:text-white block">{user.followingCount}</span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-[#657394]">Following</span>
                </div>
              </div>

              <button
                onClick={onOpenProModal}
                className="w-full neu-primary-btn py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md"
              >
                {user.plan === 'Pro' ? 'Pro Member Activated' : 'Upgrade to Canova Pro'}
              </button>
            </div>

            {/* Right Card: Profile details & actions */}
            <div className="lg:col-span-2 neu-card rounded-3xl p-6 space-y-5 border border-black/8 dark:border-white/8">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h4>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="neu-button px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 size={13} />
                  <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-[#9AA8C7] block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-[#9AA8C7] block mb-1">Headline</label>
                    <input
                      type="text"
                      value={profileHeadline}
                      onChange={(e) => setProfileHeadline(e.target.value)}
                      className="w-full neu-inset bg-[#F8FAFC] dark:bg-[#060e20] rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <button
                    onClick={() => {
                      onUpdateUser({ name: profileName, headline: profileHeadline });
                      setIsEditingProfile(false);
                    }}
                    className="neu-primary-btn px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="neu-card-subtle p-4 rounded-2xl space-y-1 border border-black/5 dark:border-white/5">
                    <span className="text-slate-600 dark:text-[#657394] font-bold block">Professional Specialization</span>
                    <p className="text-slate-900 dark:text-white font-bold">{user.headline}</p>
                  </div>
                  <div className="neu-card-subtle p-4 rounded-2xl space-y-1 border border-black/5 dark:border-white/5">
                    <span className="text-slate-600 dark:text-[#657394] font-bold block">Membership Status</span>
                    <p className="text-purple-700 dark:text-purple-300 font-extrabold">{user.plan} Tier Active</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SETTINGS (DESKTOP) ================= */}
        {currentScreen === 'settings' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">System Settings & Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Config */}
              <div className="neu-card rounded-3xl p-6 space-y-4 border border-purple-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <Cpu size={16} className="text-purple-600 dark:text-[#8B5CFF]" />
                  <span>AI Engine Configuration</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-[#9AA8C7] block mb-1.5">
                    Gemini Reasoning Model
                  </label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full neu-inset rounded-xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none"
                  >
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash (High Speed & Creative)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep STEM & Code)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra Low Latency)</option>
                  </select>
                </div>
              </div>

              {/* Interface Lighting & Neumorphic Color Palette */}
              <div className="neu-card rounded-3xl p-6 space-y-4 border border-black/8 dark:border-white/8">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Moon size={16} className="text-cyan-600 dark:text-[#35C9FF]" />
                  <span>Interface Aesthetics</span>
                </div>

                {/* Neumorphic Scheme Toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/6">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Neumorphic Color Scheme</h5>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394]">
                      {theme === 'light' ? 'Soft White Clay Edition' : 'Deep Space Dark Edition'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 neu-inset bg-[#F8FAFC] dark:bg-[#060e20] p-1 rounded-xl">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setTheme('light');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'neu-primary-btn text-white shadow-xs'
                          : 'text-slate-600 dark:text-[#657394] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Sun size={13} />
                      <span>White</span>
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setTheme('dark');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'neu-primary-btn text-white shadow-xs'
                          : 'text-slate-600 dark:text-[#657394] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Moon size={13} />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Soft Neumorphic Glow</h5>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394]">Ambient directional lighting</p>
                  </div>
                  <button
                    onClick={() => setAmbientGlow(!ambientGlow)}
                    className={`w-11 h-6 rounded-full relative p-0.5 cursor-pointer transition-colors ${
                      ambientGlow ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                        ambientGlow ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Clear workspace data */}
            <div className="neu-card rounded-3xl p-5 border border-red-500/20 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Reset Local Workspace</h5>
                <p className="text-[11px] font-medium text-slate-600 dark:text-[#657394]">Clear local cache, tasks, and files</p>
              </div>
              <button
                onClick={() => {
                  onClearData();
                  setClearedNotice(true);
                  setTimeout(() => setClearedNotice(false), 2000);
                }}
                className="neu-button px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer shadow-xs"
              >
                {clearedNotice ? 'Reset!' : 'Reset Data'}
              </button>
            </div>
          </div>
        )}
        </div>

        {/* 3. Dedicated Right Sidebar: Quick Access & Recents */}
        {showQuickAccess ? (
          <QuickAccessSidebar
            tasks={tasks}
            files={files}
            onToggleTask={onToggleTask}
            onAddTask={onAddTask}
            onNavigate={onNavigate}
            onQuickPrompt={onQuickPrompt}
            onClose={() => setShowQuickAccess(false)}
          />
        ) : (
          <button
            onClick={() => {
              soundFx.playClick();
              setShowQuickAccess(true);
            }}
            title="Expand Quick Access & Recents"
            aria-label="Expand Quick Access"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 neu-card py-3 px-1.5 rounded-l-xl border-l border-y border-purple-500/40 bg-[#071329]/95 text-purple-300 hover:text-white hover:bg-purple-900/40 transition-all shadow-xl group items-center cursor-pointer"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
