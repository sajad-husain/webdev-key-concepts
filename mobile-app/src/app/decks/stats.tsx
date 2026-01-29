import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useGame } from '@/store/game-provider';

export default function ReviewStatsScreen() {
  const { state } = useGame();

  const totalReviews = state.reviewLogs.length;
  const totalXp = state.reviewLogs.reduce((sum, log) => sum + log.xpEarned, 0);
  const avgXp = totalReviews > 0 ? Math.round(totalXp / totalReviews) : 0;

  // Grade distribution
  const gradeCounts = [0, 0, 0, 0];
  for (const log of state.reviewLogs) {
    if (log.grade >= 0 && log.grade <= 3) gradeCounts[log.grade]++;
  }

  // Ease factor distribution
  const easeBins = { '1.3-1.7': 0, '1.7-2.1': 0, '2.1-2.5': 0, '2.5+': 0 };
  for (const card of state.cards) {
    if (card.easeFactor < 1.7) easeBins['1.3-1.7']++;
    else if (card.easeFactor < 2.1) easeBins['1.7-2.1']++;
    else if (card.easeFactor < 2.5) easeBins['2.1-2.5']++;
    else easeBins['2.5+']++;
  }

  // Retention rate (Good + Easy / total reviews)
  const goodReviews = gradeCounts[2] + gradeCounts[3];
  const retention = totalReviews > 0 ? Math.round((goodReviews / totalReviews) * 100) : 0;

  const gradeNames = ['Again', 'Hard', 'Good', 'Easy'];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Card style={styles.summaryCard}>
          <ThemedText type="subtitle">Review Statistics</ThemedText>
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
          <FlatList
            data={gradeNames}
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => {
              const count = gradeCounts[index];
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              const color =
                index === 0 ? 'danger' : index === 1 ? 'textSecondary' : index === 2 ? 'success' : 'gold';
              return (
                <ThemedView style={styles.distRow} key={item}>
                  <ThemedText type="small" themeColor={color as any}>{item}</ThemedText>
                  <ThemedView style={styles.distBar}>
                    <ThemedView
                      style={[
                        styles.distBarFill,
                        { backgroundColor: color === 'danger' ? '#EF4444' : color === 'textSecondary' ? '#6B7280' : color === 'success' ? '#22C55E' : '#EAB308' },
                        { width: `${percentage}%` },
                      ]}
                    />
                  </ThemedView>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.distLabel}>
                    {count} ({percentage}%)
                  </ThemedText>
                </ThemedView>
              );
            }}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <ThemedText type="smallBold">Ease Factor Distribution</ThemedText>
          <FlatList
            data={Object.entries(easeBins)}
            keyExtractor={([key]) => key}
            renderItem={({ item }) => {
              const [range, count] = item;
              const percentage = state.cards.length > 0 ? Math.round((count / state.cards.length) * 100) : 0;
              return (
                <ThemedView style={styles.distRow} key={range}>
                  <ThemedText type="small">Ease {range}</ThemedText>
                  <ThemedView style={styles.distBar}>
                    <ThemedView
                      style={[
                        styles.distBarFill,
                        { backgroundColor: '#3B82F6' },
                        { width: `${percentage}%` },
                      ]}
                    />
                  </ThemedView>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.distLabel}>
                    {count} ({percentage}%)
                  </ThemedText>
                </ThemedView>
              );
            }}
          />
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
});