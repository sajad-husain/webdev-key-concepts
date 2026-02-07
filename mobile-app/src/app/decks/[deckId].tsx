import { useState } from 'react';
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
import { useToast } from '@/components/ui/toast-provider';

export default function DeckDetailScreen() {
  const params = useLocalSearchParams();
  const deckId = params?.deckId as string;
  const { state, dispatch } = useGame();
  const theme = useTheme();
  const deck = deckId ? getDeckById(state, deckId) : undefined;
  const stats = deckId ? getDeckStats(state, deckId) : { total: 0, due: 0, newCards: 0, reviewed: 0 };
  const deckCards = deckId ? state.cards.filter((c) => c.deckId === deckId) : [];
  const [editingCard, setEditingCard] = useState<{ id: string; front: string; back: string } | null>(null);
  const { showToast } = useToast();

  if (!deckId) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="subtitle">Invalid deck</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">Missing deck ID. Please go back and select a deck.</ThemedText>
          <Button title="Back to decks" onPress={() => router.back()} />
        </SafeAreaView>
      </ThemedView>
    );
  }

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
    if (!deckId) return;
    console.log('Adding card to deck:', deckId, { front, back });
    dispatch({ type: 'cards/add', deckId, front, back });
  };

  const removeCard = (cardId: string) => {
    Alert.alert('Remove card', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          // Find the card and its reverse before deleting
          const cardToDelete = state.cards.find(c => c.id === cardId);
          const reverseCard = cardToDelete 
            ? state.cards.find(c => c.deckId === cardToDelete.deckId && c.front === cardToDelete.back && c.back === cardToDelete.front && c.isReversed !== cardToDelete.isReversed)
            : null;
          
          dispatch({ type: 'cards/remove', id: cardId });
          if (reverseCard) {
            dispatch({ type: 'cards/remove', id: reverseCard.id });
          }
          
          // Show undo toast
          showToast({
            message: 'Card deleted',
            type: 'error',
            duration: 5000,
          });
          
          // Store for potential undo (in a real app, you'd use a more robust undo stack)
          // For now, we'll just show the toast and let the user know it was deleted
        },
      },
    ]);
  };

  const updateCard = (id: string, front: string, back: string) => {
    dispatch({ type: 'cards/update', id, front, back });
    setEditingCard(null);
  };

  const cancelEdit = () => {
    setEditingCard(null);
  };

  const startEdit = (card: { id: string; front: string; back: string }) => {
    setEditingCard({ id: card.id, front: card.front, back: card.back });
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

        <CardEditor
          onAdd={addCard}
          onUpdate={updateCard}
          editingCard={editingCard}
          onCancel={cancelEdit}
        />

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
                  <ThemedView style={styles.cardActions}>
                    <Button
                      title="Edit"
                      variant="ghost"
                      onPress={() => startEdit(item)}
                      style={styles.actionButton}
                    />
                    <Button
                      title="Remove"
                      variant="ghost"
                      onPress={() => removeCard(item.id)}
                      style={styles.actionButton}
                    />
                  </ThemedView>
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
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  actionButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    minHeight: 32,
  },
});
