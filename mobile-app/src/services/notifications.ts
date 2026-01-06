import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Routine } from '@/services/state';

export const REMINDER_ID_PREFIX = 'routine-';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function supported(): boolean {
  return Platform.OS !== 'web';
}

/** Android needs a channel before it will surface any notification. */
async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync('daily', {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function ensurePermissions(): Promise<boolean> {
  if (!supported()) {
    return false;
  }
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) {
    return true;
  }
  if (
    Platform.OS === 'ios' &&
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }
  if (settings.status === 'undetermined') {
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  }
  return false;
}

/**
 * Fires a one-off test notification in a few seconds so the alarm sound and
 * in-app overlay can be verified without waiting for the set time.
 */
export async function scheduleTestAlarm(): Promise<void> {
  if (!supported()) {
    return;
  }
  await ensureChannel();
  const granted = await ensurePermissions();
  if (!granted) {
    return;
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Alarm test',
      body: 'This is how your daily reminder will sound.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    },
  });
}

/**
 * Rebuilds the daily reminder schedule for all routines. Cancels everything
 * first so removed reminders don't linger, and skips work on web or without
 * permission.
 */
export async function rescheduleDaily(
  routines: Routine[],
  enabled: boolean,
): Promise<void> {
  if (!supported()) {
    return;
  }
  await ensureChannel();
  const granted = await ensurePermissions();
  if (!granted) {
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) {
    return;
  }

  for (const routine of routines) {
    if (!routine.reminderTime) {
      continue;
    }
    const [hour, minute] = routine.reminderTime.split(':').map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) {
      continue;
    }
    await Notifications.scheduleNotificationAsync({
      identifier: `${REMINDER_ID_PREFIX}${routine.id}`,
      content: {
        title: 'Life is a game',
        body: `Daily routine reminder: ${routine.title}`,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }
}