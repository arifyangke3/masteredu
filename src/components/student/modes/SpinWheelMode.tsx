import React, { useState, useRef, useEffect } from 'react';
import { Compass, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Question } from '../../../types';
import { SoundEngine } from '../../../utils/soundEffects';

interface SpinWheelModeProps {
  question: Question;
  onAnswer: (userAnswer: any, isCorrect: boolean, bonusMultiplier?: number) => void;
  soundEnabled: boolean;
  showExplanationMode: 'always' | 'end_only' | 'never';
}

const SEGMENTS = [
  { label: 'Poin x1.0', mult: 1.0, color: '#6366f1' },
  { label: 'Poin x2.0', mult: 2.0, color: '#10b981' },
  { label: 'Bonus +50', mult: 1.5, color: '#f59e0b' },
  { label: 'Poin x1.2', mult: 1.2, color: '#06b6d4' },
  { label: 'Mega x3.0', mult: 3.0, color: '#ec4899' },
  { label: 'Bonus +100', mult: 2.0, color: '#8b5cf6' },
];

export const SpinWheelMode: React.FC<SpinWheelModeProps> = ({
  question,
  onAnswer,
  soundEnabled,
  showExplanationMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [wonSegment, setWonSegment] = useState<string>('');

  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const angleRef = useRef<number>(0);

  // Draw wheel on canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 10;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const segAngle = (Math.PI * 2) / SEGMENTS.length;

    // Outer border
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Segments
    SEGMENTS.forEach((seg, i) => {
      const start = angle + i * segAngle;
      const end = start + segAngle;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + segAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      ctx.fillText(seg.label, radius - 15, 4);
      ctx.restore();
    });

    // Center knob
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel(angleRef.current);
  }, []);

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;
    setIsSpinning(true);

    const fullSpins = 4 + Math.random() * 3;
    const targetAngle = angleRef.current + fullSpins * Math.PI * 2 + Math.random() * Math.PI * 2;
    const duration = 2800; // ms
    const startTime = performance.now();
    const startAngle = angleRef.current;

    const interval = setInterval(() => {
      SoundEngine.playSpin(soundEnabled);
    }, 150);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + (targetAngle - startAngle) * ease;
      angleRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        clearInterval(interval);
        setIsSpinning(false);
        setHasSpun(true);

        // Calculate which segment is at the pointer (top = 3*Math.PI/2 or 0 depending on pointer position)
        // Pointer is at the top (angle 270 deg / -90 deg)
        const normalized = (3 * Math.PI / 2 - (currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const segAngle = (Math.PI * 2) / SEGMENTS.length;
        const index = Math.floor(normalized / segAngle) % SEGMENTS.length;
        const win = SEGMENTS[index];
        setCurrentMultiplier(win.mult);
        setWonSegment(win.label);
        SoundEngine.playFanfare(soundEnabled);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    SoundEngine.playClick(soundEnabled);
    setSelectedAnswer(opt);

    const correct =
      String(opt).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      SoundEngine.playCorrect(soundEnabled);
    } else {
      SoundEngine.playWrong(soundEnabled);
    }

    if (showExplanationMode !== 'always') {
      setTimeout(() => {
        onAnswer(opt, correct, currentMultiplier);
      }, 600);
    }
  };

  const handleNext = () => {
    onAnswer(selectedAnswer, isCorrect ?? false, currentMultiplier);
  };

  return (
    <div className="space-y-6">
      {/* Roda Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-4 shadow-xs">
        <span className="text-[11px] font-bold tracking-wider uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-full inline-block">
          Roda Keberuntungan · Spin Wheel Bonus
        </span>

        {/* Wheel container with pointer */}
        <div className="relative inline-block my-2">
          {/* Top Pointer Arrow */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-x-8 border-x-transparent border-t-[14px] border-t-amber-400 drop-shadow-md" />
          <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="rounded-full shadow-inner mx-auto cursor-pointer"
            onClick={handleSpin}
          />
        </div>

        <div>
          {!hasSpun ? (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 disabled:opacity-50 rounded-2xl shadow-sm transition-all"
            >
              {isSpinning ? 'Roda Berputar...' : 'Putar Roda Bonus!'}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Hadiah Putaran: {wonSegment} (Pengali x{currentMultiplier})</span>
            </div>
          )}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
          {question.question}
        </h2>

        {/* Options */}
        {question.options && question.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedAnswer === opt;
              const isKey =
                String(opt).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();

              let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400';
              if (isSubmitted) {
                if (isSelected) {
                  btnStyle = isCorrect
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-rose-500 text-white border-rose-600';
                } else if (isKey) {
                  btnStyle = 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isSubmitted}
                  className={`p-4 rounded-2xl border-2 text-left font-semibold transition-all flex items-center gap-3.5 ${btnStyle}`}
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {letter}
                  </span>
                  <span className="text-sm flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Explanation */}
        {isSubmitted && showExplanationMode === 'always' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 mt-4">
            <div className="text-xs font-bold">
              {isCorrect ? (
                <span className="text-emerald-700">
                  Benar! Poin dikalikan x{currentMultiplier} = +{Math.round((question.points || 100) * currentMultiplier)} poin!
                </span>
              ) : (
                <span className="text-rose-700">Kurang Tepat</span>
              )}
            </div>
            {question.explanation && (
              <p className="text-xs text-slate-600">
                <strong>Pembahasan:</strong> {question.explanation}
              </p>
            )}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                <span>Soal Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
