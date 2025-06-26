import { useState, useCallback } from 'react';
import { WheelSegment, SpinResult } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const useWheelSpin = (segments: WheelSegment[]) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<WheelSegment | null>(null);
  const [spinHistory, setSpinHistory] = useLocalStorage<SpinResult[]>('spinHistory', []);

  const startSpin = useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);
    setCurrentWinner(null);
  }, [isSpinning]);

  const handleSpinComplete = useCallback((winner: WheelSegment) => {
    setIsSpinning(false);
    setCurrentWinner(winner);
    setSpinHistory(prev => [
      { id: Date.now().toString(), timestamp: Date.now(), winner },
      ...prev
    ].slice(0, 10)); // Keep last 10 spins
  }, [setSpinHistory]);

  return {
    isSpinning,
    currentWinner,
    spinHistory,
    startSpin,
    handleSpinComplete
  };
}; 