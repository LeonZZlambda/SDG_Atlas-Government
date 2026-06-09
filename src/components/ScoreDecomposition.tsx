import type { InitiativeScores, ScoreBreakdown } from '../types/initiative';

interface ScoreDecompositionProps {
  scores: InitiativeScores;
}

export function ScoreDecomposition({ scores }: ScoreDecompositionProps) {
  const { impact, sustainability, feasibility, sdgAlignment, overall, breakdowns } = scores;
  
  return (
    <div className="clay-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', paddingBottom: '12px', boxShadow: 'inset 0 -1px 0 var(--border-dark)' }}>
        Score Decomposition
      </h3>
      
      {/* Waterfall Chart */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
          Contribution to Overall Score
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Impact */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, width: '100px' }}>Impact</span>
            <div style={{ flex: 1, height: '24px', background: 'var(--bg-tertiary)', borderRadius: '8px', overflow: 'hidden', position: 'relative', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.1)' }}>
              <div style={{
                width: `${breakdowns.impact.contribution}%`,
                height: '100%',
                background: impact >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : impact >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                transition: 'width 0.3s ease'
              }} />
              <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {breakdowns.impact.contribution.toFixed(1)}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '60px', textAlign: 'right' }}>
              35% weight
            </span>
          </div>
          
          {/* Sustainability */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, width: '100px' }}>Sustainability</span>
            <div style={{ flex: 1, height: '24px', background: 'var(--bg-tertiary)', borderRadius: '8px', overflow: 'hidden', position: 'relative', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.1)' }}>
              <div style={{
                width: `${breakdowns.sustainability.contribution}%`,
                height: '100%',
                background: sustainability >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : sustainability >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                transition: 'width 0.3s ease'
              }} />
              <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {breakdowns.sustainability.contribution.toFixed(1)}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '60px', textAlign: 'right' }}>
              25% weight
            </span>
          </div>
          
          {/* Feasibility */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, width: '100px' }}>Feasibility</span>
            <div style={{ flex: 1, height: '24px', background: 'var(--bg-tertiary)', borderRadius: '8px', overflow: 'hidden', position: 'relative', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.1)' }}>
              <div style={{
                width: `${breakdowns.feasibility.contribution}%`,
                height: '100%',
                background: feasibility >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : feasibility >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                transition: 'width 0.3s ease'
              }} />
              <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {breakdowns.feasibility.contribution.toFixed(1)}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '60px', textAlign: 'right' }}>
              25% weight
            </span>
          </div>
          
          {/* SDG Alignment */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, width: '100px' }}>SDG Alignment</span>
            <div style={{ flex: 1, height: '24px', background: 'var(--bg-tertiary)', borderRadius: '8px', overflow: 'hidden', position: 'relative', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.1)' }}>
              <div style={{
                width: `${breakdowns.sdgAlignment.contribution}%`,
                height: '100%',
                background: sdgAlignment >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : sdgAlignment >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                transition: 'width 0.3s ease'
              }} />
              <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                {breakdowns.sdgAlignment.contribution.toFixed(1)}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '60px', textAlign: 'right' }}>
              15% weight
            </span>
          </div>
        </div>
        
        {/* Overall Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', paddingTop: '16px', boxShadow: 'inset 0 1px 0 var(--border-dark)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, width: '100px' }}>Overall</span>
          <div style={{ flex: 1, height: '32px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              width: `${overall}%`,
              height: '100%',
              background: overall >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : overall >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
            <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {overall.toFixed(1)}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '60px', textAlign: 'right' }}>
            100% total
          </span>
        </div>
      </div>
      
      {/* Factor Breakdown */}
      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
          Factor Breakdown
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {Object.values(breakdowns).map((breakdown: ScoreBreakdown, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '10px',
              borderRadius: '8px',
              background: 'var(--bg-glass)',
              fontSize: 'clamp(9px, 1vw, 10px)',
              lineHeight: 1.3
            }}>
              <h5 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {breakdown.metric}
              </h5>
              <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: breakdown.score >= 70 ? '#10b981' : breakdown.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                {breakdown.score.toFixed(1)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {breakdown.factors.slice(0, 3).map((factor, factorIndex) => (
                  <div key={factorIndex} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{factor.name}</span>
                    <span style={{ fontWeight: 600, color: factor.impact === 'positive' ? '#10b981' : factor.impact === 'negative' ? '#ef4444' : '#818cf8' }}>
                      {factor.value.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
