import { useState, useCallback, useRef } from 'react';
import { Movie } from '../types';

interface UseWheelSpinReturn {
  isSpinning: boolean;
  targetRotation: number;
  winner: Movie | null;
  spin: (movies: Movie[]) => void;
  onSpinComplete: (movies: Movie[]) => void;
  clearWinner: () => void;
}

export function useWheelSpin(): UseWheelSpinReturn {
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetRotation, setTargetRotation] = useState(0);
  const [winner, setWinner] = useState<Movie | null>(null);
  const accumulatedRotation = useRef(0);

  const spin = useCallback((movies: Movie[]) => {
    if (isSpinning || movies.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    // 5–10 full rotations + random offset
    const extraSpins = 1800 + Math.random() * 1800;
    const newRotation = accumulatedRotation.current + extraSpins;
    accumulatedRotation.current = newRotation;
    setTargetRotation(newRotation);
  }, [isSpinning]);

  /** Called by the Wheel component's onComplete callback */
  const onSpinComplete = useCallback((movies: Movie[]) => {
    if (movies.length === 0) return;

    const finalAngle = accumulatedRotation.current;

    // Mathematical winner calculation (pointer fixed at top = 0°)
    // Normalize the rotation so we know where 0° of the wheel is pointing
    const normalized = ((360 - (finalAngle % 360)) + 360) % 360;
    const sliceAngle = 360 / movies.length;
    const winnerIndex = Math.floor(normalized / sliceAngle) % movies.length;

    setWinner(movies[winnerIndex]);
    setIsSpinning(false);
  }, []);

  const clearWinner = useCallback(() => {
    setWinner(null);
  }, []);

  return { isSpinning, targetRotation, winner, spin, onSpinComplete, clearWinner };
}