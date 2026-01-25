import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedRow } from '@/components/ui/animated-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardEditor } from '@/components/ui/card-editor';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDeckById, getDeckStats } from '@/services/state';
import { tap } from '@/services/haptics';
import { useGame } from '@/store/game-provider';

export default function DeckDetailScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { state, dispatch } = useGame();
  const theme = useTheme();
  const deck = getDeckById(state, deckId);
  const stats = getDeckStats(state, deckId);
  const deckCards = state.cards.filter((c) => c.deckId === deckId);

  if (!deck) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle">Deck not found</ThemedText>
          <Button title="Back to decks" onPress={() => router.back()} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const addCard = (front: string, back: string) => {
    dispatch({ type: 'cards/add', deckId, front, back });
  };

  const removeCard = (cardId: string) => {
    Alert.alert('Remove card', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => dispatch({ type: 'cards/remove', id: cardId }),
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.headerSection}>
          <ThemedText type="subtitle">{deck.name}</ThemedText>
          {deck.description ? (
            <ThemedText type="small" themeColor="textSecondary">{deck.description}</ThemedText>
          ) : null}
          <ThemedView style={styles.statsRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {stats.total} cards | {stats.due} due
            </ThemedText>
          </ThemedView>
          {stats.due > 0 && (
            <Button
              title={`Review ${stats.due} card${stats.due === 1 ? '' : 's'}`}
              onPress={() => router.push({ pathname: '/decks/review', params: { deckId } })}
            />
          )}
        </ThemedView>

        <CardEditor onAdd={addCard} />

        <FlatList
          data={deckCards}
          keyExtractor={(card) => card.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              No cards yet — add your first one above.
            </ThemedText>
          }
          renderItem={({ item, index }) => {
            const isDue = item.nextReview <= new Date().toISOString().slice(0, 10);
            return (
              <AnimatedRow delay={index * 40}>
                <Card style={styles.cardRow}>
                  <Pressable
                    style={styles.cardPressable}
                    onPress={() => {
                      tap();
                      Alert.alert(item.front, item.back, [{ text: 'OK' }]);
                    }}>
                    <ThemedView style={styles.cardContent}>
                      <ThemedText type="smallBold" numberOfLines={1} style={{ flex: 1 }}>
                        {item.front}
                      </ThemedText>
                      {item.isReversed && (
                        <ThemedText type="small" themeColor="textSecondary">R</ThemedText>
                      )}
                      {isDue && (
                        <ThemedView style={[styles.dueBadge, { backgroundColor: theme.gold }]}>
                          <ThemedText type="small" style={styles.dueBadgeText}>due</ThemedText>
                        </ThemedView>
                      )}
                    </ThemedView>
                    <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                      {item.back}
                    </ThemedText>
                  </Pressable>
                  <Button
                    title="Remove"
                    variant="ghost"
                    onPress={() => removeCard(item.id)}
                  />
                </Card>
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
  statsRow: {
    marginTop: Spacing.one,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardPressable: {
    flex: 1,
    gap: Spacing.half,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dueBadge: {
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  dueBadgeText: {
    color: '#000',
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
