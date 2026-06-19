/**
 * Props for ExecutiveOutputLayer component
 */
interface ExecutiveOutputLayerProps {
  /** Project data with metrics and scores */
  project: any;
  /** Selected SDG IDs */
  selectedSDGs: number[];
}

/**
 * ExecutiveOutputLayer Component
 * Displays executive-level output including impact, sustainability, feasibility scores and confidence level
 * 
 * @param props - Component props containing project data and selected SDGs
 * @returns JSX element rendering the executive output layer
 */
export function ExecutiveOutputLayer({ project, selectedSDGs }: ExecutiveOutputLayerProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
        Executive Output Layer
      </div>
      <div style={{
        padding: '16px 20px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.05) 100%)',
        boxShadow: 'var(--clay-card-shadow)',
        border: '1px solid rgba(99,102,241,0.2)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Emergent Impact Score</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', marginBottom: 2 }}>
              {project.overallImpactScore}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>±{project.monteCarloStats?.stdDevImpact || 5}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Sustainability Score</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6', marginBottom: 2 }}>
              {project.sustainabilityIndex}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>±{project.monteCarloStats?.stdDevSustain || 10}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Implementation Feasibility</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b', marginBottom: 2 }}>
              {project.feasibility ?? 70}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>±{project.monteCarloStats?.stdDevFeasibility || 10}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Confidence Level</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1', marginBottom: 2 }}>
              {selectedSDGs.length >= 5 ? 'High' : selectedSDGs.length >= 3 ? 'Moderate' : 'Low'}
            </div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>{selectedSDGs.length} SDGs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
