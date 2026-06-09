import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import { SDG_METADATA } from '../utils/projectGenerator';
import { getSDGIcon, getIcon } from './ODSIcons';

export function Dashboard() {
  const { state, dispatch } = usePlatform();
  const { t } = useTranslation();

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
          <span className="stat-card-label">{t('dashboard_stat_impact')}</span>
          <span className="stat-card-value">{avgImpact}/100</span>
        </div>
        <div className="clay-card stat-card">
          <span className="stat-card-label">{t('dashboard_stat_sustainability')}</span>
          <span className="stat-card-value">{avgSustain}/100</span>
        </div>
      </div>

      {/* SVG FREQUENCY CHART */}
      {totalProjects > 0 && (
        <div className="clay-card" style={{ marginBottom: '32px', padding: '24px' }}>
          <h3 style={{ fontSize: 'clamp(1rem, 1.8vw, 1.125rem)', marginBottom: '20px', textAlign: 'left' }}>
            {t('dashboard_frequency_chart')}
          </h3>
          <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`} style={{ width: '100%', minWidth: '480px', height: '100%', overflow: 'visible' }}>
              <defs>
                <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15"/>
                </filter>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.95"/>
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.85"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1={gap} y1={chartHeight} x2={chartWidth - gap} y2={chartHeight} stroke="var(--border-dark)" strokeWidth="1.5" />
              <line x1={gap} y1={chartHeight / 2} x2={chartWidth - gap} y2={chartHeight / 2} stroke="var(--border-dark)" strokeWidth="0.5" strokeDasharray="4 4" />

              {/* Render 17 Bars */}
              {Array.from({ length: 17 }, (_, i) => i + 1).map((id, index) => {
                const count = odsCounts[id];
                const barHeight = (count / maxCount) * (chartHeight - 20);
                const x = gap + index * (barWidth + gap);
                const y = chartHeight - barHeight;
                const odsColor = SDG_METADATA.find(o => o.id === id)?.color || '#4f46e5';

                return (
                  <g key={id}>
                    {/* Active Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={6}
                      fill={count > 0 ? odsColor : 'var(--bg-tertiary)'}
                      opacity={count > 0 ? 0.95 : 0.25}
                      filter={count > 0 ? 'url(#clayShadow)' : 'none'}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    {/* Tooltip value on top */}
                    {count > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fill="var(--text-primary)"
                        style={{ fontSize: 'clamp(9px, 1.1vw, 10px)', fontWeight: '800', fontFamily: 'var(--font-heading)' }}
                      >
                        {count}
                      </text>
                    )}
                    {/* Label number below */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 20}
                      textAnchor="middle"
                      fill="var(--text-secondary)"
                      style={{ fontSize: 'clamp(10px, 1.2vw, 11px)', fontWeight: '700', fontFamily: 'var(--font-heading)' }}
                    >
                      {id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
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
                  boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.06), inset 2px 2px 6px rgba(255,255,255,0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  textAlign: 'left',
                  position: 'relative'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: 'clamp(1rem, 1.8vw, 1.125rem)', fontWeight: 800, margin: '0 0 4px 0' }}>{p.name}</h4>
                    <span style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: 'var(--text-muted)' }}>
                      Criado em: {new Date(p.createdAt).toLocaleDateString(state.language, { dateStyle: 'medium' })}
                    </span>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="clay-button clay-button-danger"
                    style={{ padding: '4px 10px', fontSize: 'clamp(10px, 1.1vw, 11px)' }}
                  >
                    Excluir
                  </button>
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
                        ODS {id}
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
                    Orçamento: <strong>${p.inputs.budget.toLocaleString()}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px' }}>{getIcon('users', '', 'currentColor')}</div>
                    Beneficiários: <strong>{p.inputs.beneficiaries}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px' }}>{getIcon('calendar', '', 'currentColor')}</div>
                    Duração: <strong>{p.inputs.duration}m</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px' }}>{getIcon('team', '', 'currentColor')}</div>
                    Equipe: <strong>{p.inputs.teamSize}</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '14px', height: '14px' }}>{getIcon('lightning', '', 'currentColor')}</div>
                    Impacto: <strong>{p.generatedData.overallImpactScore}/100</strong>
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
    </section>
  );
}
export default Dashboard;
