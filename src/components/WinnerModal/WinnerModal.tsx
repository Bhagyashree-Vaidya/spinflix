import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Movie } from '../../types';

interface WinnerModalProps {
  winner: Movie | null;
  onClose: () => void;
  onSpinAgain: () => void;
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round((rating / 10) * 5);
  return (
    <div style={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4 + i * 0.07, type: 'spring', stiffness: 300 }}
          style={{ fontSize: '22px', color: i < stars ? '#F59E0B' : '#e5e7eb' }}
        >
          ★
        </motion.span>
      ))}
      <span style={styles.ratingNum}>{rating.toFixed(1)}</span>
    </div>
  );
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fireConfetti() {
  const duration = 3500;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#fff'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#fff'],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

export function WinnerModal({ winner, onClose, onSpinAgain }: WinnerModalProps) {
  useEffect(() => {
    if (winner) fireConfetti();
  }, [winner]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop image blur */}
          {winner.backdrop && (
            <div
              style={{
                ...styles.backdropBg,
                backgroundImage: `url(${winner.backdrop})`,
              }}
            />
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            style={styles.modal}
            className="clay-card"
          >
            {/* Tonight's pick label */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={styles.label}
            >
              🍿 Tonight's Movie
            </motion.div>

            {/* Main content */}
            <div style={styles.content}>
              {/* Poster */}
              {winner.poster && (
                <motion.div
                  initial={{ opacity: 0, x: -20, rotate: -4 }}
                  animate={{ opacity: 1, x: 0, rotate: -3 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  style={styles.posterWrap}
                  className="animate-float"
                >
                  <img src={winner.poster} alt={winner.title} style={styles.poster} />
                </motion.div>
              )}

              {/* Info */}
              <div style={styles.infoWrap}>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  style={styles.title}
                >
                  {winner.title}
                </motion.h2>

                {winner.year && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={styles.year}
                  >
                    {winner.year}
                  </motion.div>
                )}

                {winner.rating !== undefined && <StarRating rating={winner.rating} />}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  style={styles.meta}
                >
                  {winner.runtime !== undefined && (
                    <div style={styles.metaChip}>
                      <span style={styles.metaIcon}>⏱</span>
                      <span>{formatRuntime(winner.runtime)}</span>
                    </div>
                  )}
                  {winner.genres && winner.genres.length > 0 && winner.genres.map((g) => (
                    <span key={g} className="genre-chip">{g}</span>
                  ))}
                </motion.div>

                {winner.overview && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={styles.overview}
                  >
                    {winner.overview.length > 220
                      ? winner.overview.slice(0, 220) + '…'
                      : winner.overview}
                  </motion.p>
                )}

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={styles.actions}
                >
                  {winner.tmdbId && (
                    <a
                      href={`https://www.themoviedb.org/movie/${winner.tmdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-clay btn-primary"
                      style={styles.watchBtn}
                    >
                      Watch Now →
                    </a>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn-clay btn-secondary"
                    onClick={onSpinAgain}
                    style={styles.spinAgainBtn}
                  >
                    🎡 Spin Again
                  </motion.button>
                </motion.div>
              </div>
            </div>

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={styles.closeBtn}
              aria-label="Close"
            >
              ×
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdropBg: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(30px) brightness(0.3)',
    zIndex: 0,
    transform: 'scale(1.1)',
  },
  modal: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '660px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px',
    borderRadius: '32px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--purple)',
    marginBottom: '20px',
    background: 'rgba(139, 92, 246, 0.08)',
    padding: '6px 14px',
    borderRadius: '99px',
    display: 'inline-block',
  },
  content: {
    display: 'flex',
    gap: '28px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  posterWrap: {
    flexShrink: 0,
  },
  poster: {
    width: '140px',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    display: 'block',
  },
  infoWrap: {
    flex: 1,
    minWidth: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    fontSize: 'clamp(22px, 4vw, 30px)',
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  },
  year: {
    fontSize: '14px',
    color: 'var(--muted)',
    fontWeight: 500,
  },
  stars: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  ratingNum: {
    marginLeft: '8px',
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
  },
  metaChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    background: 'rgba(139, 92, 246, 0.07)',
    padding: '4px 10px',
    borderRadius: '99px',
  },
  metaIcon: {
    fontSize: '14px',
  },
  overview: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.65,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  watchBtn: {
    textDecoration: 'none',
    fontSize: '15px',
    padding: '12px 24px',
  },
  spinAgainBtn: {
    fontSize: '15px',
    padding: '12px 24px',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(239, 68, 68, 0.08)',
    color: '#ef4444',
    fontSize: '22px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
    lineHeight: 1,
    fontWeight: 300,
  },
};
