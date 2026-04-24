import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import api from '../api';

const PRIZE_KEYS = [
  { nameKey: 'wheel.pts5',       emoji: '🪙', color: '#4f46e5' },
  { nameKey: 'wheel.pts10',      emoji: '💰', color: '#7c3aed' },
  { nameKey: 'wheel.pts20',      emoji: '💎', color: '#9333ea' },
  { nameKey: 'wheel.thanks',     emoji: '🍃', color: '#374151' },
  { nameKey: 'wheel.pts50',      emoji: '🏆', color: '#db2777' },
  { nameKey: 'wheel.freeTicket', emoji: '🎫', color: '#059669' },
  { nameKey: 'wheel.pts100',     emoji: '👑', color: '#d97706' },
  { nameKey: 'wheel.tryAgain',   emoji: '🔄', color: '#2563eb' },
];

const SEG = 360 / PRIZE_KEYS.length; // 45°
const COST = 20;
const SPIN_DURATION = 5000; // 5 seconds

// Easing: fast start, slow stop
function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

interface Props {
  points: number;
  onDraw: () => void;
  onClose: () => void;
}

export default function LuckyWheel({ points, onDraw, onClose }: Props) {
  const { t } = useTranslation();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ prize: string; pointsWon: number; net: number; points: number; prizeKey?: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(points);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const animRef = useRef(0);

  // Build translated prizes from i18n keys
  const PRIZES = PRIZE_KEYS.map(p => ({ ...p, name: t(p.nameKey) }));

  useEffect(() => { setCurrentPoints(points); }, [points]);

  // Redraw when language changes
  useEffect(() => {
    if (!spinning && canvasRef.current) {
      drawWheel(angleRef.current);
    }
  }, [PRIZES]);

  // Draw wheel on canvas
  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = 125;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw segments
    PRIZES.forEach((prize, i) => {
      const startAngle = ((i * SEG - 90) * Math.PI) / 180;
      const endAngle = (((i + 1) * SEG - 90) * Math.PI) / 180;

      // Segment
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text
      const midAngle = (startAngle + endAngle) / 2;
      const textR = r * 0.65;
      const tx = textR * Math.cos(midAngle);
      const ty = textR * Math.sin(midAngle);

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(midAngle + Math.PI / 2);

      // Emoji
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(prize.emoji, 0, -8);

      // Name
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(prize.name, 0, 10);

      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    // Pointer (fixed, outside rotation)
    ctx.beginPath();
    ctx.moveTo(cx, 8);
    ctx.lineTo(cx - 12, -8);
    ctx.lineTo(cx + 12, -8);
    ctx.closePath();
    ctx.fillStyle = '#facc15';
    ctx.fill();
    ctx.shadowColor = 'rgba(250,204,21,0.6)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Edge lights
    for (let i = 0; i < 20; i++) {
      const a = ((i / 20) * 360 * Math.PI) / 180;
      const lx = cx + (r + 10) * Math.cos(a);
      const ly = cy + (r + 10) * Math.sin(a);
      const phase = (Date.now() / 400 + i) % 2;
      const opacity = phase < 1 ? 0.3 + 0.7 * phase : 0.3 + 0.7 * (2 - phase);
      ctx.beginPath();
      ctx.arc(lx, ly, 3, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0
        ? `rgba(250,204,21,${opacity})`
        : `rgba(244,114,182,${opacity})`;
      ctx.fill();
    }
  };

  // Static draw (idle animation for lights blinking)
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!spinning && running) {
        drawWheel(angleRef.current);
        animRef.current = requestAnimationFrame(loop);
      }
    };
    loop();
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [spinning]);

  const handleSpin = async () => {
    if (spinning || currentPoints < COST) return;
    setSpinning(true);
    setResult(null);
    setShowResult(false);

    try {
      const { data } = await api.post('/points/lucky-draw');

      // Use prizeIndex from server (0-7), fallback to 3 if not provided
      const idx = typeof data.prizeIndex === 'number' ? data.prizeIndex : 3;

      // Target: pointer at top points to segment center
      const targetAngle = idx * SEG + SEG / 2;
      const fullSpins = (7 + Math.floor(Math.random() * 3)) * 360;
      const endAngle = angleRef.current + fullSpins + ((360 - targetAngle) - (angleRef.current % 360) + 360) % 360;

      // Animate with requestAnimationFrame
      const startAngle = angleRef.current;
      const totalDelta = endAngle - startAngle;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / SPIN_DURATION, 1);
        const eased = easeOutQuart(t);
        const current = startAngle + totalDelta * eased;
        angleRef.current = current;
        drawWheel(current);

        if (t < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          // Done
          angleRef.current = endAngle;
          // Store prizeKey for i18n display
          const prizeKey = data.prizeKey || PRIZE_KEYS[idx]?.nameKey || 'wheel.thanks';
          setResult({ ...data, prizeKey });
          setCurrentPoints(data.points);
          setShowResult(true);
          setSpinning(false);
          onDraw();
        }
      };

      animRef.current = requestAnimationFrame(animate);
    } catch {
      setSpinning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="relative max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-white">{t('wheel.title')}</h2>
          <p className="text-gray-400 text-sm mt-1">{t('wheel.subtitle', { cost: COST })}</p>
        </div>

        {/* Canvas wheel */}
        <div className="flex justify-center">
          <canvas ref={canvasRef} style={{ width: 280, height: 280 }} />
        </div>

        {/* Center GO overlay */}
        <button
          onClick={handleSpin}
          disabled={spinning || currentPoints < COST}
          className="absolute left-1/2 top-[calc(50%-8px)] -translate-x-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-[3px] border-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.5)] flex items-center justify-center disabled:opacity-40 hover:scale-110 active:scale-90 transition-transform"
          style={{ pointerEvents: spinning ? 'none' : 'auto' }}
        >
          {spinning
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <span className="text-white font-extrabold text-sm">GO</span>
          }
        </button>

        {/* Result */}
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`mt-5 text-center py-4 px-6 rounded-2xl border ${
                result.pointsWon > 20 ? 'bg-yellow-900/30 border-yellow-500/30' :
                result.pointsWon > 0 ? 'bg-green-900/30 border-green-500/30' :
                'bg-gray-800/50 border-gray-700/50'
              }`}
            >
              <div className="text-2xl mb-1">{result.pointsWon >= 50 ? '🎉🎉🎉' : result.pointsWon > 0 ? '🎉' : '😅'}</div>
              <div className="text-white font-bold text-lg">{t(result.prizeKey || 'wheel.thanks')}</div>
              <div className="text-gray-400 text-sm mt-1">
                {result.net > 0 ? t('wheel.netWin', { amount: result.net }) : result.net < 0 ? t('wheel.netLoss', { amount: Math.abs(result.net) }) : t('wheel.netZero')} · {t('wheel.remaining', { points: result.points })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom spin button */}
        <button
          onClick={handleSpin}
          disabled={spinning || currentPoints < COST}
          className="mt-5 w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
        >
          {spinning
            ? <><Zap className="w-5 h-5 animate-pulse" /> {t('wheel.spinning')}</>
            : <><Zap className="w-5 h-5" /> {t('wheel.spin', { cost: COST, points: currentPoints })}</>
          }
        </button>
      </motion.div>
    </motion.div>
  );
}
