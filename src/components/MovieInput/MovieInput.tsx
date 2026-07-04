import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie, TMDBSearchResult } from '../../types';
import { useTMDB, buildPosterUrl, fetchMovieDetail } from '../../hooks/useTMDB';

interface MovieInputProps {
  onAdd: (movie: Movie) => void;
  existingIds: Set<number>;
}

function SearchResultItem({
  result,
  onSelect,
}: {
  result: TMDBSearchResult;
  onSelect: () => void;
}) {
  const year = result.release_date ? result.release_date.slice(0, 4) : null;
  const posterUrl = buildPosterUrl(result.poster_path, 'w92');

  return (
    <motion.button
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.06)' }}
      onClick={onSelect}
      style={styles.resultItem}
    >
      <div style={styles.resultPoster}>
        {posterUrl ? (
          <img src={posterUrl} alt={result.title} style={styles.resultImg} />
        ) : (
          <span style={{ fontSize: '16px' }}>🎬</span>
        )}
      </div>
      <div style={styles.resultInfo}>
        <span style={styles.resultTitle}>{result.title}</span>
        <span style={styles.resultYear}>{year || '—'}</span>
      </div>
      {result.vote_average > 0 && (
        <span style={styles.resultRating}>⭐ {result.vote_average.toFixed(1)}</span>
      )}
    </motion.button>
  );
}

export function MovieInput({ onAdd, existingIds }: MovieInputProps) {
  const { query, setQuery, results, loading, hasApiKey } = useTMDB();
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowDropdown(results.length > 0);
  }, [results]);

  async function handleSelectTMDB(result: TMDBSearchResult) {
    if (existingIds.has(result.id)) return;
    setIsAdding(true);
    setShowDropdown(false);
    setQuery('');

    try {
      const detail = await fetchMovieDetail(result.id);
      const movie: Movie = {
        id: `tmdb-${result.id}`,
        tmdbId: result.id,
        title: result.title,
        year: result.release_date ? parseInt(result.release_date.slice(0, 4)) : undefined,
        rating: result.vote_average ? parseFloat(result.vote_average.toFixed(1)) : undefined,
        poster: buildPosterUrl(result.poster_path),
        overview: result.overview,
        ...detail,
      };
      onAdd(movie);
    } catch {
      // fallback to minimal
      const movie: Movie = {
        id: `tmdb-${result.id}`,
        tmdbId: result.id,
        title: result.title,
        year: result.release_date ? parseInt(result.release_date.slice(0, 4)) : undefined,
        poster: buildPosterUrl(result.poster_path),
      };
      onAdd(movie);
    } finally {
      setIsAdding(false);
    }
  }

  function handleAddManual() {
    const t = manualTitle.trim();
    if (!t) return;
    const movie: Movie = {
      id: `manual-${Date.now()}`,
      title: t,
    };
    onAdd(movie);
    setManualTitle('');
  }

  function handleManualKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAddManual();
  }

  if (!hasApiKey || manualMode) {
    return (
      <div style={styles.manualWrap}>
        <div style={styles.inputRow}>
          <input
            className="clay-input"
            placeholder="🍿 Enter a movie title..."
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            onKeyDown={handleManualKeyDown}
            style={{ flex: 1 }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-clay btn-primary btn-sm"
            onClick={handleAddManual}
          >
            Add
          </motion.button>
        </div>
        {hasApiKey && (
          <button style={styles.modeToggle} onClick={() => setManualMode(false)}>
            Switch to TMDB search
          </button>
        )}
        {!hasApiKey && (
          <p style={styles.noApiNote}>
            💡 Set <code>VITE_TMDB_API_KEY</code> in <code>.env</code> to enable auto-fetch of posters &amp; ratings.
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={styles.searchWrap}>
      <div style={styles.inputRow}>
        <div style={styles.searchInputWrap}>
          <span style={styles.searchIcon}>
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                style={{ display: 'inline-block' }}
              >⟳</motion.span>
            ) : '🔍'}
          </span>
          <input
            className="clay-input"
            style={styles.searchInput}
            placeholder="Search for a movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            autoComplete="off"
          />
          {isAdding && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              style={styles.addingSpinner}
            >⟳</motion.span>
          )}
        </div>
        <button style={styles.modeToggleBtn} onClick={() => setManualMode(true)} title="Type manually">
          ✏️
        </button>
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {showDropdown && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={styles.dropdown}
            className="clay-card"
          >
            {results.map((r) => (
              <SearchResultItem
                key={r.id}
                result={r}
                onSelect={() => handleSelectTMDB(r)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  searchWrap: {
    position: 'relative',
  },
  manualWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  searchInputWrap: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    fontSize: '16px',
    zIndex: 1,
    pointerEvents: 'none',
  },
  searchInput: {
    paddingLeft: '44px',
    width: '100%',
  },
  addingSpinner: {
    position: 'absolute',
    right: '16px',
    fontSize: '18px',
    color: 'var(--purple)',
    display: 'inline-block',
  },
  modeToggleBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    background: 'var(--surface)',
    boxShadow: 'var(--shadow-clay-sm)',
    cursor: 'pointer',
    fontSize: '18px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    zIndex: 100,
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    maxHeight: '340px',
    overflowY: 'auto',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
    width: '100%',
  },
  resultPoster: {
    width: '32px',
    height: '48px',
    borderRadius: '6px',
    overflow: 'hidden',
    background: 'rgba(139, 92, 246, 0.08)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  resultInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  resultTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  resultYear: {
    fontSize: '12px',
    color: 'var(--muted)',
  },
  resultRating: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--amber)',
    flexShrink: 0,
  },
  modeToggle: {
    fontSize: '12px',
    color: 'var(--purple)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    alignSelf: 'flex-start',
    padding: 0,
  },
  noApiNote: {
    fontSize: '12px',
    color: 'var(--muted)',
    background: 'rgba(139, 92, 246, 0.05)',
    padding: '8px 12px',
    borderRadius: '10px',
    lineHeight: 1.6,
  },
};
