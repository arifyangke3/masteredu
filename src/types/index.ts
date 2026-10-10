export type EducationLevel = 'PAUD' | 'SD' | 'SMP' | 'SMA_SMK' | 'UMUM';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'matching'
  | 'essay'
  | 'picture_guess'
  | 'reading_comprehension';

export type DifficultyLevel = 'mudah' | 'sedang' | 'sulit';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[]; // for multiple_choice & picture_guess
  correctAnswer: string | boolean | string[]; // Answer key
  explanation?: string; // Pembahasan
  educationLevel: EducationLevel;
  grade?: string; // e.g. "Kelas 4", "Kelas 10"
  subject: string; // e.g. "Matematika", "IPA", "Bahasa Indonesia"
  topic: string; // Materi pokok
  difficulty: DifficultyLevel;
  imageUrl?: string; // for picture_guess or visual questions
  passageText?: string; // for reading_comprehension
  matchingPairs?: MatchingPair[]; // for matching
  points?: number; // default 10
}

export type GameMode =
  | 'kuis_cepat'
  | 'benar_salah'
  | 'tebak_gambar'
  | 'matching'
  | 'memory_card'
  | 'roda_keberuntungan'
  | 'jeopardy'
  | 'petualangan_level'
  | 'susun_kata'
  | 'battle_quiz';

export interface GameModeInfo {
  id: GameMode;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  supportedTypes: QuestionType[];
  recommendedLevel: string;
}

export interface GameSettings {
  id: string;
  code: string; // 6-digit game PIN, e.g. "ED5821"
  title: string;
  educationLevel: EducationLevel;
  grade: string;
  subject: string;
  topic: string;
  gameMode: GameMode;
  questionIds: string[];
  questionTimeSeconds: number; // 0 for unlimited, or e.g. 15, 30, 45, 60
  totalTimerMinutes?: number; // 0 for unlimited
  pointsPerCorrect: number;
  penaltyWrong: number;
  livesCount: number; // 0 = unlimited, 1-5 hearts
  bonusCombo: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showExplanation: 'always' | 'end_only' | 'never';
  maxAttempts: number;
  createdAt: string;
  active: boolean;
}

export interface StudentAnswerRecord {
  questionId: string;
  questionText: string;
  type: QuestionType;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean | null; // null for pending essay review
  pointsEarned: number;
  maxPoints: number;
  timeSpentSeconds: number;
  explanation?: string;
  teacherFeedback?: string;
}

export interface GameResult {
  id: string;
  gameId: string;
  gameCode: string;
  gameTitle: string;
  subject: string;
  educationLevel: EducationLevel;
  studentName: string;
  teamName?: string;
  score: number;
  maxScore: number;
  percentage: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  timeSpentSeconds: number;
  completedAt: string;
  answers: StudentAnswerRecord[];
  hasPendingEssay: boolean;
}
