import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type SummaryParams = {
  totalXp?: string;
  reviewCount?: string;
  gradeLog?: string;
  deckId?: string;
};

export default function ReviewSummaryScreen() {
  const params = useLocalSearchParams<SummaryParams>();

  const totalXp = Number(params.totalXp) ?? 0;
  const reviewCount = Number(params.reviewCount) ?? 0;
  const gradeLogParam = params.gradeLog;
  const gradeLog = gradeLogParam ? JSON.parse(gradeLogParam) : [];

  const gradeNames = ['Again', 'Hard', 'Good', 'Easy'];
  const gradeCounts = [0, 0, 0, 0];
  for (const { grade } of gradeLog) {
    if (grade >= 0 && grade <= 3) gradeCounts[grade]++;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Card style={styles.summaryCard}>
          <ThemedText type="subtitle" themeColor="success">Session complete!</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            You reviewed {reviewCount} card{reviewCount === 1 ? '' : 's'}.
          </ThemedText>
          <ThemedText type="subtitle" themeColor="gold">
            +{totalXp} XP earned
          </ThemedText>
          <ThemedView style={styles.divider} />
          <ThemedText type="smallBold">Grade breakdown</ThemedText>
          <FlatList
            data={gradeNames}
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => {
              const count = gradeCounts[index];
              const color =
                index === 0 ? 'danger' : index === 1 ? 'textSecondary' : index === 2 ? 'success' : 'gold';
              return (
                <ThemedView style={styles.gradeRow}>
                  <ThemedText type="small" themeColor={color as any}>{item}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {count}
                  </ThemedText>
                </ThemedView>
              );
            }}
            ListFooterComponent={
              <ThemedView style={styles.gradeRow}>
                <ThemedText type="smallBold">Total</ThemedText>
                <ThemedText type="smallBold" themeColor="gold">
                  +{totalXp} XP
                </ThemedText>
              </ThemedView>
            }
          />
          <Button title="Back to decks" onPress={() => router.replace('/decks')} />
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
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    justifyContent: 'center',
  },
  summaryCard: {
    gap: Spacing.three,
    alignItems: 'center',
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    opacity: 0.2,
    marginVertical: Spacing.one,
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.two,
  },
});