import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  FolderOpen,
  Plus,
  ArrowRight,
  FileText,
  FileCode,
  Archive,
  Image as ImageIcon,
  Check,
  TrendingUp,
  HardDrive,
  Sparkles,
  ExternalLink,
  ChevronRight,
  History,
  X,
} from 'lucide-react';
import { Task, FileItem, ScreenType } from '../../types';
import { soundFx } from '../../utils/audio';
import { useRecentSearches } from '../../utils/useRecentSearches';

interface QuickAccessSidebarProps {
  tasks: Task[];
  files: FileItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onNavigate: (screen: ScreenType) => void;
  onQuickPrompt: (prompt: string) => void;
  onClose?: () => void;
}

export const QuickAccessSidebar: React.FC<QuickAccessSidebarProps> = ({
  tasks,
  files,
  onToggleTask,
  onAddTask,
  onNavigate,
  onQuickPrompt,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'tasks' | 'files' | 'recents'>('all');
  const [quickTaskText, setQuickTaskText] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const { recentSearches, removeSearch, clearSearches, addSearch } = useRecentSearches(
    'nova_recent_searches_desktop',
    ['Brand concept idea', 'Generate TypeScript schema', 'Finish website design']
  );

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskText.trim()) return;
    soundFx.playSuccess();
    onAddTask({
      title: quickTaskText.trim(),
      category: 'Design',
      duration: '45 min',
      completed: false,
      dueDate: 'today',
    });
    setQuickTaskText('');
  };

  const getFileIcon = (ext: string, color: string) => {
    switch (ext.toLowerCase()) {
      case 'fig':
      case 'png':
      case 'jpg':
        return <ImageIcon size={15} color={color} />;
      case 'ts':
      case 'tsx':
      case 'json':
      case 'html':
        return <FileCode size={15} color={color} />;
      case 'zip':
      case 'rar':
        return <Archive size={15} color={color} />;
      default:
        return <FileText size={15} color={color} />;
    }
  };

  return (
    <aside className="w-80 2xl:w-88 border-l border-white/8 bg-[#040a18]/95 backdrop-blur-xl flex flex-col shrink-0 h-full p-4.5 space-y-4.5 overflow-y-auto custom-scrollbar select-none z-20 text-left">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8B5CFF] to-[#35C9FF] flex items-center justify-center text-white shadow-sm">
            <Zap size={14} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">Quick Access</h4>
            <p className="text-[10px] text-[#657394]">Live Workspace & Recents</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {onClose && (
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              aria-label="Close Quick Access panel"
              className="w-6 h-6 rounded-md hover:bg-white/5 flex items-center justify-center text-[#657394] hover:text-white transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="neu-inset p-0.5 rounded-xl flex items-center gap-1 text-[11px]">
        {(['all', 'tasks', 'files', 'recents'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === 'all'
              ? 'All'
              : tab === 'tasks'
              ? `Tasks (${activeTasks.length})`
              : tab === 'files'
              ? `Files (${files.length})`
              : 'Recents';
          return (
            <button
              key={tab}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab);
              }}
              className={`flex-1 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                isActive
                  ? 'neu-primary-btn text-white shadow-sm font-semibold'
                  : 'text-[#657394] hover:text-[#9AA8C7]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 3. Productivity Mini Pulse (Shown on 'all' or 'tasks') */}
      {(activeTab === 'all' || activeTab === 'tasks') && (
        <div className="neu-card rounded-2xl p-3.5 space-y-2 border border-purple-500/20 bg-gradient-to-br from-[#0c1836] to-[#060e22]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9AA8C7] flex items-center gap-1.5 font-medium">
              <TrendingUp size={13} className="text-[#35C9FF]" /> Today's Velocity
            </span>
            <span className="text-white font-bold">{progressPct}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full neu-inset overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8B5CFF] to-[#35C9FF] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#657394]">
            <span>{completedCount} completed</span>
            <span>{activeTasks.length} pending</span>
          </div>
        </div>
      )}

      {/* 4. Active Tasks List */}
      {(activeTab === 'all' || activeTab === 'tasks') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#8B5CFF]" /> Active Tasks
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('tasks');
              }}
              className="text-[10px] text-purple-300 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              <span>View all</span>
              <ChevronRight size={11} />
            </button>
          </div>

          {/* Quick task adder form */}
          <form onSubmit={handleAddQuickTask} className="relative">
            <input
              type="text"
              value={quickTaskText}
              onChange={(e) => setQuickTaskText(e.target.value)}
              placeholder="Quick add a task..."
              className="w-full neu-inset rounded-xl py-2 pl-3 pr-8 text-xs text-white placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/40"
            />
            <button
              type="submit"
              aria-label="Add task"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </form>

          {/* Task Items */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
            {activeTasks.length === 0 ? (
              <div className="neu-card rounded-xl p-3 text-center text-xs text-[#657394]">
                All tasks completed! Great sprint.
              </div>
            ) : (
              activeTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="neu-card rounded-xl p-2.5 flex items-center justify-between gap-2.5 group hover:border-purple-500/30 transition-all"
                >
                  <button
                    onClick={() => {
                      soundFx.playSuccess();
                      onToggleTask(task.id);
                    }}
                    className="w-5 h-5 rounded-md border border-white/20 hover:border-purple-400 flex items-center justify-center shrink-0 cursor-pointer bg-[#050e20] transition-colors"
                  >
                    {task.completed && <Check size={12} className="text-purple-400" />}
                  </button>

                  <div
                    onClick={() => {
                      soundFx.playClick();
                      onNavigate('tasks');
                    }}
                    className="flex-1 overflow-hidden cursor-pointer"
                  >
                    <h5 className="text-[11.5px] font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                      {task.title}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[9.5px] text-[#657394]">
                      <span>{task.category}</span>
                      <span>•</span>
                      <span>{task.duration}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. Recent Files */}
      {(activeTab === 'all' || activeTab === 'files') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FolderOpen size={13} className="text-[#35C9FF]" /> Recent Files
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('files');
              }}
              className="text-[10px] text-purple-300 hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              <span>View all</span>
              <ChevronRight size={11} />
            </button>
          </div>

          <div className="space-y-1.5">
            {files.slice(0, 4).map((file) => (
              <div
                key={file.id}
                onClick={() => {
                  soundFx.playClick();
                  setPreviewFile(file);
                }}
                className="neu-card rounded-xl p-2.5 flex items-center justify-between gap-2.5 cursor-pointer group hover:border-white/15 transition-all"
              >
                <div
                  className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center shrink-0 border border-white/5"
                  style={{ boxShadow: `0 0 10px ${file.color}20` }}
                >
                  {getFileIcon(file.extension, file.color)}
                </div>

                <div className="flex-1 overflow-hidden">
                  <h5 className="text-[11.5px] font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                    {file.name}
                  </h5>
                  <div className="flex items-center gap-1.5 text-[9.5px] text-[#657394]">
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>{file.date}</span>
                  </div>
                </div>

                <ExternalLink
                  size={12}
                  className="text-[#657394] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Recent Searches & History (Shown on 'all' or 'recents') */}
      {(activeTab === 'all' || activeTab === 'recents') && recentSearches.length > 0 && (
        <div className="neu-card rounded-2xl p-3.5 space-y-2 border border-white/6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9AA8C7] flex items-center gap-1.5 font-medium">
              <History size={13} className="text-[#8B5CFF]" /> Recent Searches
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                clearSearches();
              }}
              className="text-[10px] text-[#657394] hover:text-red-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {recentSearches.map((query, i) => (
              <div
                key={i}
                onClick={() => {
                  soundFx.playClick();
                  addSearch(query);
                  onQuickPrompt(query);
                  onNavigate('assistant');
                }}
                className="neu-card-subtle pl-2.5 pr-1 py-1 rounded-full border border-white/8 hover:border-purple-500/40 text-[11px] text-white flex items-center gap-1 group cursor-pointer hover:bg-purple-900/20 transition-all"
              >
                <span className="truncate max-w-[130px] group-hover:text-purple-200">{query}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playClick();
                    removeSearch(query);
                  }}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[#657394] hover:text-red-300 hover:bg-white/10 cursor-pointer"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Cloud Storage Vault Meter */}
      <div className="neu-card rounded-2xl p-3.5 space-y-2 border border-white/6">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#9AA8C7] flex items-center gap-1.5 font-medium">
            <HardDrive size={13} className="text-[#D66BFF]" /> Storage Vault
          </span>
          <span className="text-[11px] text-white font-semibold">68.2 MB / 2 GB</span>
        </div>
        <div className="w-full h-1.5 rounded-full neu-inset overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#D66BFF] to-[#8B5CFF] w-[14%]" />
        </div>
      </div>

      {/* 8. Quick AI Prompt Starters */}
      {(activeTab === 'all' || activeTab === 'recents') && (
        <div className="neu-card rounded-2xl p-3.5 space-y-2.5 bg-gradient-to-br from-purple-950/20 via-[#071329] to-[#040a18] border border-purple-500/20">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Sparkles size={13} className="text-[#35C9FF]" />
            <span>Quick AI Starters</span>
          </div>
          <div className="space-y-1.5">
            {[
              'Brainstorm 5 brand slogans',
              'Generate clean UI design tokens',
              'Draft TypeScript API types',
            ].map((promptText, i) => (
              <button
                key={i}
                onClick={() => {
                  soundFx.playClick();
                  onQuickPrompt(promptText);
                  onNavigate('assistant');
                }}
                className="w-full text-left neu-button px-2.5 py-1.5 rounded-lg text-[10.5px] text-[#9AA8C7] hover:text-white flex items-center justify-between group transition-all cursor-pointer"
              >
                <span className="truncate mr-1">{promptText}</span>
                <ArrowRight
                  size={11}
                  className="text-[#657394] group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl p-6 w-full max-w-sm border border-purple-500/30 bg-[#071226] text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl neu-inset flex items-center justify-center"
                  style={{ boxShadow: `0 0 12px ${previewFile.color}30` }}
                >
                  {getFileIcon(previewFile.extension, previewFile.color)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-[180px]">
                    {previewFile.name}
                  </h4>
                  <p className="text-[11px] text-[#657394]">{previewFile.size} • {previewFile.date}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 text-[#657394] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="neu-inset rounded-2xl p-4 text-xs text-[#9AA8C7] space-y-2">
              <p className="text-white font-medium">Asset Details:</p>
              <p>Type: {previewFile.category.toUpperCase()} File ({previewFile.extension.toUpperCase()})</p>
              <p>Storage: Encrypted Nova Cloud Bucket</p>
              <p>Last accessed: Today</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onQuickPrompt(`Analyze and extract summary for file: ${previewFile.name}`);
                  setPreviewFile(null);
                  onNavigate('assistant');
                }}
                className="neu-primary-btn px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Analyze with AI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
