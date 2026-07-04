import { useState, useEffect, useRef, useCallback } from 'react';
import { Movie, TMDBSearchResult, TMDBMovieDetail } from '../types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

function getApiKey(): string | undefined {
  return import.meta.env.VITE_TMDB_API_KEY as string | undefined;
}

export function buildPosterUrl(path: string | null, size = 'w342'): string | undefined {
  if (!path) return undefined;
  return `${IMG_BASE}/${size}${path}`;
}

export function buildBackdropUrl(path: string | null, size = 'w1280'): string | undefined {
  if (!path) return undefined;
  return `${IMG_BASE}/${size}${path}`;
}

/** Fetch full movie detail by TMDB id and map to Movie */
export async function fetchMovieDetail(tmdbId: number): Promise<Partial<Movie>> {
  const apiKey = getApiKey();
  if (!apiKey) return {};

  const res = await fetch(
    `${TMDB_BASE}/movie/${tmdbId}?api_key=${apiKey}`
  );
  if (!res.ok) return {};
  const data: TMDBMovieDetail = await res.json();

  return {
    tmdbId: data.id,
    title: data.title,
    year: data.release_date ? parseInt(data.release_date.slice(0, 4)) : undefined,
    runtime: data.runtime || undefined,
    genres: data.genres?.map((g) => g.name).slice(0, 3),
    rating: data.vote_average ? parseFloat(data.vote_average.toFixed(1)) : undefined,
    poster: buildPosterUrl(data.poster_path),
    backdrop: buildBackdropUrl(data.backdrop_path),
    overview: data.overview,
  };
}

interface UseTMDBReturn {
  query: string;
  setQuery: (q: string) => void;
  results: TMDBSearchResult[];
  loading: boolean;
  hasApiKey: boolean;
}

export function useTMDB(): UseTMDBReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasApiKey = Boolean(getApiKey());

  const search = useCallback(async (q: string) => {
    const apiKey = getApiKey();
    if (!apiKey || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&page=1`
      );
      if (res.ok) {
        const data = await res.json();
        setResults((data.results || []).slice(0, 6));
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  return { query, setQuery, results, loading, hasApiKey };
}
