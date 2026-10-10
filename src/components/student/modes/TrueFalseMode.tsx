import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import { Question } from '../../../types';
import { SoundEngine } from '../../../utils/soundEffects';

interface TrueFalseModeProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (userAnswer: boolean, isCorrect: boolean) => void;
  soundEnabled: boolean;
  showExplanationMode: 'always' | 'end_only' | 'never';
}

export const TrueFalseMode: React.FC<TrueFalseModeProps> = ({
  question,
  onAnswer,
  soundEnabled,
  showExplanationMode,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(null);
  }, [question.id]);

  const handleSelect = (userVal: boolean) => {
    if (isSubmitted) return;
    setSelectedAnswer(userVal);

    const actualKey = Boolean(question.correctAnswer);
    const correct = userVal === actualKey;
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      SoundEngine.playCorrect(soundEnabled);
    } else {
      SoundEngine.playWrong(soundEnabled);
    }

    if (showExplanationMode !== 'always') {
      setTimeout(() => {
        onAnswer(userVal, correct);
      }, 500);
    }
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      onAnswer(selectedAnswer, isCorrect ?? false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center space-y-4 shadow-xs">
        <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">
          Fakta atau Mitos? Tentukan!
        </span>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-display leading-relaxed max-w-xl mx-auto">
          "{question.question}"
        </h2>
      </div>

      {/* Big Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* BENAR Button */}
        <button
          onClick={() => handleSelect(true)}
          disabled={isSubmitted}
          className={`py-8 px-6 rounded-3xl border-3 flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isSubmitted
              ? selectedAnswer === true
                ? isCorrect
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg'
                  : 'bg-rose-600 text-white border-rose-700 shadow-lg'
                : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
              : 'bg-white hover:bg-emerald-50/50 border-emerald-500 text-emerald-800 hover:border-emerald-600 shadow-sm'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold font-display tracking-tight">
            BENAR
          </span>
          <span className="text-xs text-slate-500 font-medium">Pernyataan ini sesuai fakta</span>
        </button>

        {/* SALAH Button */}
        <button
          onClick={() => handleSelect(false)}
          disabled={isSubmitted}
          className={`py-8 px-6 rounded-3xl border-3 flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isSubmitted
              ? selectedAnswer === false
                ? isCorrect
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg'
                  : 'bg-rose-600 text-white border-rose-700 shadow-lg'
                : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
              : 'bg-white hover:bg-rose-50/50 border-rose-500 text-rose-800 hover:border-rose-600 shadow-sm'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-1">
            <X className="w-8 h-8 stroke-[3]" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold font-display tracking-tight">
            SALAH
          </span>
          <span className="text-xs text-slate-500 font-medium">Pernyataan ini tidak tepat</span>
        </button>
      </div>

      {/* Explanation Banner */}
      {isSubmitted && showExplanationMode === 'always' && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600" /> Tepat Sekali! (+{question.points || 100} poin)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <X className="w-4 h-4 text-rose-600" /> Kurang Tepat
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
              <span>Lanjut Soal Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
