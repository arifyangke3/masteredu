import React from 'react';
import { Flame, Heart, Zap, Shield, ArrowRight } from 'lucide-react';
import { Question } from '../../../types';
import { SpeedQuizMode } from './SpeedQuizMode';

interface BattleQuizModeProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (userAnswer: any, isCorrect: boolean) => void;
  soundEnabled: boolean;
  showExplanationMode: 'always' | 'end_only' | 'never';
  streak: number;
  lives: number;
  score: number;
}

export const BattleQuizMode: React.FC<BattleQuizModeProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  soundEnabled,
  showExplanationMode,
  streak,
  lives,
  score,
}) => {
  return (
    <div className="space-y-6">
      {/* Battle Status Strip */}
      <div className="bg-gradient-to-r from-orange-600 via-rose-600 to-red-600 text-white rounded-3xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-amber-300">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-orange-200 uppercase tracking-wider">
                Mode Tantangan Berwaktu / Survival
              </div>
              <div className="text-base font-extrabold font-display">
                Ronde Pertempuran #{questionNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {streak > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-amber-950 rounded-full text-xs font-extrabold shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>COMBO x{streak}!</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-[11px] text-orange-200">Skor Pertarungan</div>
              <div className="text-lg font-extrabold font-mono tabular-nums">{score} PTS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <SpeedQuizMode
          question={question}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          onAnswer={onAnswer}
          soundEnabled={soundEnabled}
          showExplanationMode={showExplanationMode}
          streak={streak}
        />
      </div>
    </div>
  );
};
