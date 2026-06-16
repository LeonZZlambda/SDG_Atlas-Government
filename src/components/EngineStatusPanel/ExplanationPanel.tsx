import { useState } from 'preact/hooks';
import { ConfidenceIndicator } from './ConfidenceIndicator';

export interface ExplanationPanelData {
  metricName: string;
  score: number;
  maxScore: number;
  uncertainty?: { min: number; max: number; margin: number };
  factors: Array<{ name: string; impact: number; reason: string }>;
  confidence: 'high' | 'medium' | 'low';
  interpretation: string;
  trend?: 'increasing' | 'stable' | 'decreasing';
}

interface ExplanationPanelProps {
  explanation: ExplanationPanelData;
}

export function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div
      style={{
        marginTop: 12,
        padding: '12px 14px',
        borderRadius: 10,
        background: 'var(--bg-glass)',
        boxShadow: expanded ? 'var(--clay-card-shadow), 0 4px 16px rgba(0,0,0,0.1)' : 'var(--clay-input-shadow)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        border: `1.5px solid ${expanded ? '#6366f144' : 'transparent'}`,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
            {explanation.metricName}: {explanation.uncertainty ? `${explanation.score} ± ${explanation.uncertainty.margin}` : `${explanation.score}`}/{explanation.maxScore}
          </span>
          <ConfidenceIndicator level={explanation.confidence} />
          {explanation.trend && (
            <span style={{
              fontSize: 8,
              padding: '2px 6px',
              borderRadius: 4,
              background: explanation.trend === 'increasing' ? '#10b98120' : explanation.trend === 'decreasing' ? '#ef444420' : '#94a3b820',
              color: explanation.trend === 'increasing' ? '#10b981' : explanation.trend === 'decreasing' ? '#ef4444' : '#94a3b8',
              fontWeight: 600,
            }}>
              {explanation.trend === 'increasing' ? '↗' : explanation.trend === 'decreasing' ? '↘' : '→'}
            </span>
          )}
        </div>
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            flexShrink: 0
          }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      
      <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 8 }}>
        {explanation.interpretation}
      </div>
      
      {expanded && (
        <div style={{
          paddingTop: 8,
          borderTop: '1px solid var(--border-dark)',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
            Fatores Considerados
          </div>
          {explanation.factors.map((factor, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 8px',
              marginBottom: 4,
              borderRadius: 6,
              background: factor.impact > 0 ? 'rgba(16,185,129,0.1)' : factor.impact < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.1)',
            }}>
              <span style={{ fontSize: 9, color: 'var(--text-primary)', fontWeight: 500 }}>{factor.name}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: factor.impact > 0 ? '#10b981' : factor.impact < 0 ? '#ef4444' : '#94a3b8' }}>
                {factor.impact > 0 ? '+' : ''}{factor.impact}
              </span>
            </div>
          ))}
          <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
            {explanation.factors.map(f => f.reason).join(' • ')}
          </div>
        </div>
      )}
    </div>
  );
}
