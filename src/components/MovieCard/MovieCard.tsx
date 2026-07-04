import React from 'react';
import { motion } from 'framer-motion';
import { Movie } from '../../types';

interface MovieCardProps {
  movie: Movie;
  index: number;
  color: string;
  onRemove: (id: string) => void;
}

function StarRating({ rating }: { rating: number }) {
  // TMDB rating is 0-10, display as 5 stars
  const stars = Math.round((rating / 10) * 5);
  return (
    <span style={{ fontSize: '13px', letterSpacing: '1px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < stars ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </span>
  );
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function MovieCard({ movie, index, color, onRemove }: MovieCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay: index * 0.04 }}
      whileHover={{ y: -3, boxShadow: '14px 14px 28px rgba(210,180,255,.3), -12px -12px 24px rgba(255,255,255,.95)' }}
      style={styles.card}
      className="clay-card"
    >
      {/* Color accent stripe */}
      <div style={{ ...styles.colorStripe, background: color }} />

      {/* Poster */}
      <div style={styles.posterWrap}>
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} style={styles.poster} />
        ) : (
          <div style={{ ...styles.posterPlaceholder, background: color + '33' }}>
            <span style={{ fontSize: '24px' }}>🎬</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={styles.info}>
        <div style={styles.titleRow}>
          <span style={styles.title}>{movie.title}</span>
          {movie.year && <span style={styles.year}>{movie.year}</span>}
        </div>

        {movie.genres && movie.genres.length > 0 && (
          <div style={styles.chips}>
            {movie.genres.slice(0, 3).map((g) => (
              <span key={g} className="genre-chip">{g}</span>
            ))}
          </div>
        )}

        <div style={styles.meta}>
          {movie.rating !== undefined && <StarRating rating={movie.rating} />}
          {movie.runtime !== undefined && (
            <span style={styles.runtime}>⏱ {formatRuntime(movie.runtime)}</span>
          )}
        </div>
      </div>

      {/* Remove */}
      <motion.button
        whileHover={{ scale: 1.15, backgroundColor: '#fee2e2' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(movie.id)}
        style={styles.removeBtn}
        aria-label={`Remove ${movie.title}`}
        title="Remove"
      >
        ×
      </motion.button>
    </motion.div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px 12px 14px',
    position: 'relative',
    cursor: 'default',
    transition: 'box-shadow 0.25s ease',
    overflow: 'visible',
  },
  colorStripe: {
    width: '4px',
    borderRadius: '99px',
    alignSelf: 'stretch',
    minHeight: '48px',
    flexShrink: 0,
  },
  posterWrap: {
    flexShrink: 0,
  },
  poster: {
    width: '48px',
    height: '72px',
    borderRadius: '10px',
    objectFit: 'cover',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  posterPlaceholder: {
    width: '48px',
    height: '72px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    flexWrap: 'wrap',
  },
  title: {
    fontWeight: 700,
    fontSize: '15px',
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '160px',
  },
  year: {
    fontSize: '12px',
    color: 'var(--muted)',
    fontWeight: 500,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  runtime: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  removeBtn: {
    flexShrink: 0,
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(239, 68, 68, 0.08)',
    color: '#ef4444',
    fontSize: '18px',
    lineHeight: '1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 400,
    transition: 'background 0.2s',
  },
};
