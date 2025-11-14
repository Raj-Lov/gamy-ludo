"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PuzzleConfetti } from "@/components/puzzles/puzzle-confetti";
import { PuzzleShell } from "@/components/puzzles/puzzle-shell";
import { PuzzleStats } from "@/components/puzzles/puzzle-stats";

const sudokuSolution = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [4, 1, 2, 3],
  [2, 3, 4, 1]
];

const sudokuPuzzle = [
  [1, null, 3, null],
  [null, 4, null, 2],
  [4, null, null, null],
  [null, 3, null, 1]
];

const isCellFixed = (row: number, column: number) => sudokuPuzzle[row][column] !== null;

const numbers = [1, 2, 3, 4];

export default function SudokuPage() {
  const [board, setBoard] = useState(() => sudokuPuzzle.map((row) => [...row]));
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [boostsRemaining, setBoostsRemaining] = useState(5);
  const [message, setMessage] = useState<string | null>(null);
  const [lastDrop, setLastDrop] = useState<{ row: number; column: number; correct: boolean } | null>(
    null
  );

  const solved = useMemo(
    () =>
      board.every((row, rowIndex) =>
        row.every((value, columnIndex) => value === sudokuSolution[rowIndex][columnIndex])
      ),
    [board]
  );

  useEffect(() => {
    if (solved) {
      setMessage("Grid complete! Every number clicks into place.");
    }
  }, [solved]);

  const handleDrop = (rowIndex: number, columnIndex: number, value: number) => {
    if (isCellFixed(rowIndex, columnIndex) || solved) return;

    const correctValue = sudokuSolution[rowIndex][columnIndex];
    const correct = correctValue === value;

    setBoard((previous) => {
      const next = previous.map((row) => [...row]);
      if (correct) {
        next[rowIndex][columnIndex] = value;
      }
      return next;
    });

    setLastDrop({ row: rowIndex, column: columnIndex, correct });

    if (correct) {
      setMessage("Nice placement! That number fits perfectly.");
    } else {
      setMessage("Not quite right. The deduction boost took a hit.");
      setBoostsRemaining((previous) => Math.max(0, previous - 1));
    }
  };

  const handleHint = () => {
    if (solved) return;
    if (hintsRemaining === 0) {
      setMessage("No hints left. Trust your logic!");
      return;
    }

    const emptyCells: { row: number; column: number }[] = [];
    board.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        if (value === null) {
          emptyCells.push({ row: rowIndex, column: columnIndex });
        }
      });
    });

    if (!emptyCells.length) return;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, column } = randomCell;

    setBoard((previous) => {
      const next = previous.map((r) => [...r]);
      next[row][column] = sudokuSolution[row][column];
      return next;
    });

    setHintsRemaining((previous) => previous - 1);
    setBoostsRemaining((previous) => Math.max(0, previous - 1));
    setMessage("Hint deployed! Boost reserves decreased by one.");
  };

  const resetBoard = () => {
    setBoard(sudokuPuzzle.map((row) => [...row]));
    setHintsRemaining(3);
    setBoostsRemaining(5);
    setLastDrop(null);
    setMessage(null);
  };

  const solvedCells = board.flat().filter(Boolean).length;
  const totalCells = sudokuSolution.length * sudokuSolution[0].length;

  return (
    <>
      <PuzzleConfetti show={solved} />
      <PuzzleShell
        title="Sudoku Flow"
        description="Drag digits from the number wheel onto the 4×4 grid. Logical accuracy keeps boosts intact—errors and hints deduct from your reserves."
        actions={
          <>
            <Button variant="outline" onClick={resetBoard}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button onClick={handleHint} disabled={hintsRemaining === 0 || solved}>
              <Lightbulb className="mr-2 h-4 w-4" /> Reveal hint
            </Button>
          </>
        }
        status={
          <PuzzleStats
            stats={[
              { label: "Hints remaining", value: hintsRemaining },
              { label: "Boosts remaining", value: boostsRemaining },
              { label: "Cells filled", value: `${solvedCells}/${totalCells}` }
            ]}
          />
        }
        className="grid gap-6 lg:grid-cols-[1fr,280px]"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="grid grid-cols-4 gap-2">
            {board.map((row, rowIndex) =>
              row.map((value, columnIndex) => {
                const fixed = isCellFixed(rowIndex, columnIndex);
                const highlight =
                  lastDrop?.row === rowIndex && lastDrop?.column === columnIndex
                    ? lastDrop.correct
                      ? "ring-2 ring-primary"
                      : "ring-2 ring-destructive"
                    : "";

                return (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    onDragOver={(event) => {
                      if (fixed || solved) return;
                      event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const valueString = event.dataTransfer.getData("text/plain");
                      const numericValue = Number(valueString);
                      if (!Number.isFinite(numericValue)) return;
                      handleDrop(rowIndex, columnIndex, numericValue);
                    }}
                    className={`flex h-16 w-16 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-2xl font-semibold shadow-inner transition ${
                      fixed ? "bg-primary/10 text-primary" : "hover:border-primary/70"
                    } ${highlight}`}
                  >
                    {value ?? ""}
                  </div>
                );
              })
            )}
          </div>
          <AnimatePresence>
            {message ? (
              <motion.p
                key={message}
                className="rounded-md bg-muted/60 px-4 py-3 text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
        <motion.aside
          className="relative flex h-full items-center justify-center"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 16, delay: 0.1 }}
        >
          <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-dashed border-primary/60 bg-primary/5">
            {numbers.map((number, index) => {
              const angle = (index / numbers.length) * Math.PI * 2;
              const x = Math.cos(angle) * 96;
              const y = Math.sin(angle) * 96;
              return (
                <motion.button
                  key={number}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", String(number));
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/40"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  {number}
                </motion.button>
              );
            })}
            <div className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-background/90 text-xs uppercase tracking-wide text-muted-foreground shadow-inner">
              Drag & Drop
            </div>
          </div>
        </motion.aside>
      </PuzzleShell>
    </>
  );
}
