import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradeButtons } from '@/components/ui/grade-buttons';
import { ReviewProgress } from '@/components/ui/review-progress';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { calculateReviewXp } from '@/services/gamification';
import { impact } from '@/services/haptics';
import { getDueCards } from '@/services/state';
import { useGame } from '@/store/game-provider';

export default function ReviewSessionScreen() {
  const { deckId } = useLocalSearchParams<{ deckId?: string }>();
  const { state, dispatch } = useGame();

  const dueCards = getDueCards(state, deckId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [gradeLog, setGradeLog] = useState<{ grade: number; xp: number }[]>([]);

  const currentCard = dueCards[currentIndex];
  const isSessionDone = currentIndex >= dueCards.length;

  if (dueCards.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Card style={styles.emptyCard}>
            <ThemedText type="subtitle" themeColor="success">All caught up!</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              No cards due for review right now.
            </ThemedText>
            <Button title="Back to decks" onPress={() => router.back()} />
          </Card>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isSessionDone) {
    const totalXp = gradeLog.reduce((sum, g) => sum + g.xp, 0);
    const reviewCount = gradeLog.length;
    router.replace({
      pathname: '/decks/summary',
      params: { totalXp, reviewCount, gradeLog: JSON.stringify(gradeLog), deckId },
    });
    return null;
  }

  const handleReveal = () => {
    impact();
    setRevealed(true);
  };

  const handleGrade = (grade: 0 | 1 | 2 | 3) => {
    const xp = calculateReviewXp(grade, state.reviewStreak.currentStreak);
    dispatch({ type: 'review/submit', cardId: currentCard.id, grade, xpEarned: xp });
    dispatch({ type: 'reviewStreak/update', date: new Date().toISOString().slice(0, 10) });
    setGradeLog((prev) => [...prev, { grade, xp }]);
    setRevealed(false);
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ReviewProgress current={currentIndex} total={dueCards.length} />

        <Card style={styles.cardContainer}>
          <Pressable onPress={revealed ? undefined : handleReveal}>
            <ThemedView style={styles.cardInner}>
              <ThemedText type="small" themeColor="textSecondary">
                {revealed ? 'Answer' : 'Question'}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.cardText}>
                {revealed ? currentCard.back : currentCard.front}
              </ThemedText>
              {!revealed && (
                <ThemedText type="small" themeColor="accent" style={styles.tapHint}>
                  Tap to reveal
                </ThemedText>
              )}
            </ThemedView>
          </Pressable>
        </Card>

        {revealed ? (
          <GradeButtons onGrade={handleGrade} />
        ) : (
          <Button title="Show answer" onPress={handleReveal} />
        )}

        <Button
          title="End session"
          variant="ghost"
          onPress={() => router.back()}
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
  cardContainer: {
    flex: 1,
    minHeight: 200,
  },
  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  cardText: {
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 28,
  },
  tapHint: {
    marginTop: Spacing.two,
  },
  emptyCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
});
