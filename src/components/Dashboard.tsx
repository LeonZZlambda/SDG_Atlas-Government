import { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import { SDG_METADATA, getCoefficient } from '../utils/projectGenerator';
import { getSDGIcon, getIcon } from './ODSIcons';
import { EngineStatusPanel } from './EngineStatusPanel';
import { SDGNetworkVisualization } from './SDGNetworkVisualization';
import { ProjectComparison } from './ProjectComparison';
import { WhatIfSimulation } from './WhatIfSimulation';
import {
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  calculatePageRank,
  type Graph,
} from '../utils/graphAlgorithms';

export function Dashboard() {
  const { state, dispatch } = usePlatform();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'pt-BR';
  const langKey: 'pt' | 'en' | 'es' = currentLang.startsWith('en') ? 'en' : currentLang.startsWith('es') ? 'es' : 'pt';
  const [showComparison, setShowComparison] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  const projects = state.savedProjects;

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
    dispatch({ type: 'ADD_TOAST', payload: { message: t('toast_project_deleted'), type: 'info' } });
  };

  // Compile statistics
  const totalProjects = projects.length;
  const totalBeneficiaries = projects.reduce((acc, p) => acc + p.inputs.beneficiaries, 0);
  const avgImpact = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.generatedData.overallImpactScore, 0) / totalProjects)
    : 0;
  const avgSustain = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.generatedData.sustainabilityIndex, 0) / totalProjects)
    : 0;

  // Compile ODS frequencies (1 to 17)
  const odsCounts: Record<number, number> = {};
  for (let i = 1; i <= 17; i++) odsCounts[i] = 0;

  projects.forEach(p => {
    p.odsIds.forEach(id => {
      if (odsCounts[id] !== undefined) odsCounts[id]++;
    });
  });

  const maxCount = Math.max(...Object.values(odsCounts), 1);

  // SVG bar chart specs
  const chartHeight = 150;
  const barWidth = 16;
  const gap = 12;
  const chartWidth = 17 * (barWidth + gap) + gap;

  // Build a full graph of ALL SDGs (1–17) for influence ranking
  const allSDGIds = Array.from({ length: 17 }, (_, i) => i + 1);
  const fullGraph: Graph = {
    nodes: allSDGIds.map(id => ({ id, label: `ODS ${id}` })),
    edges: [],
  };
  for (let i = 0; i < allSDGIds.length; i++) {
    for (let j = i + 1; j < allSDGIds.length; j++) {
      const coeff = getCoefficient(allSDGIds[i], allSDGIds[j]);
      if (Math.abs(coeff) > 0.1) {
        fullGraph.edges.push({ from: allSDGIds[i], to: allSDGIds[j], weight: coeff });
      }
    }
  }
  const fullDeg = calculateDegreeCentrality(fullGraph);
  const fullBtw = calculateBetweennessCentrality(fullGraph);

  // Systemic influence: 0.4*deg + 0.3*btw + 0.3*positiveInfluence, normalised 0..1
  const rawInfluence: Record<number, number> = {};
  allSDGIds.forEach(id => {
    const degree = fullDeg.get(id) ?? 0;
    const betweenness = fullBtw.get(id) ?? 0;
    const maxBetweenness = Math.max(...Array.from(fullBtw.values()), 0.001);
    const normalizedBetweenness = betweenness / maxBetweenness;
    
    // Calculate positive influence for this SDG
    const positiveEdges = fullGraph.edges.filter(e => 
      (e.from === id || e.to === id) && e.weight > 0
    ).length;
    const totalEdges = fullGraph.edges.filter(e => e.from === id || e.to === id).length;
    const positiveInfluence = totalEdges > 0 ? positiveEdges / totalEdges : 0;
    
    rawInfluence[id] = 0.4 * degree + 0.3 * normalizedBetweenness + 0.3 * positiveInfluence;
  });
  const maxInf = Math.max(...Object.values(rawInfluence), 0.001);
  const odsInfluence: Record<number, number> = {};
  allSDGIds.forEach(id => { odsInfluence[id] = rawInfluence[id] / maxInf; });

  // Active ODS sorted by Systemic Influence Score directly
  const activeOdsList = allSDGIds
    .filter(id => odsCounts[id] > 0)
    .sort((a, b) => odsInfluence[b] - odsInfluence[a]);

  return (
    <section>
      {/* Title */}
      <div className="page-header">
        <h2>{t('dashboard_title')}</h2>
        <p>{t('dashboard_subtitle')}</p>
      </div>

      {/* METRICS ROW (StatisticsPanel) */}
      <div className="grid-metrics">
        <div className="clay-card stat-card">
          <span className="stat-card-label">{t('dashboard_stat_projects')}</span>
          <span className="stat-card-value">{totalProjects}</span>
        </div>
        <div className="clay-card stat-card">
          <span className="stat-card-label">{t('dashboard_stat_beneficiaries')}</span>
          <span className="stat-card-value">{totalBeneficiaries.toLocaleString()}</span>
        </div>
        <div className="clay-card stat-card">
          <span className="stat-card-label">{t('dashboard_stat_emergent_impact')}</span>
          <span className="stat-card-value">{avgImpact}/100</span>
        </div>
        <div className="clay-card stat-card">
          <span className="stat-card-label">{t('dashboard_stat_sustainability')}</span>
          <span className="stat-card-value">{avgSustain}/100</span>
        </div>
        <div className="clay-card stat-card">
          <span className="stat-card-label">{t('dashboard_stat_feasibility')}</span>
          <span className="stat-card-value">{totalProjects > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.generatedData.feasibility ?? 70), 0) / totalProjects) : 0}/100</span>
        </div>
        <div className="clay-card stat-card">
          <span className="stat-card-label">{t('dashboard_stat_synergies')}</span>
          <span className="stat-card-value">{totalProjects > 0 ? Math.round(projects.reduce((acc, p) => acc + p.generatedData.synergyBalanceIndex, 0) / totalProjects * 100) : 0}%</span>
        </div>
      </div>

      {/* ENGINE STATUS PANEL */}
      <div className="clay-card" style={{ marginBottom: '24px', padding: '20px' }}>
        <EngineStatusPanel />
      </div>

      {/* Analysis Tools */}
      <div className="clay-card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{t('dashboard_analysis_tools')}</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('dashboard_analysis_tools_desc')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSimulation(true)}
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 11,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }}>
              <path d="M2 12h20M2 12l5-5m-5 5l5 5" />
            </svg>
            {t('dashboard_whatif_btn')}
          </button>
          <button
            onClick={() => setShowComparison(true)}
            disabled={projects.length < 2}
            style={{
              padding: '12px 20px',
              borderRadius: 8,
              background: projects.length >= 2 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(0,0,0,0.05)',
              color: projects.length >= 2 ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 11,
              border: 'none',
              cursor: projects.length >= 2 ? 'pointer' : 'not-allowed',
              boxShadow: projects.length >= 2 ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }}>
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            {t('dashboard_compare_btn')}
          </button>
        </div>
        {projects.length < 2 && (
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
            ⚠️ {t('dashboard_min_projects_warning')}
          </div>
        )}
      </div>

      {/* SDG NETWORK VISUALIZATION */}
      {state.selectedOds.length > 0 && (
        <div className="clay-card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>{t('dashboard_network_viz')}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t('dashboard_network_viz_desc')}</p>
          </div>
          
          {/* Build graph for visualization */}
          {(() => {
            const selectedSDGs = state.selectedOds;
            const graph: Graph = {
              nodes: selectedSDGs.map(id => ({
                id,
                label: SDG_METADATA.find(s => s.id === id)?.name[langKey] || `${t('dashboard_sdg_prefix')} ${id}`,
              })),
              edges: [],
            };
            for (let i = 0; i < selectedSDGs.length; i++) {
              for (let j = i + 1; j < selectedSDGs.length; j++) {
                const coeff = getCoefficient(selectedSDGs[i], selectedSDGs[j]);
                if (Math.abs(coeff) > 0.1) {
                  graph.edges.push({ from: selectedSDGs[i], to: selectedSDGs[j], weight: coeff });
                }
              }
            }
            
            const degCentrality = calculateDegreeCentrality(graph);
            const betweennessCentrality = calculateBetweennessCentrality(graph);
            const pageRank = calculatePageRank(graph);
            
            return (
              <SDGNetworkVisualization
                selectedSDGs={selectedSDGs}
                graph={graph}
                degCentrality={degCentrality}
                betweennessCentrality={betweennessCentrality}
                pageRank={pageRank}
              />
            );
          })()}
        </div>
      )}

      {/* SVG FREQUENCY CHART + INFLUENCE TABLE */}
      {totalProjects > 0 && (
        <div className="clay-card" style={{ marginBottom: '32px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: 'clamp(1rem, 1.8vw, 1.125rem)', margin: 0 }}>
                {t('dashboard_frequency_chart')}
              </h3>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 500 }}>
                {t('dashboard_frequency_influence')} — {t('dashboard_frequency_engine')}
              </p>
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`} style={{ width: '100%', minWidth: '480px', height: '100%', overflow: 'visible' }}>
              <defs>
                <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15"/>
                </filter>
              </defs>
              <line x1={gap} y1={chartHeight} x2={chartWidth - gap} y2={chartHeight} stroke="var(--border-dark)" strokeWidth="1.5" />
              <line x1={gap} y1={chartHeight / 2} x2={chartWidth - gap} y2={chartHeight / 2} stroke="var(--border-dark)" strokeWidth="0.5" strokeDasharray="4 4" />

              {Array.from({ length: 17 }, (_, i) => i + 1).map((id, index) => {
                const count = odsCounts[id];
                const influence = odsInfluence[id];
                const barHeight = (count / maxCount) * (chartHeight - 20);
                const infBarH = influence * (chartHeight - 20) * 0.35; // subtle influence overlay
                const x = gap + index * (barWidth + gap);
                const y = chartHeight - barHeight;
                const odsColor = SDG_METADATA.find(o => o.id === id)?.color || '#4f46e5';

                return (
                  <g key={id}>
                    {/* Influence ghost bar (behind) */}
                    <rect
                      x={x} y={chartHeight - infBarH}
                      width={barWidth} height={infBarH}
                      rx={4} fill={odsColor} opacity={0.12}
                    />
                    {/* Frequency bar */}
                    <rect
                      x={x} y={y}
                      width={barWidth} height={barHeight}
                      rx={6}
                      fill={count > 0 ? odsColor : 'var(--bg-tertiary)'}
                      opacity={count > 0 ? 0.92 : 0.2}
                      filter={count > 0 ? 'url(#clayShadow)' : 'none'}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    {count > 0 && (
                      <text x={x + barWidth / 2} y={y - 6}
                        textAnchor="middle" fill="var(--text-primary)"
                        style={{ fontSize: 'clamp(9px, 1.1vw, 10px)', fontWeight: '800', fontFamily: 'var(--font-heading)' }}
                      >{count}</text>
                    )}
                    <text x={x + barWidth / 2} y={chartHeight + 20}
                      textAnchor="middle" fill="var(--text-secondary)"
                      style={{ fontSize: 'clamp(10px, 1.2vw, 11px)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}
                    >{id}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent-color)', display: 'inline-block' }} />
              {t('dashboard_legend_frequency')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent-color)', opacity: 0.2, display: 'inline-block' }} />
              {t('dashboard_legend_influence')}
            </span>
          </div>

          {/* Ranking Table */}
          {activeOdsList.length > 0 && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--border-dark)', paddingTop: 16 }}>
              <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5  H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.36 7 20.28 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.36 17 20.28 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
                {t('dashboard_influence_ranking')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto auto', gap: '6px 12px', alignItems: 'center' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>#</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ODS</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' as const }}>Freq.</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' as const }}>{t('dashboard_systemic_influence')}</span>

                {activeOdsList.slice(0, 5).map((id, rank) => {
                  const ods = SDG_METADATA.find(o => o.id === id)!;
                  const score = (odsInfluence[id] * 100).toFixed(1) + '%';
                  const rankLabel = rank === 0 ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M12 14v2" /><path d="M12 16h.01" /><path d="M7 8l5-3 5 3" /></svg> : rank === 1 ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M12 14v2" /><path d="M12 16h.01" /><path d="M7 8l5-3 5 3" /></svg> : rank === 2 ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#b45309" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M12 14v2" /><path d="M12 16h.01" /><path d="M7 8l5-3 5 3" /></svg> : `#${rank + 1}`;
                  return (
                    <>
                      <span key={`r-${id}`} style={{ fontSize: 11, textAlign: 'center' }}>{rankLabel}</span>
                      <div key={`n-${id}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: ods.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 8, fontWeight: 800, color: '#fff' }}>{id}</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                          {ods.name[langKey]}
                        </span>
                      </div>
                      <span key={`f-${id}`} style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-color)', textAlign: 'right' as const }}>{odsCounts[id]}</span>
                      <span key={`s-${id}`} style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textAlign: 'right' as const }}>{score}</span>
                    </>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Ranking Widgets */}
          {activeOdsList.length > 0 && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--border-dark)', paddingTop: 16 }}>
              <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                {t('dashboard_widgets')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {/* Top Synergy Drivers */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(16,185,129,0.05)',
                  boxShadow: 'var(--clay-input-shadow)',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#10b981', marginBottom: 8, textTransform: 'uppercase' as const }}>
                    {t('dashboard_top_synergy_drivers')}
                  </div>
                  {activeOdsList.slice(0, 3).map((id) => {
                    const ods = SDG_METADATA.find(o => o.id === id)!;
                    return (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: ods.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 7, fontWeight: 800, color: '#fff' }}>{id}</span>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-primary)' }}>{ods.name[langKey]}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Highest Complexity SDGs */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(245,158,11,0.05)',
                  boxShadow: 'var(--clay-input-shadow)',
                  border: '1px solid #f59e0b20',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#f59e0b', marginBottom: 8, textTransform: 'uppercase' as const }}>
                    {t('dashboard_high_complexity')}
                  </div>
                  {[...projects]
                    .sort((a, b) => (b.generatedData.complexity ?? 0) - (a.generatedData.complexity ?? 0))
                    .slice(0, 3)
                    .map((p) => (
                      <div key={p.id} style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {p.name}: {p.generatedData.complexity ?? 0}/100
                      </div>
                    ))
                  }
                </div>

                {/* Most Critical Bottlenecks */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.05)',
                  boxShadow: 'var(--clay-input-shadow)',
                  border: '1px solid #ef444420',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', marginBottom: 8, textTransform: 'uppercase' as const }}>
                    {t('dashboard_critical_bottlenecks')}
                  </div>
                  {projects.filter(p => p.generatedData.tradeoffs.length > 0).slice(0, 3).map((p) => {
                    return (
                      <div key={p.id} style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {p.name}: {p.generatedData.tradeoffs.length} {p.generatedData.tradeoffs.length === 1 ? t('dashboard_conflict') : t('dashboard_conflicts_plural')}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SAVED PLANS LIST */}
      <div className="clay-card">
        <h3 style={{ fontSize: '20px', marginBottom: '20px', paddingBottom: '10px', boxShadow: 'inset 0 -1px 0 var(--border-dark)', textAlign: 'left' }}>
          {t('dashboard_history_title')}
        </h3>

        {projects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {projects.map(p => (
              <div
                key={p.id}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(0,0,0,0.02)',
                  boxShadow: 'var(--clay-input-shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  textAlign: 'left',
                  position: 'relative'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: 'clamp(1rem, 1.8vw, 1.125rem)', fontWeight: 800, margin: '0 0 4px 0' }}>{p.name}</h4>
                    <span style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: 'var(--text-muted)' }}>
                      {t('dashboard_created_at')}: {new Date(p.createdAt).toLocaleDateString(state.language, { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="clay-button clay-button-danger"
                    style={{ padding: '4px 10px', fontSize: 'clamp(10px, 1.1vw, 11px)' }}
                  >
                    {t('dashboard_delete')}
                  </button>
                </div>

                {/* Generation Intelligence Metadata */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 8,
                }}>
                  {[
                    { label: t('dashboard_sdg_combined'), value: p.odsIds.map(id => `${t('dashboard_sdg_prefix')} ${id}`).join(' + '), color: 'var(--accent-color)' },
                    { label: t('dashboard_mcda_score'), value: `${p.generatedData.alignmentScore}/100`, color: '#f59e0b' },
                    { label: t('dashboard_sbi_synergy'), value: p.generatedData.synergyBalanceIndex.toFixed(2), color: '#10b981' },
                    { label: t('dashboard_estimated_reach'), value: `~${p.generatedData.reachEstimated.toLocaleString()} ${t('dashboard_beneficiaries_abbr')}`, color: '#3b82f6' },
                    { label: t('dashboard_tradeoffs_label'), value: `${p.generatedData.tradeoffs.length} ${p.generatedData.tradeoffs.length === 1 ? t('dashboard_conflict') : t('dashboard_conflicts_plural')}`, color: p.generatedData.tradeoffs.length > 0 ? '#ef4444' : '#10b981' },
                    { label: t('dashboard_generated_by'), value: t('dashboard_generated_by_value'), color: '#8b5cf6' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: 'var(--bg-glass)',
                      boxShadow: 'var(--clay-input-shadow)',
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.4px', marginBottom: 3 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: item.color, lineHeight: 1.2, wordBreak: 'break-word' as const }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <p style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', margin: 0, color: 'var(--text-secondary)' }}>
                  {p.summary}
                </p>

                {/* Badge list of ODS */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {p.odsIds.map(id => {
                    const ods = SDG_METADATA.find(o => o.id === id)!;
                    return (
                      <div
                        key={id}
                        style={{
                          background: ods.color,
                          color: '#fff',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: 'clamp(10px, 1.1vw, 11px)',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.2)'
                        }}
                      >
                        <div style={{ width: '12px', height: '12px' }}>
                          {getSDGIcon(id, '', '#ffffff')}
                        </div>
                        {t('dashboard_sdg_prefix')} {id}
                      </div>
                    );
                  })}
                </div>

                {/* Parameters log footer */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  flexWrap: 'wrap',
                  fontSize: 'clamp(10px, 1.2vw, 12px)',
                  color: 'var(--text-muted)',
                  paddingTop: '10px',
                  marginTop: '10px',
                  boxShadow: 'inset 0 1px 0 var(--border-dark)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px' }}>{getIcon('budget', '', 'currentColor')}</div>
                    {t('dashboard_budget_label')}: <strong>${p.inputs.budget.toLocaleString()}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px' }}>{getIcon('users', '', 'currentColor')}</div>
                    {t('dashboard_beneficiaries_label')}: <strong>{p.inputs.beneficiaries}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px' }}>{getIcon('calendar', '', 'currentColor')}</div>
                    {t('dashboard_duration_label')}: <strong>{p.inputs.duration}m</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px' }}>{getIcon('team', '', 'currentColor')}</div>
                    {t('dashboard_team_label')}: <strong>{p.inputs.teamSize}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px' }}>{getIcon('lightning', '', 'currentColor')}</div>
                    {t('dashboard_impact_label')}: <strong>{p.generatedData.overallImpactScore}/100</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ width: 'clamp(40px, 7vw, 56px)', height: 'clamp(40px, 7vw, 56px)', margin: '0 auto 8px' }}>
              {getIcon('archive', '', 'var(--text-muted)')}
            </div>
            <p>{t('dashboard_no_projects')}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showComparison && <ProjectComparison onClose={() => setShowComparison(false)} />}
      {showSimulation && <WhatIfSimulation onClose={() => setShowSimulation(false)} />}
    </section>
  );
}
export default Dashboard;
