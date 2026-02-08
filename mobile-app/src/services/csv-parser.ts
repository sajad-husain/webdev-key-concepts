/**
 * CSV Parser utility for importing flashcards
 * Handles quoted fields, escaped quotes, and various CSV formats
 */

export interface ParsedCard {
  front: string;
  back: string;
}

export interface ParseResult {
  cards: ParsedCard[];
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