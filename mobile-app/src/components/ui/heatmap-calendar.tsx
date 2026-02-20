import { StyleSheet, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Radius } from '@/constants/theme';
import { HeatmapData, HeatmapCell } from '@/services/gamification';

const CELL_SIZE = 11;
const CELL_GAP = 3;
const MONTH_LABEL_WIDTH = 40;

const LEVEL_COLORS = {
  light: {
    0: '#EBEDF0',
    1: '#9BE9A8',
    2: '#40C463',
    3: '#30A14E',
    4: '#216E39',
  },
  dark: {
    0: '#161B22',
    1: '#0E4429',
    2: '#006D32',
    3: '#26A641',
    4: '#39D353',
  },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getColorForLevel(level: HeatmapCell['level'], isDark: boolean): string {
  return LEVEL_COLORS[isDark ? 'dark' : 'light'][level];
}

function getMonthLabelX(weekIndex: number): number {
  return MONTH_LABEL_WIDTH + weekIndex * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
}

export interface HeatmapCalendarProps {
  data: HeatmapData;
  isDark?: boolean;
  onCellPress?: (cell: HeatmapCell) => void;
  showLegend?: boolean;
  legendLabels?: { empty: string; low: string; high: string };
}

export function HeatmapCalendar({
  data,
  isDark = false,
  onCellPress,
  showLegend = true,
  legendLabels = { empty: 'No reviews', low: 'Few', high: 'Many' },
}: HeatmapCalendarProps) {
  const { cells, startDate, totalReviews } = data;

  const weeksCount = Math.ceil((cells.length + new Date(startDate).getDay()) / 7);

  const cellsByWeek: HeatmapCell[][] = Array.from({ length: weeksCount }, () => []);
  for (const cell of cells) {
    const weekIndex = getWeekIndex(cell.date, startDate);
    const dayOfWeek = getDayOfWeek(cell.date);
    const adjustedWeek = weekIndex;
    if (!cellsByWeek[adjustedWeek]) cellsByWeek[adjustedWeek] = [];
    cellsByWeek[adjustedWeek][dayOfWeek] = cell;
  }

  const monthPositions: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeksCount; w++) {
    const firstCell = cellsByWeek[w]?.find((c) => c);
    if (firstCell) {
      const month = new Date(firstCell.date).getMonth();
      if (month !== lastMonth) {
        monthPositions.push({ month: MONTHS[month], weekIndex: w });
        lastMonth = month;
      }
    }
  }

  const contentWidth = MONTH_LABEL_WIDTH + weeksCount * (CELL_SIZE + CELL_GAP);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold">Review Activity</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {totalReviews} reviews in the last {cells.length > 0 ? Math.ceil(cells.length / 30) : 12} months
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.calendarContainer, { width: contentWidth }]}>
        <ThemedView style={styles.monthLabels}>
          {monthPositions.map(({ month, weekIndex }) => (
            <ThemedText
              key={month}
              type="small"
              themeColor="textSecondary"
              style={[
                styles.monthLabel,
                { left: getMonthLabelX(weekIndex) - MONTH_LABEL_WIDTH / 2 },
              ]}
            >
              {month}
            </ThemedText>
          ))}
        </ThemedView>

        <ThemedView style={styles.calendarContainer}>
          <ThemedView style={styles.dayLabels}>
            {DAY_LABELS.map((day, i) => (
              <ThemedText
                key={day}
                type="small"
                themeColor="textSecondary"
                style={[
                  styles.dayLabel,
                  i % 2 === 1 ? { opacity: 1 } : { opacity: 0 },
                ]}
              >
                {day}
              </ThemedText>
            ))}
          </ThemedView>

          <ThemedView style={styles.weeksContainer}>
            {cellsByWeek.map((week, weekIndex) => (
              <ThemedView key={weekIndex} style={styles.weekColumn}>
                {week.map((cell, dayIndex) => {
                  if (!cell) {
                    return <ThemedView key={`${weekIndex}-${dayIndex}`} style={styles.emptyCell} />;
                  }
                  const color = getColorForLevel(cell.level, isDark);
                  if (onCellPress) {
                    return (
                      <Pressable
                        key={cell.date}
                        style={[
                          styles.cell,
                          { backgroundColor: color },
                        ]}
                        onPress={() => onCellPress(cell)}
                        accessibilityLabel={`${cell.count} review${cell.count !== 1 ? 's' : ''} on ${cell.date}`}
                      />
                    );
                  }
                  return (
                    <ThemedView
                      key={cell.date}
                      style={[
                        styles.cell,
                        { backgroundColor: color },
                      ]}
                      accessibilityLabel={`${cell.count} review${cell.count !== 1 ? 's' : ''} on ${cell.date}`}
                    />
                  );
                })}
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedView>

        {showLegend && (
          <ThemedView style={styles.legend}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.legendLabel}>
              Less
            </ThemedText>
            <ThemedView style={styles.legendGradient}>
              {[0, 1, 2, 3, 4].map((level) => (
                <ThemedView
                  key={level}
                  style={[
                    styles.legendCell,
                    { backgroundColor: getColorForLevel(level as HeatmapCell['level'], isDark) },
                  ]}
                />
              ))}
            </ThemedView>
            <ThemedText type="small" themeColor="textSecondary" style={styles.legendLabel}>
              More
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
}

function getWeekIndex(dateKey: string, startDate: string): number {
  const start = new Date(startDate);
  const target = new Date(dateKey);
  const diffDays = Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

function getDayOfWeek(dateKey: string): number {
  const date = new Date(dateKey);
  return date.getDay();
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarContainer: {
    alignSelf: 'flex-start',
  },
  monthLabels: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 20,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 10,
  },
  dayLabels: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 7 * (CELL_SIZE + CELL_GAP) - CELL_GAP,
    marginLeft: MONTH_LABEL_WIDTH,
    paddingTop: CELL_SIZE / 2,
  },
  dayLabel: {
    fontSize: 9,
    height: CELL_SIZE + CELL_GAP,
  },
  weeksContainer: {
    flexDirection: 'row',
    marginLeft: MONTH_LABEL_WIDTH,
  },
  weekColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 7 * (CELL_SIZE + CELL_GAP) - CELL_GAP,
    marginRight: CELL_GAP,
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    marginBottom: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: Radius.sm,
    marginBottom: CELL_GAP,
  },
  cellInteractive: {
    // opacity handled by press
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  legendLabel: {
    fontSize: 10,
  },
  legendGradient: {
    flexDirection: 'row',
    gap: 2,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});