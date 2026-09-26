import { Task } from '../types';
import { soundFx } from './audio';

export interface DailyCheckinSettings {
  enabled: boolean;
  times: string[]; // e.g. ["09:00", "13:00", "18:00"]
  lastFiredDates: Record<string, string>; // timeSlot -> "YYYY-MM-DD"
}

const CHECKIN_SETTINGS_KEY = 'nova_daily_checkin_settings';
const FIRED_ALARMS_KEY = 'nova_fired_task_alarms';

export function getCheckinSettings(): DailyCheckinSettings {
  try {
    const saved = localStorage.getItem(CHECKIN_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Fallback
  }
  return {
    enabled: true,
    times: ['09:00', '13:00', '18:00'],
    lastFiredDates: {},
  };
}

export function saveCheckinSettings(settings: DailyCheckinSettings): void {
  try {
    localStorage.setItem(CHECKIN_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage fail
  }
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/icon.png',
        badge: '/icon.png',
        ...options,
      });
      soundFx.playSuccess();
      return true;
    } catch (e) {
      console.error('Failed to trigger notification:', e);
    }
  }
  return false;
}

export function isTaskOverdue(task: Task): boolean {
  if (task.completed) return false;

  const now = new Date();

  // If specific scheduled date and time exist
  if (task.scheduledDate) {
    const timeStr = task.scheduledTime || '23:59';
    const scheduledDateTime = new Date(`${task.scheduledDate}T${timeStr}:00`);
    if (!isNaN(scheduledDateTime.getTime())) {
      return scheduledDateTime < now;
    }
  }

  // If task has alarm time specified on today or earlier
  if (task.alarmTime) {
    const todayStr = now.toISOString().split('T')[0];
    const taskDateStr = task.scheduledDate || todayStr;
    const taskDateTime = new Date(`${taskDateStr}T${task.alarmTime}:00`);
    if (!isNaN(taskDateTime.getTime())) {
      return taskDateTime < now;
    }
  }

  // Fallback for overdue flagged state
  if (task.isOverdue) return true;

  return false;
}

export function formatAlarmTimeLabel(task: Task): string {
  if (task.scheduledDate && task.alarmTime) {
    return `${task.scheduledDate} ${task.alarmTime}`;
  }
  if (task.alarmTime) {
    return `Alarm ${task.alarmTime}`;
  }
  if (task.scheduledTime) {
    return `Scheduled ${task.scheduledTime}`;
  }
  return '';
}

// Global Alarm Checker Runner
let alarmIntervalId: NodeJS.Timeout | null = null;

export function startAlarmService(
  getTasks: () => Task[],
  onTaskAlarmFired?: (taskId: string) => void
) {
  if (alarmIntervalId) clearInterval(alarmIntervalId);

  alarmIntervalId = setInterval(() => {
    checkTaskAlarmsAndCheckins(getTasks(), onTaskAlarmFired);
  }, 10000); // Check every 10 seconds

  // Immediate initial check
  checkTaskAlarmsAndCheckins(getTasks(), onTaskAlarmFired);
}

function checkTaskAlarmsAndCheckins(
  tasks: Task[],
  onTaskAlarmFired?: (taskId: string) => void
) {
  const now = new Date();
  const currentDateStr = now.toISOString().split('T')[0];
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  // 1. Check Task Alarms
  let firedAlarms: Record<string, boolean> = {};
  try {
    firedAlarms = JSON.parse(localStorage.getItem(FIRED_ALARMS_KEY) || '{}');
  } catch {}

  tasks.forEach((task) => {
    if (task.completed || !task.alarmEnabled) return;

    const taskDateStr = task.scheduledDate || currentDateStr;
    const taskTimeStr = task.alarmTime || task.scheduledTime;

    if (!taskTimeStr) return;

    const alarmKey = `${task.id}_${taskDateStr}_${taskTimeStr}`;

    if (firedAlarms[alarmKey] || task.alarmFired) return;

    // Check if task alarm time is reached or past
    if (taskDateStr === currentDateStr && taskTimeStr === currentTimeStr) {
      sendBrowserNotification(`⏰ Task Alarm: ${task.title}`, {
        body: `Priority: ${task.priority || 'medium'} • Category: ${task.category}`,
        tag: task.id,
      });

      firedAlarms[alarmKey] = true;
      try {
        localStorage.setItem(FIRED_ALARMS_KEY, JSON.stringify(firedAlarms));
      } catch {}

      if (onTaskAlarmFired) {
        onTaskAlarmFired(task.id);
      }
    }
  });

  // 2. Check Daily Goal Check-ins
  const checkinSettings = getCheckinSettings();
  if (checkinSettings.enabled && checkinSettings.times.length > 0) {
    checkinSettings.times.forEach((checkinTime) => {
      const lastFired = checkinSettings.lastFiredDates[checkinTime];
      if (lastFired === currentDateStr) return; // Already fired today for this time slot

      if (currentTimeStr === checkinTime) {
        sendBrowserNotification(`🎯 Daily Goal Check-in`, {
          body: `Time for your scheduled goal check-in (${checkinTime})! How are your focus tasks progressing today?`,
          tag: `checkin_${checkinTime}`,
        });

        checkinSettings.lastFiredDates[checkinTime] = currentDateStr;
        saveCheckinSettings(checkinSettings);
      }
    });
  }
}
