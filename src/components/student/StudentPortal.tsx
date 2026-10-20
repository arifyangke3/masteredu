import React, { useState } from 'react';
import {
  Gamepad2,
  Play,
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { GameSettings } from '../../types';
import { GAME_MODES } from '../../data/gameModes';
import { SoundEngine } from '../../utils/soundEffects';

interface StudentPortalProps {
  onStartGame: (game: GameSettings, studentName: string, teamName?: string) => void;
  prefilledCode?: string;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  onStartGame,
  prefilledCode,
}) => {
  const { games, getGameByCode, soundEnabled, setSoundEnabled } = useGame();

  const [pinCode, setPinCode] = useState(prefilledCode || '');
  const [studentName, setStudentName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const activeGames = games.filter((g) => g.active);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!pinCode.trim()) {
      setErrorMessage('Masukkan 6 digit Kode PIN Permainan.');
      return;
    }
    if (!studentName.trim()) {
      setErrorMessage('Isi nama lengkap atau nama panggilanmu.');
      return;
    }

    const foundGame = getGameByCode(pinCode.trim().toUpperCase());
    if (!foundGame) {
      setErrorMessage('Kode Permainan (PIN) tidak ditemukan atau permainan sedang nonaktif.');
      SoundEngine.playWrong(soundEnabled);
      return;
    }

    SoundEngine.playClick(soundEnabled);
    onStartGame(foundGame, studentName.trim(), teamName.trim() || undefined);
  };

  const handleQuickSelectGame = (game: GameSettings) => {
    setPinCode(game.code);
    SoundEngine.playClick(soundEnabled);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Portal Belajar & Bermain Siswa</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 font-display tracking-tight">
          Masuk ke Arena Permainan
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Masukkan 6 digit PIN yang diberikan oleh gurumu, tulis namamu, dan raih skor tertinggi di papan juara!
        </p>
      </div>

      {/* Main Join Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Game PIN Input */}
          <div>
            <label htmlFor="student-pin-code" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Kode Permainan (PIN)
            </label>
            <input
              id="student-pin-code"
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.toUpperCase())}
              placeholder="Contoh: SD8821"
              maxLength={8}
              className="w-full text-center text-xl sm:text-2xl font-black tracking-widest uppercase py-3.5 px-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 bg-slate-50 font-mono"
              required
            />
          </div>

          {/* Student Name Input */}
          <div>
            <label htmlFor="student-name-input" className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Siswa / Panggilan
            </label>
            <input
              id="student-name-input"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Masukkan namamu..."
              className="w-full text-sm font-semibold py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              required
            />
          </div>

          {/* Optional Team / Class Input */}
          <div>
            <label htmlFor="student-team-name" className="block text-xs font-semibold text-slate-500 mb-1">
              Nama Regu / Kelas (Opsional)
            </label>
            <input
              id="student-team-name"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Contoh: Regu Elang atau Kelas 5A"
              className="w-full text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl text-base font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Mulai Bermain Sekarang!</span>
          </button>
        </form>
      </div>

      {/* Quick Select from Active Games (For easy classroom testing) */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-slate-800 font-display">
            Pilihan Permainan Aktif di Kelas
          </h3>
          <p className="text-xs text-slate-500">
            Klik kartu di bawah untuk langsung mengisi kode PIN secara otomatis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeGames.map((g) => {
            const modeMeta = GAME_MODES.find((m) => m.id === g.gameMode);
            const isCurrentPin = pinCode === g.code;

            return (
              <button
                type="button"
                key={g.id}
                onClick={() => handleQuickSelectGame(g)}
                aria-label={`Pilih permainan PIN ${g.code}: ${g.title}`}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isCurrentPin
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">
                      {g.educationLevel} · {g.grade}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-extrabold font-mono bg-indigo-100 text-indigo-900">
                      PIN: {g.code}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {g.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {g.subject} · {g.topic}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 w-full">
                  <span className="font-medium text-slate-700">
                    {modeMeta?.title || g.gameMode}
                  </span>
                  <span className="text-indigo-600 font-bold flex items-center gap-1">
                    Pilih Game <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
