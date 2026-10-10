import React, { useState } from 'react';
import { LayoutGrid, ArrowLeft } from 'lucide-react';
import { Question } from '../../../types';
import { SpeedQuizMode } from './SpeedQuizMode';

interface JeopardyModeProps {
  questions: Question[];
  onCompleteGame: (answersRecord: any[]) => void;
  soundEnabled: boolean;
  showExplanationMode: 'always' | 'end_only' | 'never';
}

interface TileState {
  questionId: string;
  points: number;
  isAnswered: boolean;
  isCorrect?: boolean;
}

export const JeopardyMode: React.FC<JeopardyModeProps> = ({
  questions,
  onCompleteGame,
  soundEnabled,
  showExplanationMode,
}) => {
  const [tiles, setTiles] = useState<TileState[]>(() =>
    questions.map((q, idx) => ({
      questionId: q.id,
      points: (idx + 1) * 100,
      isAnswered: false,
    }))
  );

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [recordedAnswers, setRecordedAnswers] = useState<any[]>([]);

  const activeQuestion = questions.find((q) => q.id === activeQuestionId);

  const handleSelectTile = (qId: string) => {
    const tile = tiles.find((t) => t.questionId === qId);
    if (!tile || tile.isAnswered) return;
    setActiveQuestionId(qId);
  };

  const handleAnswerQuestion = (userAnswer: any, isCorrect: boolean) => {
    if (!activeQuestion) return;

    const tile = tiles.find((t) => t.questionId === activeQuestion.id);
    const pts = isCorrect ? (tile?.points || 100) : 0;

    const newRecord = {
      questionId: activeQuestion.id,
      questionText: activeQuestion.question,
      type: activeQuestion.type,
      userAnswer,
      correctAnswer: activeQuestion.correctAnswer,
      isCorrect,
      pointsEarned: pts,
      maxPoints: tile?.points || 100,
      timeSpentSeconds: 15,
      explanation: activeQuestion.explanation,
    };

    const updatedRecords = [...recordedAnswers, newRecord];
    setRecordedAnswers(updatedRecords);

    // Update tile
    const updatedTiles = tiles.map((t) =>
      t.questionId === activeQuestion.id
        ? { ...t, isAnswered: true, isCorrect }
        : t
    );
    setTiles(updatedTiles);
    setActiveQuestionId(null);

    // If all tiles are answered, complete game
    if (updatedTiles.every((t) => t.isAnswered)) {
      onCompleteGame(updatedRecords);
    }
  };

  return (
    <div className="space-y-6">
      {/* If a question is currently open */}
      {activeQuestion ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              onClick={() => setActiveQuestionId(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Papan Jeopardy
            </button>
            <span className="text-xs font-bold text-amber-600 font-mono">
              Nilai: {tiles.find((t) => t.questionId === activeQuestion.id)?.points} POIN
            </span>
          </div>

          <SpeedQuizMode
            question={activeQuestion}
            questionNumber={recordedAnswers.length + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswerQuestion}
            soundEnabled={soundEnabled}
            showExplanationMode={showExplanationMode}
            streak={0}
          />
        </div>
      ) : (
        /* The Jeopardy Matrix Board */
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-2 shadow-xs">
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block">
              Papan Tantangan Jeopardy
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
              Pilih Kotak Poin Pilihanmu!
            </h2>
            <p className="text-xs text-slate-500">
              Jawab pertanyaan pada setiap kotak untuk mengumpulkan skor setinggi-tingginya.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tiles.map((tile, idx) => {
              const q = questions.find((item) => item.id === tile.questionId);
              return (
                <button
                  key={tile.questionId}
                  onClick={() => handleSelectTile(tile.questionId)}
                  disabled={tile.isAnswered}
                  className={`p-6 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 shadow-xs ${
                    tile.isAnswered
                      ? tile.isCorrect
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 opacity-70'
                        : 'border-rose-300 bg-rose-50 text-rose-800 opacity-70'
                      : 'border-amber-400 bg-amber-500 hover:bg-amber-600 text-white font-extrabold hover:scale-105 active:scale-95'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 truncate max-w-full">
                    {q?.topic || `Soal #${idx + 1}`}
                  </span>
                  <span className="text-2xl font-black font-display tracking-tight">
                    {tile.isAnswered ? (tile.isCorrect ? '✓' : '✕') : `$${tile.points}`}
                  </span>
                  {tile.isAnswered && (
                    <span className="text-[10px] font-semibold">
                      {tile.isCorrect ? `+${tile.points} Poin` : '0 Poin'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
