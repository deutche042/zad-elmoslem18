'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function SplashScreen({ isLoading, onComplete }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isLoading && show && !isExiting) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setShow(false);
          onComplete?.();
        }, 600);
      }, 2500);
      return () => clearTimeout(exitTimer);
    }
  }, [isLoading, show, isExiting, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="splash-container"
        >
          <div className="splash-bg">
            <Stars />
            <IslamicPattern />
          </div>

          <div className="splash-content">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="splash-kaaba"
            >
              <div className="kaaba-cube">
                <div className="kaaba-face kaaba-front" />
                <div className="kaaba-face kaaba-right" />
                <div className="kaaba-face kaaba-top" />
              </div>
              <div className="kaaba-glow" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="splash-bismillah"
            >
              <span className="bismillah-text">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="splash-tagline"
            >
              ذكر Allah
            </motion.p>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.2, duration: 1, ease: 'easeInOut' }}
            className="splash-progress"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.5, duration: 0.8, ease: 'easeOut' }}
              className="splash-progress-bar"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stars() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 2,
  }));

  return (
    <div className="stars-container">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="splash-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function IslamicPattern() {
  return (
    <div className="pattern-container">
      <svg viewBox="0 0 400 400" className="islamic-pattern">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A017" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#F5C842" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D4A017" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <g className="pattern-group">
          <motion.circle
            cx="200"
            cy="200"
            r="150"
            stroke="url(#goldGrad)"
            strokeWidth="0.5"
            fill="none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          />
          <motion.circle
            cx="200"
            cy="200"
            r="120"
            stroke="url(#goldGrad)"
            strokeWidth="0.5"
            fill="none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
          />
          <motion.circle
            cx="200"
            cy="200"
            r="90"
            stroke="url(#goldGrad)"
            strokeWidth="0.5"
            fill="none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <motion.line
              key={i}
              x1="200"
              y1="200"
              x2={200 + 80 * Math.cos((angle * Math.PI) / 180)}
              y2={200 + 80 * Math.sin((angle * Math.PI) / 180)}
              stroke="url(#goldGrad)"
              strokeWidth="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatType: 'reverse' }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}