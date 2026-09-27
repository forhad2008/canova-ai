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
  AlertCircle,
  ArrowDown,
  Bell,
  BellOff,
  Clock,
  Calendar,
  AlertTriangle,
  Volume2,
} from 'lucide-react';
import { Task, TaskPriority } from '../types';
import { soundFx } from '../utils/audio';
import { FocusTimerModal } from '../components/focus/FocusTimerModal';
import { TaskRoutineTimerModal } from '../components/focus/TaskRoutineTimerModal';
import { generateAITaskBreakdown } from '../services/gemini';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { TaskProgressRing } from '../components/common/TaskProgressRing';
import { OverdueBadge } from '../components/common/OverdueBadge';
import { TaskCalendarView } from '../components/common/TaskCalendarView';
import {
  isTaskOverdue,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  sendBrowserNotification,
} from '../utils/alarmService';

interface TasksProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskPriority?: (id: string, priority: TaskPriority) => void;
  onUpdateTaskDate?: (id: string, newDateStr: string) => void;
  onToggleTaskAlarm?: (id: string) => void;
}

export const Tasks: React.FC<TasksProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdateTaskPriority,
  onUpdateTaskDate,
  onToggleTaskAlarm,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'overdue' | 'all'>('today');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Design');
  const [newDuration, setNewDuration] = useState('1 hour');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newScheduledDate, setNewScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newAlarmTime, setNewAlarmTime] = useState<string>('09:00');
  const [newAlarmEnabled, setNewAlarmEnabled] = useState(true);

  // Task Routine Timer state
  const [newRoutineEnabled, setNewRoutineEnabled] = useState(true);
  const [newRoutineTime, setNewRoutineTime] = useState<string>('14:00');
  const [newRoutineDurationMins, setNewRoutineDurationMins] = useState<number>(25);

  const [routineModalTask, setRoutineModalTask] = useState<Task | null>(null);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);

  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermissionStatus()
  );

  // AI Task Breakdown State
  const [isAiBreakdownOpen, setIsAiBreakdownOpen] = useState(false);
  const [aiGoalInput, setAiGoalInput] = useState('');
  const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);

  const handleRequestPermission = async () => {
    soundFx.playClick();
    const granted = await requestNotificationPermission();
    setNotifPermission(getNotificationPermissionStatus());
    if (granted) {
      sendBrowserNotification('Notifications Enabled!', {
        body: 'Canova AI Task Alarms will now alert you at scheduled times.',
      });
    }
  };

  const handleAiBreakdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGoalInput.trim() || isGeneratingBreakdown) return;
    soundFx.playClick();
    setIsGeneratingBreakdown(true);

    try {
      const generated = await generateAITaskBreakdown(aiGoalInput.trim());
      generated.forEach((t, index) => {
        const assignedPriority: TaskPriority =
          index === 0 ? 'high' : index === 1 ? 'medium' : 'low';
        onAddTask({
          title: t.title,
          category: t.category,
          duration: t.duration,
          completed: false,
          dueDate: 'today',
          priority: assignedPriority,
          alarmEnabled: true,
          scheduledDate: new Date().toISOString().split('T')[0],
          alarmTime: '12:00',
        });
      });
      soundFx.playSuccess();
      setAiGoalInput('');
      setIsAiBreakdownOpen(false);
    } catch {
      // Fallback
    } finally {
      setIsGeneratingBreakdown(false);
    }
  };

  const overdueTasksCount = tasks.filter((t) => isTaskOverdue(t)).length;

  const filteredTasks = tasks.filter((t) => {
    let matchesTab = true;
    if (activeTab === 'today') matchesTab = t.dueDate === 'today';
    else if (activeTab === 'week') matchesTab = t.dueDate === 'week' || t.dueDate === 'today';
    else if (activeTab === 'overdue') matchesTab = isTaskOverdue(t);
    else if (activeTab === 'all') matchesTab = true;

    const taskPriority = t.priority || 'medium';
    const matchesPriority = priorityFilter === 'all' || taskPriority === priorityFilter;
    return matchesTab && matchesPriority;
  });

  const tabTasks = tasks.filter((t) =>
    activeTab === 'all'
      ? true
      : activeTab === 'overdue'
      ? isTaskOverdue(t)
      : t.dueDate === activeTab
  );
  const completedTabTasks = tabTasks.filter((t) => t.completed).length;
  const highPriorityPendingTabTasks = tabTasks.filter((t) => !t.completed && t.priority === 'high').length;
  const activeTabLabel =
    activeTab === 'today'
      ? 'Today'
      : activeTab === 'week'
      ? 'This Week'
      : activeTab === 'overdue'
      ? 'Overdue'
      : 'All';

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      soundFx.playSuccess();
    } else {
      soundFx.playClick();
    }
    onToggleTask(id);
  };

  const handleCyclePriority = (
    id: string,
    currentPriority: TaskPriority = 'medium',
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    soundFx.playClick();
    const nextPriority: Record<TaskPriority, TaskPriority> = {
      low: 'medium',
      medium: 'high',
      high: 'low',
    };
    if (onUpdateTaskPriority) {
      onUpdateTaskPriority(id, nextPriority[currentPriority]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundFx.playSuccess();
    onAddTask({
      title: newTitle.trim(),
      category: newCategory,
      duration: `${newRoutineDurationMins} min`,
      completed: false,
      dueDate: activeTab === 'overdue' ? 'today' : activeTab === 'all' ? 'today' : activeTab,
      priority: newPriority,
      scheduledDate: newScheduledDate,
      scheduledTime: newAlarmTime,
      alarmTime: newAlarmTime,
      alarmEnabled: newAlarmEnabled,
      alarmFired: false,
      routineTimerEnabled: newRoutineEnabled,
      routineTime: newRoutineTime,
      routineDurationMins: newRoutineDurationMins,
    });

    if (newAlarmEnabled && notifPermission === 'default') {
      requestNotificationPermission();
    }

    setNewTitle('');
    setNewPriority('medium');
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
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-extrabold text-black dark:text-white tracking-tight flex items-center gap-2">
            <span>Tasks</span>
            {overdueTasksCount > 0 && <OverdueBadge label={`${overdueTasksCount} OVERDUE`} size="sm" />}
          </h2>
          <p className="text-xs font-semibold text-slate-800 dark:text-[#9AA8C7]">
            Stay productive with Web Alarm Alerts & Schedule Tracking
          </p>
        </div>

        {/* View mode switcher & Action shortcuts */}
        <div className="flex items-center gap-2">
          {/* List vs Calendar View Switcher */}
          <div className="flex items-center gap-1 neu-inset p-1 rounded-xl shrink-0">
            <button
              onClick={() => {
                soundFx.playClick();
                setViewMode('list');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'neu-primary-btn text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setViewMode('calendar');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'calendar'
                  ? 'neu-primary-btn text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white'
              }`}
            >
              <Calendar size={13} />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsAiBreakdownOpen(true);
            }}
            className="neu-primary-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Wand2 size={13} />
            <span className="hidden sm:inline">AI Plan</span>
          </button>
        </div>
      </div>

      {/* Render Calendar View Mode if active */}
      {viewMode === 'calendar' ? (
        <TaskCalendarView
          tasks={tasks}
          onToggleTask={handleToggle}
          onUpdateTaskDate={(id, newDateStr) => {
            if (onUpdateTaskDate) {
              onUpdateTaskDate(id, newDateStr);
            }
          }}
          onAddTaskForDate={(dateStr) => {
            setNewScheduledDate(dateStr);
            setIsModalOpen(true);
          }}
          onDeleteTask={onDeleteTask}
        />
      ) : (
        <>

      {/* Pirates Alarm & 24h Reset Warning Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-indigo-950/60 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-100 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <Volume2 size={16} />
          </div>
          <div>
            <p className="font-extrabold text-white flex items-center gap-1.5">
              <span>🏴‍☠️ Alarm Tune: Pirates of the Caribbean</span>
            </p>
            <p className="text-[11px] text-amber-200/90 font-medium leading-tight mt-0.5">
              ⚠️ Warning: Completing a scheduled task automatically resets its alarm & schedule for 24 hours later.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playPiratesTheme();
          }}
          className="neu-primary-btn px-3 py-1.5 rounded-xl text-[11px] font-extrabold text-white shrink-0 cursor-pointer shadow-sm self-end sm:self-auto flex items-center gap-1.5"
        >
          <Volume2 size={13} />
          <span>Test Pirates Alarm 🏴‍☠️</span>
        </button>
      </div>

      {/* Notification Permission Banner if not granted */}
      {notifPermission !== 'granted' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border border-purple-500/30 flex items-center justify-between gap-3 text-xs text-purple-200 shadow-md">
          <div className="flex items-center gap-2.5">
            <Bell size={18} className="text-purple-400 animate-bounce shrink-0" />
            <div>
              <p className="font-bold text-white">Enable Task Alarm Notifications</p>
              <p className="text-[11px] text-purple-300 opacity-90">
                Receive browser alerts when tasks reach their scheduled alarm time.
              </p>
            </div>
          </div>
          <button
            onClick={handleRequestPermission}
            className="neu-primary-btn px-3 py-1.5 rounded-xl text-xs font-bold text-white shrink-0 cursor-pointer shadow-sm"
          >
            Allow
          </button>
        </div>
      )}

      {/* Overdue Urgent Alert Banner */}
      {overdueTasksCount > 0 && (
        <div
          onClick={() => {
            soundFx.playClick();
            setActiveTab('overdue');
          }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-red-900/70 to-pink-950/80 border border-rose-500/50 flex items-center justify-between gap-3 text-xs text-rose-100 shadow-[0_0_20px_rgba(225,29,72,0.3)] cursor-pointer hover:border-rose-400"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-yellow-300 animate-pulse shrink-0" />
            <div>
              <p className="font-black text-white flex items-center gap-1.5">
                <span>Attention Required: {overdueTasksCount} Overdue Task(s)</span>
              </p>
              <p className="text-[11px] text-rose-200 opacity-90">
                Tap to filter overdue items and get back on schedule.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-rose-600 text-white border border-rose-400/50">
            View →
          </span>
        </div>
      )}

      {/* Circular Progress Bar Visualizer */}
      <TaskProgressRing
        total={tabTasks.length}
        completed={completedTabTasks}
        highPriorityPending={highPriorityPendingTabTasks}
        activeTabLabel={activeTabLabel}
      />

      {/* 2. Segmented Tabs: [Today] [This Week] [Overdue] [All] */}
      <div className="neu-inset p-1 rounded-full flex items-center gap-1 overflow-x-auto no-scrollbar">
        {(['today', 'week', 'overdue', 'all'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === 'today'
              ? 'Today'
              : tab === 'week'
              ? 'This Week'
              : tab === 'overdue'
              ? `Overdue (${overdueTasksCount})`
              : 'All';

          return (
            <button
              key={tab}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab);
              }}
              className={`flex-1 py-2 px-2 text-xs font-semibold rounded-full transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                isActive
                  ? tab === 'overdue'
                    ? 'bg-rose-600 text-white font-extrabold shadow-md'
                    : 'neu-primary-btn text-white shadow-md'
                  : 'text-slate-800 dark:text-[#657394] hover:text-black dark:hover:text-[#9AA8C7]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 3. Priority Filter Chips */}
      <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              soundFx.playClick();
              setPriorityFilter('all');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              priorityFilter === 'all'
                ? 'neu-card bg-purple-600 text-white shadow-xs border-purple-500/40'
                : 'neu-card-subtle text-slate-700 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white border-transparent'
            }`}
          >
            All Priorities
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              priorityFilter === 'high'
                ? 'bg-rose-500 text-white shadow-xs font-extrabold'
                : 'neu-card-subtle text-rose-700 dark:text-rose-300 hover:bg-rose-500/15'
            }`}
          >
            <Flame size={11} className={priorityFilter === 'high' ? 'text-white' : 'text-rose-600 dark:text-rose-400'} />
            <span>High</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setPriorityFilter(priorityFilter === 'medium' ? 'all' : 'medium');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              priorityFilter === 'medium'
                ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                : 'neu-card-subtle text-amber-700 dark:text-amber-300 hover:bg-amber-500/15'
            }`}
          >
            <AlertCircle size={11} className={priorityFilter === 'medium' ? 'text-white' : 'text-amber-600 dark:text-amber-400'} />
            <span>Medium</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setPriorityFilter(priorityFilter === 'low' ? 'all' : 'low');
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              priorityFilter === 'low'
                ? 'bg-emerald-500 text-white shadow-xs font-extrabold'
                : 'neu-card-subtle text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15'
            }`}
          >
            <ArrowDown size={11} className={priorityFilter === 'low' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
            <span>Low</span>
          </button>
        </div>

        <span className="text-[10px] font-bold text-slate-500 dark:text-[#657394] shrink-0">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* 4. Task List */}
      <div className="space-y-3 pt-1">
        {filteredTasks.length === 0 ? (
          <div className="neu-card rounded-2xl p-8 text-center space-y-2">
            <Sparkles size={24} className="mx-auto text-purple-600 dark:text-purple-400 opacity-60" />
            <h4 className="text-sm font-bold text-black dark:text-white">
              {activeTab === 'overdue' ? 'No Overdue Tasks! You are all caught up.' : 'No tasks matching this filter'}
            </h4>
            <p className="text-xs text-slate-800 dark:text-[#657394]">
              Tap the (+) button below to schedule deep work or set alarms.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const currentPriority = task.priority || 'medium';
            const overdue = isTaskOverdue(task);

            return (
              <div
                key={task.id}
                className={`neu-card rounded-2xl p-3.5 flex items-center justify-between gap-3.5 group transition-all relative overflow-hidden ${
                  overdue
                    ? 'border-2 border-rose-500/60 shadow-[0_0_15px_rgba(225,29,72,0.25)] bg-rose-500/5 dark:bg-rose-950/20'
                    : task.completed
                    ? 'opacity-85'
                    : ''
                }`}
              >
                {/* Visual Overdue Red Accent Line */}
                {overdue && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-pink-600" />
                )}

                {/* Category Icon */}
                <div className="w-10 h-10 rounded-xl neu-inset border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0 shadow-inner">
                  {getTaskIcon(task)}
                </div>

                {/* Title & Metadata */}
                <div
                  onClick={() => handleToggle(task.id)}
                  className="flex-1 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`text-xs font-bold tracking-tight transition-all truncate ${
                        task.completed
                          ? 'line-through text-slate-500 dark:text-[#657394]'
                          : overdue
                          ? 'text-rose-700 dark:text-rose-200 font-extrabold'
                          : 'text-black dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {/* Overdue Badge or Priority Level Badge */}
                    {overdue ? (
                      <OverdueBadge label="OVERDUE" size="sm" />
                    ) : (
                      <PriorityBadge
                        priority={currentPriority}
                        size="sm"
                        onClick={
                          onUpdateTaskPriority
                            ? (e) => handleCyclePriority(task.id, currentPriority, e)
                            : undefined
                        }
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-800 dark:text-[#657394] flex-wrap">
                    <span>{task.category}</span>
                    <span>•</span>
                    <span>{task.duration}</span>

                    {/* Alarm Time Badge */}
                    {(task.alarmTime || task.scheduledTime) && (
                      <span className="flex items-center gap-1 font-mono text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/20 font-bold">
                        <Bell size={10} className={task.alarmEnabled ? 'text-purple-600 animate-pulse' : 'text-slate-400'} />
                        <span>{task.alarmTime || task.scheduledTime}</span>
                      </span>
                    )}

                    {/* Routine Timer Badge & Launch Button */}
                    {task.routineTimerEnabled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick();
                          setRoutineModalTask(task);
                          setIsRoutineModalOpen(true);
                        }}
                        className="flex items-center gap-1 font-mono text-[10px] bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/30 font-extrabold cursor-pointer transition-all active:scale-95"
                      >
                        <Clock size={10} className="text-cyan-500 animate-spin" />
                        <span>Routine @ {task.routineTime || '14:00'} ({task.routineDurationMins || 25}m)</span>
                      </button>
                    )}
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
                        : overdue
                        ? 'border-2 border-rose-500 hover:bg-rose-500/20 text-rose-500'
                        : 'border-2 border-black/20 dark:border-white/20 hover:border-purple-600 dark:hover:border-purple-400/60 bg-[#EEF2F9] dark:bg-[#060e20]'
                    }`}
                  >
                    {task.completed && <Check size={13} className="stroke-[3.5]" />}
                  </button>

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
            );
          })
        )}
      </div>
      </>
      )}

      {/* 5. Floating Action Button (+) */}
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

      {/* Add Task Modal with Alarm Picker */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl p-6 w-full max-w-sm border border-purple-500/30 bg-white dark:bg-[#071226] text-left shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Scheduled Task</h3>
              <p className="text-xs text-slate-600 dark:text-[#9AA8C7]">
                Set priority level & scheduled Web Alarm Alert
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#9AA8C7] block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Finish website design"
                  className="w-full neu-inset rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#657394] focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>

              {/* Priority Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-[#9AA8C7] block mb-1">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setNewPriority('low');
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                      newPriority === 'low'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'neu-inset text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <ArrowDown size={12} /> Low
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setNewPriority('medium');
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                      newPriority === 'medium'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'neu-inset text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <AlertCircle size={12} /> Med
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setNewPriority('high');
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border ${
                      newPriority === 'high'
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'neu-inset text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    <Flame size={12} /> High
                  </button>
                </div>
              </div>

              {/* Scheduled Date & Web Alarm Time */}
              <div className="p-3 rounded-2xl neu-inset bg-[#F8FAFC] dark:bg-[#050d1e] space-y-2 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell size={14} className="text-purple-500" />
                    <span>Web Alarm Alert</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewAlarmEnabled(!newAlarmEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      newAlarmEnabled ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        newAlarmEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-[#9AA8C7] block mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newScheduledDate}
                      onChange={(e) => setNewScheduledDate(e.target.value)}
                      className="w-full neu-inset rounded-lg py-1.5 px-2 text-xs text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-[#9AA8C7] block mb-1">
                      Alarm Time
                    </label>
                    <input
                      type="time"
                      value={newAlarmTime}
                      onChange={(e) => setNewAlarmTime(e.target.value)}
                      className="w-full neu-inset rounded-lg py-1.5 px-2 text-xs text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-1.5 flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0 text-amber-500" />
                    <span>⚠️ Warning: Will reset 24 hours later upon task completion.</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => soundFx.playPiratesTheme()}
                    className="underline text-purple-600 dark:text-purple-300 hover:text-purple-400 cursor-pointer shrink-0 ml-1"
                  >
                    Audition 🏴‍☠️
                  </button>
                </div>
              </div>

              {/* Task Routine Timer Settings */}
              <div className="p-3 rounded-2xl neu-inset bg-[#F8FAFC] dark:bg-[#050d1e] space-y-2 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock size={14} className="text-cyan-500" />
                    <span>Task Routine Timer</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewRoutineEnabled(!newRoutineEnabled)}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      newRoutineEnabled ? 'bg-cyan-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        newRoutineEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {newRoutineEnabled && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-[#9AA8C7] block mb-1">
                        Routine Time
                      </label>
                      <input
                        type="time"
                        value={newRoutineTime}
                        onChange={(e) => setNewRoutineTime(e.target.value)}
                        className="w-full neu-inset rounded-lg py-1.5 px-2 text-xs text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 dark:text-[#9AA8C7] block mb-1">
                        Routine Duration
                      </label>
                      <select
                        value={newRoutineDurationMins}
                        onChange={(e) => setNewRoutineDurationMins(Number(e.target.value))}
                        className="w-full neu-inset rounded-lg py-1.5 px-2 text-xs text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none font-bold"
                      >
                        <option value={15}>15 mins</option>
                        <option value={25}>25 mins (Pomodoro)</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                        <option value={60}>60 mins (1 hr)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#9AA8C7] block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full neu-inset rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none"
                  >
                    <option value="Design">Design</option>
                    <option value="Creative">Creative</option>
                    <option value="Learning">Learning</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-[#9AA8C7] block mb-1">
                    Duration
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full neu-inset rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white bg-[#F8FAFC] dark:bg-[#060e20] focus:outline-none"
                  >
                    <option value="30 min">30 min</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl neu-button text-xs text-slate-700 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl neu-primary-btn text-xs font-semibold text-white cursor-pointer shadow-md"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Routine Timer Modal */}
      <TaskRoutineTimerModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        task={routineModalTask}
        onCompleteTask={(tId) => {
          onToggleTask(tId);
        }}
      />

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
