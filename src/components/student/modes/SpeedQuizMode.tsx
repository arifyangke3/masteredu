import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Lightbulb } from 'lucide-react';
import { Question } from '../../../types';
import { SoundEngine } from '../../../utils/soundEffects';

interface SpeedQuizModeProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (userAnswer: any, isCorrect: boolean) => void;
  soundEnabled: boolean;
  showExplanationMode: 'always' | 'end_only' | 'never';
  streak: number;
}

export const SpeedQuizMode: React.FC<SpeedQuizModeProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  soundEnabled,
  showExplanationMode,
  streak,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [textInput, setTextInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Reset state on new question
  useEffect(() => {
    setSelectedAnswer(null);
    setTextInput('');
    setIsSubmitted(false);
    setIsCorrect(null);
  }, [question.id]);

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    SoundEngine.playClick(soundEnabled);
    setSelectedAnswer(opt);

    // Evaluate
    const correct = String(opt).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      SoundEngine.playCorrect(soundEnabled);
    } else {
      SoundEngine.playWrong(soundEnabled);
    }

    if (showExplanationMode !== 'always') {
      setTimeout(() => {
        onAnswer(opt, correct);
      }, 500);
    }
  };

  const handleShortAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isSubmitted) return;

    const cleanedUser = textInput.trim().toLowerCase();
    const cleanedKey = String(question.correctAnswer).trim().toLowerCase();
    const correct = cleanedUser === cleanedKey;

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      SoundEngine.playCorrect(soundEnabled);
    } else {
      SoundEngine.playWrong(soundEnabled);
    }

    if (showExplanationMode !== 'always') {
      setTimeout(() => {
        onAnswer(textInput.trim(), correct);
      }, 500);
    }
  };

  const handleEssaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isSubmitted) return;

    SoundEngine.playClick(soundEnabled);
    setIsSubmitted(true);
    // For essay, isCorrect is null/pending
    setTimeout(() => {
      onAnswer(textInput.trim(), true);
    }, 400);
  };

  const handleNext = () => {
    const ans = question.type === 'short_answer' || question.type === 'essay' ? textInput : selectedAnswer;
    onAnswer(ans, isCorrect ?? true);
  };

  return (
    <div className="space-y-6">
      {/* Passage text if reading comprehension */}
      {question.type === 'reading_comprehension' && question.passageText && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Teks Bacaan Pemahaman
          </span>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif">
            {question.passageText}
          </p>
        </div>
      )}

      {/* Image if available */}
      {question.imageUrl && (
        <div className="flex justify-center">
          <img
            src={question.imageUrl}
            alt="Ilustrasi Soal"
            referrerPolicy="no-referrer"
            className="max-h-56 sm:max-h-72 w-auto rounded-2xl object-cover shadow-sm border border-slate-200"
          />
        </div>
      )}

      {/* Question Text */}
      <div className="text-center sm:text-left space-y-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 font-display leading-snug">
          {question.question}
        </h2>
      </div>

      {/* Multiple Choice & Picture Guess Options */}
      {(question.type === 'multiple_choice' ||
        question.type === 'picture_guess' ||
        question.type === 'reading_comprehension') &&
        question.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedAnswer === opt;
              const isTheCorrectKey =
                String(opt).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();

              let btnStyle =
                'bg-white border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/20 active:scale-[0.99]';

              if (isSubmitted) {
                if (isSelected) {
                  btnStyle = isCorrect
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                    : 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-300';
                } else if (isTheCorrectKey && showExplanationMode === 'always') {
                  btnStyle = 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isSubmitted}
                  className={`p-4 rounded-2xl border-2 text-left font-semibold transition-all flex items-center gap-3.5 ${btnStyle}`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                      isSubmitted && isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isSubmitted && isSelected ? (isCorrect ? '✓' : '✕') : letter}
                  </span>
                  <span className="text-sm sm:text-base flex-1 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

      {/* Short Answer Input */}
      {question.type === 'short_answer' && (
        <form onSubmit={handleShortAnswerSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isSubmitted}
              placeholder="Ketikkan jawaban singkat di sini..."
              className="w-full text-base sm:text-lg font-semibold px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white"
              autoFocus
            />
          </div>
          {!isSubmitted && (
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all"
            >
              Kirim Jawaban
            </button>
          )}
        </form>
      )}

      {/* Essay Input */}
      {question.type === 'essay' && (
        <form onSubmit={handleEssaySubmit} className="space-y-4">
          <div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isSubmitted}
              rows={4}
              placeholder="Tuliskan jawaban penjelasan/uraian Anda secara lengkap..."
              className="w-full text-sm p-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-indigo-500 bg-white leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              * Jawaban uraian akan dikirim ke guru untuk diperiksa dan diberi nilai manual.
            </p>
          </div>
          {!isSubmitted && (
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all"
            >
              Kirim Jawaban Uraian
            </button>
          )}
        </form>
      )}

      {/* Explanation Banner (if showExplanationMode === 'always' and isSubmitted) */}
      {isSubmitted && showExplanationMode === 'always' && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600" /> Jawaban Tepat! (+{question.points || 100} poin)
              </span>
            ) : question.type === 'essay' ? (
              <span className="text-xs font-bold text-amber-700">
                Jawaban Terkirim untuk Penilaian Guru
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
              <span>Soal Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
