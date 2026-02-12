import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useGame } from '@/store/game-provider';
import { getDeckById, getDeckReviewStats } from '@/services/state';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width * 0.9;

export default function ReviewStatsScreen() {
  const params = useLocalSearchParams<{ deckId?: string }>();
  const deckId = params?.deckId as string | undefined;
  const { state } = useGame();

  const deck = deckId ? getDeckById(state, deckId) : null;
  getDeckReviewStats(state, deckId!);

  const deckCards = deckId ? state.cards.filter(c => c.deckId === deckId) : state.cards;
  const deckLogs = deckId ? state.reviewLogs.filter(l => l.deckId === deckId) : state.reviewLogs;
  
  const totalReviews = deckLogs.length;
  const totalXp = deckLogs.reduce((sum, log) => sum + log.xpEarned, 0);
  const avgXp = totalReviews > 0 ? Math.round(totalXp / totalReviews) : 0;

  // Grade distribution
  const gradeCounts = [0, 0, 0, 0];
  for (const log of deckLogs) {
    if (log.grade >= 0 && log.grade <= 3) gradeCounts[log.grade]++;
  }

  // Ease factor distribution (only for cards in this deck)
  const easeBins = { '1.3-1.7': 0, '1.7-2.1': 0, '2.1-2.5': 0, '2.5+': 0 };
  for (const card of deckCards) {
    if (card.easeFactor < 1.7) easeBins['1.3-1.7']++;
    else if (card.easeFactor < 2.1) easeBins['1.7-2.1']++;
    else if (card.easeFactor < 2.5) easeBins['2.1-2.5']++;
    else easeBins['2.5+']++;
  }

  // Retention rate (Good + Easy / total reviews)
  const goodReviews = gradeCounts[2] + gradeCounts[3];
  const retention = totalReviews > 0 ? Math.round((goodReviews / totalReviews) * 100) : 0;

const gradeNames = ['Again', 'Hard', 'Good', 'Easy'];
   
   const title = deck ? `${deck.name} Statistics` : 'Review Statistics';

   // Reviews per day for the last 14 days
   const today = new Date();
   const last14DaysLabels: string[] = [];
   const reviewsPerDay: number[] = [];
   for (let i = 13; i >= 0; i--) {
     const date = new Date(today);
     date.setDate(date.getDate() - i);
     const dateStr = date.toISOString().slice(0, 10);
     last14DaysLabels.push(date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }));
     const dayLogs = deckLogs.filter(l => l.reviewedAt.startsWith(dateStr));
     reviewsPerDay.push(dayLogs.length);
   }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Card style={styles.summaryCard}>
          <ThemedText type="subtitle">{title}</ThemedText>
          {deck && (
            <ThemedText type="small" themeColor="textSecondary">
              {deck.description}
            </ThemedText>
          )}
          <ThemedView style={styles.statsGrid}>
            <ThemedView style={styles.statBox}>
              <ThemedText type="small" themeColor="textSecondary">Total Reviews</ThemedText>
              <ThemedText type="subtitle" themeColor="accent">{totalReviews}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statBox}>
              <ThemedText type="small" themeColor="textSecondary">Total XP</ThemedText>
              <ThemedText type="subtitle" themeColor="gold">{totalXp}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statBox}>
              <ThemedText type="small" themeColor="textSecondary">Avg XP/Review</ThemedText>
              <ThemedText type="subtitle" themeColor="success">{avgXp}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statBox}>
              <ThemedText type="small" themeColor="textSecondary">Retention</ThemedText>
              <ThemedText type="subtitle" themeColor="gold">{retention}%</ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        <Card style={styles.sectionCard}>
          <ThemedText type="smallBold">Grade Distribution</ThemedText>
          {totalReviews > 0 ? (
            <BarChart
              data={{
                labels: gradeNames,
                datasets: [
                  {
                    data: gradeCounts,
                    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                  },
                ],
              }}
              width={CHART_WIDTH}
              height={220}
              yAxisLabel="Reviews"
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
            />
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyChart}>
              No reviews yet to show distribution
            </ThemedText>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <ThemedText type="smallBold">Ease Factor Distribution</ThemedText>
          {Object.values(easeBins).some(v => v > 0) ? (
            <BarChart
              data={{
                labels: Object.keys(easeBins),
                datasets: [
                  {
                    data: Object.values(easeBins),
                    color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                  },
                ],
              }}
              width={CHART_WIDTH}
              height={220}
              yAxisLabel="Cards"
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
            />
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyChart}>
              No cards yet to show ease distribution
            </ThemedText>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <ThemedText type="smallBold">Reviews Over Time (Last 14 Days)</ThemedText>
          {deckLogs.length > 0 ? (
            <LineChart
              data={{
                labels: last14DaysLabels,
                datasets: [
                  {
                    data: reviewsPerDay,
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={CHART_WIDTH}
              height={220}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
            />
          ) : (
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyChart}>
              No reviews yet to show trend
            </ThemedText>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <ThemedText type="smallBold">Recent Activity</ThemedText>
          {state.reviewLogs.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">No reviews yet.</ThemedText>
          ) : (
            <FlatList
              data={state.reviewLogs.slice(-10).reverse()}
              keyExtractor={(log) => log.id}
              renderItem={({ item }) => {
                const date = new Date(item.reviewedAt);
                const dateStr = date.toLocaleDateString();
                const gradeNames = ['Again', 'Hard', 'Good', 'Easy'];
                const grade = gradeNames[item.grade];
                const color =
                  item.grade === 0 ? 'danger' : item.grade === 1 ? 'textSecondary' : item.grade === 2 ? 'success' : 'gold';
                return (
                  <ThemedView style={styles.logRow} key={item.id}>
                    <ThemedText type="small" themeColor="textSecondary">{dateStr}</ThemedText>
                    <ThemedText type="small" themeColor={color as any} style={styles.gradeBadge}>
                      {grade}
                    </ThemedText>
                    <ThemedText type="small" themeColor="gold">+{item.xpEarned} XP</ThemedText>
                  </ThemedView>
                );
              }}
            />
          )}
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
  },
  summaryCard: {
    gap: Spacing.two,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    gap: Spacing.half,
    padding: Spacing.two,
  },
  sectionCard: {
    gap: Spacing.two,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  distBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  distLabel: {
    width: 60,
    textAlign: 'right',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  gradeBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  emptyChart: {
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
});