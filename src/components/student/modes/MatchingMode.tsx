import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, RotateCcw, Link2 } from 'lucide-react';
import { Question, MatchingPair } from '../../../types';
import { SoundEngine } from '../../../utils/soundEffects';

interface MatchingModeProps {
  question: Question;
  onAnswer: (userAnswer: any, isCorrect: boolean) => void;
  soundEnabled: boolean;
  showExplanationMode: 'always' | 'end_only' | 'never';
}

export const MatchingMode: React.FC<MatchingModeProps> = ({
  question,
  onAnswer,
  soundEnabled,
  showExplanationMode,
}) => {
  const rawPairs: MatchingPair[] = question.matchingPairs || [
    { id: '1', left: 'Konsep 1', right: 'Definisi 1' },
    { id: '2', left: 'Konsep 2', right: 'Definisi 2' },
    { id: '3', left: 'Konsep 3', right: 'Definisi 3' },
  ];

  // Shuffled right items
  const [shuffledRights, setShuffledRights] = useState<{ id: string; text: string }[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  // Matches: map of leftId -> rightId
  const [userMatches, setUserMatches] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [allMatchedCorrectly, setAllMatchedCorrectly] = useState<boolean | null>(null);

  useEffect(() => {
    // Shuffle the right side
    const rights = rawPairs.map((p) => ({ id: p.id, text: p.right }));
    const shuffled = [...rights].sort(() => Math.random() - 0.5);
    setShuffledRights(shuffled);
    setUserMatches({});
    setSelectedLeftId(null);
    setIsSubmitted(false);
    setAllMatchedCorrectly(null);
  }, [question.id]);

  const handleSelectLeft = (leftId: string) => {
    if (isSubmitted) return;
    SoundEngine.playClick(soundEnabled);
    if (selectedLeftId === leftId) {
      setSelectedLeftId(null);
    } else {
      setSelectedLeftId(leftId);
    }
  };

  const handleSelectRight = (rightId: string) => {
    if (isSubmitted || !selectedLeftId) return;
    SoundEngine.playClick(soundEnabled);

    // If this rightId was previously matched to another left, remove that old match
    const newMatches = { ...userMatches };
    for (const lId in newMatches) {
      if (newMatches[lId] === rightId) {
        delete newMatches[lId];
      }
    }

    newMatches[selectedLeftId] = rightId;
    setUserMatches(newMatches);
    setSelectedLeftId(null);
  };

  const handleRemoveMatch = (leftId: string) => {
    if (isSubmitted) return;
    const newMatches = { ...userMatches };
    delete newMatches[leftId];
    setUserMatches(newMatches);
  };

  const handleResetMatches = () => {
    if (isSubmitted) return;
    setUserMatches({});
    setSelectedLeftId(null);
  };

  const handleCheckAnswer = () => {
    if (Object.keys(userMatches).length < rawPairs.length) {
      alert('Pasangkan semua butir sebelum memeriksa!');
      return;
    }

    // Evaluate: in correct pair, left.id === right.id
    let correctCount = 0;
    rawPairs.forEach((p) => {
      if (userMatches[p.id] === p.id) {
        correctCount++;
      }
    });

    const isFullyCorrect = correctCount === rawPairs.length;
    setAllMatchedCorrectly(isFullyCorrect);
    setIsSubmitted(true);

    if (isFullyCorrect) {
      SoundEngine.playCorrect(soundEnabled);
    } else {
      SoundEngine.playWrong(soundEnabled);
    }

    if (showExplanationMode !== 'always') {
      setTimeout(() => {
        onAnswer(userMatches, isFullyCorrect);
      }, 600);
    }
  };

  const handleNext = () => {
    onAnswer(userMatches, allMatchedCorrectly ?? false);
  };

  // Color palette for paired items
  const PAIR_COLORS = [
    'border-indigo-500 bg-indigo-50 text-indigo-900',
    'border-emerald-500 bg-emerald-50 text-emerald-900',
    'border-amber-500 bg-amber-50 text-amber-900',
    'border-purple-500 bg-purple-50 text-purple-900',
    'border-cyan-500 bg-cyan-50 text-cyan-900',
  ];

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-2 shadow-xs">
        <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">
          Matching Game · Hubungkan Pasangan
        </span>
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
          {question.question}
        </h2>
        <p className="text-xs text-slate-500">
          Klik butir di kolom kiri, lalu klik pasangannya di kolom kanan untuk menghubungkan.
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column (Konsep / Istilah) */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 px-1 flex items-center justify-between">
            <span>Kolom Istilah / Kiri</span>
            <span className="text-slate-400 font-normal">
              {Object.keys(userMatches).length} / {rawPairs.length} Terpasang
            </span>
          </div>

          <div className="space-y-2.5">
            {rawPairs.map((pair, idx) => {
              const isSelected = selectedLeftId === pair.id;
              const matchedRightId = userMatches[pair.id];
              const pairColorClass = matchedRightId
                ? PAIR_COLORS[idx % PAIR_COLORS.length]
                : '';

              let statusBorder = 'border-slate-200 bg-white hover:border-indigo-300';
              if (isSelected) statusBorder = 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/30';
              else if (matchedRightId) statusBorder = pairColorClass;

              if (isSubmitted) {
                const isCorrect = matchedRightId === pair.id;
                statusBorder = isCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-rose-400 bg-rose-50 text-rose-900';
              }

              return (
                <div
                  key={pair.id}
                  onClick={() => handleSelectLeft(pair.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${statusBorder}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold">{pair.left}</span>
                  </div>

                  {matchedRightId && !isSubmitted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMatch(pair.id);
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-600 p-1 rounded"
                    >
                      Batal
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (Definisi / Jawaban) */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 px-1">
            <span>Kolom Pasangan / Kanan</span>
          </div>

          <div className="space-y-2.5">
            {shuffledRights.map((item, rIdx) => {
              // Check which leftId is matched to this rightId
              const matchedLeftId = Object.keys(userMatches).find(
                (lId) => userMatches[lId] === item.id
              );
              const leftIndex = rawPairs.findIndex((p) => p.id === matchedLeftId);
              const pairColorClass =
                matchedLeftId && leftIndex >= 0
                  ? PAIR_COLORS[leftIndex % PAIR_COLORS.length]
                  : '';

              let statusBorder = 'border-slate-200 bg-white hover:border-sky-300';
              if (matchedLeftId) statusBorder = pairColorClass;

              if (isSubmitted && matchedLeftId) {
                const isCorrect = matchedLeftId === item.id;
                statusBorder = isCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-rose-400 bg-rose-50 text-rose-900';
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectRight(item.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${statusBorder}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + rIdx)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium">{item.text}</span>
                  </div>

                  {matchedLeftId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200">
                      Pasangan #{leftIndex + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      {!isSubmitted && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleResetMatches}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Atur Ulang Pasangan</span>
          </button>

          <button
            onClick={handleCheckAnswer}
            disabled={Object.keys(userMatches).length < rawPairs.length}
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-all"
          >
            Periksa Pasangan ({Object.keys(userMatches).length}/{rawPairs.length})
          </button>
        </div>
      )}

      {/* Explanation Banner */}
      {isSubmitted && showExplanationMode === 'always' && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            {allMatchedCorrectly ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600" /> Semua Pasangan Tepat! (+{question.points || 100} poin)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <X className="w-4 h-4 text-rose-600" /> Beberapa Pasangan Belum Sesuai
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
