import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { impact } from '@/services/haptics';

type GradeButtonsProps = {
  onGrade: (grade: 0 | 1 | 2 | 3) => void;
};

const GRADES = [
  { grade: 0 as const, label: 'Again', variant: 'ghost' as const },
  { grade: 1 as const, label: 'Hard', variant: 'secondary' as const },
  { grade: 2 as const, label: 'Good', variant: 'primary' as const },
  { grade: 3 as const, label: 'Easy', variant: 'primary' as const },
];

export function GradeButtons({ onGrade }: GradeButtonsProps) {
  return (
    <ThemedView style={styles.container}>
      {GRADES.map(({ grade, label, variant }) => (
        <Button
          key={grade}
          title={label}
          variant={variant}
          style={styles.button}
          onPress={() => {
            impact();
            onGrade(grade);
          }}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    flex: 1,
  },
});
