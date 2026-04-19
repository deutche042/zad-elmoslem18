'use client';

import { motion } from 'framer-motion';

interface IslamicPatternProps {
  className?: string;
  opacity?: number;
  color?: string;
  variant?: 'stars' | 'geometric' | 'diamond' | 'arabesque';
}

export function IslamicPattern({
  className = '',
  opacity = 0.04,
  color = '#D4A017',
  variant = 'geometric',
}: IslamicPatternProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {variant === 'geometric' && (
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="islamic-pattern"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M40 0 L45 15 L60 15 L48 25 L52 40 L40 30 L28 40 L32 25 L20 15 L35 15 Z"
                fill={color}
                opacity="0.5"
              />
              <path
                d="M0 0 L5 5 L0 10 L-5 5 Z"
                fill={color}
                opacity="0.3"
                transform="translate(20,20)"
              />
              <path
                d="M0 0 L5 5 L0 10 L-5 5 Z"
                fill={color}
                opacity="0.3"
                transform="translate(60,20)"
              />
              <path
                d="M0 0 L5 5 L0 10 L-5 5 Z"
                fill={color}
                opacity="0.3"
                transform="translate(20,60)"
              />
              <path
                d="M0 0 L5 5 L0 10 L-5 5 Z"
                fill={color}
                opacity="0.3"
                transform="translate(60,60)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
      )}

      {variant === 'arabesque' && (
        <div className="h-full w-full">
          <svg viewBox="0 0 400 400" className="h-full w-full">
            <defs>
              <pattern
                id="arabesque"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M50 10 Q30 30 50 50 Q70 30 50 10"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  opacity="0.6"
                />
                <path
                  d="M10 50 Q30 70 50 50 Q30 30 10 50"
                  fill="none"
                  stroke={color}
                  strokeWidth="0.5"
                  opacity="0.6"
                />
                <circle cx="50" cy="50" r="3" fill={color} opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#arabesque)" />
          </svg>
        </div>
      )}

      {variant === 'diamond' && (
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <pattern
              id="diamond-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M20 5 L25 15 L20 25 L15 15 Z" fill={color} opacity="0.4" />
              <path d="M5 20 L15 15 L25 20 L15 25 Z" fill={color} opacity="0.3" />
              <path d="M20 35 L25 25 L20 25 L15 25 Z" fill={color} opacity="0.4" />
              <path d="M35 20 L25 25 L25 15 L25 25 Z" fill={color} opacity="0.3" />
              <circle cx="20" cy="20" r="2" fill={color} opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diamond-pattern)" />
        </svg>
      )}

      {(variant === 'stars') && (
        <div className="stars-pattern">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="pattern-star"
              style={{
                left: `${(i * 8) % 100}%`,
                top: `${(i * 13) % 100}%`,
                backgroundColor: color,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3 + (i % 2),
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
