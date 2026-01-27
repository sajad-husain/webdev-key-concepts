import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedRow } from '@/components/ui/animated-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeckCard } from '@/components/ui/deck-card';
import { Input } from '@/components/ui/input';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { getDeckStats, getDueCards, getReviewStreak } from '@/services/state';
import { useGame } from '@/store/game-provider';
import { router } from 'expo-router';

export default function DecksScreen() {
  const { state, dispatch } = useGame();
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  const totalDue = getDueCards(state).length;
  const reviewStreak = getReviewStreak(state);

  const addDeck = () => {
    const name = deckName.trim();
    if (!name) return;
    dispatch({ type: 'decks/add', name, description: deckDescription.trim() || undefined });
    setDeckName('');
    setDeckDescription('');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.headerSection}>
          <ThemedText type="subtitle">Decks</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Build flashcard decks to boost your XP with daily reviews.
          </ThemedText>
          {reviewStreak.currentStreak > 0 && (
            <Card style={styles.streakBadge}>
              <ThemedText type="smallBold" themeColor="accent">
                🔥 {reviewStreak.currentStreak} day review streak
              </ThemedText>
            </Card>
          )}
          {totalDue > 0 && (
            <Card style={styles.dueBanner}>
              <ThemedText type="smallBold" themeColor="accent">
                {totalDue} card{totalDue === 1 ? '' : 's'} due for review
              </ThemedText>
              <Button
                title="Review now"
                onPress={() => router.push('/decks/review')}
              />
            </Card>
          )}
        </ThemedView>

        <Card style={styles.addCard}>
          <ThemedText type="smallBold">New deck</ThemedText>
          <Input
            placeholder="Deck name"
            value={deckName}
            onChangeText={setDeckName}
            returnKeyType="done"
            onSubmitEditing={addDeck}
            style={styles.input}
          />
          <Input
            placeholder="Description (optional)"
            value={deckDescription}
            onChangeText={setDeckDescription}
            returnKeyType="done"
            onSubmitEditing={addDeck}
            style={styles.input}
          />
          <Button title="Create deck" onPress={addDeck} />
        </Card>

        <FlatList
          data={state.decks}
          keyExtractor={(deck) => deck.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No decks yet — create your first one above.
            </ThemedText>
          }
          renderItem={({ item, index }) => {
            const stats = getDeckStats(state, item.id);
            return (
              <AnimatedRow delay={index * 40}>
                <DeckCard
                  name={item.name}
                  description={item.description}
                  total={stats.total}
                  due={stats.due}
                  onPress={() => router.push(`/decks/${item.id}`)}
                />
              </AnimatedRow>
            );
          }}
        />
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
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  headerSection: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  dueBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  streakBadge: {
    marginTop: Spacing.two,
  },
  addCard: {
    gap: Spacing.two,
  },
  input: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
