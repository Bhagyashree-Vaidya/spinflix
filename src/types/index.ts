export interface Movie {
  id: string;
  title: string;
  year?: number;
  runtime?: number;       // in minutes
  genres?: string[];
  rating?: number;        // TMDB rating 0–10
  poster?: string;        // full TMDB image URL
  backdrop?: string;      // full TMDB backdrop URL
  overview?: string;
  tmdbId?: number;
}

export interface TMDBSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface TMDBMovieDetail {
  id: number;
  title: string;
  release_date: string;
  runtime: number;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  genres: { id: number; name: string }[];
}

export interface SpinResult {
  id: string;
  timestamp: number;
  winner: Movie;
}