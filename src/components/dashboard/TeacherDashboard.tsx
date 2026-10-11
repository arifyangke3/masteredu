import React, { useState } from 'react';
import {
  Gamepad2,
  BookOpen,
  Trophy,
  Plus,
  Play,
  Copy,
  Check,
  Edit3,
  CopyPlus,
  Trash2,
  Sparkles,
  Users,
  Clock,
  Heart,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { GameSettings } from '../../types';
import { GAME_MODES } from '../../data/gameModes';
import { QuestionBankView } from './QuestionBankView';
import { ResultsRekapView } from './ResultsRekapView';
import { GameConfigModal } from './GameConfigModal';

interface TeacherDashboardProps {
  currentTab: 'overview' | 'bank' | 'games' | 'results';
  setCurrentTab: (tab: 'overview' | 'bank' | 'games' | 'results') => void;
  onLaunchGameAsStudent: (gameCode: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentTab,
  setCurrentTab,
  onLaunchGameAsStudent,
}) => {
  const { games, questions, results, createGame, updateGame, deleteGame, duplicateGame } =
    useGame();

  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [editingGame, setEditingGame] = useState<GameSettings | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${
            currentTab === 'overview'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ringkasan Dashboard
        </button>
        <button
          onClick={() => setCurrentTab('bank')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'bank'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Bank Soal & Upload</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono px-1.5 py-0.2 rounded">
            {questions.length}
          </span>
        </button>
        <button
          onClick={() => setCurrentTab('games')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'games'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Kelola Permainan</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono px-1.5 py-0.2 rounded">
            {games.length}
          </span>
        </button>
        <button
          onClick={() => setCurrentTab('results')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            currentTab === 'results'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Rekap Nilai Siswa</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono px-1.5 py-0.2 rounded">
            {results.length}
          </span>
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Hero Welcome Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Platform Edukasi Universal PAUD · SD · SMP · SMA/SMK</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
                Selamat Datang di EDU GAME MASTER
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                Ubah latihan dan asesmen soal biasa menjadi pengalaman game edukasi yang seru, interaktif, dan penuh motivasi belajar untuk semua mata pelajaran.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsCreatingGame(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-indigo-950 bg-amber-300 hover:bg-amber-200 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Permainan Baru</span>
                </button>
                <button
                  onClick={() => setCurrentTab('bank')}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-white/15 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Buka Bank Soal</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Butir Soal</span>
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">
                {questions.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Tersedia untuk semua jenjang
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Sesi Permainan Aktif</span>
                <Gamepad2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">
                {games.filter((g) => g.active).length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Siap dimainkan siswa via PIN
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Penyelesaian Siswa</span>
                <Users className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-display tabular-nums">
                {results.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Data nilai terekam otomatis
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Rata-Rata Nilai</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-indigo-600 font-display tabular-nums">
                {results.length > 0
                  ? Math.round(
                      results.reduce((acc, c) => acc + c.percentage, 0) / results.length
                    )
                  : 0}
                %
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Ketercapaian pemahaman materi
              </div>
            </div>
          </div>

          {/* Quick Step Flow Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Alur Penggunaan EDU GAME MASTER
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-600 mb-1">LANGKAH 1</div>
                  <div className="text-sm font-bold text-slate-800">Unggah Soal</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload file Excel (.xlsx), CSV, atau salin teks dari dokumen.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('bank')}
                  className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Buka Bank Soal <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-600 mb-1">LANGKAH 2</div>
                  <div className="text-sm font-bold text-slate-800">Pilih Mode Game</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Tentukan format game seperti Kuis Cepat, Matching, Tebak Gambar, atau Petualangan.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreatingGame(true)}
                  className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Buat Game <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-600 mb-1">LANGKAH 3</div>
                  <div className="text-sm font-bold text-slate-800">Bagikan PIN Siswa</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Siswa membuka Portal Siswa dan memasukkan 6 digit Kode PIN Permainan.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('games')}
                  className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Lihat PIN Game <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-600 mb-1">LANGKAH 4</div>
                  <div className="text-sm font-bold text-slate-800">Unduh Hasil Rekap</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Skor dihitung otomatis, evaluasi uraian, dan ekspor lembar nilai ke Excel/CSV.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('results')}
                  className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Buka Rekap <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Active Games Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Permainan Siap Main
              </h3>
              <button
                onClick={() => setCurrentTab('games')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Kelola Semua ({games.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.slice(0, 3).map((game) => (
                <div
                  key={game.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 uppercase">
                        {game.educationLevel} · {game.grade}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {game.title}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-100 text-indigo-800">
                      PIN: {game.code}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {game.subject} · {game.questionIds.length} Soal · Mode: {game.gameMode.replace('_', ' ')}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyCode(game.code)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                    >
                      {copiedCode === game.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin PIN</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onLaunchGameAsStudent(game.code)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                    >
                      <Play className="w-3 h-3" />
                      <span>Mainkan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BANK SOAL TAB */}
      {currentTab === 'bank' && <QuestionBankView />}

      {/* KELOLA GAME TAB */}
      {currentTab === 'games' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-display">
                Kelola Permainan & Sesi Kelas
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur mode interaktif, bagikan kode PIN ke murid, dan luncurkan game langsung.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingGame(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Permainan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((g) => {
              const modeMeta = GAME_MODES.find((m) => m.id === g.gameMode);
              return (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-bold text-indigo-700">{g.educationLevel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{g.grade}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-extrabold font-mono tracking-wider bg-indigo-100 text-indigo-900">
                        {g.code}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-display leading-snug">
                      {g.title}
                    </h3>

                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{g.subject}</span> · {g.topic}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                        Mode: {modeMeta?.title || g.gameMode}
                      </span>
                      <span>·</span>
                      <span>{g.questionIds.length} Butir Soal</span>
                      <span>·</span>
                      <span>{g.questionTimeSeconds ? `${g.questionTimeSeconds}s / soal` : 'Tanpa Waktu'}</span>
                      {g.livesCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-rose-600 font-semibold">{g.livesCount} Nyawa</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions & Launch */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleCopyCode(g.code)}
                        className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                      >
                        {copiedCode === g.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">PIN Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin PIN ({g.code})</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingGame(g)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          title="Edit Pengaturan"
                          aria-label={`Edit pengaturan game ${g.title}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateGame(g.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          title="Duplikat Game"
                          aria-label={`Duplikat game ${g.title}`}
                        >
                          <CopyPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus game "${g.title}"?`)) {
                              deleteGame(g.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          title="Hapus Game"
                          aria-label={`Hapus game ${g.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onLaunchGameAsStudent(g.code)}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Buka & Mainkan Sebagai Siswa</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REKAP NILAI TAB */}
      {currentTab === 'results' && <ResultsRekapView />}

      {/* Create Modal */}
      {isCreatingGame && (
        <GameConfigModal
          onClose={() => setIsCreatingGame(false)}
          onSave={(data) => createGame(data)}
        />
      )}

      {/* Edit Modal */}
      {editingGame && (
        <GameConfigModal
          initialGame={editingGame}
          onClose={() => setEditingGame(null)}
          onSave={(data) => updateGame(editingGame.id, data)}
        />
      )}
    </div>
  );
};
