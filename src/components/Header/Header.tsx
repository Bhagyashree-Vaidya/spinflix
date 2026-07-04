import React from 'react';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      style={styles.header}
    >
      <div style={styles.logoRow}>
        <motion.span
          style={styles.emoji}
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
        >
          🎡
        </motion.span>
        <h1 style={styles.title} className="gradient-text">SpinFlix</h1>
      </div>
      <p style={styles.tagline}>Spin the wheel. Discover tonight's movie.</p>
    </motion.header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    textAlign: 'center',
    paddingBottom: '8px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '6px',
  },
  emoji: {
    fontSize: '40px',
    display: 'inline-block',
    lineHeight: 1,
  },
  title: {
    fontSize: 'clamp(36px, 6vw, 56px)',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    lineHeight: 1,
  },
  tagline: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    fontWeight: 400,
    letterSpacing: '0.01em',
  },
};
