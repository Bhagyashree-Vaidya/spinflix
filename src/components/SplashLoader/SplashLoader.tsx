import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashLoaderProps {
  onComplete: () => void;
}

export function SplashLoader({ onComplete }: SplashLoaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Always hide after 5 seconds regardless of video state
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 600); // wait for fade-out animation
    }, 5000);

    // Also try to play the video
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — still show the loader, timer handles it
      });
    }

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={styles.overlay}
        >
          {/* Background blur orbs */}
          <div style={styles.orb1} />
          <div style={styles.orb2} />

          {/* Video — fullscreen cover */}
          <div style={styles.videoWrap}>
            <video
              ref={videoRef}
              src={`${import.meta.env.BASE_URL}loader.mp4`}
              style={styles.video}
              muted
              playsInline
              loop
              autoPlay
            />
          </div>

          {/* Progress bar */}
          <motion.div style={styles.progressTrack}>
            <motion.div
              style={styles.progressBar}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </motion.div>

          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={styles.brand}
          >
            <span style={styles.brandIcon}>🎡</span>
            <span style={styles.brandText} className="gradient-text">SpinFlix</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#0a0a0f',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    top: '-150px',
    left: '-150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  orb2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    bottom: '-100px',
    right: '-100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  videoWrap: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  progressTrack: {
    width: '100%',
    height: '4px',
    background: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
    borderRadius: '99px',
    transformOrigin: 'left',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    position: 'relative',
    zIndex: 2,
    marginBottom: '28px',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '10px 24px',
    borderRadius: '99px',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  brandIcon: {
    fontSize: '28px',
  },
  brandText: {
    fontSize: '26px',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
};
