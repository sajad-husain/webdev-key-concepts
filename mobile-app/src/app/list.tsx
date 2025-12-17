import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedRow } from '@/components/ui/animated-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { XP } from '@/services/gamification';
import { useGame } from '@/store/game-provider';

export default function QuestsScreen() {
  const { state, dispatch } = useGame();
  const [draft, setDraft] = useState('');

  const addQuest = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    dispatch({ type: 'quests/add', title: trimmed, xp: XP.questDefault });
    setDraft('');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView style={styles.headerSection}>
            <ThemedText type="subtitle">Quests</ThemedText>
            <ThemedText themeColor="textSecondary">
              Short-term goals. Finish one, bank the XP.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.composer}>
            <Input
              placeholder="What are you taking on?"
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={addQuest}
              returnKeyType="done"
              style={styles.input}
            />
            <Button title="Add" onPress={addQuest} />
          </ThemedView>

          <FlatList
            data={state.quests}
            keyExtractor={(quest) => quest.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
                No quests yet — add your first one above.
              </ThemedText>
            }
            renderItem={({ item, index }) => (
              <AnimatedRow delay={index * 40}>
                <Card style={styles.row}>
                  <Pressable
                    style={styles.rowPressable}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: item.done }}
                    onPress={() => dispatch({ type: 'quests/toggle', id: item.id })}>
                    <ThemedText
                      type="smallBold"
                      themeColor={item.done ? 'success' : 'text'}
                      style={item.done && styles.doneText}>
                      {item.title}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      +{item.xp} XP
                    </ThemedText>
                  </Pressable>
                  <Button
                    title="Remove"
                    variant="ghost"
                    onPress={() => dispatch({ type: 'quests/remove', id: item.id })}
                  />
                </Card>
              </AnimatedRow>
            )}
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