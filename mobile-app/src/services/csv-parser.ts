/**
 * CSV Parser utility for importing flashcards
 * Handles quoted fields, escaped quotes, and various CSV formats
 */

export interface ParsedCard {
  front: string;
  back: string;
}

export interface DuplicateMatch {
  newCard: ParsedCard;
  existingCardId: string;
  existingFront: string;
  existingBack: string;
  matchType: 'exact' | 'fuzzy';
  similarity: number;
}

export interface ParseResult {
  cards: ParsedCard[];
  duplicates: DuplicateMatch[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

/**
 * Parses a CSV string into an array of card objects
 * Expected format: front,back (with optional headers)
 * Supports quoted fields and escaped quotes
 */
export function parseCSV(csvText: string): ParseResult {
  const lines = csvText.trim().split(/\r?\n/);
  const result: ParseResult = {
    cards: [],
    duplicates: [],
    errors: [],
    totalRows: 0,
    validRows: 0,
  };

  if (lines.length === 0) {
    result.errors.push('Empty CSV file');
    return result;
  }

  // Check for header row
  const firstLine = lines[0].toLowerCase().trim();
  const hasHeader = firstLine === 'front,back' || firstLine === 'front, back' || firstLine === 'front\tback';
  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Skip empty lines entirely
      continue;
    }

    result.totalRows++;
    try {
      const fields = parseCSVLine(line);
      
      if (fields.length < 2) {
        result.errors.push(`Row ${i + 1}: Expected at least 2 columns (front, back), got ${fields.length}`);
        continue;
      }

      const front = fields[0].trim();
      const back = fields[1].trim();

      if (!front || !back) {
        result.errors.push(`Row ${i + 1}: Front and back cannot be empty`);
        continue;
      }

      result.cards.push({ front, back });
      result.validRows++;
    } catch (error) {
      result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }

  return result;
}

/**
 * Parses a single CSV line handling quoted fields and escaped quotes
 */
export function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (char === ',' && !inQuotes) {
      fields.push(currentField);
      currentField = '';
      i++;
      continue;
    }

    currentField += char;
    i++;
  }

  fields.push(currentField);
  return fields;
}

/**
 * Generates a CSV template for users to fill in
 */
export function generateCSVTemplate(): string {
  return 'front,back\n"What is the capital of France?",Paris\n"2 + 2 = ?",4\n';
}

/**
 * Converts cards array to CSV string
 */
export function cardsToCSV(cards: { front: string; back: string }[]): string {
  const lines = ['front,back'];
  for (const card of cards) {
    const escapeField = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return '"' + field.replace(/"/g, '""') + '"';
      }
      return field;
    };
    lines.push(`${escapeField(card.front)},${escapeField(card.back)}`);
  }
  return lines.join('\n');
}

/**
 * Normalizes text for comparison (lowercase, trim, remove extra whitespace)
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculates similarity between two strings (0 to 1)
 */
function calculateSimilarity(a: string, b: string): number {
  const normalizedA = normalizeText(a);
  const normalizedB = normalizeText(b);
  const maxLen = Math.max(normalizedA.length, normalizedB.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(normalizedA, normalizedB);
  return 1 - distance / maxLen;
}

/**
 * Checks for duplicate cards against existing cards
 */
export function detectDuplicates(
  newCards: ParsedCard[],
  existingCards: { id: string; front: string; back: string }[],
  fuzzyThreshold: number = 0.85
): DuplicateMatch[] {
  const duplicates: DuplicateMatch[] = [];

  for (const newCard of newCards) {
    const normalizedNewFront = normalizeText(newCard.front);
    const normalizedNewBack = normalizeText(newCard.back);

    for (const existingCard of existingCards) {
      const normalizedExistingFront = normalizeText(existingCard.front);
      const normalizedExistingBack = normalizeText(existingCard.back);

      // Exact match
      if (normalizedNewFront === normalizedExistingFront && normalizedNewBack === normalizedExistingBack) {
        duplicates.push({
          newCard,
          existingCardId: existingCard.id,
          existingFront: existingCard.front,
          existingBack: existingCard.back,
          matchType: 'exact',
          similarity: 1,
        });
        break;
      }

      // Fuzzy match
      const frontSimilarity = calculateSimilarity(newCard.front, existingCard.front);
      const backSimilarity = calculateSimilarity(newCard.back, existingCard.back);
      const avgSimilarity = (frontSimilarity + backSimilarity) / 2;

      if (avgSimilarity >= fuzzyThreshold) {
        duplicates.push({
          newCard,
          existingCardId: existingCard.id,
          existingFront: existingCard.front,
          existingBack: existingCard.back,
          matchType: 'fuzzy',
          similarity: avgSimilarity,
        });
        break;
      }
    }
  }

  return duplicates;
}

/**
 * Filters out duplicate cards from the import
 */
export function filterDuplicates(
  cards: ParsedCard[],
  duplicates: DuplicateMatch[],
  action: 'skip' | 'replace' = 'skip'
): ParsedCard[] {
  if (action === 'replace') {
    return cards;
  }

  const duplicateFronts = new Set(duplicates.map((d) => normalizeText(d.newCard.front)));
  const duplicateBacks = new Set(duplicates.map((d) => normalizeText(d.newCard.back)));

  return cards.filter((card) => {
    const normalizedFront = normalizeText(card.front);
    const normalizedBack = normalizeText(card.back);
    return !duplicateFronts.has(normalizedFront) || !duplicateBacks.has(normalizedBack);
  });
}