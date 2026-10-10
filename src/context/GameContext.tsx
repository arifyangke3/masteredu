import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question, GameSettings, GameResult, EducationLevel } from '../types';
import { INITIAL_QUESTIONS, INITIAL_GAMES } from '../data/defaultQuestions';

interface GameContextType {
  questions: Question[];
  games: GameSettings[];
  results: GameResult[];
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Question bank actions
  addQuestion: (q: Omit<Question, 'id'>) => Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  importQuestions: (newQs: Question[]) => void;
  clearQuestions: () => void;
  loadSampleQuestions: () => void;

  // Game management actions
  createGame: (settings: Omit<GameSettings, 'id' | 'code' | 'createdAt'>) => GameSettings;
  updateGame: (id: string, updates: Partial<GameSettings>) => void;
  deleteGame: (id: string) => void;
  duplicateGame: (id: string) => GameSettings;
  getGameByCode: (code: string) => GameSettings | undefined;

  // Student results actions
  saveGameResult: (res: Omit<GameResult, 'id' | 'completedAt'>) => GameResult;
  updateEssayGrade: (resultId: string, questionId: string, pointsAwarded: number, feedback: string) => void;
  deleteResult: (id: string) => void;
  clearResultsByGame: (gameId: string) => void;
  clearAllResults: () => void;
  resetAllData: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEYS = {
  QUESTIONS: 'edugame_questions_v1',
  GAMES: 'edugame_games_v1',
  RESULTS: 'edugame_results_v1',
  SOUND: 'edugame_sound_v1',
};

// Generate 6 character alphanumeric code
function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_QUESTIONS;
  });

  const [games, setGames] = useState<GameSettings[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAMES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_GAMES;
  });

  const [results, setResults] = useState<GameResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESULTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.warn('Gagal menyimpan soal ke localStorage:', e);
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
    } catch (e) {
      console.warn('Gagal menyimpan game ke localStorage:', e);
    }
  }, [games]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    } catch (e) {
      console.warn('Gagal menyimpan hasil ke localStorage:', e);
    }
  }, [results]);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, String(val));
    } catch {}
  };

  // --- Questions Actions ---
  const addQuestion = (qData: Omit<Question, 'id'>): Question => {
    const newQ: Question = {
      ...qData,
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setQuestions(prev => [newQ, ...prev]);
    return newQ;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    // also remove from games
    setGames(prev =>
      prev.map(g => ({
        ...g,
        questionIds: g.questionIds.filter(qId => qId !== id),
      }))
    );
  };

  const importQuestions = (newQs: Question[]) => {
    setQuestions(prev => [...newQs, ...prev]);
  };

  const clearQuestions = () => {
    setQuestions([]);
  };

  const loadSampleQuestions = () => {
    setQuestions(INITIAL_QUESTIONS);
    setGames(INITIAL_GAMES);
  };

  // --- Game Actions ---
  const createGame = (data: Omit<GameSettings, 'id' | 'code' | 'createdAt'>): GameSettings => {
    // Ensure unique code
    let code = generateGameCode();
    while (games.some(g => g.code === code)) {
      code = generateGameCode();
    }

    const newGame: GameSettings = {
      ...data,
      id: `game-${Date.now()}`,
      code,
      createdAt: new Date().toLocaleString('id-ID', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    };
    setGames(prev => [newGame, ...prev]);
    return newGame;
  };

  const updateGame = (id: string, updates: Partial<GameSettings>) => {
    setGames(prev =>
      prev.map(g => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const deleteGame = (id: string) => {
    setGames(prev => prev.filter(g => g.id !== id));
  };

  const duplicateGame = (id: string): GameSettings => {
    const source = games.find(g => g.id === id);
    if (!source) throw new Error('Game tidak ditemukan');

    let code = generateGameCode();
    while (games.some(g => g.code === code)) {
      code = generateGameCode();
    }

    const copy: GameSettings = {
      ...source,
      id: `game-${Date.now()}`,
      code,
      title: `${source.title} (Salinan)`,
      createdAt: new Date().toLocaleString('id-ID', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    };
    setGames(prev => [copy, ...prev]);
    return copy;
  };

  const getGameByCode = (code: string): GameSettings | undefined => {
    const cleaned = (code || '').trim().toUpperCase();
    return games.find(g => g.code.toUpperCase() === cleaned && g.active);
  };

  // --- Student Result Actions ---
  const saveGameResult = (resData: Omit<GameResult, 'id' | 'completedAt'>): GameResult => {
    const result: GameResult = {
      ...resData,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      completedAt: new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };
    setResults(prev => [result, ...prev]);
    return result;
  };

  const updateEssayGrade = (
    resultId: string,
    questionId: string,
    pointsAwarded: number,
    feedback: string
  ) => {
    setResults(prev =>
      prev.map(res => {
        if (res.id !== resultId) return res;

        let deltaScore = 0;
        const updatedAnswers = res.answers.map(ans => {
          if (ans.questionId === questionId) {
            deltaScore = pointsAwarded - ans.pointsEarned;
            return {
              ...ans,
              pointsEarned: pointsAwarded,
              isCorrect: pointsAwarded > 0,
              teacherFeedback: feedback,
            };
          }
          return ans;
        });

        const newScore = Math.max(0, res.score + deltaScore);
        const newPercentage = res.maxScore > 0 ? Math.round((newScore / res.maxScore) * 100) : 0;
        const stillPending = updatedAnswers.some(a => a.type === 'essay' && a.isCorrect === null);

        return {
          ...res,
          score: newScore,
          percentage: newPercentage,
          answers: updatedAnswers,
          hasPendingEssay: stillPending,
        };
      })
    );
  };

  const deleteResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const clearResultsByGame = (gameId: string) => {
    setResults(prev => prev.filter(r => r.gameId !== gameId));
  };

  const clearAllResults = () => {
    setResults([]);
  };

  const resetAllData = () => {
    setQuestions(INITIAL_QUESTIONS);
    setGames(INITIAL_GAMES);
    setResults([]);
  };

  return (
    <GameContext.Provider
      value={{
        questions,
        games,
        results,
        soundEnabled,
        setSoundEnabled,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        importQuestions,
        clearQuestions,
        loadSampleQuestions,
        createGame,
        updateGame,
        deleteGame,
        duplicateGame,
        getGameByCode,
        saveGameResult,
        updateEssayGrade,
        deleteResult,
        clearResultsByGame,
        clearAllResults,
        resetAllData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame harus digunakan di dalam GameProvider');
  }
  return context;
};
