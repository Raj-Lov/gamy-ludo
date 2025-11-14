export type DailyPuzzleDifficulty = "easy" | "medium" | "hard" | "extreme";

export interface DailyPuzzle {
  id: string;
  title: string;
  difficulty: DailyPuzzleDifficulty;
  objective: string;
  points: number;
}

export interface DailyPuzzleDocument {
  puzzles?: DailyPuzzle[];
  releaseAt?: { seconds: number; nanoseconds: number } | Date | null;
  theme?: string;
  heroHeadline?: string;
}

export const puzzleDifficulties: DailyPuzzleDifficulty[] = [
  "easy",
  "medium",
  "hard",
  "extreme"
];

export const createDefaultPuzzle = (index = 0): DailyPuzzle => ({
  id: `puzzle-${index + 1}`,
  title: `Puzzle ${index + 1}`,
  difficulty: "medium",
  objective: "Solve the challenge to keep your streak alive.",
  points: 100
});
