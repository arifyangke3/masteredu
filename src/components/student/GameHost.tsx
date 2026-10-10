import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Clock,
  Zap,
  Volume2,
  VolumeX,
  X,
  Trophy,
  AlertCircle,
} from 'lucide-react';
import { GameSettings, Question, StudentAnswerRecord, GameResult } from '../../types';
import { useGame } from '../../context/GameContext';
import { SoundEngine } from '../../utils/soundEffects';
import { SpeedQuizMode } from './modes/SpeedQuizMode';
import { TrueFalseMode } from './modes/TrueFalseMode';
import { MatchingMode } from './modes/MatchingMode';
import { MemoryCardMode } from './modes/MemoryCardMode';
import { SpinWheelMode } from './modes/SpinWheelMode';
import { LevelQuestMode } from './modes/LevelQuestMode';
import { WordScrambleMode } from './modes/WordScrambleMode';
import { BattleQuizMode } from './modes/BattleQuizMode';
import { JeopardyMode } from './modes/JeopardyMode';
import { GameResultSummary } from './GameResultSummary';

interface GameHostProps {
  game: GameSettings;
  studentName: string;
  teamName?: string;
  onExit: () => void;
}

export const GameHost: React.FC<GameHostProps> = ({
  game,
  studentName,
  teamName,
  onExit,
}) => {
  const { questions: allQuestions, saveGameResult, soundEnabled, setSoundEnabled } = useGame();

  // Prepare game questions
  const [gameQuestions, setGameQuestions] = useState<Question[]>(() => {
    let qs = allQuestions.filter((q) => game.questionIds.includes(q.id));
    if (qs.length === 0) {
      // fallback to first 5 questions if none match
      qs = allQuestions.slice(0, 5);
    }
    if (game.shuffleQuestions) {
      qs = [...qs].sort(() => Math.random() - 0.5);
    }
    // Also optionally shuffle options if multiple choice
    if (game.shuffleOptions) {
      qs = qs.map((q) => {
        if (q.options && q.options.length > 1) {
          return {
            ...q,
            options: [...q.options].sort(() => Math.random() - 0.5),
          };
        }
        return q;
      });
    }
    return qs;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(game.livesCount); // 0 = unlimited
  const [timeLeft, setTimeLeft] = useState(game.questionTimeSeconds);
  const [isGameOver, setIsGameOver] = useState(false);
  const [completedResult, setCompletedResult] = useState<GameResult | null>(null);

  // Time elapsed total
  const [startTime] = useState<number>(Date.now());
  const [recordedAnswers, setRecordedAnswers] = useState<StudentAnswerRecord[]>([]);

  const currentQuestion = gameQuestions[currentIndex];

  // Timer interval
  useEffect(() => {
    if (game.questionTimeSeconds <= 0 || isGameOver || completedResult) return;

    setTimeLeft(game.questionTimeSeconds);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up for current question
          handleTimeUp();
          return 0;
        }
        if (prev <= 4) {
          SoundEngine.playTick(soundEnabled);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isGameOver, completedResult, game.questionTimeSeconds]);

  // Handle timeout
  const handleTimeUp = () => {
    if (!currentQuestion) return;
    SoundEngine.playWrong(soundEnabled);

    const ansRecord: StudentAnswerRecord = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      type: currentQuestion.type,
      userAnswer: '(Waktu Habis)',
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: false,
      pointsEarned: 0,
      maxPoints: currentQuestion.points || game.pointsPerCorrect || 100,
      timeSpentSeconds: game.questionTimeSeconds,
      explanation: currentQuestion.explanation,
    };

    const nextAnswers = [...recordedAnswers, ansRecord];
    setRecordedAnswers(nextAnswers);
    setStreak(0);

    // Decrease lives
    if (lives > 0) {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      if (remainingLives === 0) {
        finishGame(nextAnswers, true);
        return;
      }
    }

    advanceOrFinish(nextAnswers);
  };

  // Handle student answer submission
  const handleAnswer = (userAnswer: any, isCorrect: boolean, bonusMultiplier: number = 1.0) => {
    if (!currentQuestion) return;

    let pointsEarned = 0;
    const basePoints = currentQuestion.points || game.pointsPerCorrect || 100;

    if (currentQuestion.type === 'essay') {
      // Essay is marked pending
      pointsEarned = 0;
    } else if (isCorrect) {
      // Calculate streak bonus
      let streakMult = 1.0;
      if (game.bonusCombo && streak >= 2) {
        streakMult = 1.0 + Math.min(streak * 0.2, 1.0); // max 2x for streak
      }
      pointsEarned = Math.round(basePoints * bonusMultiplier * streakMult);
    } else {
      pointsEarned = -Math.abs(game.penaltyWrong);
    }

    const newScore = Math.max(0, score + pointsEarned);
    setScore(newScore);

    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);

    // Record answer
    const ansRecord: StudentAnswerRecord = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      type: currentQuestion.type,
      userAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: currentQuestion.type === 'essay' ? null : isCorrect,
      pointsEarned,
      maxPoints: basePoints,
      timeSpentSeconds: game.questionTimeSeconds ? game.questionTimeSeconds - timeLeft : 15,
      explanation: currentQuestion.explanation,
    };

    const nextAnswers = [...recordedAnswers, ansRecord];
    setRecordedAnswers(nextAnswers);

    // Lives check
    if (!isCorrect && lives > 0 && currentQuestion.type !== 'essay') {
      const remainingLives = lives - 1;
      setLives(remainingLives);
      if (remainingLives === 0) {
        finishGame(nextAnswers, true);
        return;
      }
    }

    advanceOrFinish(nextAnswers);
  };

  const advanceOrFinish = (answersSoFar: StudentAnswerRecord[]) => {
    if (currentIndex + 1 < gameQuestions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishGame(answersSoFar, false);
    }
  };

  const finishGame = (finalAnswers: StudentAnswerRecord[], died: boolean = false) => {
    setIsGameOver(true);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    const correctCount = finalAnswers.filter((a) => a.isCorrect === true).length;
    const wrongCount = finalAnswers.filter((a) => a.isCorrect === false).length;
    const unansweredCount = gameQuestions.length - finalAnswers.length;

    const totalMaxScore = gameQuestions.reduce(
      (acc, q) => acc + (q.points || game.pointsPerCorrect || 100),
      0
    );

    const finalPercentage =
      totalMaxScore > 0 ? Math.min(100, Math.round((score / totalMaxScore) * 100)) : 0;

    const hasPendingEssay = finalAnswers.some((a) => a.type === 'essay' && a.isCorrect === null);

    const saved = saveGameResult({
      gameId: game.id,
      gameCode: game.code,
      gameTitle: game.title,
      subject: game.subject,
      educationLevel: game.educationLevel,
      studentName,
      teamName,
      score,
      maxScore: totalMaxScore,
      percentage: finalPercentage,
      totalQuestions: gameQuestions.length,
      correctCount,
      wrongCount,
      unansweredCount,
      timeSpentSeconds: elapsedSeconds,
      answers: finalAnswers,
      hasPendingEssay,
    });

    setCompletedResult(saved);
  };

  // If game is completed or lives ran out
  if (completedResult) {
    return (
      <GameResultSummary
        result={completedResult}
        onPlayAgain={() => {
          // Restart game state
          setCompletedResult(null);
          setIsGameOver(false);
          setCurrentIndex(0);
          setScore(0);
          setStreak(0);
          setLives(game.livesCount);
          setRecordedAnswers([]);
        }}
        onBackToPortal={onExit}
        soundEnabled={soundEnabled}
      />
    );
  }

  // Active Game Header HUD
  const progressPercent = Math.round(((currentIndex + 1) / gameQuestions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top HUD Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Game Title & Student Identity */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (window.confirm('Keluar dari permainan sekarang? Progres saat ini akan terhenti.')) {
                  onExit();
                }
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Keluar Permainan"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 font-display line-clamp-1">
                  {game.title}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700">
                  {game.code}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Pemain: <span className="font-semibold text-slate-800">{studentName}</span>
                {teamName && <span> (Regu: {teamName})</span>}
              </div>
            </div>
          </div>

          {/* Right: Score, Streak & Lives HUD */}
          <div className="flex items-center gap-4">
            {/* Lives */}
            {game.livesCount > 0 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: game.livesCount }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 ${
                      i < lives
                        ? 'text-rose-500 fill-rose-500'
                        : 'text-slate-200 fill-slate-100'
                    } transition-colors`}
                  />
                ))}
              </div>
            )}

            {/* Streak Combo Badge */}
            {streak >= 2 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 border border-amber-200 rounded-full text-xs font-bold text-amber-900">
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span className="font-mono">x{streak} Combo!</span>
              </div>
            )}

            {/* Live Score */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Skor
              </span>
              <span className="text-base font-extrabold text-indigo-600 font-mono tabular-nums">
                {score}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              title="Suara FX"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar & Question Step */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Soal <strong className="text-slate-800">{currentIndex + 1}</strong> dari{' '}
              <strong>{gameQuestions.length}</strong>
            </span>
            {game.questionTimeSeconds > 0 && (
              <span
                className={`flex items-center gap-1 font-mono font-bold ${
                  timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-600'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </span>
            )}
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Render Specific Mode */}
      {game.gameMode === 'benar_salah' ? (
        <TrueFalseMode
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={gameQuestions.length}
          onAnswer={handleAnswer}
          soundEnabled={soundEnabled}
          showExplanationMode={game.showExplanation}
        />
      ) : game.gameMode === 'matching' ? (
        <MatchingMode
          question={currentQuestion}
          onAnswer={handleAnswer}
          soundEnabled={soundEnabled}
          showExplanationMode={game.showExplanation}
        />
      ) : game.gameMode === 'memory_card' ? (
        <MemoryCardMode
          question={currentQuestion}
          onAnswer={handleAnswer}
          soundEnabled={soundEnabled}
          showExplanationMode={game.showExplanation}
        />
      ) : game.gameMode === 'roda_keberuntungan' ? (
        <SpinWheelMode
          question={currentQuestion}
          onAnswer={handleAnswer}
          soundEnabled={soundEnabled}
          showExplanationMode={game.showExplanation}
        />
      ) : game.gameMode === 'petualangan_level' ? (
        <LevelQuestMode
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={gameQuestions.length}
          onAnswer={handleAnswer}
          soundEnabled={soundEnabled}
          showExplanationMode={game.showExplanation}
          streak={streak}
        />
      ) : game.gameMode === 'susun_kata' ? (
        <WordScrambleMode
          question={currentQuestion}
          onAnswer={handleAnswer}
          soundEnabled={soundEnabled}
          showExplanationMode={game.showExplanation}
        />
      ) : game.gameMode === 'battle_quiz' ? (
        <BattleQuizMode
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={gameQuestions.length}
          onAnswer={handleAnswer}
          soundEnabled={soundEnabled}
          showExplanationMode={game.showExplanation}
          streak={streak}
          lives={lives}
          score={score}
        />
      ) : game.gameMode === 'jeopardy' ? (
        <JeopardyMode
          questions={gameQuestions}
          onCompleteGame={(answers) => {
            finishGame(answers, false);
          }}
          soundEnabled={soundEnabled}
          showExplanationMode={game.showExplanation}
        />
      ) : (
        /* Default: Kuis Cepat & Tebak Gambar */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <SpeedQuizMode
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={gameQuestions.length}
            onAnswer={handleAnswer}
            soundEnabled={soundEnabled}
            showExplanationMode={game.showExplanation}
            streak={streak}
          />
        </div>
      )}
    </div>
  );
};
