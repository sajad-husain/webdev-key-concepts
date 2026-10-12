import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { View } from 'react-native';
import { SM2_MIN_EASE, SM2_INITIAL_EASE } from '@/services/gamification';
import { GameState, createInitialState } from '@/services/state';

export async function shareStatsAsText(state?: GameState, deckId?: string): Promise<void> {
  const gameState = state || createInitialState();
const deckLogs = deckId
    ? gameState.reviewLogs.filter((l: { deckId: string; xpEarned: number }) => l.deckId === deckId)
    : gameState.reviewLogs;
  const deckCards = deckId
    ? gameState.cards.filter((c: { deckId: string; front: string; back: string }) => c.deckId === deckId)
    : gameState.cards;

  const totalReviews = deckLogs.length;
  const totalXp = deckLogs.reduce((sum, log) => sum + log.xpEarned, 0);
  const avgXp = totalReviews > 0 ? Math.round(totalXp / totalReviews) : 0;

  const gradeCounts = [0, 0, 0, 0];
  for (const log of deckLogs) {
    if (log.grade >= 0 && log.grade <= 3) gradeCounts[log.grade]++;
  }

  const goodReviews = gradeCounts[2] + gradeCounts[3];
  const retention = totalReviews > 0 ? Math.round((goodReviews / totalReviews) * 100) : 0;

  const binWidth = (SM2_INITIAL_EASE - SM2_MIN_EASE) / 3;
  const bin1Upper = SM2_MIN_EASE + binWidth;
  const bin2Upper = SM2_MIN_EASE + binWidth * 2;
  const easeBins = {
    [`${SM2_MIN_EASE.toFixed(1)}-${bin1Upper.toFixed(1)}`]: 0,
    [`${bin1Upper.toFixed(1)}-${bin2Upper.toFixed(1)}`]: 0,
    [`${bin2Upper.toFixed(1)}-${SM2_INITIAL_EASE.toFixed(1)}`]: 0,
  };
  for (const card of deckCards) {
    if (card.easeFactor < bin1Upper) easeBins[`${SM2_MIN_EASE.toFixed(1)}-${bin1Upper.toFixed(1)}`]++;
    else if (card.easeFactor < bin2Upper) easeBins[`${bin1Upper.toFixed(1)}-${bin2Upper.toFixed(1)}`]++;
    else if (card.easeFactor < SM2_INITIAL_EASE) easeBins[`${bin2Upper.toFixed(1)}-${SM2_INITIAL_EASE.toFixed(1)}`]++;
    else easeBins[`${SM2_INITIAL_EASE.toFixed(1)}+`]++;
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
  viewRef?: React.RefObject<View | null>,
  options?: { filename?: string; format?: 'png' | 'jpg'; quality?: number }
): Promise<void> {
  const ref = viewRef?.current;
  if (!ref) {
    console.warn('View ref not available for capture');
    return;
  }
  try {
    const style = ref.props.style;
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