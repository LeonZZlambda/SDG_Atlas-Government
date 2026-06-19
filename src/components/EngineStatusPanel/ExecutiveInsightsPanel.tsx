import { useState } from 'preact/hooks';
import type { ExecutiveInsight } from './types';

interface ExecutiveInsightsPanelProps {
  executiveInsights: ExecutiveInsight[];
}

export function ExecutiveInsightsPanel({ executiveInsights }: ExecutiveInsightsPanelProps) {
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
        Section 9 — Executive Intelligence Layer
      </div>
      
      {/* Summary Dashboard */}
      <div style={{
        marginBottom: 16,
        padding: '16px 18px',
        borderRadius: 12,
        background: 'var(--bg-card)',
        boxShadow: 'var(--clay-card-shadow)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 10 }}>
          Resumo de Inteligência Executiva
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginBottom: 2 }}>
              {executiveInsights.filter(i => i.type === 'opportunity').length}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>Oportunidades</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', marginBottom: 2 }}>
              {executiveInsights.filter(i => i.type === 'risk').length}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>Riscos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1', marginBottom: 2 }}>
              {executiveInsights.filter(i => i.type === 'consideration').length}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>Considerações</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginBottom: 2 }}>
              {executiveInsights.filter(i => i.priority === 'high').length}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>Prioridade Alta</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Executive Insights</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        {executiveInsights.map((insight, i) => (
          <div key={i} style={{
            padding: '14px 16px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            boxShadow: 'var(--clay-card-shadow)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }} onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={insight.type === 'opportunity' ? '#10b981' : insight.type === 'risk' ? '#ef4444' : '#6366f1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {insight.type === 'opportunity' ? (
                    <path d="M9 18l6-6-6-6" />
                  ) : insight.type === 'risk' ? (
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
                  ) : (
                    <circle cx="12" cy="12" r="10" />
                  )}
                </svg>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {insight.title}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{
                  fontSize: 8,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: insight.type === 'opportunity'
                    ? 'rgba(16,185,129,0.2)'
                    : insight.type === 'risk'
                    ? 'rgba(239,68,68,0.2)'
                    : 'rgba(99,102,241,0.2)',
                  color: insight.type === 'opportunity'
                    ? '#10b981'
                    : insight.type === 'risk'
                    ? '#ef4444'
                    : '#6366f1',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                }}>
                  {insight.type === 'opportunity' ? 'Oportunidade' : insight.type === 'risk' ? 'Risco' : 'Consideração'}
                </span>
                <span style={{
                  fontSize: 8,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: insight.priority === 'high' ? 'rgba(239,68,68,0.2)' : insight.priority === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(148,163,184,0.2)',
                  color: insight.priority === 'high' ? '#ef4444' : insight.priority === 'medium' ? '#f59e0b' : '#94a3b8',
                  fontWeight: 600,
                }}>
                  {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: expandedInsight === i ? 8 : 0 }}>
              {insight.description}
            </div>
            {expandedInsight === i && (
              <div style={{
                paddingTop: 8,
                borderTop: '1px dashed var(--border-dark)',
                fontSize: 8,
                color: 'var(--text-muted)',
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Análise Detalhada:</div>
                <div style={{ marginBottom: 4 }}>
                  • Tipo: {insight.type === 'opportunity' ? 'Potencial de melhoria identificável' : insight.type === 'risk' ? 'Ameaça sistêmica que requer mitigação' : 'Fator contextual a considerar'}
                </div>
                <div style={{ marginBottom: 4 }}>
                  • Prioridade: {insight.priority === 'high' ? 'Requer atenção imediata' : insight.priority === 'medium' ? 'Deve ser monitorado' : 'Pode ser tratado posteriormente'}
                </div>
                <div>
                  • Ação Recomendada: {insight.type === 'opportunity' ? 'Explorar estratégias para capitalizar' : insight.type === 'risk' ? 'Desenvolver plano de mitigação' : 'Incluir na análise de decisão'}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <span style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 600 }}>
                {expandedInsight === i ? '▲ Menos' : '▼ Mais'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
