import React, { useState, useEffect } from 'react';
import { RotateCcw, Check, ArrowRight, Lightbulb } from 'lucide-react';
import { Question } from '../../../types';
import { SoundEngine } from '../../../utils/soundEffects';

interface WordScrambleModeProps {
  question: Question;
  onAnswer: (userAnswer: string, isCorrect: boolean) => void;
  soundEnabled: boolean;
  showExplanationMode: 'always' | 'end_only' | 'never';
}

interface LetterTile {
  id: string;
  char: string;
  isUsed: boolean;
}

export const WordScrambleMode: React.FC<WordScrambleModeProps> = ({
  question,
  onAnswer,
  soundEnabled,
  showExplanationMode,
}) => {
  const targetWord = String(question.correctAnswer || 'JAWABAN').toUpperCase().replace(/[^A-Z0-9]/g, '');

  const [tiles, setTiles] = useState<LetterTile[]>([]);
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    // Generate scrambled tiles from targetWord
    const chars = targetWord.split('');
    const rawTiles = chars.map((ch, idx) => ({
      id: `tile-${idx}-${ch}`,
      char: ch,
      isUsed: false,
    }));
    // Shuffle
    setTiles([...rawTiles].sort(() => Math.random() - 0.5));
    setSelectedTileIds([]);
    setIsSubmitted(false);
    setIsCorrect(null);
  }, [question.id, targetWord]);

  const handleTileClick = (tile: LetterTile) => {
    if (isSubmitted || tile.isUsed) return;
    SoundEngine.playClick(soundEnabled);

    setSelectedTileIds([...selectedTileIds, tile.id]);
    setTiles((prev) =>
      prev.map((t) => (t.id === tile.id ? { ...t, isUsed: true } : t))
    );
  };

  const handleRemoveFromSlot = (tileId: string) => {
    if (isSubmitted) return;
    SoundEngine.playClick(soundEnabled);

    setSelectedTileIds(selectedTileIds.filter((id) => id !== tileId));
    setTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, isUsed: false } : t))
    );
  };

  const handleReset = () => {
    if (isSubmitted) return;
    setSelectedTileIds([]);
    setTiles((prev) => prev.map((t) => ({ ...t, isUsed: false })));
  };

  const assembledWord = selectedTileIds
    .map((id) => tiles.find((t) => t.id === id)?.char || '')
    .join('');

  const handleCheck = () => {
    if (assembledWord.length === 0) return;

    const correct = assembledWord === targetWord;
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      SoundEngine.playCorrect(soundEnabled);
    } else {
      SoundEngine.playWrong(soundEnabled);
    }

    if (showExplanationMode !== 'always') {
      setTimeout(() => {
        onAnswer(assembledWord, correct);
      }, 600);
    }
  };

  const handleNext = () => {
    onAnswer(assembledWord, isCorrect ?? false);
  };

  return (
    <div className="space-y-6">
      {/* Header Clue Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-2 shadow-xs">
        <span className="text-[11px] font-bold tracking-wider uppercase text-violet-600 bg-violet-50 px-3 py-1 rounded-full inline-block">
          Susun Kata · Word Scramble
        </span>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
          {question.question}
        </h2>
        <p className="text-xs text-slate-500">
          Susun huruf-huruf acak di bawah ini menjadi kata konsep yang tepat ({targetWord.length} huruf).
        </p>
      </div>

      {/* Word Placement Slots */}
      <div className="flex flex-wrap items-center justify-center gap-2 min-h-14 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        {selectedTileIds.length === 0 ? (
          <span className="text-xs text-slate-400 italic">
            Klik huruf di bawah untuk menyusun kata...
          </span>
        ) : (
          selectedTileIds.map((tileId) => {
            const tile = tiles.find((t) => t.id === tileId);
            return (
              <button
                key={tileId}
                onClick={() => handleRemoveFromSlot(tileId)}
                disabled={isSubmitted}
                className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl bg-indigo-600 text-white font-extrabold text-lg sm:text-xl font-display flex items-center justify-center shadow-sm hover:bg-rose-600 transition-all active:scale-95"
                title="Klik untuk menghapus huruf"
              >
                {tile?.char}
              </button>
            );
          })
        )}
      </div>

      {/* Available Letter Bank */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-500 text-center">
          Pilihan Huruf Tersedia:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md mx-auto">
          {tiles.map((t) => {
            return (
              <button
                key={t.id}
                onClick={() => handleTileClick(t)}
                disabled={t.isUsed || isSubmitted}
                className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 font-extrabold text-lg sm:text-xl font-display flex items-center justify-center transition-all ${
                  t.isUsed
                    ? 'border-slate-200 bg-slate-100 text-slate-300 cursor-not-allowed opacity-40'
                    : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-500 hover:scale-105 active:scale-95 shadow-xs'
                }`}
              >
                {t.char}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      {!isSubmitted && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Huruf</span>
          </button>

          <button
            onClick={handleCheck}
            disabled={assembledWord.length < targetWord.length}
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-all"
          >
            Periksa Kata ({assembledWord.length}/{targetWord.length})
          </button>
        </div>
      )}

      {/* Explanation Banner */}
      {isSubmitted && showExplanationMode === 'always' && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600" /> Kata Tersusun Sempurna! (+{question.points || 100} poin)
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-700">
                Kurang Tepat (Kunci yang benar: {targetWord})
              </span>
            )}
          </div>

          {question.explanation && (
            <div className="text-xs text-slate-700 leading-relaxed pt-1">
              <span className="font-bold text-slate-900">Pembahasan: </span>
              {question.explanation}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
            >
              <span>Soal Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
