import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BottomTabInset, MaxContentWidth, Spacing, type ThemeColor } from '@/constants/theme';
import { XP } from '@/services/gamification';
import { useGame } from '@/store/game-provider';
import { useTheme } from '@/hooks/use-theme';
import type { Goal } from '@/services/state';

function GoalCard({ goal }: { goal: Goal }) {
  const { dispatch } = useGame();
  const theme = useTheme();
  const [draft, setDraft] = useState('');

  const doneCount = goal.milestones.filter((milestone) => milestone.done).length;
  const ratio = goal.milestones.length === 0 ? 0 : doneCount / goal.milestones.length;

  const addMilestone = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    dispatch({ type: 'goals/addMilestone', goalId: goal.id, title: trimmed });
    setDraft('');
  };

  return (
    <Card style={styles.goalCard}>
      <ThemedView style={styles.goalHeader}>
        <ThemedText type="smallBold" style={styles.goalTitle}>
          {goal.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {doneCount}/{goal.milestones.length}
        </ThemedText>
      </ThemedView>

      <ProgressBar progress={ratio} height={8} />

      <ThemedView style={styles.milestones}>
        {goal.milestones.map((milestone) => {
          const done = milestone.done;
          const boxColor: ThemeColor = done ? 'success' : 'textSecondary';
          return (
            <Pressable
              key={milestone.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              style={styles.milestoneRow}
              onPress={() =>
                dispatch({ type: 'goals/toggleMilestone', goalId: goal.id, milestoneId: milestone.id })
              }>
              <ThemedView
                style={[styles.checkbox, { borderColor: theme[boxColor] }]}
                type={done ? 'backgroundSelected' : undefined}>
                {done && <ThemedView style={[styles.checkboxFill, { backgroundColor: theme.success }]} />}
              </ThemedView>
              <ThemedText
                type="small"
                themeColor={done ? 'success' : 'text'}
                style={done && styles.doneText}>
                {milestone.title}
              </ThemedText>
            </Pressable>
          );
        })}
      </ThemedView>

      {goal.milestones.length === 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          No milestones yet — break it into steps below.
        </ThemedText>
      )}

      <ThemedView style={styles.milestoneComposer}>
        <Input
          placeholder="Add a milestone (+10 XP)"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={addMilestone}
          returnKeyType="done"
          style={styles.milestoneInput}
        />
        <Button title="Add" variant="secondary" onPress={addMilestone} />
      </ThemedView>

      <Button
        title="Remove goal"
        variant="ghost"
        onPress={() => dispatch({ type: 'goals/remove', id: goal.id })}
      />
    </Card>
  );
}

export default function GoalsScreen() {
  const { state, dispatch } = useGame();
  const [draft, setDraft] = useState('');

  const addGoal = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    dispatch({ type: 'goals/add', title: trimmed });
    setDraft('');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView style={styles.headerSection}>
            <ThemedText type="subtitle">Goals</ThemedText>
            <ThemedText themeColor="textSecondary">
              Long-term goals, broken into milestones. Every step is worth {XP.milestone} XP.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.composer}>
            <Input
              placeholder="What are you building toward?"
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={addGoal}
              returnKeyType="done"
              style={styles.input}
            />
            <Button title="Add" onPress={addGoal} />
          </ThemedView>

          <FlatList
            data={state.goals}
            keyExtractor={(goal) => goal.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                No goals yet — add your first one above.
              </ThemedText>
            }
            renderItem={({ item }) => <GoalCard goal={item} />}
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
    gap: Spacing.four,
  },
  keyboard: {
    flex: 1,
    gap: Spacing.four,
  },
  headerSection: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  composer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  goalCard: {
    gap: Spacing.two,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  goalTitle: {
    flex: 1,
  },
  milestones: {
    gap: Spacing.one,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxFill: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  doneText: {
    textDecorationLine: 'line-through',
  },
  milestoneComposer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  milestoneInput: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});