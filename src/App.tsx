import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header/Header';
import { MovieInput } from './components/MovieInput/MovieInput';
import { MovieCard } from './components/MovieCard/MovieCard';
import { Wheel } from './components/Wheel/Wheel';
import { WinnerModal } from './components/WinnerModal/WinnerModal';
import { SplashLoader } from './components/SplashLoader/SplashLoader';
import { useWheelSpin } from './hooks/useWheelSpin';
import { Movie } from './types';

// Claymorphic slice colors (matches Wheel.tsx)
const COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
  '#3B82F6', '#F43F5E', '#06B6D4', '#A855F7',
];

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.emptyState}
    >
      <div style={styles.emptyIcon}>🎬</div>
      <p style={styles.emptyText}>Add at least 2 movies to spin the wheel!</p>
    </motion.div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  const {
    isSpinning,
    targetRotation,
    winner,
    spin,
    onSpinComplete,
    clearWinner,
  } = useWheelSpin();

  const existingTmdbIds = useMemo(
    () => new Set(movies.filter((m) => m.tmdbId).map((m) => m.tmdbId!)),
    [movies]
  );

  const handleAdd = useCallback((movie: Movie) => {
    setMovies((prev) => {
      // Don't add duplicates
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [...prev, movie];
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
    setWinnerIndex(null);
  }, []);

  const handleSpin = () => {
    if (movies.length < 2) return;
    setWinnerIndex(null);
    spin(movies);
  };

  const handleSpinComplete = useCallback(() => {
    // Calculate winner index from the final rotation
    const finalAngle = targetRotation;
    const normalized = ((360 - (finalAngle % 360)) + 360) % 360;
    const sliceAngle = 360 / movies.length;
    const idx = Math.floor(normalized / sliceAngle) % movies.length;
    setWinnerIndex(idx);
    onSpinComplete(movies);
  }, [targetRotation, movies, onSpinComplete]);

  const handleModalClose = useCallback(() => {
    clearWinner();
    setWinnerIndex(null);
  }, [clearWinner]);

  const handleSpinAgain = useCallback(() => {
    clearWinner();
    setWinnerIndex(null);
    // Small delay then spin
    setTimeout(() => spin(movies), 150);
  }, [clearWinner, spin, movies]);

  return (
    <>
      <SplashLoader onComplete={() => setLoading(false)} />
    <div style={{ ...styles.page, opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
      <Header />

      <div className="app-layout">
        {/* Left column: Movie list */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={styles.leftCol}
        >
          <div style={styles.section} className="clay-card">
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>🍿 Movie List</h2>
              {movies.length > 0 && (
                <motion.span
                  key={movies.length}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  style={styles.countBadge}
                >
                  {movies.length}
                </motion.span>
              )}
            </div>

            <MovieInput onAdd={handleAdd} existingIds={existingTmdbIds} />

            <div style={styles.movieList}>
              <AnimatePresence mode="popLayout">
                {movies.length === 0 ? (
                  <EmptyState key="empty" />
                ) : (
                  movies.map((movie, i) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      index={i}
                      color={COLORS[i % COLORS.length]}
                      onRemove={handleRemove}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right column: Wheel + Spin */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={styles.rightCol}
        >
          <div style={styles.wheelSection}>
            <Wheel
              movies={movies}
              isSpinning={isSpinning}
              targetRotation={targetRotation}
              winnerIndex={winnerIndex}
              onSpinComplete={handleSpinComplete}
            />

            {/* Spin Button */}
            <motion.button
              whileHover={!isSpinning && movies.length >= 2 ? { scale: 1.06, y: -3 } : {}}
              whileTap={!isSpinning && movies.length >= 2 ? { scale: 0.94 } : {}}
              className="btn-clay btn-primary"
              onClick={handleSpin}
              disabled={isSpinning || movies.length < 2}
              style={styles.spinBtn}
              id="spin-button"
            >
              {isSpinning ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    style={{ display: 'inline-block', fontSize: '20px' }}
                  >
                    🎡
                  </motion.span>
                  Spinning…
                </>
              ) : (
                <>🎡 SPIN THE WHEEL</>
              )}
            </motion.button>

            {movies.length < 2 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.hint}
              >
                Add {movies.length === 0 ? 'at least 2 movies' : '1 more movie'} to spin
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Winner Modal */}
      <WinnerModal
        winner={winner}
        onClose={handleModalClose}
        onSpinAgain={handleSpinAgain}
      />
    </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '40px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '8px',
  },
  section: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--purple), var(--pink))',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 700,
  },
  movieList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '480px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  wheelSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '28px',
    width: '100%',
  },
  spinBtn: {
    fontSize: '18px',
    padding: '18px 48px',
    letterSpacing: '0.04em',
    gap: '10px',
    minWidth: '220px',
  },
  hint: {
    fontSize: '13px',
    color: 'var(--muted)',
    marginTop: '-12px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  emptyIcon: {
    fontSize: '40px',
  },
  emptyText: {
    color: 'var(--muted)',
    fontSize: '14px',
    lineHeight: 1.5,
  },
};