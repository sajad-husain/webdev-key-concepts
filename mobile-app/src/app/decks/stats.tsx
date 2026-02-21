import { FlatList, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useGame } from '@/store/game-provider';
import { getDeckById } from '@/services/state';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { filterLogsByRange, type StatsRange, generateReviewHeatmap } from '@/services/gamification';
import { HeatmapCalendar } from '@/components/ui/heatmap-calendar';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width * 0.9;

const timeRanges: { value: StatsRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'all', label: 'All Time' },
];

const gradeNames = ['Again', 'Hard', 'Good', 'Easy'];

export default function ReviewStatsScreen() {
  const params = useLocalSearchParams<{ deckId?: string }>();
  const deckId = params?.deckId as string | undefined;
  const { state } = useGame();
  const [timeRange, setTimeRange] = useState<StatsRange>('30d');

  const deck = deckId ? getDeckById(state, deckId) : null;

  const deckCards = deckId ? state.cards.filter((c) => c.deckId === deckId) : state.cards;
  const deckLogs = deckId ? state.reviewLogs.filter((l) => l.deckId === deckId) : state.reviewLogs;

  const filteredLogs = useMemo(() => filterLogsByRange(deckLogs, timeRange), [deckLogs, timeRange]);

  const totalReviews = filteredLogs.length;
  const totalXp = filteredLogs.reduce((sum, log) => sum + log.xpEarned, 0);
  const avgXp = totalReviews > 0 ? Math.round(totalXp / totalReviews) : 0;

  const gradeCounts = useMemo(() => {
    const counts = [0, 0, 0, 0];
    for (const log of filteredLogs) {
      if (log.grade >= 0 && log.grade <= 3) counts[log.grade]++;
    }
    return counts;
  }, [filteredLogs]);

  const easeBins = useMemo(() => {
    const bins = { '1.3-1.7': 0, '1.7-2.1': 0, '2.1-2.5': 0, '2.5+': 0 };
    for (const card of deckCards) {
      if (card.easeFactor < 1.7) bins['1.3-1.7']++;
      else if (card.easeFactor < 2.1) bins['1.7-2.1']++;
      else if (card.easeFactor < 2.5) bins['2.1-2.5']++;
      else bins['2.5+']++;
    }
    return bins;
  }, [deckCards]);

  const goodReviews = gradeCounts[2] + gradeCounts[3];
  const retention = totalReviews > 0 ? Math.round((goodReviews / totalReviews) * 100) : 0;

  const title = deck ? `${deck.name} Statistics` : 'Review Statistics';

  const chartData = useMemo(() => {
    const today = new Date();

    let daysBack: number;
    let bucketSize: number;
    let formatLabel: (date: Date) => string;

    switch (timeRange) {
      case '7d':
        daysBack = 6;
        bucketSize = 1;
        formatLabel = (d) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        break;
      case '30d':
        daysBack = 29;
        bucketSize = 1;
        formatLabel = (d) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        break;
      case '90d':
        daysBack = 89;
        bucketSize = 7;
        formatLabel = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        break;
      case 'all':
        if (deckLogs.length === 0) {
          return { labels: [], data: [] };
        }
        const oldestLog = new Date(Math.min(...deckLogs.map((l) => new Date(l.reviewedAt).getTime())));
        const diffDays = Math.ceil((today.getTime() - oldestLog.getTime()) / (1000 * 60 * 60 * 24));
        daysBack = diffDays;
        bucketSize = Math.max(1, Math.ceil(daysBack / 30));
        formatLabel = (d) => d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        break;
    }

    const numBuckets = Math.ceil((daysBack + 1) / bucketSize);
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = numBuckets - 1; i >= 0; i--) {
      const bucketEnd = new Date(today);
      bucketEnd.setDate(today.getDate() - i * bucketSize);
      const bucketStart = new Date(bucketEnd);
      bucketStart.setDate(bucketEnd.getDate() - bucketSize + 1);

      labels.push(formatLabel(bucketEnd));

      const startKey = bucketStart.toISOString().slice(0, 10);
      const endKey = bucketEnd.toISOString().slice(0, 10);

      const bucketLogs = deckLogs.filter((l) => {
        const logDate = l.reviewedAt.slice(0, 10);
        return logDate >= startKey && logDate <= endKey;
      });
      data.push(bucketLogs.length);
    }

    return { labels, data };
  }, [deckLogs, timeRange]);

  const recentLogs = useMemo(
    () => state.reviewLogs.slice(-10).reverse(),
    [state.reviewLogs]
  );

  const heatmapData = useMemo(
    () => generateReviewHeatmap(state.reviewLogs, 12),
    [state.reviewLogs]
  );

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
          <ThemedView style={styles.timeRangeSelector}>
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                title={range.label}
                variant={timeRange === range.value ? 'primary' : 'ghost'}
                style={styles.timeRangeButton}
                onPress={() => setTimeRange(range.value)}
              />
            ))}
          </ThemedView>
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
          {Object.values(easeBins).some((v) => v > 0) ? (
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
          <ThemedText type="smallBold">Reviews Over Time</ThemedText>
          {chartData.data.some((v) => v > 0) ? (
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    data: chartData.data,
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
              data={recentLogs}
              keyExtractor={(log) => log.id}
              renderItem={({ item }) => {
                const date = new Date(item.reviewedAt);
                const dateStr = date.toLocaleDateString();
                const grade = gradeNames[item.grade];
                const color =
                  item.grade === 0
                    ? 'danger'
                    : item.grade === 1
                    ? 'textSecondary'
                    : item.grade === 2
                    ? 'success'
                    : 'gold';
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

        <Card style={styles.sectionCard}>
          <HeatmapCalendar data={heatmapData} />
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
  timeRangeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  timeRangeButton: {
    flex: 1,
    minWidth: 80,
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