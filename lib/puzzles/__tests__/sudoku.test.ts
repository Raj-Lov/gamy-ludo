import assert from "node:assert/strict";
import test from "node:test";

import { cloneSudokuGrid, isCellFixed, isSudokuSolved, sudokuPuzzle, sudokuSolution } from "../sudoku.ts";

test("sudoku helpers detect a solved grid", () => {
  const solvedGrid = cloneSudokuGrid(sudokuSolution);

  assert.equal(isSudokuSolved(solvedGrid), true);
});

test("sudoku helpers detect an incomplete grid", () => {
  const inProgress = cloneSudokuGrid(sudokuPuzzle);
  inProgress[0][1] = 2;

  assert.equal(isSudokuSolved(inProgress), false);
});

test("sudoku helpers flag fixed cells from the starting puzzle", () => {
  assert.equal(isCellFixed(0, 0), true);
  assert.equal(isCellFixed(0, 1), false);
});
