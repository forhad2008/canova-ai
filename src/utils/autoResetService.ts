import { Task } from '../types';
import { sendBrowserNotification } from './alarmService';
import { soundFx } from './audio';

export interface AutoResetSettings {
  enabled: boolean;
  lastResetTimestamp: number; // Date.now()
}

const AUTO_RESET_KEY = 'nova_auto_reset_24h_settings';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 86,400,000 ms

export function getAutoResetSettings(): AutoResetSettings {
  try {
    const saved = localStorage.getItem(AUTO_RESET_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        enabled: Boolean(parsed.enabled),
        lastResetTimestamp: typeof parsed.lastResetTimestamp === 'number' ? parsed.lastResetTimestamp : Date.now(),
      };
    }
  } catch {
    // Storage read fallback
  }
  return {
    enabled: false,
    lastResetTimestamp: Date.now(),
  };
}

export function saveAutoResetSettings(settings: AutoResetSettings): void {
  try {
    localStorage.setItem(AUTO_RESET_KEY, JSON.stringify(settings));
  } catch {
    // Storage save fallback
  }
}

export function getTimeUntilNextReset(lastResetTimestamp: number): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const nextResetTime = lastResetTimestamp + TWENTY_FOUR_HOURS_MS;
  const diffMs = Math.max(0, nextResetTime - Date.now());

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours}h ${minutes}m ${seconds}s`,
  };
}

export function checkAndExecute24hReset(
  tasks: Task[],
  onResetTasks: (newTasks: Task[]) => void
): boolean {
  const settings = getAutoResetSettings();
  if (!settings.enabled) return false;

  const now = Date.now();
  const elapsedMs = now - settings.lastResetTimestamp;

  if (elapsedMs >= TWENTY_FOUR_HOURS_MS) {
    // Execute reset: mark all tasks as incomplete
    const resetTasks = tasks.map((t) => ({
      ...t,
      completed: false,
      alarmFired: false,
      isOverdue: false,
    }));

    // Update last reset timestamp
    saveAutoResetSettings({
      ...settings,
      lastResetTimestamp: now,
    });

    onResetTasks(resetTasks);

    soundFx.playSuccess();
    sendBrowserNotification('🔄 24-Hour Task Reset Triggered', {
      body: 'All tasks have been reset for your new 24-hour cycle. Ready for a fresh start!',
    });

    return true;
  }

  return false;
}
