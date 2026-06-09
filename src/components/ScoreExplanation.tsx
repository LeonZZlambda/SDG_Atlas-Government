import type { InitiativeScores } from '../types/initiative';

interface ScoreExplanationProps {
  scores: InitiativeScores;
  showOverall?: boolean;
}

export function ScoreExplanation({ scores, showOverall = true }: ScoreExplanationProps) {
  const { overall, explanations, breakdowns } = scores;
  
  return (
    <div className="clay-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', paddingBottom: '12px', boxShadow: 'inset 0 -1px 0 var(--border-dark)' }}>
        Why this score?
      </h3>
      
      {/* Overall Score Explanation */}
      {showOverall && (
        <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: overall >= 70 ? 'rgba(16, 185, 129, 0.08)' : overall >= 40 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: overall >= 70 ? '#10b981' : overall >= 40 ? '#f59e0b' : '#ef4444' }}>
              {overall.toFixed(1)}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Overall Score</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {explanations.overall}
          </p>
        </div>
      )}
      
      {/* Individual Metric Explanations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Impact */}
        <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Impact
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: breakdowns.impact.score >= 70 ? '#10b981' : breakdowns.impact.score >= 40 ? '#f59e0b' : '#ef4444' }}>
              {breakdowns.impact.score.toFixed(1)}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {explanations.impact}
          </p>
        </div>
        
        {/* Sustainability */}
        <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Sustainability
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: breakdowns.sustainability.score >= 70 ? '#10b981' : breakdowns.sustainability.score >= 40 ? '#f59e0b' : '#ef4444' }}>
              {breakdowns.sustainability.score.toFixed(1)}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {explanations.sustainability}
          </p>
        </div>
        
        {/* Feasibility */}
        <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Feasibility
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: breakdowns.feasibility.score >= 70 ? '#10b981' : breakdowns.feasibility.score >= 40 ? '#f59e0b' : '#ef4444' }}>
              {breakdowns.feasibility.score.toFixed(1)}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {explanations.feasibility}
          </p>
        </div>
        
        {/* SDG Alignment */}
        <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              SDG Alignment
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: breakdowns.sdgAlignment.score >= 70 ? '#10b981' : breakdowns.sdgAlignment.score >= 40 ? '#f59e0b' : '#ef4444' }}>
              {breakdowns.sdgAlignment.score.toFixed(1)}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {explanations.sdgAlignment}
          </p>
        </div>
      </div>
      
      {/* Score Weights Info */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '10px',
        borderRadius: '8px',
        background: 'var(--bg-glass)',
        fontSize: 'clamp(9px, 1vw, 10px)',
        lineHeight: 1.3
      }}>
        <strong>Scoring Weights:</strong> Impact (35%), Sustainability (25%), Feasibility (25%), SDG Alignment (15%)
      </div>
    </div>
  );
}
