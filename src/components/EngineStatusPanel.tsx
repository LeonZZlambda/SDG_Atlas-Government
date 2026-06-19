import { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import {
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  calculatePageRank,
  getGraphStatistics,
} from '../utils/graphAlgorithms';
import { ExplanationPanel } from './EngineStatusPanel/ExplanationPanel';
import { PulseDot } from './EngineStatusPanel/PulseDot';
import {
  IconGraph,
  IconLightning,
  IconMCDA,
  IconImpact,
  IconSustain,
  IconGenerator,
} from './EngineStatusPanel/Icons';
import { EngineCard } from './EngineStatusPanel/EngineCard';
import { ExecutiveOutputLayer } from './EngineStatusPanel/ExecutiveOutputLayer';
import { StrategicRecommendationsPanel } from './EngineStatusPanel/StrategicRecommendationsPanel';
import { ExecutiveInsightsPanel } from './EngineStatusPanel/ExecutiveInsightsPanel';
import { generateDrivers } from '../utils/engineDrivers';
import { buildGraphFromSDGs, calculateSingleSystemicInfluence } from '../utils/graphBuilders';
import { getEngines } from '../utils/engineConfig';
import {
  generateExplanationPanels,
  generateStrategicRecommendations,
  generateExecutiveInsights,
} from '../utils/engineAnalysis';

// ─── Main Component ───────────────────────────────────────────────────────────

export function EngineStatusPanel() {
  const { state } = usePlatform();
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSDGs = state.selectedOds;
  const project = state.currentProject;
  const hasSdgs = selectedSDGs.length > 0;

  // Build a live graph from selected SDGs with error handling
  let graph: { nodes: any[]; edges: any[] };
  try {
    graph = hasSdgs ? buildGraphFromSDGs(selectedSDGs) : { nodes: [], edges: [] };
  } catch (err) {
    console.error('Error building graph:', err);
    setError('Failed to build SDG graph');
    graph = { nodes: [], edges: [] };
  }

  // Compute live metrics using graph algorithms with error handling
  let degCentrality: Map<number, number> | null = null;
  let betweennessCentrality: Map<number, number> | null = null;
  let pageRank: Map<number, number> | null = null;
  let graphStats: any = null;

  if (hasSdgs && !error) {
    try {
      degCentrality = calculateDegreeCentrality(graph);
      betweennessCentrality = calculateBetweennessCentrality(graph);
      pageRank = calculatePageRank(graph);
      graphStats = getGraphStatistics(graph);
    } catch (err) {
      console.error('Error computing graph metrics:', err);
      setError('Failed to compute graph metrics');
    }
  }

  const positiveEdges = graph.edges.filter(e => e.weight > 0).length;
  const negativeEdges = graph.edges.filter(e => e.weight < 0).length;

  // Synergy Balance Index
  const sbi = project ? project.synergyBalanceIndex : null;

  // Low Conflict Ratio: 1 - (negativeEdges / totalEdges)
  const lcr = graph.edges.length > 0
    ? ((1 - negativeEdges / graph.edges.length) * 100).toFixed(0)
    : '—';

  // Network Density
  const networkDensity = graphStats ? (graphStats.density * 100).toFixed(1) + '%' : '—';

  // Average Clustering Coefficient
  const avgClustering = graphStats ? graphStats.averageClusteringCoefficient.toFixed(3) : '—';

  // MCDA score from project alignmentScore
  const mcdaScore = project ? `${project.alignmentScore}/100` : '—';
  const impactScore = project ? `${project.overallImpactScore}/100` : '—';
  const sustainScore = project ? `${project.sustainabilityIndex}/100` : '—';

  // Impact classification
  const getImpactClassification = (score: number) => {
    if (score >= 85) return 'Transformador';
    if (score >= 70) return 'Alto Impacto';
    if (score >= 50) return 'Moderado';
    return 'Limitado';
  };

  // Sustainability classification
  const getSustainabilityClassification = (score: number) => {
    if (score >= 80) return 'Sustentável';
    if (score >= 60) return 'Viável';
    if (score >= 40) return 'Risco Moderado';
    return 'Alto Risco';
  };

  // Create context for driver generation
  const driverContext = {
    hasSdgs,
    selectedSDGs,
    graphStats,
    graph,
    positiveEdges,
    negativeEdges,
    degCentrality,
    betweennessCentrality,
    sbi,
    project,
    inputs: state.inputs,
    calculateSystemicInfluence: (sdgId: number) => calculateSingleSystemicInfluence(sdgId, degCentrality, betweennessCentrality, graph)
  };

  // Generate Sensitivity Analysis
  const generateSensitivityAnalysis = (): { sdgId: number; influence: number; reason: string }[] => {
    if (!project || !project.sensitivity) return [];
    return project.sensitivity.map((s: any) => ({
      sdgId: s.sdgId,
      influence: s.contribution,
      reason: s.reason
    }));
  };

  // Use extracted analysis functions
  const explanationPanels = generateExplanationPanels({
    hasSdgs,
    selectedSDGs,
    project,
    inputs: state.inputs,
    degCentrality,
    betweennessCentrality,
    graph,
    t,
  });
  const { recommendations, gaps } = generateStrategicRecommendations({
    hasSdgs,
    selectedSDGs,
    project,
    inputs: state.inputs,
    degCentrality,
    betweennessCentrality,
    graph,
    t,
  });
  const executiveInsights = generateExecutiveInsights({
    hasSdgs,
    selectedSDGs,
    project,
    inputs: state.inputs,
    degCentrality,
    betweennessCentrality,
    graph,
    t,
  });

  const engines = getEngines({
    hasSdgs,
    selectedSDGs,
    graph,
    positiveEdges,
    negativeEdges,
    networkDensity,
    avgClustering,
    lcr,
    mcdaScore,
    impactScore,
    sustainScore,
    sbi,
    project,
    inputs: state.inputs,
    degCentrality,
    pageRank,
    betweennessCentrality,
    graphStats,
    getImpactClassification,
    getSustainabilityClassification,
    t,
    IconGraph: <IconGraph />,
    IconMCDA: <IconMCDA />,
    IconImpact: <IconImpact />,
    IconSustain: <IconSustain />,
    IconGenerator: <IconGenerator />,
  });

  return (
    <div style={{ marginBottom: 24 }}>
      <style>{`
        @keyframes engine-ping {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Error Display */}
      {error && (
        <div 
          style={{
            padding: '12px 16px',
            marginBottom: 16,
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          role="alert"
          aria-live="polite"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: 16,
              padding: 0,
              lineHeight: 1,
            }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
            Intelligence Dashboard
          </h3>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 500 }}>
            {t('dashboard_framework_description')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PulseDot status={hasSdgs ? 'active' : 'idle'} />
          <span style={{ fontSize: 10, fontWeight: 700, color: hasSdgs ? '#10b981' : 'var(--text-muted)' }}>
            {hasSdgs ? `${selectedSDGs.length} ${t('engine_ods_active')}` : t('engine_awaiting_selection')}
          </span>
        </div>
      </div>

      {/* SECTION 1: Executive Output Layer */}
      {hasSdgs && project && (
        <ExecutiveOutputLayer project={project} selectedSDGs={selectedSDGs} />
      )}

      {/* SECTION 2: Intelligence Pipeline Overview */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Intelligence Pipeline Overview
          </div>
          <div style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: 'var(--bg-glass)',
            boxShadow: 'var(--clay-card-shadow)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', fontSize: 10 }}>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(99,102,241,0.15)',
                color: '#6366f1',
                fontWeight: 700,
                border: '1px solid rgba(99,102,241,0.3)',
              }}>
                Graph Engine
              </div>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(245,158,11,0.15)',
                color: '#f59e0b',
                fontWeight: 700,
                border: '1px solid rgba(245,158,11,0.3)',
              }}>
                MCDA Engine
              </div>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(16,185,129,0.15)',
                color: '#10b981',
                fontWeight: 700,
                border: '1px solid rgba(16,185,129,0.3)',
              }}>
                Impact Engine
              </div>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(59,130,246,0.15)',
                color: '#3b82f6',
                fontWeight: 700,
                border: '1px solid rgba(59,130,246,0.3)',
              }}>
                Sustainability Engine
              </div>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(236,72,153,0.15)',
                color: '#ec4899',
                fontWeight: 700,
                border: '1px solid rgba(236,72,153,0.3)',
              }}>
                Project Generator
              </div>
            </div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
              {t('engine_pipeline_description')}
            </div>
          </div>
        </div>
      )}
      {/* Network Reliability Warning */}
      {hasSdgs && selectedSDGs.length < 5 && (
        <div style={{
          marginBottom: 14,
          padding: '10px 14px',
          borderRadius: 8,
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
          </svg>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>
              {t('engine_network_limited')}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
              {t('engine_network_limited_desc', { count: selectedSDGs.length })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Graph Algorithms Engine */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 3 — Graph Algorithms Engine
          </div>
          <EngineCard
            engine={engines.find(e => e.id === 'graph')!}
            expanded={expandedId === 'graph'}
            onToggle={() => setExpandedId(expandedId === 'graph' ? null : 'graph')}
            drivers={generateDrivers('graph', driverContext, t)}
          />
        </div>
      )}

      {/* SECTION 4: MCDA Engine */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 4 — MCDA Engine
          </div>
          <EngineCard
            engine={engines.find(e => e.id === 'mcda')!}
            expanded={expandedId === 'mcda'}
            onToggle={() => setExpandedId(expandedId === 'mcda' ? null : 'mcda')}
            drivers={generateDrivers('mcda', driverContext, t)}
          />
        </div>
      )}

      {/* SECTION 5: Impact Engine */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 5 — Impact Engine
          </div>
          <EngineCard
            engine={engines.find(e => e.id === 'impact')!}
            expanded={expandedId === 'impact'}
            onToggle={() => setExpandedId(expandedId === 'impact' ? null : 'impact')}
            drivers={generateDrivers('impact', driverContext, t)}
          />
        </div>
      )}

      {/* SECTION 6: Sustainability Engine */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 6 — Sustainability Engine
          </div>
          <EngineCard
            engine={engines.find(e => e.id === 'sustain')!}
            expanded={expandedId === 'sustain'}
            onToggle={() => setExpandedId(expandedId === 'sustain' ? null : 'sustain')}
            drivers={generateDrivers('sustain', driverContext, t)}
          />
        </div>
      )}

      {/* SECTION 7: Explainability Layer */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 7 — Explainability Layer
          </div>
          
          {/* Sensitivity Analysis */}
          {(() => {
            const sensitivityData = generateSensitivityAnalysis();
            if (sensitivityData.length === 0) return null;
            
            return (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Sensitivity Analysis</div>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-glass)',
                  boxShadow: 'var(--clay-input-shadow)',
                }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Influência de cada ODS no resultado final
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sensitivityData.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        borderRadius: 6,
                        background: item.influence > 40 ? 'rgba(16,185,129,0.1)' : item.influence > 25 ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>ODS {item.sdgId}</span>
                          <span style={{ fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.reason}</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: item.influence > 40 ? '#10b981' : item.influence > 25 ? '#3b82f6' : '#f59e0b' }}>
                          +{item.influence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Explanation Panels */}
          {explanationPanels.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Metric Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                {explanationPanels.map((panel, i) => (
                  <ExplanationPanel key={i} explanation={panel} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 8: Decision Support Layer */}
      {hasSdgs && (recommendations.length > 0 || gaps.length > 0) && (
        <StrategicRecommendationsPanel recommendations={recommendations} gaps={gaps} />
      )}

      {/* SECTION 9: Executive Intelligence Layer */}
      {hasSdgs && executiveInsights.length > 0 && (
        <ExecutiveInsightsPanel executiveInsights={executiveInsights} />
      )}

      {/* SECTION 10: Saved Projects */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
          Section 10 — Saved Projects
        </div>
        <div style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: 'var(--bg-glass)',
          boxShadow: 'var(--clay-input-shadow)',
        }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>
            {state.savedProjects.length} projeto{state.savedProjects.length !== 1 ? 's' : ''} salvo{state.savedProjects.length !== 1 ? 's' : ''}
          </div>
          {state.savedProjects.length === 0 ? (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Nenhum projeto salvo ainda
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {state.savedProjects.slice(0, 5).map(p => (
                <div key={p.id} style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-dark)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {p.odsIds.length} ODS • {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 9 }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Impact: {p.generatedData.overallImpactScore}</span>
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>Sust: {p.generatedData.sustainabilityIndex}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Methodology Panel */}
      <div style={{
        marginBottom: 20,
        padding: '14px 18px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(59,130,246,0.02) 100%)',
        boxShadow: 'var(--clay-input-shadow)',
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>
          {t('engine_general_methodology')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>{t('engine_graph_theory')}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('engine_graph_theory_desc')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>{t('engine_mcda_label')}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('engine_mcda_desc')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#10b981', marginBottom: 4 }}>{t('engine_impact_modeling')}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('engine_impact_modeling_desc')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#3b82f6', marginBottom: 4 }}>{t('engine_sustainability_modeling')}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('engine_sustainability_modeling_desc')}
            </div>
          </div>
        </div>
      </div>

      {/* No-SDG hint */}
      {!hasSdgs && (
        <div style={{
          textAlign: 'center',
          padding: '12px 16px',
          marginTop: 10,
          borderRadius: 12,
          background: 'rgba(0,0,0,0.03)',
          boxShadow: 'var(--clay-input-shadow)',
          fontSize: 11,
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>
          <IconLightning /> {t('engine_select_hint')}
        </div>
      )}
    </div>
  );
}

export default EngineStatusPanel;
