export type SudokuCell = number | null;

export type SudokuGrid = SudokuCell[][];

export const sudokuSolution: SudokuGrid = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [4, 1, 2, 3],
  [2, 3, 4, 1]
];

export const sudokuPuzzle: SudokuGrid = [
  [1, null, 3, null],
  [null, 4, null, 2],
  [4, null, null, null],
  [null, 3, null, 1]
];

export const sudokuNumbers = [1, 2, 3, 4] as const;

export const isCellFixed = (row: number, column: number, puzzle: SudokuGrid = sudokuPuzzle) =>
  puzzle[row][column] !== null;

export const isSudokuSolved = (board: SudokuGrid, solution: SudokuGrid = sudokuSolution) =>
  board.every((row, rowIndex) =>
    row.every((value, columnIndex) => value === solution[rowIndex][columnIndex])
  );

export const cloneSudokuGrid = (grid: SudokuGrid): SudokuGrid => grid.map((row) => [...row]);
