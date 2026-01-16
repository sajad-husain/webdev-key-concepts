import { useState } from 'react';
import { FlatList, Share, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedRow } from '@/components/ui/animated-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { todayKey } from '@/services/gamification';
import { impact } from '@/services/haptics';
import { serializeState } from '@/services/state';
import { useGame } from '@/store/game-provider';

const WIN_POINTS = [5, 10, 15] as const;

export default function WinsScreen() {
  const { state, dispatch } = useGame();
  const [note, setNote] = useState('');
  const today = todayKey();
  const wins = state.wins[today] ?? [];
  const todayPoints = wins.reduce((sum, win) => sum + win.points, 0);

  const addWin = (points: (typeof WIN_POINTS)[number]) => {
    impact();
    dispatch({
      type: 'wins/add',
      date: today,
      note: note.trim() || 'A small win',
      points,
    });
    setNote('');
  };

  const handleExport = async () => {
    impact();
    const serialized = serializeState(state);
    const json = JSON.stringify(serialized, null, 2);
    try {
      await Share.share({
        title: 'Life\'s a game — Backup',
        message: 'Game data backup',
        url: `data:application/json;base64,${btoa(json)}`,
      });
    } catch {
      // Share cancelled or unavailable
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.headerSection}>
          <ThemedText type="subtitle">Today&apos;s wins</ThemedText>
          <ThemedText themeColor="textSecondary">
            Log the little wins — their points feed straight into your XP.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.composer}>
          <Input
            placeholder="What went well today?"
            value={note}
            onChangeText={setNote}
            returnKeyType="done"
            style={styles.input}
          />
        </ThemedView>

        <ThemedView style={styles.chipRow}>
          {WIN_POINTS.map((points) => (
            <Button
              key={points}
              title={`+${points}`}
              variant={points === 10 ? 'primary' : 'secondary'}
              onPress={() => addWin(points)}
            />
          ))}
        </ThemedView>

        <ThemedText type="small" themeColor="textSecondary" style={styles.pointsLabel}>
          {todayPoints} XP so far today
        </ThemedText>

        <FlatList
          data={wins}
          keyExtractor={(win) => win.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No wins logged yet — go earn one.
            </ThemedText>
          }
          renderItem={({ item, index }) => (
            <AnimatedRow delay={index * 40}>
              <Card style={styles.row}>
                <ThemedText style={styles.rowText}>{item.note}</ThemedText>
                <ThemedText type="smallBold" themeColor="gold">
                  +{item.points}
                </ThemedText>
                <Button
                  title="Remove"
                  variant="ghost"
                  onPress={() => dispatch({ type: 'wins/remove', date: today, id: item.id })}
                />
              </Card>
            </AnimatedRow>
          )}
        />

        <Card style={styles.dataSection}>
          <ThemedText type="smallBold">Data</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Backup or restore your progress.
          </ThemedText>
          <Button title="Export data" variant="secondary" onPress={handleExport} />
        </Card>
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
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pointsLabel: {
    paddingHorizontal: Spacing.two,
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
  rowText: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
  dataSection: {
    gap: Spacing.two,
  },
});