import { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedRow } from '@/components/ui/animated-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { todayKey } from '@/services/gamification';
import { impact, tap } from '@/services/haptics';
import { ensurePermissions, rescheduleDaily, scheduleTestAlarm } from '@/services/notifications';
import { useGame } from '@/store/game-provider';

function formatTimeForPicker(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function parseTimeString(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export default function RoutinesScreen() {
  const { state, dispatch, hydrated } = useGame();
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [reminder, setReminder] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [permissionHint, setPermissionHint] = useState<string | null>(null);
  const [alarmTitle, setAlarmTitle] = useState<string | null>(null);
  const today = todayKey();

  // Latest state without making the schedule effect re-run on every change.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Only rebuild reminders when the *schedule* (enabled flag + routine
  // ids/times) actually changes — checking a routine off must not churn
  // the whole notification queue.
  const scheduleSignature = useMemo(() => {
    if (!state.settings.notifications) {
      return 'off';
    }
    return state.routines
      .filter((routine) => routine.reminderTime)
      .map((routine) => `${routine.id}:${routine.reminderTime}`)
      .sort()
      .join('|');
  }, [state.routines, state.settings.notifications]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const { routines, settings } = stateRef.current;
    void rescheduleDaily(routines, settings.notifications).then((granted) => {
      if (Platform.OS === 'web') {
        setPermissionHint(null);
        return;
      }
      setPermissionHint(
        settings.notifications && !granted
          ? 'Reminders are on but notifications are blocked — allow them in system settings.'
          : null,
      );
    });
  }, [scheduleSignature, hydrated]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      setAlarmTitle(notification.request.content.body ?? 'Routine reminder');
    });
    return () => subscription.remove();
  }, []);

  const onToggleNotifications = async () => {
    if (state.settings.notifications) {
      dispatch({ type: 'settings/toggleNotifications' });
      return;
    }
    tap();
    const granted = await ensurePermissions();
    setPermissionHint(
      granted ? null : 'Notifications are blocked — allow them in system settings.',
    );
    if (granted) {
      dispatch({ type: 'settings/toggleNotifications' });
    }
  };

  const addRoutine = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    dispatch({ type: 'routines/add', title: trimmed, reminderTime: reminder ? reminder : null });
    setTitle('');
    setReminder('');
    setShowTimePicker(false);
  };

  const handleTimeChange = (_event: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setReminder(formatTimeForPicker(selectedDate));
    }
    setShowTimePicker(false);
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {Platform.OS !== 'web' && alarmTitle && (
          <ThemedView style={styles.alarmOverlay}>
            <Card style={styles.alarmCard}>
              <ThemedText type="smallBold" themeColor="tint">
                Alarm
              </ThemedText>
              <ThemedText style={styles.alarmBody}>{alarmTitle}</ThemedText>
              <Button
                title="Dismiss"
                variant="secondary"
                onPress={() => setAlarmTitle(null)}
              />
            </Card>
          </ThemedView>
        )}
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView style={styles.headerSection}>
            <ThemedText type="subtitle">Routines</ThemedText>
            <ThemedText themeColor="textSecondary">
              Daily habits. Check them off, keep your streak alive.
            </ThemedText>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.navigate('/guide')}
              style={({ pressed }) => pressed && styles.pressedLink}>
              <ThemedText type="link" themeColor="tint">
                How to play — turn tasks into XP
              </ThemedText>
            </Pressable>
          </ThemedView>

          {Platform.OS !== 'web' && (
            <ThemedView style={styles.reminderSection}>
              <ThemedView style={styles.reminderRow}>
                <ThemedText type="smallBold" style={styles.reminderLabel}>
                  Daily reminders
                </ThemedText>
                <Switch
                  value={state.settings.notifications}
                  onValueChange={() => {
                    void onToggleNotifications();
                  }}
                  trackColor={{ true: theme.tint, false: theme.backgroundSelected }}
                  thumbColor={theme.background}
                />
              </ThemedView>
              {permissionHint && (
                <ThemedText type="small" themeColor="danger" style={styles.reminderHint}>
                  {permissionHint}
                </ThemedText>
              )}
            </ThemedView>
          )}

          {Platform.OS !== 'web' && (
            <Button
              title="Test alarm"
              variant="secondary"
              onPress={() => {
                tap();
                void scheduleTestAlarm();
              }}
            />
          )}

          <ThemedView style={styles.composer}>
            <Input
              placeholder="New routine"
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
            />
          </ThemedView>
          {Platform.OS !== 'web' && showTimePicker && (
            <DateTimePicker
              mode="time"
              value={reminder ? parseTimeString(reminder) : new Date()}
              is24Hour={true}
              onChange={handleTimeChange}
            />
          )}
          <ThemedView style={styles.composer}>
            {Platform.OS !== 'web' ? (
              <Pressable onPress={openTimePicker} style={styles.timePickerButton}>
                <ThemedText type="small" themeColor={reminder ? 'accent' : 'textSecondary'}>
                  {reminder ? `Reminder: ${reminder}` : 'Set reminder time (optional)'}
                </ThemedText>
              </Pressable>
            ) : (
              <Input
                placeholder="Reminder time (HH:MM, optional)"
                value={reminder}
                onChangeText={(text) => {
                  setReminder(text);
                  if (timeError) {
                    setTimeError(null);
                  }
                }}
                onSubmitEditing={addRoutine}
                returnKeyType="done"
                style={styles.titleInput}
              />
            )}
            <Button title="Add" onPress={addRoutine} />
          </ThemedView>
          {timeError && (
            <ThemedText type="small" themeColor="danger" style={styles.reminderHint}>
              {timeError}
            </ThemedText>
          )}

          <FlatList
            data={state.routines}
            keyExtractor={(routine) => routine.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                No routines yet — build your daily loop above.
              </ThemedText>
            }
            renderItem={({ item, index }) => {
              const checkedToday = item.history.includes(today);
              return (
                <AnimatedRow delay={index * 40}>
                  <Card style={styles.row}>
                    <Pressable
                      style={styles.rowPressable}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: checkedToday }}
                      onPress={() => {
                        impact();
                        dispatch({ type: 'routines/toggleDay', id: item.id, date: today });
                      }}>
                      <ThemedText
                        type="smallBold"
                        themeColor={checkedToday ? 'success' : 'text'}
                        style={checkedToday && styles.doneText}>
                        {item.title}
                      </ThemedText>
                      {item.reminderTime && (
                        <ThemedText type="small" themeColor="accent">
                          reminders at {item.reminderTime}
                        </ThemedText>
                      )}
                    </Pressable>
                    <Button
                      title="Remove"
                      variant="ghost"
                      onPress={() => dispatch({ type: 'routines/remove', id: item.id })}
                    />
                  </Card>
                </AnimatedRow>
              );
            }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  keyboard: {
    flex: 1,
    gap: Spacing.three,
  },
  headerSection: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  pressedLink: {
    opacity: 0.7,
  },
  reminderSection: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderLabel: {
    marginRight: 'auto',
  },
  reminderHint: {
    paddingHorizontal: Spacing.two,
  },
  alarmOverlay: {
    position: 'absolute',
    top: Spacing.three,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.three,
  },
  alarmCard: {
    gap: Spacing.two,
  },
  alarmBody: {},
  composer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  timePickerButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleInput: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  rowPressable: {
    flex: 1,
    gap: Spacing.half,
  },
  doneText: {
    textDecorationLine: 'line-through',
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});