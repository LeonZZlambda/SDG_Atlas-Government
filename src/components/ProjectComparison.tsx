import { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';

interface ProjectComparisonProps {
  onClose: () => void;
}

interface RadarChartProps {
  projects: any[];
  metrics: any[];
}

function RadarChart({ projects, metrics }: RadarChartProps) {
  const centerX = 200;
  const centerY = 175;
  const radius = 120;
  const numAxes = metrics.length;
  const angleStep = (Math.PI * 2) / numAxes;

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getNormalizedValue = (project: any, metric: any) => {
    const dataPath = metric.path || 'generatedData';
    const dataObj = dataPath === 'inputs' ? project.inputs : project.generatedData;
    const value = dataObj?.[metric.key as keyof typeof dataObj] as number || 0;
    return Math.min(1, Math.max(0, value / metric.max));
  };

  const getPoint = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = value * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const getAxisPoint = (index: number) => {
    return getPoint(1, index);
  };

  return (
    <g>
      {/* Draw background grid */}
      {[0.25, 0.5, 0.75, 1].map(level => (
        <polygon
          key={level}
          points={Array.from({ length: numAxes }, (_, i) => {
            const point = getPoint(level, i);
            return `${point.x},${point.y}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="1"
        />
      ))}

      {/* Draw axes */}
      {Array.from({ length: numAxes }, (_, i) => {
        const point = getAxisPoint(i);
        return (
          <line
            key={i}
            x1={centerX}
            y1={centerY}
            x2={point.x}
            y2={point.y}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="1"
          />
        );
      })}

      {/* Draw axis labels */}
      {metrics.map((metric, i) => {
        const labelRadius = radius + 20;
        const angle = i * angleStep - Math.PI / 2;
        const labelX = centerX + labelRadius * Math.cos(angle);
        const labelY = centerY + labelRadius * Math.sin(angle);
        
        return (
          <text
            key={i}
            x={labelX}
            y={labelY}
            textAnchor={labelX > centerX ? 'start' : labelX < centerX ? 'end' : 'middle'}
            dominantBaseline={labelY > centerY ? 'hanging' : labelY < centerY ? 'auto' : 'middle'}
            fontSize="9"
            fontWeight="600"
            fill="var(--text-primary)"
          >
            {metric.label}
          </text>
        );
      })}

      {/* Draw project polygons */}
      {projects.map((project, projectIndex) => {
        const points = metrics.map((metric, i) => {
          const value = getNormalizedValue(project, metric);
          const point = getPoint(value, i);
          return `${point.x},${point.y}`;
        }).join(' ');

        return (
          <g key={project.id}>
            <polygon
              points={points}
              fill={colors[projectIndex % colors.length] + '33'}
              stroke={colors[projectIndex % colors.length]}
              strokeWidth="2"
              opacity="0.7"
            />
            {/* Draw points */}
            {metrics.map((metric, i) => {
              const value = getNormalizedValue(project, metric);
              const point = getPoint(value, i);
              return (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={colors[projectIndex % colors.length]}
                />
              );
            })}
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(10, 320)">
        {projects.map((project, i) => (
          <g key={project.id} transform={`translate(${i * 100}, 0)`}>
            <rect
              x="0"
              y="-8"
              width="12"
              height="12"
              fill={colors[i % colors.length]}
              opacity="0.7"
            />
            <text
              x="16"
              y="2"
              fontSize="9"
              fontWeight="600"
              fill="var(--text-primary)"
            >
              {project.name.substring(0, 15)}{project.name.length > 15 ? '...' : ''}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

export function ProjectComparison({ onClose }: ProjectComparisonProps) {
  const { state } = usePlatform();
  const { t } = useTranslation();
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const projects = state.savedProjects;

  const toggleProject = (id: string) => {
    setSelectedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedProjectsList = projects.filter(p => selectedProjects.has(p.id));

  const getComparisonData = () => {
    if (selectedProjectsList.length === 0) return null;

    return {
      metrics: [
        { label: t('whatif_impact'), key: 'overallImpactScore', max: 100, path: 'generatedData' },
        { label: t('whatif_sustainability'), key: 'sustainabilityIndex', max: 100, path: 'generatedData' },
        { label: t('planner_alignment_ods'), key: 'alignmentScore', max: 100, path: 'generatedData' },
        { label: `${t('dashboard_budget_label')} (K)`, key: 'budget', max: 1000, format: (v: number) => `$${(v / 1000).toFixed(0)}K`, path: 'inputs' },
        { label: `${t('dashboard_duration_label')} (mo)`, key: 'duration', max: 36, path: 'inputs' },
        { label: t('dashboard_beneficiaries_label'), key: 'beneficiaries', max: 100000, format: (v: number) => v.toLocaleString(), path: 'inputs' },
        { label: t('dashboard_tradeoffs_label'), key: 'tradeoffs', max: 10, format: (v: any) => v.length, path: 'generatedData' },
      ],
    };
  };

  const comparisonData = getComparisonData();

  const generateInsights = () => {
    if (selectedProjectsList.length < 2) return null;

    const insights: string[] = [];
    const p1 = selectedProjectsList[0];
    const p2 = selectedProjectsList[1];

    const p1Impact = p1.generatedData?.overallImpactScore || 0;
    const p2Impact = p2.generatedData?.overallImpactScore || 0;
    const p1Sustain = p1.generatedData?.sustainabilityIndex || 0;
    const p2Sustain = p2.generatedData?.sustainabilityIndex || 0;
    const p1Tradeoffs = p1.generatedData?.tradeoffs?.length || 0;
    const p2Tradeoffs = p2.generatedData?.tradeoffs?.length || 0;
    const p1Budget = p1.inputs?.budget || 0;
    const p2Budget = p2.inputs?.budget || 0;

    if (p1Impact > p2Impact + 10) {
      insights.push(`${p1.name} ${t('comparison_higher_impact')} (${p1Impact} vs ${p2Impact}).`);
    } else if (p2Impact > p1Impact + 10) {
      insights.push(`${p2.name} ${t('comparison_higher_impact')} (${p2Impact} vs ${p1Impact}).`);
    }

    if (p1Sustain > p2Sustain + 10) {
      insights.push(`${p1.name} ${t('comparison_higher_resilience')}.`);
    } else if (p2Sustain > p1Sustain + 10) {
      insights.push(`${p2.name} ${t('comparison_higher_resilience')}.`);
    }

    if (p1Tradeoffs < p2Tradeoffs) {
      insights.push(`${p1.name} ${t('comparison_lower_coordination')} (${p1Tradeoffs} vs ${p2Tradeoffs} trade-offs).`);
    } else if (p2Tradeoffs < p1Tradeoffs) {
      insights.push(`${p2.name} ${t('comparison_lower_coordination')} (${p2Tradeoffs} vs ${p1Tradeoffs} trade-offs).`);
    }

    if (p1Budget < p2Budget) {
      insights.push(`${p1.name} ${t('comparison_more_efficient')}.`);
    } else {
      insights.push(`${p2.name} ${t('comparison_more_efficient')}.`);
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: 16,
        maxWidth: 1200,
        maxHeight: '90vh',
        width: '95%',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{t('comparison_title')}</h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {t('comparison_subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: 20,
              padding: '4px 12px',
              borderRadius: 8,
              background: 'rgba(0,0,0,0.05)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* Project Selection */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{t('comparison_select_projects')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => toggleProject(project.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: selectedProjects.has(project.id) ? '#6366f1' : 'rgba(0,0,0,0.05)',
                  color: selectedProjects.has(project.id) ? '#fff' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: 10,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Results */}
        {selectedProjectsList.length >= 2 && comparisonData && (
          <>
            {/* Side-by-side Metrics Table */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{t('comparison_comparative_metrics')}</div>
              <div style={{
                borderRadius: 12,
                background: 'var(--bg-glass)',
                boxShadow: 'var(--clay-input-shadow)',
                overflow: 'hidden',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.03)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700 }}>{t('comparison_metric')}</th>
                      {selectedProjectsList.map(p => (
                        <th key={p.id} style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.metrics.map(metric => (
                      <tr key={metric.key} style={{ borderBottom: '1px solid var(--border-dark)' }}>
                        <td style={{ padding: '10px 12px', fontSize: 10, fontWeight: 600 }}>{metric.label}</td>
                        {selectedProjectsList.map(p => {
                          const dataPath = metric.path || 'generatedData';
                          const dataObj = dataPath === 'inputs' ? p.inputs : p.generatedData;
                          const value = dataObj?.[metric.key as keyof typeof dataObj] as number || 0;
                          const formatted = metric.format ? metric.format(value) : value.toFixed(1);
                          const percentage = (value / metric.max) * 100;
                          
                          return (
                            <td key={p.id} style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{formatted}</div>
                              <div style={{ height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%',
                                  width: `${Math.min(100, percentage)}%`,
                                  background: percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444',
                                  borderRadius: 2,
                                }} />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Automated Insights */}
            {insights && insights.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{t('comparison_auto_analysis')}</div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(245,158,11,0.05) 100%)',
                  boxShadow: 'var(--clay-input-shadow)',
                }}>
                  {insights.map((insight, i) => (
                    <div key={i} style={{ fontSize: 10, marginBottom: 6, lineHeight: 1.5 }}>
                      <span style={{ color: '#6366f1', fontWeight: 700 }}>•</span> {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Radar Chart */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{t('comparison_radar_chart')}</div>
              <div style={{
                height: 350,
                borderRadius: 12,
                background: 'var(--bg-glass)',
                boxShadow: 'var(--clay-input-shadow)',
                padding: 16,
                position: 'relative',
              }}>
                <svg
                  viewBox="0 0 400 350"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {/* Radar Chart Implementation */}
                  <RadarChart
                    projects={selectedProjectsList}
                    metrics={comparisonData?.metrics || []}
                  />
                </svg>
              </div>
            </div>
          </>
        )}

        {selectedProjectsList.length < 2 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 12,
          }}>
            {t('comparison_min_projects')}
          </div>
        )}
      </div>
    </div>
  );
}
