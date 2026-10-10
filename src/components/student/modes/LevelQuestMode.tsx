import React from 'react';
import { MapPin, Star, ShieldCheck, Trophy } from 'lucide-react';
import { Question } from '../../../types';
import { SpeedQuizMode } from './SpeedQuizMode';

interface LevelQuestModeProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (userAnswer: any, isCorrect: boolean) => void;
  soundEnabled: boolean;
  showExplanationMode: 'always' | 'end_only' | 'never';
  streak: number;
}

export const LevelQuestMode: React.FC<LevelQuestModeProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  soundEnabled,
  showExplanationMode,
  streak,
}) => {
  return (
    <div className="space-y-6">
      {/* Visual Level Roadmap Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[320px] max-w-xl mx-auto px-4 relative">
          {/* Connector Line behind nodes */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 z-0" />

          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isCompleted = idx + 1 < questionNumber;
            const isCurrent = idx + 1 === questionNumber;
            const isBoss = idx + 1 === totalQuestions;

            return (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110 shadow-sm'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Star className="w-4 h-4 fill-white text-white" />
                  ) : isBoss ? (
                    <Trophy className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 ${
                    isCurrent ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  {isBoss ? 'Final' : `Lvl ${idx + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quest Stage Challenge Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              ★
            </span>
            <span className="text-xs font-bold text-slate-800">
              Rintangan Level #{questionNumber} dari {totalQuestions}
            </span>
          </div>
          <span className="text-xs font-semibold text-indigo-600">
            {question.topic}
          </span>
        </div>

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
