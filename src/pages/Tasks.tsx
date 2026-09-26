import React, { useState } from 'react';
import {
  Check,
  Plus,
  Headphones,
  Video,
  Code2,
  Activity,
  BookOpen,
  Sparkles,
  Trash2,
  Flame,
  Wand2,
} from 'lucide-react';
import { Task } from '../types';
import { soundFx } from '../utils/audio';
import { FocusTimerModal } from '../components/focus/FocusTimerModal';
import { generateAITaskBreakdown } from '../services/gemini';

interface TasksProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onDeleteTask: (id: string) => void;
}

export const Tasks: React.FC<TasksProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'all'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Design');
  const [newDuration, setNewDuration] = useState('1 hour');
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  // AI Task Breakdown State
  const [isAiBreakdownOpen, setIsAiBreakdownOpen] = useState(false);
  const [aiGoalInput, setAiGoalInput] = useState('');
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);

  const handleAiBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGoalInput.trim() || isGeneratingBreakdown) return;
    soundFx.playClick();
    setIsGeneratingBreakdown(true);

    try {
      const generated = await generateAITaskBreakdown(aiGoalInput.trim());
      generated.forEach((t) => {
        onAddTask({
          title: t.title,
          category: t.category,
          duration: t.duration,
          completed: false,
          dueDate: 'today',
        });
      });
      soundFx.playSuccess();
      setAiGoalInput('');
      setIsAiBreakdownOpen(false);
    } catch {
      // Error handling
    } finally {
      setIsGeneratingBreakdown(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'all') return true;
    return t.dueDate === activeTab;
  });

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      soundFx.playSuccess();
    } else {
      soundFx.playClick();
    }
    onToggleTask(id);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundFx.playSuccess();
    onAddTask({
      title: newTitle.trim(),
      category: newCategory,
      duration: newDuration,
      completed: false,
      dueDate: activeTab,
    });

    setNewTitle('');
    setIsModalOpen(false);
  };

  const getTaskIcon = (task: Task) => {
    const title = task.title.toLowerCase();
    const cat = task.category.toLowerCase();

    if (title.includes('design') || title.includes('website') || cat === 'design') {
      return <Headphones size={18} className="text-[#A978FF]" />;
    }
    if (title.includes('video') || cat === 'creative') {
      return <Video size={18} className="text-[#35C9FF]" />;
    }
    if (title.includes('python') || title.includes('code') || cat === 'learning') {
      return <Code2 size={18} className="text-[#8B5CFF]" />;
    }
    if (title.includes('workout') || title.includes('health') || cat === 'health') {
      return <Activity size={18} className="text-emerald-400" />;
    }
    return <BookOpen size={18} className="text-[#D66BFF]" />;
  };

  return (
    <div className="relative flex flex-col space-y-4 px-5 py-4 pb-28 text-left select-none max-w-2xl mx-auto w-full">
      {/* 1. Header (Screen 4) */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">
            Tasks
          </h2>
          <p className="text-xs font-semibold text-slate-800 dark:text-[#9AA8C7]">
            Stay productive, achieve more.
          </p>
        </div>

        {/* Action button shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsAiBreakdownOpen(true);
            }}
            className="neu-primary-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Wand2 size={13} />
            <span>AI Plan</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setFocusTask(tasks.find((t) => !t.completed) || null);
            }}
            className="neu-button px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Flame size={14} className="text-orange-400" />
            <span>Sprint</span>
          </button>
        </div>
      </div>

      {/* 2. Segmented Pill Tabs: [Today] [This Week] [All] */}
      <div className="neu-inset p-1 rounded-full flex items-center gap-1">
        {(['today', 'week', 'all'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === 'today' ? 'Today' : tab === 'week' ? 'This Week' : 'All';
          return (
            <button
              key={tab}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'neu-primary-btn text-white shadow-md'
                  : 'text-slate-800 dark:text-[#657394] hover:text-black dark:hover:text-[#9AA8C7]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 3. Task List (Cards matching Screen 4) */}
      <div className="space-y-3 pt-1">
        {filteredTasks.length === 0 ? (
          <div className="neu-card rounded-2xl p-8 text-center space-y-2">
            <Sparkles size={24} className="mx-auto text-purple-600 dark:text-purple-400 opacity-60" />
            <h4 className="text-sm font-bold text-black dark:text-white">No tasks in this view</h4>
            <p className="text-xs text-slate-800 dark:text-[#657394]">
              Tap the (+) button below to schedule deep work.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`neu-card rounded-2xl p-3.5 flex items-center justify-between gap-3.5 group transition-all ${
                task.completed ? 'opacity-85' : ''
              }`}
            >
              {/* Category Icon inside rounded square */}
              <div className="w-10 h-10 rounded-xl neu-inset border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0 shadow-inner">
                {getTaskIcon(task)}
              </div>

              {/* Title & Metadata */}
              <div
                onClick={() => handleToggle(task.id)}
                className="flex-1 cursor-pointer overflow-hidden"
              >
                <h4
                  className={`text-xs font-bold tracking-tight transition-all truncate ${
                    task.completed
                      ? 'line-through text-slate-500 dark:text-[#657394]'
                      : 'text-black dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300'
                  }`}
                >
                  {task.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-medium text-slate-800 dark:text-[#657394]">
                  <span>{task.category}</span>
                  <span>•</span>
                  <span>{task.duration}</span>
                </div>
              </div>

              {/* Right Action: Circular Checkbox */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(task.id)}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    task.completed
                      ? 'bg-gradient-to-tr from-[#8B5CFF] to-[#35C9FF] text-white shadow-[0_0_12px_rgba(139,92,255,0.8)]'
                      : 'border-2 border-black/20 dark:border-white/20 hover:border-purple-600 dark:hover:border-purple-400/60 bg-[#EEF2F9] dark:bg-[#060e20]'
                  }`}
                >
                  {task.completed && <Check size={13} className="stroke-[3.5]" />}
                </button>

                {/* Quick delete on hover */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onDeleteTask(task.id);
                  }}
                  aria-label="Delete task"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-500 transition-opacity cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Floating Action Button (+) matching Screen 4 position */}
      <button
        onClick={() => {
          soundFx.playClick();
          setIsModalOpen(true);
        }}
        aria-label="Add Task"
        className="fixed bottom-24 right-6 w-13 h-13 rounded-full neu-primary-btn text-white flex items-center justify-center shadow-[0_8px_24px_rgba(139,92,255,0.7)] cursor-pointer hover:scale-105 active:scale-95 transition-transform z-30"
      >
        <Plus size={24} />
      </button>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl p-6 w-full max-w-sm border border-purple-500/30 bg-[#071226] text-left shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Create New Task</h3>
            <p className="text-xs text-[#9AA8C7] mb-4">
              Add a focus goal to your schedule
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#9AA8C7] block mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Finish website design"
                  className="w-full neu-inset rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#9AA8C7] block mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full neu-inset rounded-xl py-2.5 px-3 text-xs text-white bg-[#060e20] focus:outline-none"
                  >
                    <option value="Design">Design</option>
                    <option value="Creative">Creative</option>
                    <option value="Learning">Learning</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#9AA8C7] block mb-1.5">
                    Duration
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full neu-inset rounded-xl py-2.5 px-3 text-xs text-white bg-[#060e20] focus:outline-none"
                  >
                    <option value="30 min">30 min</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl neu-button text-xs text-[#9AA8C7] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl neu-primary-btn text-xs font-semibold text-white cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Focus Timer Modal */}
      <FocusTimerModal
        isOpen={Boolean(focusTask)}
        onClose={() => setFocusTask(null)}
        task={focusTask}
        onTaskCompleted={(tId) => {
          onToggleTask(tId);
        }}
      />
    </div>
  );
};
