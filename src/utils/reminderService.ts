import { soundFx } from './audio';
import { TaskReminder } from '../types';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const triggerTaskReminderAlert = (title: string, message?: string) => {
  soundFx.playAlarm();

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`Task Reminder: ${title}`, {
      body: message || 'Your scheduled task reminder is due now!',
      icon: '/pwa-192x192.png',
    });
  }
};

/**
 * Checks all active reminders against current time (HH:mm) or timestamp
 */
export const checkScheduledReminders = (
  reminders: TaskReminder[],
  onTrigger: (reminder: TaskReminder) => void
) => {
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  reminders.forEach((reminder) => {
    if (reminder.status === 'pending' && reminder.reminderTime === currentTimeStr) {
      onTrigger(reminder);
    }
  });
};
