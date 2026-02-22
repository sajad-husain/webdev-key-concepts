import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { View } from 'react-native';
import { GameState } from '@/services/state';

export async function shareStatsAsText(state: GameState, deckId?: string): Promise<void> {
  const deckLogs = deckId
    ? state.reviewLogs.filter((l) => l.deckId === deckId)
    : state.reviewLogs;
  const deckCards = deckId
    ? state.cards.filter((c) => c.deckId === deckId)
    : state.cards;

  const totalReviews = deckLogs.length;
  const totalXp = deckLogs.reduce((sum, log) => sum + log.xpEarned, 0);
  const avgXp = totalReviews > 0 ? Math.round(totalXp / totalReviews) : 0;

  const gradeCounts = [0, 0, 0, 0];
  for (const log of deckLogs) {
    if (log.grade >= 0 && log.grade <= 3) gradeCounts[log.grade]++;
  }

  const goodReviews = gradeCounts[2] + gradeCounts[3];
  const retention = totalReviews > 0 ? Math.round((goodReviews / totalReviews) * 100) : 0;

  const easeBins = { '1.3-1.7': 0, '1.7-2.1': 0, '2.1-2.5': 0, '2.5+': 0 };
  for (const card of deckCards) {
    if (card.easeFactor < 1.7) easeBins['1.3-1.7']++;
    else if (card.easeFactor < 2.1) easeBins['1.7-2.1']++;
    else if (card.easeFactor < 2.5) easeBins['2.1-2.5']++;
    else easeBins['2.5+']++;
  }

  const gradeNames = ['Again', 'Hard', 'Good', 'Easy'];
  const gradeLines = gradeNames.map((name, i) => `  ${name}: ${gradeCounts[i]}`).join('\n');

  const easeLines = Object.entries(easeBins)
    .map(([range, count]) => `  ${range}: ${count}`)
    .join('\n');

  const text = `Life's a Game - Statistics
${deckId ? 'Deck' : 'All Decks'} Review Stats

Total Reviews: ${totalReviews}
Total XP: ${totalXp}
Avg XP/Review: ${avgXp}
Retention: ${retention}%

Grade Distribution:
${gradeLines}

Ease Factor Distribution:
${easeLines}

Generated on ${new Date().toLocaleDateString()}
`;

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(text, {
      mimeType: 'text/plain',
      dialogTitle: 'Share Statistics',
    });
  }
}

export async function shareStatsAsImage(
  viewRef: React.RefObject<View | null>,
  options?: { filename?: string; format?: 'png' | 'jpg'; quality?: number }
): Promise<void> {
  if (!viewRef.current) {
    console.warn('View ref not available for capture');
    return;
  }

  try {
    const style = viewRef.current.props.style;
    let width = 400;
    let height = 600;
    if (style && typeof style === 'object' && !Array.isArray(style)) {
      width = typeof style.width === 'number' ? style.width : 400;
      height = typeof style.height === 'number' ? style.height : 600;
    }

    const uri = await captureRef(viewRef, {
      format: options?.format || 'png',
      quality: options?.quality || 0.8,
      result: 'tmpfile',
      width,
      height,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: options?.format === 'jpg' ? 'image/jpeg' : 'image/png',
        dialogTitle: 'Share Statistics Image',
        UTI: options?.format === 'jpg' ? 'public.jpeg' : 'public.png',
      });
    }
  } catch (error) {
    console.error('Failed to capture/share stats image:', error);
  }
}

export async function isSharingAvailable(): Promise<boolean> {
  return Sharing.isAvailableAsync();
}