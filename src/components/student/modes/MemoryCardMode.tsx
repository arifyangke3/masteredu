import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { Question, MatchingPair } from '../../../types';
import { SoundEngine } from '../../../utils/soundEffects';

interface MemoryCardModeProps {
  question: Question;
  onAnswer: (userAnswer: any, isCorrect: boolean) => void;
  soundEnabled: boolean;
  showExplanationMode: 'always' | 'end_only' | 'never';
}

interface CardItem {
  uid: string;
  pairId: string;
  text: string;
  side: 'left' | 'right';
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryCardMode: React.FC<MemoryCardModeProps> = ({
  question,
  onAnswer,
  soundEnabled,
  showExplanationMode,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Generate card pairs from question matching pairs or options
    const pairs: MatchingPair[] = question.matchingPairs || [
      { id: '1', left: 'A', right: '1' },
      { id: '2', left: 'B', right: '2' },
      { id: '3', left: 'C', right: '3' },
    ];

    const deck: CardItem[] = [];
    pairs.forEach((p, idx) => {
      deck.push({
        uid: `${p.id}-L`,
        pairId: p.id,
        text: p.left,
        side: 'left',
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        uid: `${p.id}-R`,
        pairId: p.id,
        text: p.right,
        side: 'right',
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    setCards(deck.sort(() => Math.random() - 0.5));
    setFlippedUids([]);
    setMovesCount(0);
    setIsCompleted(false);
  }, [question.id]);

  const handleCardClick = (card: CardItem) => {
    if (card.isFlipped || card.isMatched || flippedUids.length >= 2) return;

    SoundEngine.playFlip(soundEnabled);
    const newFlipped = [...flippedUids, card.uid];
    setFlippedUids(newFlipped);

    // Flip card visually
    setCards((prev) =>
      prev.map((c) => (c.uid === card.uid ? { ...c, isFlipped: true } : c))
    );

    // If 2 cards are flipped, check for match
    if (newFlipped.length === 2) {
      setMovesCount((m) => m + 1);
      const firstCard = cards.find((c) => c.uid === newFlipped[0]);
      const secondCard = card;

      if (firstCard && firstCard.pairId === secondCard.pairId) {
        // MATCH!
        SoundEngine.playCorrect(soundEnabled);
        setTimeout(() => {
          setCards((prev) => {
            const updated = prev.map((c) =>
              c.pairId === firstCard.pairId
                ? { ...c, isFlipped: true, isMatched: true }
                : c
            );
            // Check if all matched
            if (updated.every((c) => c.isMatched)) {
              setIsCompleted(true);
              SoundEngine.playFanfare(soundEnabled);
            }
            return updated;
          });
          setFlippedUids([]);
        }, 500);
      } else {
        // NO MATCH -> flip back after short delay
        SoundEngine.playWrong(soundEnabled);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.uid) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedUids([]);
        }, 900);
      }
    }
  };

  const handleFinish = () => {
    onAnswer(`Diselesaikan dalam ${movesCount} langkah`, true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-2 shadow-xs">
        <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full inline-block">
          Memory Card · Latih Daya Ingat Konsep
        </span>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
          {question.question}
        </h2>
        <div className="text-xs text-slate-500 font-medium">
          Langkah Percobaan: <span className="font-bold text-slate-800 font-mono">{movesCount}</span> · Buka dua kartu untuk mencari pasangan yang cocok!
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
        {cards.map((c) => {
          return (
            <div
              key={c.uid}
              onClick={() => handleCardClick(c)}
              className={`h-28 sm:h-32 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-center p-3 text-center select-none shadow-xs ${
                c.isMatched
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold scale-[0.98]'
                  : c.isFlipped
                  ? 'bg-white border-indigo-500 text-slate-900 shadow-md font-semibold'
                  : 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-800 text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {c.isFlipped || c.isMatched ? (
                <div className="space-y-1">
                  <span className="text-xs sm:text-sm font-semibold line-clamp-3 leading-snug">
                    {c.text}
                  </span>
                  {c.isMatched && (
                    <span className="text-[10px] text-emerald-600 font-bold block">✓ Cocok!</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-indigo-200">
                  <Sparkles className="w-6 h-6 mb-1 text-amber-300" />
                  <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-80">
                    KARTU
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in duration-200">
          <div className="text-sm font-bold text-emerald-800">
            Luar Biasa! Semua Pasangan Kartu Berhasil Ditemukan!
          </div>
          <p className="text-xs text-emerald-700">
            Kamu menyelesaikan dalam {movesCount} langkah percobaan. Poin penuh diraih (+{question.points || 100} poin).
          </p>
          <div className="flex justify-center pt-1">
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all"
            >
              <span>Lanjut Soal Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
