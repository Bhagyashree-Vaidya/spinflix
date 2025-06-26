import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { WheelSegment } from '../../types';
import styles from './styles.module.css';

interface WheelProps {
  segments: WheelSegment[];
  onSpinComplete: (winner: WheelSegment) => void;
  isSpinning: boolean;
}

export const Wheel: React.FC<WheelProps> = ({ segments, onSpinComplete, isSpinning }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (!wheelRef.current || isSpinning) return;

    const randomDegrees = 1800 + Math.random() * 1800; // 5-10 full rotations
    const finalRotation = rotation + randomDegrees;
    
    gsap.to(wheelRef.current, {
      rotation: finalRotation,
      duration: 5,
      ease: "power2.out",
      onComplete: () => {
        const normalizedRotation = finalRotation % 360;
        const segmentAngle = 360 / segments.length;
        const winningIndex = Math.floor(normalizedRotation / segmentAngle);
        const winner = segments[segments.length - 1 - winningIndex];
        onSpinComplete(winner);
      }
    });

    setRotation(finalRotation);
  };

  useEffect(() => {
    if (isSpinning) {
      spinWheel();
    }
  }, [isSpinning]);

  return 
} 