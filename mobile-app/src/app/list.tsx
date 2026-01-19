import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedRow } from '@/components/ui/animated-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { XP } from '@/services/gamification';
import { tap } from '@/services/haptics';
import { useGame } from '@/store/game-provider';

const ROW_COLORS = ['tint', 'accent', 'gold'] as const;
const XP_OPTIONS = [5, XP.questDefault, 50] as const;

export default function QuestsScreen() {
  const { state, dispatch } = useGame();
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const [questXp, setQuestXp] = useState<(typeof XP_OPTIONS)[number]>(XP.questDefault);

  const addQuest = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    tap();
    dispatch({ type: 'quests/add', title: trimmed, xp: questXp });
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

          <ThemedView style={styles.xpPicker}>
            {XP_OPTIONS.map((xp) => (
              <Button
                key={xp}
                title={`+${xp}`}
                variant={xp === questXp ? 'primary' : 'secondary'}
                style={styles.xpChip}
                onPress={() => {
                  tap();
                  setQuestXp(xp);
                }}
              />
            ))}
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
            renderItem={({ item, index }) => {
              const accentColor = theme[ROW_COLORS[index % ROW_COLORS.length]];
              return (
              <AnimatedRow delay={index * 40}>
                <Card style={styles.row}>
                  <Pressable
                    style={styles.rowPressable}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: item.done }}
                    onPress={() => {
                      tap();
                      dispatch({ type: 'quests/toggle', id: item.id });
                    }}>
                    <View style={styles.rowHeader}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: item.done ? theme.success : accentColor },
                        ]}
                      />
                      <ThemedText
                        type="smallBold"
                        themeColor={item.done ? 'success' : 'text'}
                        style={[styles.rowTitle, item.done && styles.doneText]}>
                        {item.title}
                      </ThemedText>
                    </View>
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
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowTitle: {
    flexShrink: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
  },
  doneText: {
    textDecorationLine: 'line-through',
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
  xpPicker: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  xpChip: {
    flex: 1,
  },
});