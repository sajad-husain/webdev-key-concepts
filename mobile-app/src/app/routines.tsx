import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { rescheduleDaily, scheduleTestAlarm } from '@/services/notifications';
import { useGame } from '@/store/game-provider';

const TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/;

export default function RoutinesScreen() {
  const { state, dispatch, hydrated } = useGame();
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [reminder, setReminder] = useState('');
  const [alarmTitle, setAlarmTitle] = useState<string | null>(null);
  const today = todayKey();

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    void rescheduleDaily(state.routines, state.settings.notifications);
  }, [state.routines, state.settings.notifications, hydrated]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      setAlarmTitle(notification.request.content.body ?? 'Routine reminder');
    });
    return () => subscription.remove();
  }, []);

  const addRoutine = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    const reminderTime = reminder.trim();
    const validTime = TIME_PATTERN.test(reminderTime) ? reminderTime : null;
    dispatch({ type: 'routines/add', title: trimmed, reminderTime: validTime });
    setTitle('');
    setReminder('');
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
          </ThemedView>

          {Platform.OS !== 'web' && (
            <ThemedView style={styles.reminderRow}>
              <ThemedText type="smallBold" style={styles.reminderLabel}>
                Daily reminders
              </ThemedText>
              <Switch
                value={state.settings.notifications}
                onValueChange={() => dispatch({ type: 'settings/toggleNotifications' })}
                trackColor={{ true: theme.tint, false: theme.backgroundSelected }}
                thumbColor={theme.background}
              />
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
          <ThemedView style={styles.composer}>
            <Input
              placeholder="Reminder time (HH:MM, optional)"
              value={reminder}
              onChangeText={setReminder}
              onSubmitEditing={addRoutine}
              returnKeyType="done"
              style={styles.titleInput}
            />
            <Button title="Add" onPress={addRoutine} />
          </ThemedView>

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
                        tap();
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
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
  },
  reminderLabel: {
    marginRight: 'auto',
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