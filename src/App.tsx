import React from 'react';
import { Wheel } from './components/Wheel/Wheel';
import { ResultDisplay } from './components/ResultDisplay/ResultDisplay';
import { History } from './components/History/History';
import { Button } from './components/Button/Button';
import { defaultSegments } from './data/wheelSegments';
import { useWheelSpin } from './hooks/useWheelSpin';
import confetti from 'canvas-confetti';
import './App.css';

function App() {
  const {
    isSpinning,
    currentWinner,
    spinHistory,
    startSpin,
    handleSpinComplete
  } = useWheelSpin(defaultSegments);

  const handleSpin = () => {
    startSpin();
    // Play spin sound
    const audio = new Audio('/sounds/spin.mp3');
    audio.play();
  };

  const handleWinner = (winner: WheelSegment) => {
    handleSpinComplete(winner);
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8">SpinFlix</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Wheel
              segments={defaultSegments}
              onSpinComplete={handleWinner}
              isSpinning={isSpinning}
            />
            <div className="mt-6 text-center">
              <Button
                onClick={handleSpin}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 