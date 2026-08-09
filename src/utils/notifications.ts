import { ReminderSettings } from '../types';

export function checkNotificationSupport(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!checkNotificationSupport()) return false;

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.error('Failed to request notification permission', e);
    return false;
  }
}

export function sendBrowserNotification(title: string, body: string): void {
  if (!checkNotificationSupport()) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'cycle-tracker-reminder'
      });
    } catch (e) {
      console.error('Error firing notification:', e);
    }
  }
}

export function triggerTestNotification(type: keyof ReminderSettings): void {
  const titles: Record<string, string> = {
    expectedPeriod: 'Cycle Tracker: Expected Period',
    periodStarting: 'Cycle Tracker: Period Starting',
    periodEnding: 'Cycle Tracker: Period Ending',
    fertileWindow: 'Cycle Tracker: Fertile Window',
    dailySymptomTracking: 'Cycle Tracker: Daily Check-In'
  };

  const bodies: Record<string, string> = {
    expectedPeriod: 'Your estimated period is expected in 2 days. Make sure you are prepared!',
    periodStarting: 'Your period is estimated to start today based on your cycle history.',
    periodEnding: 'Your period is estimated to end today.',
    fertileWindow: 'Your estimated fertile window opens today.',
    dailySymptomTracking: 'How are you feeling today? Tap to log your symptoms and mood.'
  };

  const title = titles[type] || 'Cycle Tracker Notification';
  const body = bodies[type] || 'Stay updated on your cycle tracking.';

  sendBrowserNotification(title, body);
}
