import React from 'react';
import { Volume2, VolumeX, Sparkles, GraduationCap, Gamepad2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface NavbarProps {
  activeView: 'dashboard' | 'student';
  setActiveView: (view: 'dashboard' | 'student') => void;
  dashboardTab?: 'overview' | 'bank' | 'games' | 'results';
  setDashboardTab?: (tab: 'overview' | 'bank' | 'games' | 'results') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  dashboardTab,
  setDashboardTab,
}) => {
  const { soundEnabled, setSoundEnabled } = useGame();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 font-display whitespace-nowrap">
                EDU GAME MASTER
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4 Clean Single-line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <button
            onClick={() => {
              setActiveView('dashboard');
              setDashboardTab?.('overview');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'dashboard' && dashboardTab === 'overview'
                ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveView('dashboard');
              setDashboardTab?.('bank');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'dashboard' && dashboardTab === 'bank'
                ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            Bank Soal & Upload
          </button>
          <button
            onClick={() => {
              setActiveView('dashboard');
              setDashboardTab?.('games');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'dashboard' && dashboardTab === 'games'
                ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            Kelola Game
          </button>
          <button
            onClick={() => {
              setActiveView('dashboard');
              setDashboardTab?.('results');
            }}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'dashboard' && dashboardTab === 'results'
                ? 'text-indigo-600 border-b-2 border-indigo-600 pb-0.5'
                : 'hover:text-slate-900'
            }`}
          >
            Rekap Nilai
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Matikan Suara FX' : 'Aktifkan Suara FX'}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label={soundEnabled ? 'Matikan Suara FX' : 'Aktifkan Suara FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Mode Switcher Button */}
          {activeView === 'dashboard' ? (
            <button
              onClick={() => setActiveView('student')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Masuk Portal Siswa</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all whitespace-nowrap shrink-0"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Dashboard Guru</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
