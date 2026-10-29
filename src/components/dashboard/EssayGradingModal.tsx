import React, { useState } from 'react';
import { X, Check, Award, MessageSquare } from 'lucide-react';
import { GameResult, StudentAnswerRecord } from '../../types';

interface EssayGradingModalProps {
  result: GameResult;
  onClose: () => void;
  onSaveGrade: (resultId: string, questionId: string, pointsAwarded: number, feedback: string) => void;
}

export const EssayGradingModal: React.FC<EssayGradingModalProps> = ({
  result,
  onClose,
  onSaveGrade,
}) => {
  const essayAnswers = result.answers.filter((a) => a.type === 'essay');

  const [activeQuestionId, setActiveQuestionId] = useState<string>(
    essayAnswers[0]?.questionId || ''
  );

  const currentAnswer = essayAnswers.find((a) => a.questionId === activeQuestionId);

  const [awardedPoints, setAwardedPoints] = useState<number>(
    currentAnswer ? currentAnswer.pointsEarned : 0
  );
  const [feedback, setFeedback] = useState<string>(
    currentAnswer?.teacherFeedback || ''
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSelectQuestion = (qId: string) => {
    setActiveQuestionId(qId);
    const ans = essayAnswers.find((a) => a.questionId === qId);
    if (ans) {
      setAwardedPoints(ans.pointsEarned);
      setFeedback(ans.teacherFeedback || '');
      setSaveSuccess(false);
    }
  };

  const handleSaveCurrent = () => {
    if (!currentAnswer) return;
    onSaveGrade(result.id, currentAnswer.questionId, awardedPoints, feedback);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  if (essayAnswers.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
          <p className="text-sm font-semibold text-slate-800">
            Tidak ada butir soal uraian/essay pada sesi pengerjaan ini.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Penilaian Manual Soal Uraian / Essay
            </h3>
            <p className="text-xs text-slate-500">
              Siswa: <span className="font-semibold text-slate-800">{result.studentName}</span> · Game: {result.gameTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Selector Tabs */}
        {essayAnswers.length > 1 && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
            {essayAnswers.map((a, i) => (
              <button
                key={a.questionId}
                onClick={() => handleSelectQuestion(a.questionId)}
                className={`py-2 px-3 text-xs font-bold rounded-t-lg transition-colors ${
                  activeQuestionId === a.questionId
                    ? 'bg-white text-indigo-700 border-t border-x border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Soal Uraian #{i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {currentAnswer && (
          <div className="p-6 space-y-4">
            {/* Question Text */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Pertanyaan Soal
              </span>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                {currentAnswer.questionText}
              </p>
            </div>

            {/* Rubrik / Reference Key */}
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                Pedoman Kunci Jawaban / Rubrik Acuan Guru
              </span>
              <p className="text-xs text-amber-950 leading-relaxed">
                {String(currentAnswer.correctAnswer || 'Tidak ada rubrik khusus')}
              </p>
            </div>

            {/* Student's actual answer */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">
                Jawaban Siswa ({result.studentName})
              </span>
              <p className="text-xs font-medium text-slate-900 bg-white p-3 rounded-lg border border-indigo-100 whitespace-pre-wrap leading-relaxed">
                {currentAnswer.userAnswer ? String(currentAnswer.userAnswer) : '(Tidak dijawab)'}
              </p>
            </div>

            {/* Grading input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Beri Poin Nilai (Maks: {currentAnswer.maxPoints} poin)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={currentAnswer.maxPoints}
                    value={awardedPoints}
                    onChange={(e) =>
                      setAwardedPoints(
                        Math.min(
                          currentAnswer.maxPoints,
                          Math.max(0, parseInt(e.target.value) || 0)
                        )
                      )
                    }
                    className="w-24 text-sm font-bold text-center px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-indigo-700 bg-white"
                  />
                  <span className="text-xs text-slate-500 font-medium">
                    dari {currentAnswer.maxPoints} poin
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Catatan / Umpan Balik Guru
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={2}
                  placeholder="Beri apresiasi atau koreksi untuk siswa..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {saveSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Nilai uraian dan umpan balik berhasil disimpan! Skor siswa diperbarui.</span>
              </div>
            )}
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleSaveCurrent}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Simpan Nilai Uraian</span>
          </button>
        </div>
      </div>
    </div>
  );
};
