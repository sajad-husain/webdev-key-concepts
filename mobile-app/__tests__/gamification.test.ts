// jest-expo test file for SM-2 algorithm boundary tests
import {runAllTests} from '@jest-expo';
import {
  sm2NextReview,
  calculateReviewXp,
  isReviewGrade,
  REVIEW_BASE_XP,
  REVIEW_GRADE_BONUS,
  STREAK_BONUS_CAP,
} from '@/services/gamification';

describe('SM-2 algorithm boundaries', () => {
  describe('grade validation', () => {
    it('should accept valid grades 0-3', () => {
      expect(isReviewGrade(0)).toBe(true);
      expect(isReviewGrade(1)).toBe(true);
      expect(isReviewGrade(2)).toBe(true);
      expect(isReviewGrade(3)).toBe(true);
    });

    it('should reject invalid grades', () => {
      expect(isReviewGrade(-1)).toBe(false);
      expect(isReviewGrade(4)).toBe(false);
      expect(isReviewGrade('good')).toBe(false);
      expect(isReviewGrade(null)).toBe(false);
    });
  });

  describe('Again handling', () => {
    it('should reset interval to 1 and increment repetitions on Again (grade 0)', () => {
      const result = sm2NextReview(0, { easeFactor: 2.5, interval: 7, repetitions: 2 }, '2026-01-15');
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(3);
    });

    it('should keep interval at 1 when grade 0 with repetitions 0', () => {
      const result = sm2NextReview(0, { easeFactor: 2.5, interval: 7, repetitions: 0 }, '2026-01-15');
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });
  });

  describe('ease factor boundaries', () => {
    it('should clamp ease factor minimum at SM2_MIN_EASE', () => {
      const card = { easeFactor: 0.5, interval: 1, repetitions: 0 };
      const result = sm2NextReview(2, card, '2026-01-15');
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should allow ease factor to increase with good grades', () => {
      const card = { easeFactor: 1.5, interval: 1, repetitions: 0 };
      const result = sm2NextReview(2, card, '2026-01-15'); // Good grade
      expect(result.easeFactor).toBeGreaterThan(1.5);
    });

    it('should not exceed reasonable ease factor limits', () => {
      const card = { easeFactor: 3.0, interval: 1, repetitions: 0 };
      const result = sm2NextReview(2, card, '2026-01-15');
      expect(result.easeFactor).toBeLessThanOrEqual(5);
    });
  });

  describe('repetitions increments', () => {
    it('should increment repetitions for Good (grade 2) review', () => {
      const result = sm2NextReview(2, { easeFactor: 2.5, interval: 1, repetitions: 0 }, '2026-01-15');
      expect(result.repetitions).toBe(1);
    });

    it('should increment repetitions for Easy (grade 3) review', () => {
      const result = sm2NextReview(3, { easeFactor: 2.5, interval: 1, repetitions: 0 }, '2026-01-15');
      expect(result.repetitions).toBe(1);
    });

    it('should keep interval unchanged for repetitions > 1', () => {
      const result = sm2NextReview(2, { easeFactor: 2.5, interval: 6, repetitions: 5 }, '2026-01-15');
      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(6);
    });
  });

  describe('XP calculation boundaries', () => {
    it('should calculate minimum XP (Again grade 0)', () => {
      const result = calculateReviewXp(0, 0);
      expect(result).toBe(REVIEW_BASE_XP + REVIEW_GRADE_BONUS[0]);
    });

    it('should calculate maximum XP (Easy grade 3 with streak cap)', () => {
      const result = calculateReviewXp(3, STREAK_BONUS_CAP);
      expect(result).toBe(REVIEW_BASE_XP + REVIEW_GRADE_BONUS[3] + STREAK_BONUS_CAP);
    });

    it('should cap streak bonus at STREAK_BONUS_CAP', () => {
      const result = calculateReviewXp(2, 100);
      expect(result).toBe(REVIEW_BASE_XP + REVIEW_GRADE_BONUS[2] + STREAK_BONUS_CAP);
    });
  });
});