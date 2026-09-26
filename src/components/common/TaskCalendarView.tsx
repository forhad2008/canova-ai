import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Bell,
  Check,
  Flame,
  AlertCircle,
  ArrowDown,
  GripVertical,
} from 'lucide-react';
import { Task, TaskPriority } from '../../types';
import { soundFx } from '../../utils/audio';
import { isTaskOverdue } from '../../utils/alarmService';
import { OverdueBadge } from './OverdueBadge';
import { PriorityBadge } from './PriorityBadge';

interface TaskCalendarViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onUpdateTaskDate: (id: string, newDateStr: string) => void;
  onAddTaskForDate?: (dateStr: string) => void;
  onDeleteTask?: (id: string) => void;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onToggleTask,
  onUpdateTaskDate,
  onAddTaskForDate,
  onDeleteTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [rescheduleNotice, setRescheduleNotice] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper: get year and month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar grid days for current month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
    const day = daysInPrevMonth - firstDayOfMonth + i + 1;
    const prevMonthDate = new Date(year, month - 1, day);
    return {
      dateStr: prevMonthDate.toISOString().split('T')[0],
      dayNum: day,
      isCurrentMonth: false,
    };
  });

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return {
      dateStr: `${year}-${mStr}-${dStr}`,
      dayNum: day,
      isCurrentMonth: true,
    };
  });

  const totalGridCells = Math.ceil((prevMonthDays.length + currentMonthDays.length) / 7) * 7;
  const nextMonthDaysCount = totalGridCells - (prevMonthDays.length + currentMonthDays.length);

  const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => {
    const day = i + 1;
    const nextMonthDate = new Date(year, month + 1, day);
    return {
      dateStr: nextMonthDate.toISOString().split('T')[0],
      dayNum: day,
      isCurrentMonth: false,
    };
  });

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Navigation handlers
  const handlePrevMonth = () => {
    soundFx.playClick();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    soundFx.playClick();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    soundFx.playClick();
    setCurrentDate(new Date());
  };

  // Helper to map tasks to calendar dates
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter((t) => {
      if (t.scheduledDate) {
        return t.scheduledDate === dateStr;
      }
      // Fallback if no scheduledDate explicitly set
      if (t.dueDate === 'today' && dateStr === todayStr) {
        return true;
      }
      return false;
    });
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    soundFx.playClick();
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = (e: React.DragEvent, dateStr: string) => {
    if (dragOverDate === dateStr) {
      setDragOverDate(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;

    if (taskId && targetDateStr) {
      const task = tasks.find((t) => t.id === taskId);
      soundFx.playSuccess();
      onUpdateTaskDate(taskId, targetDateStr);
      setDraggedTaskId(null);

      if (task) {
        const dateObj = new Date(targetDateStr + 'T00:00:00');
        const formattedTarget = dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        setRescheduleNotice(`Rescheduled "${task.title}" to ${formattedTarget}`);
        setTimeout(() => setRescheduleNotice(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-4 w-full text-left select-none">
      {/* Reschedule Toast Notification */}
      {rescheduleNotice && (
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white text-xs font-bold py-2 px-4 rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn border border-purple-400/40">
          <div className="flex items-center gap-2">
            <CalendarIcon size={14} className="text-cyan-200" />
            <span>{rescheduleNotice}</span>
          </div>
          <button
            onClick={() => setRescheduleNotice(null)}
            className="text-white/80 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Calendar Header Controls */}
      <div className="neu-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border border-black/8 dark:border-white/8 bg-white dark:bg-[#071329]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-700 dark:text-[#A978FF] flex items-center justify-center border border-purple-500/30">
            <CalendarIcon size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {monthNames[month]} {year}
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-[#657394]">
              Drag & drop tasks between dates to update deadlines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="neu-button px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-[#9AA8C7] hover:text-purple-700 dark:hover:text-white cursor-pointer shadow-2xs"
          >
            Today
          </button>

          <div className="flex items-center gap-1 neu-inset p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="w-7 h-7 rounded-lg neu-button flex items-center justify-center text-slate-700 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="w-7 h-7 rounded-lg neu-button flex items-center justify-center text-slate-700 dark:text-[#9AA8C7] hover:text-black dark:hover:text-white cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="py-1.5 text-[11px] font-extrabold text-slate-500 dark:text-[#657394] uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid (Days) */}
      <div className="grid grid-cols-7 gap-2">
        {allCalendarDays.map((cell) => {
          const dateTasks = getTasksForDate(cell.dateStr);
          const isToday = cell.dateStr === todayStr;
          const isTargeted = dragOverDate === cell.dateStr;

          return (
            <div
              key={cell.dateStr}
              onDragOver={(e) => handleDragOver(e, cell.dateStr)}
              onDragLeave={(e) => handleDragLeave(e, cell.dateStr)}
              onDrop={(e) => handleDrop(e, cell.dateStr)}
              className={`min-h-[110px] p-2 rounded-2xl transition-all duration-200 flex flex-col justify-between border relative group ${
                isTargeted
                  ? 'border-purple-500 bg-purple-500/20 scale-[1.02] shadow-[0_0_20px_rgba(139,92,255,0.4)] z-20'
                  : isToday
                  ? 'border-purple-500/60 bg-purple-500/10 dark:bg-purple-950/30 neu-card shadow-sm'
                  : cell.isCurrentMonth
                  ? 'neu-card bg-white dark:bg-[#071329] border-black/5 dark:border-white/5 hover:border-purple-500/30'
                  : 'bg-black/5 dark:bg-white/2 border-transparent opacity-50'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-purple-600 text-white shadow-xs'
                      : cell.isCurrentMonth
                      ? 'text-slate-800 dark:text-white'
                      : 'text-slate-400 dark:text-[#657394]'
                  }`}
                >
                  {cell.dayNum}
                </span>

                {/* Add task shortcut for date */}
                {onAddTaskForDate && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onAddTaskForDate(cell.dateStr);
                    }}
                    title={`Add task for ${cell.dateStr}`}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-opacity cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>

              {/* Tasks List for Date Cell */}
              <div className="space-y-1.5 my-1.5 flex-1 overflow-y-auto max-h-[85px] no-scrollbar">
                {dateTasks.map((task) => {
                  const overdue = isTaskOverdue(task);

                  return (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className={`group/item p-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-grab active:cursor-grabbing border shadow-2xs flex items-center justify-between gap-1 select-none ${
                        task.completed
                          ? 'bg-slate-200 dark:bg-[#0b1834] text-slate-500 dark:text-[#657394] line-through border-transparent'
                          : overdue
                          ? 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-500/60 shadow-[0_0_8px_rgba(225,29,72,0.3)] font-bold'
                          : 'bg-[#F8FAFC] dark:bg-[#0e1c3c] text-slate-900 dark:text-white border-black/8 dark:border-white/10 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-1 truncate flex-1">
                        <GripVertical size={10} className="text-slate-400 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        <span className="truncate">{task.title}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {overdue && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                        {task.alarmTime && (
                          <Bell size={10} className="text-purple-500 shrink-0" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTask(task.id);
                          }}
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-400 hover:border-purple-500'
                          }`}
                        >
                          {task.completed && <Check size={8} className="stroke-[3]" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom indicator count */}
              <div className="text-[9.5px] font-bold text-slate-400 dark:text-[#657394] text-right">
                {dateTasks.length > 0 && `${dateTasks.length} ${dateTasks.length === 1 ? 'task' : 'tasks'}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
