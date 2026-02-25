/// <reference types="jest" />
/// <reference types="jest" />
import { parseCSV, parseCSVLine, cardsToCSV, generateCSVTemplate, detectDuplicates, filterDuplicates } from '@/services/csv-parser';

describe('CSV Parser', () => {
  describe('parseCSVLine', () => {
    it('parses simple comma-separated values', () => {
      expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('handles quoted fields with commas', () => {
      expect(parseCSVLine('"a,b",c')).toEqual(['a,b', 'c']);
    });

    it('handles escaped quotes', () => {
      expect(parseCSVLine('"a""b",c')).toEqual(['a"b', 'c']);
    });

    it('handles multiple quoted fields', () => {
      expect(parseCSVLine('"a,b","c,d"')).toEqual(['a,b', 'c,d']);
    });

    it('handles empty fields', () => {
      expect(parseCSVLine('a,,c')).toEqual(['a', '', 'c']);
    });
  });

  describe('parseCSV', () => {
    it('parses simple CSV without header', () => {
      const csv = 'Front 1,Back 1\nFront 2,Back 2';
      const result = parseCSV(csv);
      expect(result.cards).toHaveLength(2);
      expect(result.cards[0]).toEqual({ front: 'Front 1', back: 'Back 1' });
      expect(result.cards[1]).toEqual({ front: 'Front 2', back: 'Back 2' });
      expect(result.validRows).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('parses CSV with header row', () => {
      const csv = 'front,back\nFront 1,Back 1\nFront 2,Back 2';
      const result = parseCSV(csv);
      expect(result.cards).toHaveLength(2);
      expect(result.validRows).toBe(2);
    });

    it('handles quoted fields with commas', () => {
      const csv = '"Question, with comma",Answer\nFront 2,Back 2';
      const result = parseCSV(csv);
      expect(result.cards).toHaveLength(2);
      expect(result.cards[0]).toEqual({ front: 'Question, with comma', back: 'Answer' });
    });

    it('handles escaped quotes', () => {
      const csv = '"He said ""Hello""",Greeting';
      const result = parseCSV(csv);
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0]).toEqual({ front: 'He said "Hello"', back: 'Greeting' });
    });

    it('skips empty lines', () => {
      const csv = 'Front 1,Back 1\n\nFront 2,Back 2';
      const result = parseCSV(csv);
      expect(result.cards).toHaveLength(2);
      expect(result.errors).toHaveLength(0); // Empty lines are skipped
    });

    it('reports error for rows with missing columns', () => {
      const csv = 'Front 1,Back 1\nFront 2';
      const result = parseCSV(csv);
      expect(result.cards).toHaveLength(1);
      expect(result.errors).toContain('Row 2: Expected at least 2 columns (front, back), got 1');
    });

    it('reports error for empty front or back', () => {
      const csv = 'Front 1,Back 1\n,Back 2\nFront 3,';
      const result = parseCSV(csv);
      expect(result.cards).toHaveLength(1);
      expect(result.errors).toHaveLength(2);
    });

    it('handles case-insensitive header detection', () => {
      const csv = 'FRONT,BACK\nFront 1,Back 1';
      const result = parseCSV(csv);
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0]).toEqual({ front: 'Front 1', back: 'Back 1' });
    });
  });

  describe('cardsToCSV', () => {
    it('generates CSV from cards', () => {
      const cards = [
        { front: 'Front 1', back: 'Back 1' },
        { front: 'Front 2', back: 'Back 2' },
      ];
      const csv = cardsToCSV(cards);
      expect(csv).toBe('front,back\nFront 1,Back 1\nFront 2,Back 2');
    });

    it('escapes fields with commas', () => {
      const cards = [{ front: 'A, B', back: 'C' }];
      const csv = cardsToCSV(cards);
      expect(csv).toBe('front,back\n"A, B",C');
    });

    it('escapes fields with quotes', () => {
      const cards = [{ front: 'He said "Hi"', back: 'Quote' }];
      const csv = cardsToCSV(cards);
      expect(csv).toBe('front,back\n"He said ""Hi""",Quote');
    });

    it('escapes fields with newlines', () => {
      const cards = [{ front: 'Line 1\nLine 2', back: 'Answer' }];
      const csv = cardsToCSV(cards);
      expect(csv).toContain('"Line 1\nLine 2"');
    });
  });

  describe('generateCSVTemplate', () => {
    it('generates a valid CSV template', () => {
      const template = generateCSVTemplate();
      const result = parseCSV(template);
      expect(result.cards.length).toBeGreaterThan(0);
      expect(result.validRows).toBeGreaterThan(0);
    });
  });
});

describe('Duplicate Detection', () => {
  const existingCards = [
    { id: 'card-1', front: 'What is the capital of France?', back: 'Paris' },
    { id: 'card-2', front: '2 + 2 = ?', back: '4' },
    { id: 'card-3', front: 'Hello world', back: 'Bonjour monde' },
  ];

  it('detects exact duplicates', () => {
    const newCards = [
      { front: 'What is the capital of France?', back: 'Paris' },
      { front: 'New question', back: 'New answer' },
    ];
    const duplicates = detectDuplicates(newCards, existingCards);
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].matchType).toBe('exact');
    expect(duplicates[0].similarity).toBe(1);
    expect(duplicates[0].existingCardId).toBe('card-1');
  });

  it('detects exact duplicates ignoring case and whitespace', () => {
    const newCards = [
      { front: '  what is the capital of france?  ', back: '  paris  ' },
    ];
    const duplicates = detectDuplicates(newCards, existingCards);
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].matchType).toBe('exact');
  });

  it('detects fuzzy duplicates', () => {
    const newCards = [
      { front: 'What is the capital city of France?', back: 'Paris' }, // Similar to card-1
    ];
    const duplicates = detectDuplicates(newCards, existingCards, 0.8);
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].matchType).toBe('fuzzy');
    expect(duplicates[0].similarity).toBeGreaterThan(0.8);
  });

  it('does not detect dissimilar cards as duplicates', () => {
    const newCards = [
      { front: 'What is the meaning of life?', back: '42' },
    ];
    const duplicates = detectDuplicates(newCards, existingCards, 0.85);
    expect(duplicates).toHaveLength(0);
  });

  it('detects multiple duplicates', () => {
    const newCards = [
      { front: 'What is the capital of France?', back: 'Paris' },
      { front: '2 + 2 = ?', back: '4' },
      { front: 'New question', back: 'New answer' },
    ];
    const duplicates = detectDuplicates(newCards, existingCards);
    expect(duplicates).toHaveLength(2);
  });

  it('returns empty array when no existing cards', () => {
    const newCards = [
      { front: 'What is the capital of France?', back: 'Paris' },
    ];
    const duplicates = detectDuplicates(newCards, []);
    expect(duplicates).toHaveLength(0);
  });

  it('filters out exact duplicates when skipping', () => {
    const newCards = [
      { front: 'What is the capital of France?', back: 'Paris' },
      { front: 'New question', back: 'New answer' },
    ];
    const duplicates = detectDuplicates(newCards, existingCards);
    const filtered = filterDuplicates(newCards, duplicates, 'skip');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].front).toBe('New question');
  });

  it('keeps all cards when replacing', () => {
    const newCards = [
      { front: 'What is the capital of France?', back: 'Paris' },
      { front: 'New question', back: 'New answer' },
    ];
    const duplicates = detectDuplicates(newCards, existingCards);
    const filtered = filterDuplicates(newCards, duplicates, 'replace');
    expect(filtered).toHaveLength(2);
  });

  it('handles empty new cards array', () => {
    const duplicates = detectDuplicates([], existingCards);
    expect(duplicates).toHaveLength(0);
  });
});