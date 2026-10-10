import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Home,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GameResult } from '../../types';
import { SoundEngine } from '../../utils/soundEffects';

interface GameResultSummaryProps {
  result: GameResult;
  onPlayAgain: () => void;
  onBackToPortal: () => void;
  soundEnabled: boolean;
}

export const GameResultSummary: React.FC<GameResultSummaryProps> = ({
  result,
  onPlayAgain,
  onBackToPortal,
  soundEnabled,
}) => {
  const [showFullReview, setShowFullReview] = React.useState(true);

  useEffect(() => {
    // Trigger confetti celebration if score >= 60%
    if (result.percentage >= 60) {
      SoundEngine.playFanfare(soundEnabled);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [result.percentage, soundEnabled]);

  // Star rating: 1 to 3 stars
  const starsCount = result.percentage >= 85 ? 3 : result.percentage >= 60 ? 2 : 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Victory Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center shadow-sm relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-xs">
          <Trophy className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Permainan Selesai!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Hebat sekali, <span className="font-bold text-slate-800">{result.studentName}</span>! Hasil belajarmu telah terekam.
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 ${
                starIdx <= starsCount
                  ? 'text-amber-400 fill-amber-400 scale-110'
                  : 'text-slate-200 fill-slate-100'
              } transition-transform`}
            />
          ))}
        </div>

        {/* Big Score Badge */}
        <div className="inline-block bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl my-2">
          <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 font-display tabular-nums">
            {result.score} <span className="text-sm font-semibold text-slate-400">/ {result.maxScore}</span>
          </div>
          <div className="text-xs font-bold text-slate-600 mt-0.5">
            Nilai Akhir: <span className="text-indigo-700">{result.percentage}%</span>
          </div>
        </div>

        {/* Pending Essay Notice */}
        {result.hasPendingEssay && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
            * Kamu telah menjawab soal Uraian/Essay. Skor akhir dapat bertambah setelah guru memberikan penilaian manual.
          </div>
        )}

        {/* Stat metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block">Benar</span>
            <span className="text-lg font-bold text-emerald-600 font-display tabular-nums">
              {result.correctCount}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block">Salah</span>
            <span className="text-lg font-bold text-rose-600 font-display tabular-nums">
              {result.wrongCount}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block">Total Soal</span>
            <span className="text-lg font-bold text-slate-800 font-display tabular-nums">
              {result.totalQuestions}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block">Waktu Selesai</span>
            <span className="text-lg font-bold text-sky-600 font-display tabular-nums">
              {result.timeSpentSeconds}s
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs hover:shadow transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mainkan Lagi</span>
          </button>
          <button
            onClick={onBackToPortal}
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Pilih Game Lain</span>
          </button>
        </div>
      </div>

      {/* Answer & Explanation Review Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <button
          onClick={() => setShowFullReview(!showFullReview)}
          className="w-full flex items-center justify-between text-left focus:outline-none"
        >
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Review Lembar Jawaban & Pembahasan
            </h3>
            <p className="text-xs text-slate-500">
              Pelajari kembali setiap butir pertanyaan untuk penguatan pemahaman materi.
            </p>
          </div>
          <div className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            {showFullReview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showFullReview && (
          <div className="divide-y divide-slate-100 pt-2 space-y-3">
            {result.answers.map((ans, idx) => (
              <div
                key={ans.questionId || idx}
                className="pt-3 pb-2 space-y-2 first:pt-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {ans.questionText}
                    </span>
                  </div>
                  <div>
                    {ans.isCorrect === true ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Benar (+{ans.pointsEarned})
                      </span>
                    ) : ans.isCorrect === false ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        <XCircle className="w-3.5 h-3.5" /> Salah
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        <HelpCircle className="w-3.5 h-3.5" /> Menunggu Guru
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pl-7">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold block">Jawaban Kamu:</span>
                    <span className="font-semibold text-slate-800">
                      {typeof ans.userAnswer === 'object'
                        ? JSON.stringify(ans.userAnswer)
                        : String(ans.userAnswer ?? '-')}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold block">Kunci Jawaban:</span>
                    <span className="font-semibold text-emerald-700">
                      {typeof ans.correctAnswer === 'object'
                        ? JSON.stringify(ans.correctAnswer)
                        : String(ans.correctAnswer ?? '-')}
                    </span>
                  </div>
                </div>

                {ans.explanation && (
                  <div className="text-xs pl-7 text-slate-600 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                    <span className="font-bold text-indigo-900 block mb-0.5">Pembahasan:</span>
                    {ans.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
