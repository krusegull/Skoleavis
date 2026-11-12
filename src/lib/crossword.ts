/**
 * Delt rutenett-logikk for kryssord - brukt både når Redaktør/Admin bygger et
 * kryssord i dashbordet (validering/forhåndsvisning) og når en besøkende
 * løser det (rutenettets FORM, aldri bokstavene, sendes til nettleseren).
 */

export type CrosswordWordInput = {
  answer: string;
  clue: string;
  row: number;
  col: number;
  direction: "A" | "D";
};

export type GridConflict = { answer: string; row: number; col: number; existing: string; incoming: string };

/** Bygger et rutenett (rad,kolonne -> bokstav) fra ordlisten. Oppdager kryss som ikke stemmer. */
export function buildGrid(words: CrosswordWordInput[]): { grid: Map<string, string>; conflicts: GridConflict[] } {
  const grid = new Map<string, string>();
  const conflicts: GridConflict[] = [];

  for (const word of words) {
    const answer = word.answer.toUpperCase();
    for (let i = 0; i < answer.length; i++) {
      const r = word.direction === "A" ? word.row : word.row + i;
      const c = word.direction === "A" ? word.col + i : word.col;
      const key = `${r},${c}`;
      const ch = answer[i];
      const existing = grid.get(key);
      if (existing && existing !== ch) {
        conflicts.push({ answer, row: r, col: c, existing, incoming: ch });
      }
      grid.set(key, ch);
    }
  }

  return { grid, conflicts };
}

/** Standard kryssord-nummerering: en rute får nummer hvis et ord starter der. */
export function computeNumbers(words: CrosswordWordInput[]): Map<string, number> {
  const starts = Array.from(new Set(words.map((w) => `${w.row},${w.col}`))).sort((a, b) => {
    const [ar, ac] = a.split(",").map(Number);
    const [br, bc] = b.split(",").map(Number);
    return ar - br || ac - bc;
  });
  const numbers = new Map<string, number>();
  starts.forEach((key, i) => numbers.set(key, i + 1));
  return numbers;
}

export type PublicCell = { row: number; col: number; number: number | null };

export type PublicClue = { number: number; direction: "A" | "D"; clue: string; length: number };

export type PublicShape = {
  cells: PublicCell[];
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
  clues: PublicClue[];
};

/**
 * Formen på rutenettet uten fasit - det eneste som er trygt å sende til
 * nettleseren før kryssordet er løst.
 */
export function buildPublicShape(words: CrosswordWordInput[]) {
  const { grid } = buildGrid(words);
  const numbers = computeNumbers(words);

  const cells: PublicCell[] = Array.from(grid.keys()).map((key) => {
    const [row, col] = key.split(",").map(Number);
    return { row, col, number: numbers.get(key) ?? null };
  });

  const rows = cells.map((c) => c.row);
  const cols = cells.map((c) => c.col);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);

  const clues = words
    .map((w) => ({
      number: numbers.get(`${w.row},${w.col}`)!,
      direction: w.direction,
      clue: w.clue,
      length: w.answer.length,
    }))
    .sort((a, b) => a.number - b.number || (a.direction === b.direction ? 0 : a.direction === "A" ? -1 : 1));

  return { cells, minRow, maxRow, minCol, maxCol, clues };
}

/** Sjekker besøkendes gjetninger mot fasiten. Returnerer kun riktig/feil per rute, aldri selve bokstaven. */
export function checkGuesses(
  words: CrosswordWordInput[],
  guesses: Record<string, string>
): { correct: Record<string, boolean>; allCorrect: boolean } {
  const { grid } = buildGrid(words);
  const correct: Record<string, boolean> = {};
  let allCorrect = grid.size > 0;

  for (const [key, answerLetter] of grid.entries()) {
    const guess = (guesses[key] ?? "").trim().toUpperCase();
    const isCorrect = guess === answerLetter;
    correct[key] = isCorrect;
    if (!isCorrect) allCorrect = false;
  }

  return { correct, allCorrect };
}
