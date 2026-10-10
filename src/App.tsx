/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/common/Navbar';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { StudentPortal } from './components/student/StudentPortal';
import { GameHost } from './components/student/GameHost';
import { GameSettings } from './types';

function MainApp() {
  const [activeView, setActiveView] = useState<'dashboard' | 'student'>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'bank' | 'games' | 'results'>('overview');

  // Active game session when student plays
  const [activeStudentGame, setActiveStudentGame] = useState<{
    game: GameSettings;
    studentName: string;
    teamName?: string;
  } | null>(null);

  const [prefilledPin, setPrefilledPin] = useState<string>('');

  const handleLaunchGameAsStudent = (gameCode: string) => {
    setPrefilledPin(gameCode);
    setActiveStudentGame(null);
    setActiveView('student');
  };

  const handleStartGame = (game: GameSettings, studentName: string, teamName?: string) => {
    setActiveStudentGame({ game, studentName, teamName });
  };

  const handleExitGame = () => {
    setActiveStudentGame(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Bar with 3-Zone Contract */}
      <Navbar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          if (view === 'dashboard') {
            setActiveStudentGame(null);
          }
        }}
        dashboardTab={dashboardTab}
        setDashboardTab={setDashboardTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeView === 'dashboard' ? (
          <TeacherDashboard
            currentTab={dashboardTab}
            setCurrentTab={setDashboardTab}
            onLaunchGameAsStudent={handleLaunchGameAsStudent}
          />
        ) : activeStudentGame ? (
          <GameHost
            game={activeStudentGame.game}
            studentName={activeStudentGame.studentName}
            teamName={activeStudentGame.teamName}
            onExit={handleExitGame}
          />
        ) : (
          <StudentPortal
            prefilledCode={prefilledPin}
            onStartGame={handleStartGame}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 font-display">EDU GAME MASTER</span>
            <span aria-hidden="true">·</span>
            <span>Platform Pembelajaran Interaktif Universal</span>
          </div>
          <div className="text-slate-400">
            Dukungan format PAUD · SD · SMP · SMA/SMK · Semua Mata Pelajaran
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}
