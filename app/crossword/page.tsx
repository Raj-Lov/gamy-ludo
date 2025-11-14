"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PuzzleConfetti } from "@/components/puzzles/puzzle-confetti";
import { PuzzleShell } from "@/components/puzzles/puzzle-shell";
import { PuzzleStats } from "@/components/puzzles/puzzle-stats";

const crosswordSolution: (string | null)[][] = [
  ["B", "R", "A", "I", "N"],
  ["O", null, "G", null, "O"],
  ["O", "L", "O", "G", "Y"],
  ["S", null, "P", null, "U"],
  ["T", "I", "M", "E", "S"]
];

const getNextEditableIndex = (index: number, direction: 1 | -1) => {
  const flat = crosswordSolution.flat();
  let cursor = index + direction;
  while (cursor >= 0 && cursor < flat.length) {
    if (flat[cursor] !== null) {
      return cursor;
    }
    cursor += direction;
  }
  return index;
};

export default function CrosswordPage() {
  const [grid, setGrid] = useState(() =>
    crosswordSolution.map((row) => row.map((cell) => (cell ? "" : null)))
  );
  const [activeCell, setActiveCell] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const flattenedSolution = useMemo(() => crosswordSolution.flat(), []);
  const flattenedGrid = useMemo(() => grid.flat(), [grid]);

  const solved = useMemo(
    () =>
      flattenedSolution.every((letter, index) =>
        letter === null ? true : letter === flattenedGrid[index]
      ),
    [flattenedGrid, flattenedSolution]
  );

  useEffect(() => {
    if (solved) {
      setMessage("Wordplay wizard! You cracked the crossword.");
    }
  }, [solved]);

  const focusCell = (index: number) => {
    const input = inputRefs.current[index];
    input?.focus();
    input?.select();
  };

  useEffect(() => {
    focusCell(activeCell);
  }, [activeCell]);

  const handleInput = (value: string, index: number) => {
    const letter = value.slice(-1).toUpperCase();
    if (!/^[A-Z]$/.test(letter)) {
      return;
    }

    setGrid((previous) => {
      const next = previous.map((row) => [...row]);
      const rowIndex = Math.floor(index / crosswordSolution[0].length);
      const columnIndex = index % crosswordSolution[0].length;
      next[rowIndex][columnIndex] = letter;
      return next;
    });

    const nextIndex = getNextEditableIndex(index, 1);
    setActiveCell(nextIndex);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      setGrid((previous) => {
        const next = previous.map((row) => [...row]);
        const rowIndex = Math.floor(index / crosswordSolution[0].length);
        const columnIndex = index % crosswordSolution[0].length;
        const currentValue = next[rowIndex][columnIndex];
        if (currentValue) {
          next[rowIndex][columnIndex] = "";
          return next;
        }
        const nextIndex = getNextEditableIndex(index, -1);
        setActiveCell(nextIndex);
        const previousRow = Math.floor(nextIndex / crosswordSolution[0].length);
        const previousColumn = nextIndex % crosswordSolution[0].length;
        next[previousRow][previousColumn] = "";
        return next;
      });
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveCell(getNextEditableIndex(index, -1));
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveCell(getNextEditableIndex(index, 1));
    }
  };

  const useHint = () => {
    if (solved) return;
    if (hintsRemaining === 0) {
      setMessage("No more hints! Trust your crossword instincts.");
      return;
    }

    const unsolvedIndices = flattenedSolution
      .map((letter, index) => ({ letter, index }))
      .filter(({ letter, index }) => letter && flattenedGrid[index] !== letter)
      .map(({ index }) => index);

    if (!unsolvedIndices.length) return;

    const randomIndex = unsolvedIndices[Math.floor(Math.random() * unsolvedIndices.length)];
    const rowIndex = Math.floor(randomIndex / crosswordSolution[0].length);
    const columnIndex = randomIndex % crosswordSolution[0].length;

    setGrid((previous) => {
      const next = previous.map((row) => [...row]);
      next[rowIndex][columnIndex] = crosswordSolution[rowIndex][columnIndex];
      return next;
    });
    setHintsRemaining((previous) => previous - 1);
    setHintsUsed((previous) => previous + 1);
    setActiveCell(randomIndex);
    setMessage("Hint revealed! Keep the streak going.");
  };

  return (
    <>
      <PuzzleConfetti show={solved} />
      <PuzzleShell
        title="Crossword Sprint"
        description="Fill the 5×5 grid. Letters auto-advance, hints are limited, and perfection earns a celebratory shower."
        actions={
          <>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button onClick={useHint} disabled={hintsRemaining === 0 || solved}>
              <Lightbulb className="mr-2 h-4 w-4" /> Use hint
            </Button>
          </>
        }
        status={
          <PuzzleStats
            stats={[
              { label: "Hints remaining", value: hintsRemaining },
              { label: "Hints used", value: hintsUsed },
              {
                label: "Cells solved",
                value: `${flattenedSolution.filter(Boolean).length -
                  flattenedGrid.filter((cell, index) =>
                    flattenedSolution[index] && flattenedSolution[index] !== cell
                  ).length}/${flattenedSolution.filter(Boolean).length}`
              }
            ]}
          />
        }
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {crosswordSolution.flat().map((cell, index) => {
              if (cell === null) {
                return <div key={index} className="h-14 w-full rounded-md bg-muted sm:h-16" />;
              }

              const rowIndex = Math.floor(index / crosswordSolution[0].length);
              const columnIndex = index % crosswordSolution[0].length;
              const value = grid[rowIndex][columnIndex] ?? "";
              const isCorrect = value === cell;
              const isFilled = value !== "";

              return (
                <motion.input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  value={value as string}
                  onChange={(event) => handleInput(event.target.value, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onFocus={() => setActiveCell(index)}
                  maxLength={1}
                  className="h-14 w-full rounded-md border border-border bg-background/70 text-center text-2xl font-semibold uppercase tracking-wide shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/50 sm:h-16"
                  style={{
                    boxShadow: isCorrect
                      ? "0 0 0 2px hsl(var(--primary))"
                      : isFilled
                      ? "0 0 0 2px hsl(var(--destructive))"
                      : undefined,
                    backgroundColor: isCorrect
                      ? "hsl(var(--primary) / 0.1)"
                      : isFilled
                      ? "hsl(var(--destructive) / 0.05)"
                      : undefined
                  }}
                />
              );
            })}
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
      </PuzzleShell>
    </>
  );
}
