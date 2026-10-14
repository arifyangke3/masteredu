import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Question, EducationLevel, QuestionType, DifficultyLevel } from '../../types';
import {
  parseExcelFile,
  parseCSVText,
  parseRawTextPaste,
  downloadExcelTemplate,
  downloadCSVTemplate,
} from '../../utils/fileParser';
import { QuestionEditorModal } from './QuestionEditorModal';

export const QuestionBankView: React.FC = () => {
  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    importQuestions,
    clearQuestions,
    loadSampleQuestions,
  } = useGame();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    success?: string;
    warnings?: string[];
    errors?: string[];
  } | null>(null);

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler (Excel / CSV)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadFeedback(null);

    const fileName = file.name.toLowerCase();
    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const result = await parseExcelFile(file);
        if (result.errors.length > 0) {
          setUploadFeedback({ errors: result.errors });
        } else {
          importQuestions(result.questions);
          setUploadFeedback({
            success: `Berhasil mengimpor ${result.questions.length} butir soal dari file Excel!`,
            warnings: result.warnings,
          });
        }
      } else if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        const text = await file.text();
        const result = parseCSVText(text);
        if (result.errors.length > 0) {
          setUploadFeedback({ errors: result.errors });
        } else {
          importQuestions(result.questions);
          setUploadFeedback({
            success: `Berhasil mengimpor ${result.questions.length} butir soal dari CSV/Teks!`,
            warnings: result.warnings,
          });
        }
      } else {
        setUploadFeedback({
          errors: ['Format file tidak didukung. Mohon gunakan file .xlsx, .xls, .csv, atau .txt.'],
        });
      }
    } catch (err: any) {
      setUploadFeedback({
        errors: [`Terjadi kendala saat membaca file: ${err?.message || 'Error tidak terduga'}`],
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Text Paste Handler
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) return;
    const result = parseRawTextPaste(pastedText);
    if (result.errors.length > 0) {
      setUploadFeedback({ errors: result.errors });
    } else {
      importQuestions(result.questions);
      setUploadFeedback({
        success: `Berhasil mengekstrak ${result.questions.length} butir soal dari teks yang ditempel!`,
        warnings: result.warnings,
      });
      setPastedText('');
      setShowPasteModal(false);
    }
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = filterLevel === 'all' || q.educationLevel === filterLevel;
    const matchesType = filterType === 'all' || q.type === filterType;
    const matchesDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;

    return matchesSearch && matchesLevel && matchesType && matchesDiff;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Bank Soal Universal
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola kumpulan soal pembelajaran, impor dokumen Excel/CSV, atau tambahkan butir soal secara manual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download Templates */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={downloadExcelTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-white rounded-lg transition-all"
                title="Unduh Format Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Template Excel</span>
              </button>
              <button
                onClick={downloadCSVTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-700 hover:bg-white rounded-lg transition-all"
                title="Unduh Format CSV"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Template CSV</span>
              </button>
            </div>

            {/* Quick Sample Loader */}
            <button
              onClick={loadSampleQuestions}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              title="Reset dan isi bank soal dengan contoh PAUD, SD, SMP, SMA"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Muat Contoh Soal</span>
            </button>

            {/* Manual Add Button */}
            <button
              onClick={() => setIsCreatingNew(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Soal Manual</span>
            </button>
          </div>
        </div>

        {/* Upload Dropzone & Paste Section */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800">
                {isUploading ? 'Memproses berkas...' : 'Unggah File Soal (.xlsx / .csv)'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Klik untuk memilih file lembar kerja Excel atau CSV dari perangkat
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv,.txt"
              className="hidden"
            />
          </div>

          {/* Paste Text Box */}
          <div
            onClick={() => setShowPasteModal(true)}
            className="border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800">Salin & Tempel Teks Soal</div>
              <div className="text-[11px] text-slate-500 truncate">
                Impor dari Word / dokumen teks dengan format bernomor otomatis
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {uploadFeedback && (
          <div className="mt-4 space-y-2">
            {uploadFeedback.success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadFeedback.success}</span>
              </div>
            )}
            {uploadFeedback.errors && uploadFeedback.errors.map((err, i) => (
              <div key={i} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{err}</span>
              </div>
            ))}
            {uploadFeedback.warnings && uploadFeedback.warnings.map((warn, i) => (
              <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan soal, materi, mata pelajaran..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Cari soal"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Jenjang</option>
            <option value="PAUD">PAUD / TK</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA_SMK">SMA / SMK</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Tipe Soal</option>
            <option value="multiple_choice">Pilihan Ganda</option>
            <option value="true_false">Benar / Salah</option>
            <option value="short_answer">Isian Singkat</option>
            <option value="matching">Menjodohkan</option>
            <option value="picture_guess">Tebak Gambar</option>
            <option value="reading_comprehension">Teks Bacaan</option>
            <option value="essay">Uraian / Essay</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Kesulitan</option>
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>

          {/* Clear Bank */}
          {questions.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Kosongkan semua soal di bank soal?')) {
                  clearQuestions();
                }
              }}
              className="text-xs px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-auto font-medium"
            >
              Kosongkan Bank
            </button>
          )}
        </div>
      </div>

      {/* Question Counter & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800">
            Daftar Soal ({filteredQuestions.length} dari {questions.length} butir)
          </div>
          <div className="text-xs text-slate-500">
            Tersimpan lokal di peramban (Local Storage)
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Belum ada butir soal</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Gunakan tombol "Muat Contoh Soal", unggah file Excel/CSV, atau klik "Tambah Soal Manual" di atas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQuestions.map((q, index) => {
              // Check if missing key
              const hasNoAnswerKey =
                q.type !== 'essay' &&
                q.type !== 'matching' &&
                (q.correctAnswer === undefined || q.correctAnswer === null || q.correctAnswer === '');

              return (
                <div
                  key={q.id}
                  className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Metadata Header */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-700">#{index + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-indigo-700">{q.educationLevel}</span>
                      {q.grade && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{q.grade}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-800 font-medium">{q.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600">{q.topic}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{q.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Tipe: {q.type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Question text */}
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {q.question}
                    </p>

                    {/* Optional Image Preview */}
                    {q.imageUrl && (
                      <div className="mt-1">
                        <img
                          src={q.imageUrl}
                          alt="Soal Gambar"
                          referrerPolicy="no-referrer"
                          className="h-20 w-auto rounded-lg object-cover border border-slate-200"
                        />
                      </div>
                    )}

                    {/* Options Preview for Multiple Choice */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const letter = String.fromCharCode(65 + oIdx);
                          const isKey = String(q.correctAnswer) === String(opt);
                          return (
                            <div
                              key={oIdx}
                              className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                                isKey
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <span className="w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center bg-slate-100 text-slate-600 shrink-0">
                                {letter}
                              </span>
                              <span className="truncate">{opt}</span>
                              {isKey && <span className="ml-auto text-[10px] text-emerald-600">✓ Kunci</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True/False Key */}
                    {q.type === 'true_false' && (
                      <div className="text-xs pt-1">
                        <span className="text-slate-500">Kunci: </span>
                        <span className="font-bold text-emerald-700">
                          {q.correctAnswer ? 'BENAR' : 'SALAH'}
                        </span>
                      </div>
                    )}

                    {/* Short Answer Key */}
                    {q.type === 'short_answer' && (
                      <div className="text-xs pt-1">
                        <span className="text-slate-500">Kunci Isian: </span>
                        <span className="font-bold text-indigo-700 font-mono">
                          {String(q.correctAnswer)}
                        </span>
                      </div>
                    )}

                    {/* Matching Pairs */}
                    {q.type === 'matching' && q.matchingPairs && (
                      <div className="text-xs text-slate-600 pt-1 flex flex-wrap gap-2">
                        {q.matchingPairs.map((pair, pIdx) => (
                          <span
                            key={pIdx}
                            className="bg-purple-50 border border-purple-200 text-purple-900 px-2 py-0.5 rounded text-[11px]"
                          >
                            {pair.left} ↔ {pair.right}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Warning if missing key */}
                    {hasNoAnswerKey && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 w-fit">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Kunci jawaban belum ditentukan! Klik Edit untuk melengkapi.</span>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <p className="text-xs text-slate-500 italic pt-0.5">
                        <span className="font-semibold text-slate-600">Pembahasan: </span>
                        {q.explanation}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      title="Edit Soal"
                      aria-label={`Edit soal ${index + 1}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Hapus soal ini dari bank soal?')) {
                          deleteQuestion(q.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      title="Hapus Soal"
                      aria-label={`Hapus soal ${index + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Salin & Tempel Teks Soal
                </h3>
                <p className="text-xs text-slate-500">
                  Tempel teks soal dengan format bernomor (1., 2.), opsi (A., B.), dan kunci jawaban.
                </p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-900 leading-relaxed">
                <strong>Format Contoh Teks:</strong>
                <pre className="mt-1 font-mono text-[11px] whitespace-pre-wrap text-slate-700 bg-white p-2 rounded border border-indigo-100">
{`1. Ibukota Indonesia adalah...
A. Jakarta
B. Nusantara
C. Bandung
Kunci: B
Pembahasan: IKN terletak di Kalimantan Timur.`}
                </pre>
              </div>

              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={8}
                placeholder="Tempel teks kumpulan soal di sini..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowPasteModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleProcessPastedText}
                  disabled={!pastedText.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-all"
                >
                  Proses & Impor Soal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal for Edit */}
      {editingQuestion && (
        <QuestionEditorModal
          initialQuestion={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={(updated) => updateQuestion(editingQuestion.id, updated)}
        />
      )}

      {/* Editor Modal for New Question */}
      {isCreatingNew && (
        <QuestionEditorModal
          onClose={() => setIsCreatingNew(false)}
          onSave={(newQ) => addQuestion(newQ)}
        />
      )}
    </div>
  );
};
