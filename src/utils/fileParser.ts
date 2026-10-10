import * as XLSX from 'xlsx';
import { Question, QuestionType, DifficultyLevel, EducationLevel, GameResult } from '../types';

export interface ParseResult {
  questions: Question[];
  warnings: string[];
  errors: string[];
}

// Normalizer for Question Type
function normalizeQuestionType(rawType: string): QuestionType {
  const t = (rawType || '').toLowerCase().trim();
  if (t.includes('benar') || t.includes('salah') || t.includes('true') || t.includes('false') || t === 'bs') {
    return 'true_false';
  }
  if (t.includes('isian') || t.includes('singkat') || t.includes('short')) {
    return 'short_answer';
  }
  if (t.includes('jodoh') || t.includes('match') || t.includes('pasang')) {
    return 'matching';
  }
  if (t.includes('uraian') || t.includes('essay')) {
    return 'essay';
  }
  if (t.includes('gambar') || t.includes('picture') || t.includes('image')) {
    return 'picture_guess';
  }
  if (t.includes('bacaan') || t.includes('teks') || t.includes('reading')) {
    return 'reading_comprehension';
  }
  return 'multiple_choice';
}

// Normalizer for Education Level
function normalizeLevel(rawLevel: string): EducationLevel {
  const l = (rawLevel || '').toUpperCase().trim();
  if (l.includes('PAUD') || l.includes('TK')) return 'PAUD';
  if (l.includes('SD') || l.includes('MI')) return 'SD';
  if (l.includes('SMP') || l.includes('MTS')) return 'SMP';
  if (l.includes('SMA') || l.includes('SMK') || l.includes('MA')) return 'SMA_SMK';
  return 'SD';
}

// Normalizer for Difficulty
function normalizeDifficulty(rawDiff: string): DifficultyLevel {
  const d = (rawDiff || '').toLowerCase().trim();
  if (d.includes('sulit') || d.includes('hard') || d.includes('tinggi')) return 'sulit';
  if (d.includes('sedang') || d.includes('medium')) return 'sedang';
  return 'mudah';
}

// Process row objects from Excel or CSV
export function processRawRows(rows: Record<string, any>[]): ParseResult {
  const questions: Question[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!rows || rows.length === 0) {
    errors.push('File tidak memiliki data atau baris kosong.');
    return { questions, warnings, errors };
  }

  rows.forEach((row, index) => {
    const rowNum = index + 2; // Assuming header is row 1
    // Find keys case-insensitively
    const getVal = (possibleKeys: string[]): string => {
      for (const key of Object.keys(row)) {
        const cleanedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const candidate of possibleKeys) {
          const cleanedCandidate = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanedKey === cleanedCandidate || cleanedKey.includes(cleanedCandidate)) {
            const val = row[key];
            return val !== undefined && val !== null ? String(val).trim() : '';
          }
        }
      }
      return '';
    };

    const questionText = getVal(['soal', 'pertanyaan', 'question', 'deskripsi_soal']);
    if (!questionText) {
      warnings.push(`Baris ${rowNum}: Dilewati karena kolom 'Soal' kosong.`);
      return;
    }

    const rawType = getVal(['tipe', 'jenis', 'type', 'kategori_soal']);
    const type = normalizeQuestionType(rawType);

    // Options
    let options: string[] = [];
    const optA = getVal(['opsia', 'pilihana', 'optiona', 'a']);
    const optB = getVal(['opsib', 'pilihanb', 'optionb', 'b']);
    const optC = getVal(['opsic', 'pilihanc', 'optionc', 'c']);
    const optD = getVal(['opsid', 'pilihand', 'optiond', 'd']);
    const optE = getVal(['opsie', 'pilihane', 'optione', 'e']);

    if (optA || optB) {
      if (optA) options.push(optA);
      if (optB) options.push(optB);
      if (optC) options.push(optC);
      if (optD) options.push(optD);
      if (optE) options.push(optE);
    } else {
      // Check combined options field (separated by | or ;)
      const combinedOptions = getVal(['opsi', 'pilihan', 'options']);
      if (combinedOptions) {
        options = combinedOptions.split(/[|;]/).map((s) => s.trim()).filter(Boolean);
      }
    }

    let answerKey = getVal(['kunci', 'kuncijawaban', 'jawaban', 'answer', 'correct']);
    const explanation = getVal(['pembahasan', 'penjelasan', 'explanation', 'alasan']);
    const rawLevel = getVal(['jenjang', 'tingkat', 'level']);
    const grade = getVal(['kelas', 'grade']) || 'Kelas Umum';
    const subject = getVal(['matapelajaran', 'mapel', 'subject']) || 'Pelajaran Umum';
    const topic = getVal(['materi', 'topik', 'topic', 'tema']) || 'Umum';
    const rawDifficulty = getVal(['kesulitan', 'difficulty']);
    const imageUrl = getVal(['gambar', 'image', 'urlgambar', 'foto']);
    const passageText = getVal(['teks', 'teksbacaan', 'passage', 'bacaan']);
    const rawPairs = getVal(['jodohkan', 'matching', 'pasangan']);

    // Match pairs if type is matching
    let matchingPairs: { id: string; left: string; right: string }[] = [];
    if (type === 'matching' && rawPairs) {
      // format "A=1; B=2; C=3" or "A:1 | B:2"
      const pairTokens = rawPairs.split(/[;|]/);
      matchingPairs = pairTokens.map((p, idx) => {
        const parts = p.split(/[:=]/);
        return {
          id: `p-${idx + 1}`,
          left: (parts[0] || '').trim(),
          right: (parts[1] || '').trim(),
        };
      }).filter(p => p.left && p.right);
    }

    // Validation
    if (!answerKey && type !== 'essay' && type !== 'matching') {
      warnings.push(`Baris ${rowNum}: Kunci jawaban belum terisi untuk tipe "${type}". Mohon lengkapi pada editor.`);
    }

    if ((type === 'multiple_choice' || type === 'picture_guess') && options.length < 2) {
      warnings.push(`Baris ${rowNum}: Tipe pilihan ganda memerlukan minimal 2 opsi.`);
    }

    // Format answer key for true/false
    let finalAnswerKey: string | boolean | string[] = answerKey;
    if (type === 'true_false') {
      const akLower = String(answerKey).toLowerCase().trim();
      finalAnswerKey = akLower.includes('benar') || akLower === 'true' || akLower === 'b' || akLower === '1';
    }

    questions.push({
      id: `q-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      question: questionText,
      type,
      options: options.length > 0 ? options : undefined,
      correctAnswer: finalAnswerKey,
      explanation: explanation || undefined,
      educationLevel: normalizeLevel(rawLevel),
      grade,
      subject,
      topic,
      difficulty: normalizeDifficulty(rawDifficulty),
      imageUrl: imageUrl || undefined,
      passageText: passageText || undefined,
      matchingPairs: matchingPairs.length > 0 ? matchingPairs : undefined,
      points: 10,
    });
  });

  return { questions, warnings, errors };
}

// Parse Excel file buffer
export async function parseExcelFile(file: File): Promise<ParseResult> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { questions: [], warnings: [], errors: ['File Excel tidak memiliki lembar kerja (sheet).'] };
    }
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    return processRawRows(rows);
  } catch (err: any) {
    return { questions: [], warnings: [], errors: [`Gagal membaca file Excel: ${err?.message || 'Format tidak valid'}`] };
  }
}

// Parse CSV text
export function parseCSVText(csvContent: string): ParseResult {
  try {
    const workbook = XLSX.read(csvContent, { type: 'string' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
    return processRawRows(rows);
  } catch (err: any) {
    return { questions: [], warnings: [], errors: [`Gagal membaca format CSV: ${err?.message || 'Error parsing'}`] };
  }
}

// Parse Raw Text pasted by teacher (e.g. numbered questions from Word or text)
export function parseRawTextPaste(text: string): ParseResult {
  const questions: Question[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!text || text.trim().length === 0) {
    errors.push('Teks yang ditempel kosong.');
    return { questions, warnings, errors };
  }

  // Split by question blocks: separated by empty lines or numbered lines (1., 2., No 1, etc.)
  const lines = text.split('\n').map(l => l.trim());
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    if (!line) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
      continue;
    }
    // Check if line starts with question number: e.g. "1.", "1)", "Soal 1:"
    if (/^(soal\s*)?\d+[\.\)]\s*/i.test(line) && currentBlock.length > 0) {
      blocks.push(currentBlock);
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  blocks.forEach((block, idx) => {
    let questionText = '';
    const options: string[] = [];
    let answerKey = '';
    let explanation = '';
    let type: QuestionType = 'multiple_choice';

    block.forEach(line => {
      // Check for answer key line: "Kunci: A" or "Jawaban: B"
      const keyMatch = line.match(/^(kunci(\s*jawaban)?|jawaban|kunci)\s*[:=]\s*(.+)$/i);
      if (keyMatch) {
        answerKey = keyMatch[3].trim();
        return;
      }

      // Check for explanation line: "Pembahasan: ..."
      const expMatch = line.match(/^(pembahasan|penjelasan|alasan)\s*[:=]\s*(.+)$/i);
      if (expMatch) {
        explanation = expMatch[2].trim();
        return;
      }

      // Check for options: A. ..., B. ..., A) ...
      const optMatch = line.match(/^([A-Ea-e])[\.\)]\s*(.+)$/);
      if (optMatch) {
        options.push(optMatch[2].trim());
        return;
      }

      // Question body
      if (!questionText) {
        questionText = line.replace(/^(soal\s*)?\d+[\.\)]\s*/i, '').trim();
      } else {
        questionText += ' ' + line;
      }
    });

    if (!questionText) {
      warnings.push(`Blok ${idx + 1}: Teks soal tidak ditemukan.`);
      return;
    }

    if (options.length === 0) {
      // Check if true/false or short answer
      const qLower = questionText.toLowerCase();
      if (qLower.includes('benar') && qLower.includes('salah')) {
        type = 'true_false';
      } else {
        type = 'short_answer';
      }
    }

    // Determine answer key for MC
    let formattedKey: any = answerKey;
    if (type === 'multiple_choice' && answerKey.length === 1 && /^[A-E]$/i.test(answerKey)) {
      const optIndex = answerKey.toUpperCase().charCodeAt(0) - 65;
      if (options[optIndex]) {
        formattedKey = options[optIndex];
      }
    }

    questions.push({
      id: `q-paste-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      question: questionText,
      type,
      options: options.length > 0 ? options : undefined,
      correctAnswer: formattedKey || (options[0] ?? ''),
      explanation: explanation || undefined,
      educationLevel: 'SD',
      grade: 'Kelas 4',
      subject: 'Tematik / Umum',
      topic: 'Latihan Soal',
      difficulty: 'sedang',
      points: 10,
    });
  });

  return { questions, warnings, errors };
}

// Generate Excel template for teachers to download
export function downloadExcelTemplate() {
  const sampleData = [
    {
      'Soal': 'Ibukota negara Indonesia yang baru di Kalimantan Timur adalah...',
      'Tipe': 'Pilihan Ganda',
      'Pilihan A': 'Jakarta',
      'Pilihan B': 'Nusantara',
      'Pilihan C': 'Surabaya',
      'Pilihan D': 'Bandung',
      'Pilihan E': 'Medan',
      'Kunci Jawaban': 'Nusantara',
      'Pembahasan': 'Ibu Kota Nusantara (IKN) terletak di Kabupaten Penajam Paser Utara dan Kutai Kartanegara, Kalimantan Timur.',
      'Jenjang': 'SD',
      'Kelas': 'Kelas 5',
      'Mata Pelajaran': 'IPS',
      'Materi': 'Geografi & Pemerintahan',
      'Kesulitan': 'Mudah',
      'Gambar': '',
      'Teks Bacaan': ''
    },
    {
      'Soal': 'Matahari terbit dari sebelah barat.',
      'Tipe': 'Benar/Salah',
      'Pilihan A': '',
      'Pilihan B': '',
      'Pilihan C': '',
      'Pilihan D': '',
      'Pilihan E': '',
      'Kunci Jawaban': 'Salah',
      'Pembahasan': 'Bumi berotasi dari barat ke timur, sehingga matahari tampak selalu terbit di sebelah timur.',
      'Jenjang': 'SD',
      'Kelas': 'Kelas 4',
      'Mata Pelajaran': 'IPA',
      'Materi': 'Tata Surya & Bumi',
      'Kesulitan': 'Mudah',
      'Gambar': '',
      'Teks Bacaan': ''
    },
    {
      'Soal': 'Berapakah hasil dari 15 x 8?',
      'Tipe': 'Isian Singkat',
      'Pilihan A': '',
      'Pilihan B': '',
      'Pilihan C': '',
      'Pilihan D': '',
      'Pilihan E': '',
      'Kunci Jawaban': '120',
      'Pembahasan': '15 x 8 = 120.',
      'Jenjang': 'SD',
      'Kelas': 'Kelas 4',
      'Mata Pelajaran': 'Matematika',
      'Materi': 'Perkalian Bilangan Bulat',
      'Kesulitan': 'Sedang',
      'Gambar': '',
      'Teks Bacaan': ''
    },
    {
      'Soal': 'Pasangkan nama organ pernapasan dengan fungsinya yang tepat!',
      'Tipe': 'Menjodohkan',
      'Pilihan A': '',
      'Pilihan B': '',
      'Pilihan C': '',
      'Pilihan D': '',
      'Pilihan E': '',
      'Kunci Jawaban': '',
      'Pembahasan': 'Alveolus tempat pertukaran gas, hidung menyaring udara, trakea saluran udara.',
      'Jenjang': 'SMP',
      'Kelas': 'Kelas 8',
      'Mata Pelajaran': 'IPA',
      'Materi': 'Sistem Pernapasan Manusia',
      'Kesulitan': 'Sedang',
      'Gambar': '',
      'Teks Bacaan': '',
      'Pasangan Menjodohkan': 'Hidung=Menyaring kotoran dan menghangatkan udara; Trakea=Batang tenggorokan saluran udara; Alveolus=Pertukaran oksigen dan karbon dioksida'
    },
    {
      'Soal': 'Jelaskan perbedaan fotosintesis dan respirasi pada tumbuhan!',
      'Tipe': 'Uraian',
      'Pilihan A': '',
      'Pilihan B': '',
      'Pilihan C': '',
      'Pilihan D': '',
      'Pilihan E': '',
      'Kunci Jawaban': 'Fotosintesis menghasilkan glukosa & O2 menggunakan cahaya dan CO2; respirasi membakar glukosa untuk menghasilkan energi sel.',
      'Pembahasan': 'Fotosintesis terjadi di kloroplas saat ada cahaya, sedangkan respirasi terjadi di mitokondria sepanjang waktu.',
      'Jenjang': 'SMP',
      'Kelas': 'Kelas 7',
      'Mata Pelajaran': 'IPA',
      'Materi': 'Metabolisme Sel',
      'Kesulitan': 'Sulit',
      'Gambar': '',
      'Teks Bacaan': ''
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Soal');
  XLSX.writeFile(wb, 'Template_Bank_Soal_EduGameMaster.xlsx');
}

// Download CSV template
export function downloadCSVTemplate() {
  const csvText = `Soal,Tipe,Pilihan A,Pilihan B,Pilihan C,Pilihan D,Kunci Jawaban,Pembahasan,Jenjang,Kelas,Mata Pelajaran,Materi,Kesulitan
"Ibukota negara Indonesia yang baru adalah...","Pilihan Ganda","Jakarta","Nusantara","Bandung","Surabaya","Nusantara","IKN Nusantara di Kaltim","SD","Kelas 5","IPS","Geografi","Mudah"
"Matahari terbit dari arah timur.","Benar/Salah","","","","","Benar","Rotasi bumi ke timur","SD","Kelas 4","IPA","Tata Surya","Mudah"
"Berapa 12 x 12?","Isian Singkat","","","","","144","12 kuadrat = 144","SD","Kelas 5","Matematika","Perkalian","Mudah"
`;
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Template_Bank_Soal_EduGameMaster.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Export Game Results to Excel file (.xlsx)
export function exportResultsToExcel(results: GameResult[], gameTitle: string) {
  const summaryRows = results.map((r, i) => ({
    'No': i + 1,
    'Nama Siswa': r.studentName,
    'Tim/Kelas': r.teamName || '-',
    'Kode Game': r.gameCode,
    'Judul Game': r.gameTitle,
    'Mata Pelajaran': r.subject,
    'Jenjang': r.educationLevel,
    'Nilai Skor': r.score,
    'Skor Maksimal': r.maxScore,
    'Persentase (%)': `${r.percentage}%`,
    'Benar': r.correctCount,
    'Salah': r.wrongCount,
    'Tidak Dijawab': r.unansweredCount,
    'Total Soal': r.totalQuestions,
    'Waktu (Detik)': r.timeSpentSeconds,
    'Status Uraian': r.hasPendingEssay ? 'Perlu Penilaian Manual' : 'Selesai Dinilai',
    'Tanggal Main': r.completedAt,
  }));

  const wb = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Rekap_Nilai');

  // Also include a detailed answer sheet
  const detailRows: any[] = [];
  results.forEach(r => {
    r.answers.forEach((ans, aIdx) => {
      detailRows.push({
        'Nama Siswa': r.studentName,
        'No Soal': aIdx + 1,
        'Pertanyaan': ans.questionText,
        'Tipe': ans.type,
        'Jawaban Siswa': typeof ans.userAnswer === 'object' ? JSON.stringify(ans.userAnswer) : String(ans.userAnswer ?? '-'),
        'Kunci Jawaban': typeof ans.correctAnswer === 'object' ? JSON.stringify(ans.correctAnswer) : String(ans.correctAnswer ?? '-'),
        'Status': ans.isCorrect === true ? 'BENAR' : ans.isCorrect === false ? 'SALAH' : 'MENUNGGU GURU',
        'Poin Diperoleh': ans.pointsEarned,
        'Poin Maksimal': ans.maxPoints,
        'Catatan Guru': ans.teacherFeedback || '-',
      });
    });
  });

  if (detailRows.length > 0) {
    const detailSheet = XLSX.utils.json_to_sheet(detailRows);
    XLSX.utils.book_append_sheet(wb, detailSheet, 'Detail_Jawaban_Siswa');
  }

  const filename = `Rekap_${gameTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// Export Game Results to CSV
export function exportResultsToCSV(results: GameResult[], gameTitle: string) {
  const rows = results.map((r, i) => [
    i + 1,
    `"${r.studentName}"`,
    `"${r.teamName || '-'}"`,
    `"${r.gameCode}"`,
    `"${r.gameTitle}"`,
    `"${r.subject}"`,
    r.score,
    r.maxScore,
    `${r.percentage}%`,
    r.correctCount,
    r.wrongCount,
    r.unansweredCount,
    r.timeSpentSeconds,
    `"${r.completedAt}"`
  ].join(','));

  const header = 'No,Nama Siswa,Tim/Kelas,Kode Game,Judul Game,Mata Pelajaran,Skor,Skor Maks,Persentase,Benar,Salah,Tidak Dijawab,Waktu (detik),Tanggal';
  const csvContent = [header, ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rekap_${gameTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
