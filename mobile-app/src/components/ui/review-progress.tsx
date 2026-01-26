import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Spacing } from '@/constants/theme';

type ReviewProgressProps = {
  current: number;
  total: number;
};

export function ReviewProgress({ current, total }: ReviewProgressProps) {
  const progress = total > 0 ? current / total : 0;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="small" themeColor="textSecondary">
          {current} / {total}
        </ThemedText>
      </ThemedView>
      <ProgressBar progress={progress} height={6} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
