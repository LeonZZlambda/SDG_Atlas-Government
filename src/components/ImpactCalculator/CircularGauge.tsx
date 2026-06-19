/**
 * CircularGauge Component
 * Renders a circular gauge meter for displaying scores
 */

import { motion } from 'framer-motion';
import { CHART_DIMENSIONS } from '../../constants/chartDimensions';

interface CircularGaugeProps {
  score: number;
  label: string;
  subtitle?: string;
  color?: string;
}

export function CircularGauge({ score, label, subtitle, color = 'var(--accent-color)' }: CircularGaugeProps) {
  const { STROKE_RADIUS: strokeRadius, CIRCUMFERENCE: strokeCircumference } = CHART_DIMENSIONS.GAUGE;
  const strokeOffset = strokeCircumference - (score / 100) * strokeCircumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 'clamp(100px, 12vw, 120px)', height: 'clamp(100px, 12vw, 120px)' }}>
        <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <filter id="circleShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
            </filter>
          </defs>
          <circle cx="60" cy="60" r={strokeRadius} fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r={strokeRadius}
            fill="transparent"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={strokeCircumference}
            animate={{ strokeDashoffset: strokeOffset }}
            transition={{ duration: 0.4 }}
            strokeLinecap="round"
            filter="url(#circleShadow)"
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800 }}>{score}</span>
          <span style={{ fontSize: 'clamp(9px, 1.1vw, 10px)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{subtitle}</span>
        </div>
      </div>
      <h4 style={{ fontSize: 'clamp(11px, 1.3vw, 13px)', marginTop: '12px', fontWeight: 700 }}>
        {label}
      </h4>
    </div>
  );
}
