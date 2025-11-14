"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PuzzleConfetti } from "@/components/puzzles/puzzle-confetti";
import { PuzzleShell } from "@/components/puzzles/puzzle-shell";
import { PuzzleStats } from "@/components/puzzles/puzzle-stats";

interface MemoryCard {
  id: number;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

const symbols = ["🍎", "🚀", "🎲", "🎵"];

const createDeck = (): MemoryCard[] => {
  const duplicated = symbols.flatMap((symbol) => [symbol, symbol]);
  const shuffled = duplicated
    .map((symbol) => ({ symbol, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item, index) => ({ id: index, symbol: item.symbol }));

  return shuffled.map((card) => ({ ...card, flipped: false, matched: false }));
};

export default function MemoryPage() {
  const [cards, setCards] = useState<MemoryCard[]>(() => createDeck());
  const [selection, setSelection] = useState<number[]>([]);
  const [matchesFound, setMatchesFound] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const completed = useMemo(() => matchesFound === symbols.length, [matchesFound]);

  useEffect(() => {
    if (completed) {
      setMessage("Memory mastery! Every pair has been matched.");
    }
  }, [completed]);

  useEffect(() => {
    if (selection.length < 2) return;

    const [firstId, secondId] = selection;
    const firstCard = cards.find((card) => card.id === firstId);
    const secondCard = cards.find((card) => card.id === secondId);
    if (!firstCard || !secondCard) return;

    setAttempts((previous) => previous + 1);

    let timeout: number | undefined;

    if (firstCard.symbol === secondCard.symbol) {
      setCards((previous) =>
        previous.map((card) =>
          card.id === firstId || card.id === secondId
            ? { ...card, matched: true, flipped: true }
            : card
        )
      );
      setMatchesFound((previous) => previous + 1);
      setSelection([]);
      setMessage("Pair found! Keep the streak alive.");
    } else {
      setMessage("Mismatch. Flip again to spot the right pair.");
      timeout = window.setTimeout(() => {
        setCards((previous) =>
          previous.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, flipped: false }
              : card
          )
        );
        setSelection([]);
      }, 900);
    }

    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [selection, cards]);

  const flipCard = (cardId: number) => {
    if (selection.length === 2) return;

    setCards((previous) =>
      previous.map((card) => {
        if (card.id !== cardId || card.flipped || card.matched) {
          return card;
        }
        return { ...card, flipped: true };
      })
    );

    setSelection((previous) => {
      if (previous.includes(cardId)) {
        return previous;
      }
      return [...previous, cardId];
    });
  };

  const resetGame = () => {
    setCards(createDeck());
    setSelection([]);
    setMatchesFound(0);
    setAttempts(0);
    setMessage(null);
  };

  return (
    <>
      <PuzzleConfetti show={completed} />
      <PuzzleShell
        title="Memory Match"
        description="Flip cards with silky animations, track your matches, and celebrate when every pair is revealed."
        actions={
          <Button variant="outline" onClick={resetGame}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset deck
          </Button>
        }
        status={
          <PuzzleStats
            stats={[
              { label: "Pairs found", value: `${matchesFound}/${symbols.length}` },
              { label: "Attempts", value: attempts }
            ]}
          />
        }
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {cards.map((card) => {
            const flipped = card.flipped || card.matched;
            return (
              <motion.button
                key={card.id}
                onClick={() => flipCard(card.id)}
                className="relative h-32 w-full"
                style={{ perspective: "1000px" }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl border border-border/60 bg-background/80 shadow-lg"
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/20 text-4xl font-semibold"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    ?
                  </div>
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10 text-5xl font-semibold text-primary"
                    style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                  >
                    {card.symbol}
                  </div>
                </motion.div>
              </motion.button>
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
      </PuzzleShell>
    </>
  );
}
