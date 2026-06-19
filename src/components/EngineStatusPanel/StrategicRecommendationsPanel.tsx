import { useMemo } from 'preact/hooks';
import type { Recommendation } from './types';

/**
 * Props for StrategicRecommendationsPanel component
 */
interface StrategicRecommendationsPanelProps {
  /** Array of strategic recommendations for adding/removing SDGs */
  recommendations: Recommendation[];
  /** Array of missing strategic areas (gaps) */
  gaps: string[];
}

/**
 * StrategicRecommendationsPanel Component
 * Displays strategic recommendations for SDG selection and identifies missing strategic areas
 * 
 * @param props - Component props containing recommendations and gaps
 * @returns JSX element rendering the strategic recommendations panel
 */
export function StrategicRecommendationsPanel({ recommendations, gaps }: StrategicRecommendationsPanelProps) {
  // Memoize the sorted recommendations to avoid unnecessary re-renders
  const sortedRecommendations = useMemo(() => {
    return [...recommendations].sort((a, b) => b.expectedImpact - a.expectedImpact);
  }, [recommendations]);
  return (
    <div style={{ marginBottom: 20 }} role="region" aria-labelledby="strategic-recommendations-title">
      <h2 id="strategic-recommendations-title" style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
        Section 8 — Decision Support Layer
      </h2>
      
      {/* Strategic Recommendations */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Strategic Recommendations</div>
      
      {/* Missing Strategic Areas */}
      {gaps.length > 0 && (
        <div 
          style={{
            marginBottom: 12,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(245,158,11,0.05) 100%)',
            boxShadow: 'inset -1px -1px 4px rgba(0,0,0,0.04), inset 1px 1px 4px rgba(255,255,255,0.8)',
          }}
          role="alert"
          aria-live="polite"
        >
          <div style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>
            Áreas Estratégicas Ausentes
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} role="list" aria-label="Missing strategic areas">
            {gaps.map((gap, i) => (
              <span 
                key={i} 
                style={{
                  fontSize: 9,
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  fontWeight: 600,
                }}
                role="listitem"
              >
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* SDG Recommendations */}
      {sortedRecommendations.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }} role="list" aria-label="SDG recommendations">
          {sortedRecommendations.map((rec, i) => (
            <article 
              key={i} 
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: rec.type === 'add' 
                  ? 'rgba(16,185,129,0.05)' 
                  : 'rgba(239,68,68,0.05)',
                boxShadow: 'var(--clay-input-shadow)',
              }}
              role="listitem"
              tabIndex={0}
              aria-label={`${rec.type === 'add' ? 'Add' : 'Remove'} SDG ${rec.sdgId}, Priority: ${rec.priority}, Expected Impact: ${rec.expectedImpact}%`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: rec.type === 'add' ? '#10b981' : '#ef4444' }} aria-hidden="true">
                  {rec.type === 'add' ? '+' : '-'} ODS {rec.sdgId}
                </span>
                <span 
                  style={{
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: rec.priority === 'high' ? '#ef444420' : rec.priority === 'medium' ? '#f59e0b20' : '#94a3b820',
                    color: rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#94a3b8',
                    fontWeight: 600,
                  }}
                  aria-label={`Priority: ${rec.priority}`}
                >
                  {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 4 }}>
                {rec.reason}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: rec.type === 'add' ? '#10b981' : '#ef4444' }} aria-label={`Expected impact: ${rec.expectedImpact > 0 ? '+' : ''}${rec.expectedImpact}%`}>
                Impacto Esperado: {rec.expectedImpact > 0 ? '+' : ''}{rec.expectedImpact}%
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
