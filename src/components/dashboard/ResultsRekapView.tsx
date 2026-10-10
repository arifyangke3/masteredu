import React, { useState } from 'react';
import {
  Trophy,
  Download,
  FileSpreadsheet,
  Trash2,
  Eye,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  Search,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { GameResult } from '../../types';
import { exportResultsToExcel, exportResultsToCSV } from '../../utils/fileParser';
import { EssayGradingModal } from './EssayGradingModal';

export const ResultsRekapView: React.FC = () => {
  const { results, games, deleteResult, clearResultsByGame, updateEssayGrade } = useGame();

  const [selectedGameId, setSelectedGameId] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState('');
  const [inspectingResult, setInspectingResult] = useState<GameResult | null>(null);
  const [gradingResult, setGradingResult] = useState<GameResult | null>(null);

  // Filtered results
  const filteredResults = results.filter((r) => {
    const matchesGame = selectedGameId === 'all' || r.gameId === selectedGameId;
    const matchesStudent =
      r.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (r.teamName && r.teamName.toLowerCase().includes(searchStudent.toLowerCase()));
    return matchesGame && matchesStudent;
  });

  // Calculate statistics
  const totalSubmissions = filteredResults.length;
  const avgScore =
    totalSubmissions > 0
      ? Math.round(filteredResults.reduce((acc, cur) => acc + cur.percentage, 0) / totalSubmissions)
      : 0;
  const maxScore =
    totalSubmissions > 0 ? Math.max(...filteredResults.map((r) => r.percentage)) : 0;
  const pendingEssayCount = filteredResults.filter((r) => r.hasPendingEssay).length;

  const activeGame = games.find((g) => g.id === selectedGameId);
  const gameTitleForExport = activeGame ? activeGame.title : 'Semua_Game';

  const handleExportExcel = () => {
    if (filteredResults.length === 0) {
      alert('Tidak ada data hasil siswa untuk diekspor.');
      return;
    }
    exportResultsToExcel(filteredResults, gameTitleForExport);
  };

  const handleExportCSV = () => {
    if (filteredResults.length === 0) {
      alert('Tidak ada data hasil siswa untuk diekspor.');
      return;
    }
    exportResultsToCSV(filteredResults, gameTitleForExport);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Rekap Hasil & Leaderboard Siswa
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau ketercapaian belajar siswa, periksa lembar jawaban, dan ekspor data nilai ke Excel/CSV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={filteredResults.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded-xl transition-all disabled:opacity-50"
              title="Unduh Lembar Rekap Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredResults.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 rounded-xl transition-all disabled:opacity-50"
              title="Unduh Format CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Semua Sesi Permainan ({games.length})</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  [{g.code}] {g.title} ({g.educationLevel})
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Cari nama siswa..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Stat KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Siswa Selesai</span>
            <div className="text-xl font-extrabold text-slate-900 font-display mt-0.5 tabular-nums">
              {totalSubmissions}
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Rata-rata Nilai</span>
            <div className="text-xl font-extrabold text-indigo-600 font-display mt-0.5 tabular-nums">
              {avgScore}%
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Nilai Tertinggi</span>
            <div className="text-xl font-extrabold text-emerald-600 font-display mt-0.5 tabular-nums">
              {maxScore}%
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Uraian Menunggu Guru</span>
            <div className="text-xl font-extrabold text-amber-600 font-display mt-0.5 tabular-nums">
              {pendingEssayCount}
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Rekap Lembar Jawaban Siswa ({filteredResults.length})
          </div>
          {selectedGameId !== 'all' && filteredResults.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Hapus seluruh rekap nilai untuk game ini?')) {
                  clearResultsByGame(selectedGameId);
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              Hapus Rekap Sesi Ini
            </button>
          )}
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Belum ada siswa yang menyelesaikan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Bagikan Kode Permainan (PIN) ke siswa agar mereka dapat bermain melalui Portal Siswa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Peringkat</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Game & Mapel</th>
                  <th className="py-3 px-4 text-center">Skor Akhir</th>
                  <th className="py-3 px-4 text-center">Persentase</th>
                  <th className="py-3 px-4 text-center">Benar / Salah</th>
                  <th className="py-3 px-4 text-center">Durasi</th>
                  <th className="py-3 px-4 text-center">Waktu Pengerjaan</th>
                  <th className="py-3 px-4 text-center">Uraian</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Sort by score descending */}
                {[...filteredResults]
                  .sort((a, b) => b.score - a.score)
                  .map((res, index) => {
                    const isTop1 = index === 0;
                    const isTop2 = index === 1;
                    const isTop3 = index === 2;

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-center font-bold font-mono">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/10 text-amber-900 font-bold text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-400">{index + 1}</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{res.studentName}</div>
                          {res.teamName && (
                            <div className="text-[10px] text-slate-500">Regu: {res.teamName}</div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 truncate max-w-[160px]">
                            {res.gameTitle}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {res.subject} · {res.educationLevel}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center font-bold font-mono text-slate-900 tabular-nums">
                          {res.score} <span className="text-slate-400 font-normal">/ {res.maxScore}</span>
                        </td>

                        <td className="py-3 px-4 text-center font-bold font-mono tabular-nums">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              res.percentage >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : res.percentage >= 60
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {res.percentage}%
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono tabular-nums">
                          <span className="text-emerald-600 font-bold">{res.correctCount}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-rose-600 font-bold">{res.wrongCount}</span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono text-slate-500 tabular-nums">
                          {res.timeSpentSeconds}s
                        </td>

                        <td className="py-3 px-4 text-center text-[11px] text-slate-500">
                          {res.completedAt}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {res.hasPendingEssay ? (
                            <button
                              onClick={() => setGradingResult(res)}
                              className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                            >
                              Beri Nilai
                            </button>
                          ) : res.answers.some((a) => a.type === 'essay') ? (
                            <button
                              onClick={() => setGradingResult(res)}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                            >
                              ✓ Terisi
                            </button>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectingResult(res)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Lihat Detail Jawaban"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus hasil nilai untuk ${res.studentName}?`)) {
                                  deleteResult(res.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Nilai"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Answer Inspection Modal */}
      {inspectingResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Detail Jawaban: {inspectingResult.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  {inspectingResult.gameTitle} · Nilai: {inspectingResult.percentage}% ({inspectingResult.score}/{inspectingResult.maxScore})
                </p>
              </div>
              <button
                onClick={() => setInspectingResult(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {inspectingResult.answers.map((ans, i) => (
                <div
                  key={ans.questionId || i}
                  className={`p-4 rounded-xl border ${
                    ans.isCorrect === true
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : ans.isCorrect === false
                      ? 'border-rose-200 bg-rose-50/30'
                      : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Soal #{i + 1} ({ans.type})
                    </span>
                    <span className="text-xs font-mono font-bold">
                      {ans.isCorrect === true ? (
                        <span className="text-emerald-700">+{ans.pointsEarned} Poin (BENAR)</span>
                      ) : ans.isCorrect === false ? (
                        <span className="text-rose-700">0 Poin (SALAH)</span>
                      ) : (
                        <span className="text-amber-700">Menunggu Penilaian Guru</span>
                      )}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 mb-2">
                    {ans.questionText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                        Jawaban Siswa:
                      </span>
                      <span className="font-bold text-slate-800">
                        {typeof ans.userAnswer === 'object'
                          ? JSON.stringify(ans.userAnswer)
                          : String(ans.userAnswer ?? '-')}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                        Kunci Jawaban:
                      </span>
                      <span className="font-bold text-emerald-700">
                        {typeof ans.correctAnswer === 'object'
                          ? JSON.stringify(ans.correctAnswer)
                          : String(ans.correctAnswer ?? '-')}
                      </span>
                    </div>
                  </div>

                  {ans.explanation && (
                    <p className="text-xs text-slate-500 italic mt-2">
                      <span className="font-semibold text-slate-600">Pembahasan: </span>
                      {ans.explanation}
                    </p>
                  )}

                  {ans.teacherFeedback && (
                    <div className="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-900">
                      <strong>Umpan Balik Guru:</strong> {ans.teacherFeedback}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setInspectingResult(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Essay Grading Modal */}
      {gradingResult && (
        <EssayGradingModal
          result={gradingResult}
          onClose={() => setGradingResult(null)}
          onSaveGrade={(resId, qId, pts, fb) => {
            updateEssayGrade(resId, qId, pts, fb);
          }}
        />
      )}
    </div>
  );
};
