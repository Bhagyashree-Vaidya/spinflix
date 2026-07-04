import React, { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { Movie } from '../../types';

interface WheelProps {
  movies: Movie[];
  isSpinning: boolean;
  targetRotation: number;
  winnerIndex: number | null;
  onSpinComplete: () => void;
}

// Claymorphic wheel color palette
const COLORS = [
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#F43F5E', // rose
  '#06B6D4', // cyan
  '#A855F7', // violet
];

const CANVAS_SIZE = 420;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CENTER - 16;

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + '…';
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  movies: Movie[],
  winnerIdx: number | null
) {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (movies.length === 0) {
    // Empty state
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, 0, 2 * Math.PI);
    const emptyGrad = ctx.createRadialGradient(CENTER - 40, CENTER - 40, 10, CENTER, CENTER, RADIUS);
    emptyGrad.addColorStop(0, '#f5f0ff');
    emptyGrad.addColorStop(1, '#ede5ff');
    ctx.fillStyle = emptyGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.font = '600 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add movies to spin!', CENTER, CENTER);
    ctx.restore();
    return;
  }

  const sliceAngle = (2 * Math.PI) / movies.length;

  movies.forEach((movie, i) => {
    const startAngle = i * sliceAngle - Math.PI / 2; // Start from top
    const endAngle = startAngle + sliceAngle;
    const isWinner = winnerIdx === i;
    const color = COLORS[i % COLORS.length];

    ctx.save();

    // Winner slice gets a glow
    if (isWinner) {
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 20;
    }

    // Slice
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle);
    ctx.closePath();

    // Clay gradient fill
    const grad = ctx.createRadialGradient(
      CENTER + Math.cos(startAngle + sliceAngle / 2) * RADIUS * 0.3,
      CENTER + Math.sin(startAngle + sliceAngle / 2) * RADIUS * 0.3,
      RADIUS * 0.05,
      CENTER,
      CENTER,
      RADIUS
    );
    if (isWinner) {
      grad.addColorStop(0, '#fff8e6');
      grad.addColorStop(0.4, color);
      grad.addColorStop(1, shadeColor(color, -25));
    } else {
      grad.addColorStop(0, lightenColor(color, 30));
      grad.addColorStop(0.5, color);
      grad.addColorStop(1, shadeColor(color, -20));
    }
    ctx.fillStyle = grad;
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = movies.length > 6 ? 2 : 3;
    ctx.stroke();

    ctx.restore();

    // Text
    ctx.save();
    ctx.translate(CENTER, CENTER);
    ctx.rotate(startAngle + sliceAngle / 2);

    const textRadius = RADIUS * 0.62;
    const fontSize = movies.length > 8 ? 11 : movies.length > 5 ? 13 : 15;

    ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const maxTextWidth = textRadius - 18;
    const displayText = truncateText(ctx, movie.title, maxTextWidth);
    ctx.fillText(displayText, textRadius, 0);
    ctx.restore();
  });

  // Center hub
  ctx.save();

  // Hub shadow
  ctx.shadowColor = 'rgba(139, 92, 246, 0.4)';
  ctx.shadowBlur = 15;

  const hubGrad = ctx.createRadialGradient(CENTER - 10, CENTER - 10, 2, CENTER, CENTER, 26);
  hubGrad.addColorStop(0, '#fff');
  hubGrad.addColorStop(0.4, '#f5f0ff');
  hubGrad.addColorStop(1, '#c4b5fd');
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 26, 0, 2 * Math.PI);
  ctx.fillStyle = hubGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // Hub inner dot
  ctx.save();
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, 8, 0, 2 * Math.PI);
  ctx.fillStyle = 'var(--purple)';
  ctx.fillStyle = '#8B5CF6';
  ctx.fill();
  ctx.restore();

  // Gloss overlay on top half
  ctx.save();
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, RADIUS, Math.PI, 2 * Math.PI);
  ctx.closePath();
  const glossGrad = ctx.createLinearGradient(CENTER, CENTER - RADIUS, CENTER, CENTER);
  glossGrad.addColorStop(0, 'rgba(255,255,255,0.18)');
  glossGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glossGrad;
  ctx.fill();
  ctx.restore();
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `rgb(${r},${g},${b})`;
}

function shadeColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) + amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) + amount);
  const b = Math.max(0, (num & 0x0000ff) + amount);
  return `rgb(${r},${g},${b})`;
}

export function Wheel({ movies, isSpinning, targetRotation, winnerIndex, onSpinComplete }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelGroupRef = useRef<HTMLDivElement>(null);
  const currentRotationRef = useRef(0);
  const prevWinnerIndex = useRef<number | null>(null);

  // Redraw canvas when movies or winner changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawWheel(ctx, movies, winnerIndex);
    prevWinnerIndex.current = winnerIndex;
  }, [movies, winnerIndex]);

  // Spin animation
  useEffect(() => {
    if (!isSpinning || !wheelGroupRef.current) return;

    const el = wheelGroupRef.current;
    const from = currentRotationRef.current;
    const to = targetRotation;

    gsap.to(el, {
      rotation: to,
      duration: 5.5,
      ease: 'power4.out',
      onUpdate: () => {
        // Tick sound via subtle haptic-like DOM trick — skipped for build stability
      },
      onComplete: () => {
        currentRotationRef.current = to;
        onSpinComplete();
      },
    });
  }, [isSpinning, targetRotation]);

  return (
    <div style={styles.outerWrap}>
      {/* Crystal pointer */}
      <motion.div
        style={styles.pointerWrap}
        animate={isSpinning ? { y: [0, -4, 0] } : { y: 0 }}
        transition={isSpinning ? { repeat: Infinity, duration: 0.3, ease: 'easeInOut' } : {}}
      >
        <svg width="28" height="40" viewBox="0 0 28 40" className="pointer-crystal">
          <defs>
            <linearGradient id="crystalGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#c4b5fd" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="crystalShine" x1="0" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          {/* Main crystal shape */}
          <polygon points="14,36 2,6 26,6" fill="url(#crystalGrad)" />
          {/* Shine overlay */}
          <polygon points="14,30 4,8 14,8" fill="url(#crystalShine)" />
          {/* Top gem facet */}
          <polygon points="2,6 14,0 26,6" fill="white" fillOpacity="0.8" />
          {/* Center line */}
          <line x1="14" y1="4" x2="14" y2="34" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Wheel with floating shadow */}
      <motion.div
        style={styles.wheelFloat}
        className={winnerIndex !== null ? 'wheel-win-glow' : ''}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div ref={wheelGroupRef} style={styles.wheelGroup}>
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            style={styles.canvas}
          />
        </div>
      </motion.div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  outerWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
    position: 'relative',
  },
  pointerWrap: {
    zIndex: 10,
    marginBottom: '-12px',
    position: 'relative',
  },
  wheelFloat: {
    borderRadius: '50%',
    boxShadow:
      '0 30px 60px rgba(139, 92, 246, 0.25), 0 10px 20px rgba(0,0,0,0.08)',
    transition: 'filter 0.5s ease',
  },
  wheelGroup: {
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid rgba(255,255,255,0.8)',
  },
  canvas: {
    display: 'block',
    borderRadius: '50%',
    maxWidth: '100%',
    height: 'auto',
  },
};