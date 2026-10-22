import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  Clock,
  Heart,
  Shuffle,
  Eye,
  Check,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { GameSettings, EducationLevel, GameMode } from '../../types';
import { GAME_MODES } from '../../data/gameModes';

interface GameConfigModalProps {
  initialGame?: GameSettings | null;
  onClose: () => void;
  onSave: (gameData: Omit<GameSettings, 'id' | 'code' | 'createdAt'>) => void;
}

export const GameConfigModal: React.FC<GameConfigModalProps> = ({
  initialGame,
  onClose,
  onSave,
}) => {
  const { questions } = useGame();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [title, setTitle] = useState(initialGame?.title || 'Kuis Interaktif Ceria');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(
    initialGame?.educationLevel || 'SD'
  );
  const [grade, setGrade] = useState(initialGame?.grade || 'Kelas 4');
  const [subject, setSubject] = useState(initialGame?.subject || 'IPA (Sains)');
  const [topic, setTopic] = useState(initialGame?.topic || 'Sains & Pengetahuan Alam');
  const [gameMode, setGameMode] = useState<GameMode>(initialGame?.gameMode || 'kuis_cepat');

  // Selected questions
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    initialGame?.questionIds || []
  );

  // Game rules
  const [questionTimeSeconds, setQuestionTimeSeconds] = useState<number>(
    initialGame?.questionTimeSeconds !== undefined ? initialGame.questionTimeSeconds : 30
  );
  const [pointsPerCorrect, setPointsPerCorrect] = useState<number>(
    initialGame?.pointsPerCorrect || 100
  );
  const [penaltyWrong, setPenaltyWrong] = useState<number>(initialGame?.penaltyWrong || 0);
  const [livesCount, setLivesCount] = useState<number>(initialGame?.livesCount || 3);
  const [bonusCombo, setBonusCombo] = useState<boolean>(
    initialGame?.bonusCombo !== undefined ? initialGame.bonusCombo : true
  );
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(
    initialGame?.shuffleQuestions !== undefined ? initialGame.shuffleQuestions : true
  );
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(
    initialGame?.shuffleOptions !== undefined ? initialGame.shuffleOptions : true
  );
  const [showExplanation, setShowExplanation] = useState<'always' | 'end_only' | 'never'>(
    initialGame?.showExplanation || 'always'
  );
  const [maxAttempts, setMaxAttempts] = useState<number>(initialGame?.maxAttempts || 3);

  // Question filter in Step 2
  const [qSearch, setQSearch] = useState('');
  const [qLevelFilter, setQLevelFilter] = useState<string>(educationLevel);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredQuestionsForSelect = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(qSearch.toLowerCase()) ||
      q.subject.toLowerCase().includes(qSearch.toLowerCase()) ||
      q.topic.toLowerCase().includes(qSearch.toLowerCase());
    const matchesLevel = qLevelFilter === 'all' || q.educationLevel === qLevelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleToggleQuestion = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((qId) => qId !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredQuestionsForSelect.map((q) => q.id);
    const combined = Array.from(new Set([...selectedQuestionIds, ...ids]));
    setSelectedQuestionIds(combined);
  };

  const handleDeselectAllFiltered = () => {
    const idsToRemove = new Set(filteredQuestionsForSelect.map((q) => q.id));
    setSelectedQuestionIds(selectedQuestionIds.filter((id) => !idsToRemove.has(id)));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Mohon isi judul permainan.');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      alert('Pilih minimal 1 butir soal untuk permainan ini.');
      return;
    }

    onSave({
      title: title.trim(),
      educationLevel,
      grade: grade.trim(),
      subject: subject.trim(),
      topic: topic.trim(),
      gameMode,
      questionIds: selectedQuestionIds,
      questionTimeSeconds,
      pointsPerCorrect,
      penaltyWrong,
      livesCount,
      bonusCombo,
      shuffleQuestions,
      shuffleOptions,
      showExplanation,
      maxAttempts,
      active: true,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-config-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 id="game-config-title" className="text-lg font-bold text-slate-900 font-display">
              {initialGame ? 'Edit Pengaturan Permainan' : 'Buat Permainan Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              Konfigurasi mode game, pilih kumpulan soal, dan tentukan aturan permainan.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setStep(1)}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              step === 1
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Identitas & Mode Game</span>
          </button>
          <button
            onClick={() => setStep(2)}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              step === 2
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Pilih Soal ({selectedQuestionIds.length} dipilih)</span>
          </button>
          <button
            onClick={() => setStep(3)}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              step === 3
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Aturan Skor & Waktu</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: Identitas & Mode Game */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama / Judul Permainan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Kuis Cepat Petualang Sains Bab 3"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenjang Pendidikan</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => {
                      const lvl = e.target.value as EducationLevel;
                      setEducationLevel(lvl);
                      setQLevelFilter(lvl);
                    }}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="PAUD">PAUD / TK</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA_SMK">SMA / SMK</option>
                    <option value="UMUM">Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Contoh: Kelas 4 atau TK-B"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: IPA, Matematika, B. Indonesia"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Materi Pokok / Topik</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: Rantai Makanan & Ekosistem"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Game Modes Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2">
                  Pilih Mekanisme Mode Game Pembelajaran
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {GAME_MODES.map((mode) => {
                    const isSelected = gameMode === mode.id;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => setGameMode(mode.id)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-extrabold text-slate-900 font-display">
                              {mode.title}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {mode.description}
                          </p>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{mode.subtitle}</span>
                          <span className="font-medium text-indigo-600">{mode.recommendedLevel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pilih Soal dari Bank Soal */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Filter Sub-bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={qSearch}
                    onChange={(e) => setQSearch(e.target.value)}
                    placeholder="Cari butir soal..."
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={qLevelFilter}
                    onChange={(e) => setQLevelFilter(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700"
                  >
                    <option value="all">Semua Jenjang</option>
                    <option value="PAUD">PAUD</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA_SMK">SMA/SMK</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-xs px-2.5 py-1.5 font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                  >
                    Pilih Semua ({filteredQuestionsForSelect.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllFiltered}
                    className="text-xs px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Batal Pilih
                  </button>
                </div>
              </div>

              {/* Questions Checklist */}
              {filteredQuestionsForSelect.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    Tidak ada soal yang cocok dengan filter. Tambahkan soal di Bank Soal terlebih dahulu.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-96 overflow-y-auto bg-white">
                  {filteredQuestionsForSelect.map((q) => {
                    const isChecked = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => handleToggleQuestion(q.id)}
                        className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by div
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-semibold text-indigo-600">{q.educationLevel}</span>
                            <span aria-hidden="true">·</span>
                            <span>{q.subject}</span>
                            <span aria-hidden="true">·</span>
                            <span>{q.topic}</span>
                            <span aria-hidden="true">·</span>
                            <span className="capitalize">{q.difficulty}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{q.type}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 mt-0.5 line-clamp-2">
                            {q.question}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Aturan Skor & Waktu */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Waktu Per Soal */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Waktu Pengerjaan per Soal</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Durasi hitung mundur untuk tiap butir pertanyaan (0 = tanpa batas).
                  </p>
                  <select
                    value={questionTimeSeconds}
                    onChange={(e) => setQuestionTimeSeconds(parseInt(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  >
                    <option value={0}>Tanpa Batas Waktu (Santai)</option>
                    <option value={15}>15 Detik (Sangat Cepat)</option>
                    <option value={20}>20 Detik (Cepat)</option>
                    <option value={30}>30 Detik (Standar)</option>
                    <option value={45}>45 Detik (Sedang)</option>
                    <option value={60}>60 Detik (Panjang)</option>
                    <option value={90}>90 Detik (Materi Rumus/Uraian)</option>
                  </select>
                </div>

                {/* Nyawa / Lives */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Jumlah Nyawa (Kesempatan Salah)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Game berakhir jika nyawa habis sebelum semua soal selesai.
                  </p>
                  <select
                    value={livesCount}
                    onChange={(e) => setLivesCount(parseInt(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  >
                    <option value={0}>Tak Terbatas (Lanjut Sampai Selesai)</option>
                    <option value={1}>1 Nyawa (Sudden Death / Hardcore)</option>
                    <option value={3}>3 Nyawa (Standar Petualangan)</option>
                    <option value={5}>5 Nyawa (Ramah Pemula)</option>
                  </select>
                </div>

                {/* Poin Benar & Salah */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Skor Jawaban Benar & Penalti
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-500">Poin Benar:</span>
                      <input
                        type="number"
                        value={pointsPerCorrect}
                        onChange={(e) => setPointsPerCorrect(parseInt(e.target.value) || 100)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-center font-bold text-emerald-700"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Pengurangan Salah:</span>
                      <input
                        type="number"
                        value={penaltyWrong}
                        onChange={(e) => setPenaltyWrong(parseInt(e.target.value) || 0)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-center font-bold text-rose-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Pembahasan */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                    <Eye className="w-4 h-4 text-sky-600" />
                    <span>Tampilkan Pembahasan Soal</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Kapan penjelasan materi ditampilkan kepada siswa?
                  </p>
                  <select
                    value={showExplanation}
                    onChange={(e) => setShowExplanation(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  >
                    <option value="always">Langsung setelah menjawab tiap butir</option>
                    <option value="end_only">Hanya di akhir permainan (Evaluasi)</option>
                    <option value="never">Jangan tampilkan (Mode Ujian Rahasia)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Acak Urutan Soal</div>
                    <div className="text-[11px] text-slate-500">
                      Tiap siswa menerima urutan butir pertanyaan yang berbeda
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Acak Urutan Opsi Pilihan</div>
                    <div className="text-[11px] text-slate-500">
                      Pilihan A, B, C, D diacak posisinya secara acak
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Nav */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Kembali
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((step + 1) as any)}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-all"
              >
                <span>Lanjut</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
              >
                {initialGame ? 'Perbarui Permainan' : 'Buat Permainan & Buat Kode PIN'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
