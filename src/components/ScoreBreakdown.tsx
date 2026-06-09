import type { ScoreBreakdown } from '../types/initiative';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdown;
  compact?: boolean;
}

export function ScoreBreakdown({ breakdown, compact = false }: ScoreBreakdownProps) {
  const { metric, score, weight, contribution, factors } = breakdown;
  
  return (
    <div className="clay-card" style={{ padding: compact ? '16px' : '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontSize: compact ? '14px' : '16px', fontWeight: 700, margin: 0 }}>
          {metric}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: compact ? '20px' : '24px', 
            fontWeight: 800, 
            color: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444',
            fontFamily: 'var(--font-heading)'
          }}>
            {score.toFixed(1)}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/100</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div style={{ 
        width: '100%', 
        height: '8px', 
        borderRadius: '4px', 
        background: 'var(--bg-tertiary)', 
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{
          width: `${score}%`,
          height: '100%',
          background: score >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : score >= 40 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      {/* Weight and contribution info */}
      {!compact && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>Weight: {(weight * 100).toFixed(0)}%</span>
          <span>Contribution: {contribution.toFixed(1)}</span>
        </div>
      )}
      
      {/* Score factors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {factors.map((factor, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '8px',
            background: factor.impact === 'positive' ? 'rgba(16, 185, 129, 0.08)' : 
                       factor.impact === 'negative' ? 'rgba(239, 68, 68, 0.08)' : 
                       'rgba(99, 102, 241, 0.08)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {factor.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {factor.description}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 700,
                color: factor.impact === 'positive' ? '#10b981' : 
                       factor.impact === 'negative' ? '#ef4444' : '#818cf8'
              }}>
                {factor.value.toFixed(1)}
              </span>
              <span style={{ 
                fontSize: '10px', 
                padding: '2px 6px', 
                borderRadius: '4px',
                background: factor.impact === 'positive' ? '#10b981' : 
                           factor.impact === 'negative' ? '#ef4444' : '#818cf8',
                color: '#fff',
                fontWeight: 600
              }}>
                {factor.impact === 'positive' ? '+' : factor.impact === 'negative' ? '-' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
