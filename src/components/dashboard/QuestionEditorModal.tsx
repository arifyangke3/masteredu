import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Question, QuestionType, EducationLevel, DifficultyLevel, MatchingPair } from '../../types';

interface QuestionEditorModalProps {
  initialQuestion?: Question | null;
  onClose: () => void;
  onSave: (q: Question | Omit<Question, 'id'>) => void;
}

export const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  initialQuestion,
  onClose,
  onSave,
}) => {
  const [question, setQuestion] = useState(initialQuestion?.question || '');
  const [type, setType] = useState<QuestionType>(initialQuestion?.type || 'multiple_choice');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(initialQuestion?.educationLevel || 'SD');
  const [grade, setGrade] = useState(initialQuestion?.grade || 'Kelas 4');
  const [subject, setSubject] = useState(initialQuestion?.subject || 'IPA (Sains)');
  const [topic, setTopic] = useState(initialQuestion?.topic || 'Umum');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialQuestion?.difficulty || 'sedang');
  const [points, setPoints] = useState<number>(initialQuestion?.points || 10);
  const [imageUrl, setImageUrl] = useState(initialQuestion?.imageUrl || '');
  const [passageText, setPassageText] = useState(initialQuestion?.passageText || '');
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');

  // Options for Multiple Choice
  const [options, setOptions] = useState<string[]>(
    initialQuestion?.options && initialQuestion.options.length > 0
      ? initialQuestion.options
      : ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D']
  );

  // Correct answer
  const [correctAnswer, setCorrectAnswer] = useState<any>(
    initialQuestion?.correctAnswer !== undefined ? initialQuestion.correctAnswer : ''
  );

  // Matching pairs
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(
    initialQuestion?.matchingPairs || [
      { id: '1', left: 'Konsep A', right: 'Definisi A' },
      { id: '2', left: 'Konsep B', right: 'Definisi B' },
      { id: '3', left: 'Konsep C', right: 'Definisi C' },
    ]
  );

  const [errorMessage, setErrorMessage] = useState('');

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, `Pilihan ${String.fromCharCode(65 + options.length)}`]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOpts = options.filter((_, i) => i !== index);
      setOptions(newOpts);
      if (correctAnswer === options[index]) {
        setCorrectAnswer(newOpts[0]);
      }
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const oldVal = options[index];
    const newOpts = [...options];
    newOpts[index] = val;
    setOptions(newOpts);
    if (correctAnswer === oldVal) {
      setCorrectAnswer(val);
    }
  };

  // Matching pair handlers
  const handleAddPair = () => {
    setMatchingPairs([
      ...matchingPairs,
      { id: String(Date.now()), left: '', right: '' },
    ]);
  };

  const handleRemovePair = (idx: number) => {
    if (matchingPairs.length > 2) {
      setMatchingPairs(matchingPairs.filter((_, i) => i !== idx));
    }
  };

  const handlePairChange = (idx: number, side: 'left' | 'right', val: string) => {
    const updated = [...matchingPairs];
    updated[idx][side] = val;
    setMatchingPairs(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setErrorMessage('Isi teks soal terlebih dahulu.');
      return;
    }

    if (type === 'multiple_choice' || type === 'picture_guess' || type === 'reading_comprehension') {
      if (options.some((o) => !o.trim())) {
        setErrorMessage('Pastikan semua pilihan jawaban terisi.');
        return;
      }
      if (!correctAnswer) {
        setErrorMessage('Tentukan kunci jawaban yang benar.');
        return;
      }
    }

    if (type === 'matching') {
      if (matchingPairs.some((p) => !p.left.trim() || !p.right.trim())) {
        setErrorMessage('Pastikan semua pasangan konsep dan jawaban terisi.');
        return;
      }
    }

    const payload: any = {
      ...(initialQuestion ? { id: initialQuestion.id } : {}),
      question: question.trim(),
      type,
      educationLevel,
      grade: grade.trim(),
      subject: subject.trim(),
      topic: topic.trim(),
      difficulty,
      points: Number(points) || 10,
      imageUrl: imageUrl.trim() || undefined,
      passageText: passageText.trim() || undefined,
      explanation: explanation.trim() || undefined,
      options:
        type === 'multiple_choice' || type === 'picture_guess' || type === 'reading_comprehension'
          ? options
          : undefined,
      correctAnswer:
        type === 'true_false'
          ? Boolean(correctAnswer)
          : type === 'matching'
          ? ''
          : String(correctAnswer).trim(),
      matchingPairs: type === 'matching' ? matchingPairs : undefined,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {initialQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              Sesuaikan format soal, kunci jawaban, dan pembahasan materi.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenjang</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                placeholder="Contoh: Kelas 5"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Matematika"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kesulitan</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </div>
          </div>

          {/* Topic & Format Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Materi / Topik</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Ekosistem Darat"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Format Soal</label>
              <select
                value={type}
                onChange={(e) => {
                  const newT = e.target.value as QuestionType;
                  setType(newT);
                  if (newT === 'true_false') setCorrectAnswer(true);
                  if (newT === 'multiple_choice') setCorrectAnswer(options[0]);
                }}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                <option value="multiple_choice">Pilihan Ganda (A/B/C/D...)</option>
                <option value="true_false">Benar atau Salah</option>
                <option value="short_answer">Isian Singkat</option>
                <option value="matching">Menjodohkan (Matching Pairs)</option>
                <option value="picture_guess">Tebak Gambar / Soal Gambar</option>
                <option value="reading_comprehension">Teks Bacaan Pemahaman</option>
                <option value="essay">Uraian / Essay (Penilaian Guru)</option>
              </select>
            </div>
          </div>

          {/* Reading Passage if Reading Comprehension */}
          {type === 'reading_comprehension' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teks Bacaan (Passage)
              </label>
              <textarea
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                rows={3}
                placeholder="Tuliskan teks cerita, artikel, atau kutipan bacaan di sini..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          )}

          {/* Image URL if Picture Guess or Visual Question */}
          {(type === 'picture_guess' || imageUrl) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Gambar Soal
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... atau paste link gambar"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pertanyaan / Inti Soal <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="Tuliskan butir pertanyaan secara jelas..."
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Condition: Multiple Choice & Picture Guess & Reading Comprehension */}
          {(type === 'multiple_choice' || type === 'picture_guess' || type === 'reading_comprehension') && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Pilihan Jawaban & Kunci
                </span>
                {options.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Opsi
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelectedKey = correctAnswer === opt;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrectAnswer(opt)}
                        className={`w-7 h-7 shrink-0 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                          isSelectedKey
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white border border-slate-300 text-slate-600 hover:border-emerald-500'
                        }`}
                        title={isSelectedKey ? 'Kunci Jawaban Terpilih' : 'Klik untuk jadikan kunci jawaban'}
                      >
                        {isSelectedKey ? '✓' : letter}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Opsi ${letter}`}
                        className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          aria-label={`Hapus pilihan ${letter}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500">
                Klik tombol huruf di sebelah kiri opsi untuk menentukan kunci jawaban yang benar.
              </p>
            </div>
          )}

          {/* Condition: True / False */}
          {type === 'true_false' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Kunci Jawaban yang Benar:
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(true)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    correctAnswer === true
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> BENAR
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(false)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                    correctAnswer === false
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rose-500'
                  }`}
                >
                  <X className="w-4 h-4" /> SALAH
                </button>
              </div>
            </div>
          )}

          {/* Condition: Short Answer */}
          {type === 'short_answer' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Kunci Jawaban Isian Singkat
              </label>
              <input
                type="text"
                value={String(correctAnswer)}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Contoh: fotosintesis atau 144"
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Pencocokan jawaban siswa bersifat toleran huruf besar/kecil (case-insensitive) & spasi berlebih.
              </p>
            </div>
          )}

          {/* Condition: Matching Pairs */}
          {type === 'matching' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Pasangan Menjodohkan (Kiri & Kanan)
                </span>
                <button
                  type="button"
                  onClick={handleAddPair}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Pasangan
                </button>
              </div>
              <div className="space-y-2">
                {matchingPairs.map((pair, pIdx) => (
                  <div key={pair.id || pIdx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-5 text-center">
                      {pIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={pair.left}
                      onChange={(e) => handlePairChange(pIdx, 'left', e.target.value)}
                      placeholder="Istilah / Sisi Kiri"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <span className="text-slate-400 text-xs">↔</span>
                    <input
                      type="text"
                      value={pair.right}
                      onChange={(e) => handlePairChange(pIdx, 'right', e.target.value)}
                      placeholder="Definisi / Sisi Kanan"
                      className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    {matchingPairs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePair(pIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        aria-label={`Hapus pasangan ${pIdx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Condition: Essay */}
          {type === 'essay' && (
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
              <label className="block text-xs font-bold text-amber-900">
                Rubrik Acuan Kunci Jawaban (Pedoman Guru)
              </label>
              <textarea
                value={String(correctAnswer)}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                rows={2}
                placeholder="Tuliskan poin-poin utama jawaban benar yang diharapkan sebagai acuan penilaian guru..."
                className="w-full text-xs p-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
              <p className="text-[11px] text-amber-700">
                * Soal uraian memerlukan review dan pemberian skor manual oleh guru di menu Rekap Nilai.
              </p>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pembahasan / Penjelasan Materi (Tampil setelah siswa menjawab)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              placeholder="Berikan alasan mengapa jawaban tersebut benar untuk penguatan materi siswa..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Points */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Bobot Poin Soal:</label>
            <input
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 10))}
              className="w-20 text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow transition-all"
            >
              Simpan Soal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
