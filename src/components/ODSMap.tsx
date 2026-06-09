import { useState } from 'preact/hooks';
import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import { SDG_METADATA, getCoefficient } from '../utils/projectGenerator';
import { getSDGIcon, getIcon } from './ODSIcons';

const SIZE   = 560;
const CX     = SIZE / 2;
const CY     = SIZE / 2;
const RING   = 210;
const R_ON   = 20;
const R_OFF  = 10;

// Responsive text sizes using clamp
const TEXT_PROJ = 'clamp(6px, 1.2vw, 8px)';
const TEXT_ODS  = 'clamp(5px, 1vw, 7px)';
const TEXT_TOOLTIP = 'clamp(7px, 1.3vw, 9px)';
const TEXT_INACTIVE = 'clamp(5px, 1vw, 7px)';

function nodeCoords(id: number) {
  const angle = ((id - 1) / 17) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CX + RING * Math.cos(angle),
    y: CY + RING * Math.sin(angle),
  };
}

function edgeColor(v: number) {
  if (v < 0)    return '#ef4444';
  if (v > 0.5)  return '#10b981';
  return '#818cf8';
}

function edgeOpacity(v: number) {
  if (v < 0)    return 0.7;
  if (v > 0.5)  return 0.65;
  return 0.35;
}

export function ODSMap() {
  const { state } = usePlatform();
  const { t }     = useTranslation();
  const lang      = state.language.split('-')[0] as 'pt' | 'en' | 'es';

  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [activeEdge, setActiveEdge] = useState<{ a: number; b: number; val: number } | null>(null);
  const [clickedNode, setClickedNode] = useState<number | null>(null);

  const selected = state.selectedOds;

  const edges: { a: number; b: number; val: number }[] = [];
  for (let i = 0; i < selected.length; i++)
    for (let j = i + 1; j < selected.length; j++)
      edges.push({ a: selected[i], b: selected[j], val: getCoefficient(selected[i], selected[j]) });

  const strongSynergies = edges.filter(e => e.val > 0.5).length;
  const conflicts       = edges.filter(e => e.val < 0).length;

  const infoOds  = (clickedNode || activeNode) ? SDG_METADATA.find(o => o.id === (clickedNode || activeNode)) : null;
  const infoOdsA = activeEdge ? SDG_METADATA.find(o => o.id === activeEdge.a) : null;
  const infoOdsB = activeEdge ? SDG_METADATA.find(o => o.id === activeEdge.b) : null;

  const handleNodeClick = (id: number) => {
    if (selected.includes(id)) {
      setClickedNode(clickedNode === id ? null : id);
      setActiveNode(id);
    }
  };


  return (
    <section className="ods-map-section">
      <div className="view-header">
        <h2 className="view-title">{t('map_title')}</h2>
        <p className="view-subtitle">{t('map_subtitle')}</p>
      </div>

      {/* Legend */}
      <div className="map-legend">
        {[
          { color: '#10b981', label: lang === 'pt' ? 'Alta sinergia' : lang === 'es' ? 'Alta sinergia' : 'High synergy' },
          { color: '#818cf8', label: lang === 'pt' ? 'Sinergia neutra' : lang === 'es' ? 'Sinergia neutra' : 'Neutral synergy' },
          { color: '#ef4444', label: lang === 'pt' ? 'Conflito' : lang === 'es' ? 'Conflicto' : 'Conflict' },
        ].map(l => (
          <span key={l.label} className="map-legend-item">
            <span className="map-legend-dot" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      {/* SVG — full width, ratio locked via viewBox */}
      <div className="clay-card map-svg-card">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
          aria-label="SDG Radial Synergy Map"
          role="img"
        >
          <defs>
            <filter id="node-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Guide ring */}
          <circle cx={CX} cy={CY} r={RING}
            fill="none" stroke="var(--border-dark)" strokeWidth="1"
            strokeDasharray="3 6" opacity="0.5"
          />

          {/* Edges — rendered first so nodes sit on top */}
          {edges.map((e, i) => {
            const a = nodeCoords(e.a);
            const b = nodeCoords(e.b);
            const isHov = activeEdge?.a === e.a && activeEdge?.b === e.b;
            const isDim = !!activeEdge && !isHov;
            const isConnectedToClicked = clickedNode && (e.a === clickedNode || e.b === clickedNode);
            const col   = edgeColor(e.val);
            const dash  = e.val < 0 ? '6 4' : undefined;
            const w     = e.val < 0 ? 1.5 : e.val > 0.5 ? 2.5 : 1.2;
            const hitAreaWidth = 20; // Larger invisible hit area for easier clicking

            return (
              <g key={i}>
                {/* Invisible hit area - wider stroke for easier clicking */}
                <path
                  d={`M ${a.x} ${a.y} Q ${CX} ${CY} ${b.x} ${b.y}`}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={hitAreaWidth}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => { setActiveEdge(e); setActiveNode(null); }}
                  onMouseLeave={() => setActiveEdge(null)}
                />
                {/* Visible edge */}
                <path
                  d={`M ${a.x} ${a.y} Q ${CX} ${CY} ${b.x} ${b.y}`}
                  fill="none"
                  stroke={col}
                  strokeWidth={isConnectedToClicked ? w + 3 : isHov ? w + 2 : w}
                  strokeDasharray={dash}
                  opacity={clickedNode ? (isConnectedToClicked ? 1 : 0.15) : (isDim ? 0.08 : isHov ? 1 : edgeOpacity(e.val))}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s, stroke-width 0.2s', pointerEvents: 'none' }}
                />
              </g>
            );
          })}

          {/* Center node */}
          <circle cx={CX} cy={CY} r={28} fill="var(--accent-color)"
            stroke="rgba(255,255,255,0.25)" strokeWidth="2"
            filter="url(#node-glow)"
          />
          <text x={CX} y={CY - 5} textAnchor="middle" fill="#fff"
            style={{ fontSize: TEXT_PROJ, fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}>
            PROJ
          </text>
          <text x={CX} y={CY + 8} textAnchor="middle" fill="rgba(255,255,255,0.7)"
            style={{ fontSize: TEXT_ODS, fontFamily: 'var(--font-sans)' }}>
            {selected.length} ODS
          </text>

          {/* SDG Nodes */}
          {SDG_METADATA.map(ods => {
            const { x, y } = nodeCoords(ods.id);
            const on     = selected.includes(ods.id);
            const isHov  = activeNode === ods.id;
            const isClicked = clickedNode === ods.id;
            const isDim  = !!activeEdge && !selected.includes(ods.id);
            const r      = on ? R_ON : R_OFF;

            return (
              <g
                key={ods.id}
                style={{
                  cursor: on ? 'pointer' : 'default',
                  opacity: isDim ? 0.2 : 1,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={() => { if (on) { setActiveNode(ods.id); setActiveEdge(null); } }}
                onMouseLeave={() => setActiveNode(null)}
                onClick={() => handleNodeClick(ods.id)}
                role={on ? 'button' : undefined}
                aria-label={on ? `SDG ${ods.id}: ${ods.name[lang]}` : undefined}
              >
                {/* Glow halo on hover or click */}
                {on && (isHov || isClicked) && (
                  <circle cx={x} cy={y} r={r + 8}
                    fill={ods.color} opacity={0.2}
                    filter="url(#node-glow)"
                  />
                )}

                {/* Node body */}
                <circle
                  cx={x} cy={y} r={r}
                  fill={on ? ods.color : 'var(--bg-tertiary)'}
                  stroke={on ? 'rgba(255,255,255,0.35)' : 'var(--border-dark)'}
                  strokeWidth={on ? (isClicked ? 2.5 : 1.5) : 1}
                  opacity={on ? 1 : 0.4}
                  style={{
                    transition: 'r 0.0s',
                    filter: on && (isHov || isClicked) ? `drop-shadow(0 0 6px ${ods.color})` : 'none',
                  }}
                />

                {/* Inner icon for active nodes */}
                {on && (
                  <foreignObject
                    x={x - r * 0.6} y={y - r * 0.6}
                    width={r * 1.2} height={r * 1.2}
                    style={{ pointerEvents: 'none', overflow: 'visible' }}
                  >
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {getSDGIcon(ods.id, '', '#ffffff')}
                    </div>
                  </foreignObject>
                )}

                {/* Number for inactive */}
                {!on && (
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill="var(--text-muted)"
                    style={{ fontSize: TEXT_INACTIVE, fontWeight: 700, fontFamily: 'var(--font-heading)', pointerEvents: 'none' }}>
                    {ods.id}
                  </text>
                )}

                {/* Tooltip label above hovered node */}
                {on && isHov && (() => {
                  const label = `${ods.id}. ${ods.name[lang]}`;
                  const boxW  = Math.min(label.length * 5.5 + 12, 120);
                  const boxX  = Math.max(4, Math.min(x - boxW / 2, SIZE - boxW - 4));
                  const boxY  = y - r - 28;
                  return (
                    <g style={{ pointerEvents: 'none' }}>
                      <rect x={boxX} y={boxY} width={boxW} height={20} rx={6}
                        fill="var(--bg-card)" stroke={ods.color} strokeWidth="1.5" opacity={0.97}
                      />
                      <text x={boxX + boxW / 2} y={boxY + 13} textAnchor="middle"
                        fill="var(--text-primary)"
                        style={{ fontSize: TEXT_TOOLTIP, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                        {label.length > 20 ? label.slice(0, 20) + '…' : label}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Info panel — fixed height, no layout shift */}
      <div className="map-info-row">
        {/* Detail card */}
        <div className="clay-card map-detail-card">
          {infoOds ? (
            <>
              <div className="map-info-ods-header">
                <div className="map-info-ods-badge" style={{ background: infoOds.color }}>
                  <div style={{ width: 24, height: 24 }}>{getSDGIcon(infoOds.id, '', '#fff')}</div>
                </div>
                <div>
                  <span className="map-info-ods-number">ODS {infoOds.id}</span>
                  <h4 className="map-info-ods-name">{infoOds.name[lang]}</h4>
                </div>
              </div>
              <p className="map-info-ods-desc">{infoOds.shortDescription[lang]}</p>
              <div className="map-info-ods-status"
                style={{
                  background: selected.includes(infoOds.id) ? `${infoOds.color}18` : 'var(--bg-tertiary)',
                  borderColor: selected.includes(infoOds.id) ? infoOds.color : 'var(--border-dark)',
                }}
              >
                <span style={{ color: selected.includes(infoOds.id) ? infoOds.color : 'var(--text-muted)' }}>
                  {selected.includes(infoOds.id)
                    ? (lang === 'pt' ? '✓ Alinhado ao Projeto' : lang === 'es' ? '✓ Alineado al Proyecto' : '✓ Aligned to Project')
                    : (lang === 'pt' ? '✗ Não selecionado' : lang === 'es' ? '✗ No seleccionado' : '✗ Not selected')}
                </span>
              </div>
            </>
          ) : infoOdsA && infoOdsB && activeEdge ? (
            <>
              <p className="map-info-edge-label">
                {lang === 'pt' ? 'Interrelação de Metas' : lang === 'es' ? 'Interrelación de Metas' : 'Goal Interrelation'}
              </p>
              <div className="map-info-edge-pair">
                <div className="map-info-edge-node" style={{ background: infoOdsA.color }}>ODS {infoOdsA.id}</div>
                <span className="map-info-edge-arrow">↔</span>
                <div className="map-info-edge-node" style={{ background: infoOdsB.color }}>ODS {infoOdsB.id}</div>
              </div>
              <div className="map-info-edge-score-row">
                <span className="map-info-edge-score-label">
                  {lang === 'pt' ? 'Coeficiente:' : lang === 'es' ? 'Coeficiente:' : 'Coefficient:'}
                </span>
                <span className="map-info-edge-score-value"
                  style={{ background: activeEdge.val < 0 ? '#ef4444' : '#10b981' }}>
                  {activeEdge.val > 0 ? `+${activeEdge.val.toFixed(2)}` : activeEdge.val.toFixed(2)}
                </span>
              </div>
              <p className="map-info-edge-desc">
                {activeEdge.val < 0
                  ? (lang === 'pt' ? 'Compromisso identificado. O progresso em uma meta pode pressionar a outra.'
                    : lang === 'es' ? 'Compromiso identificado. El progreso en una meta puede presionar la otra.'
                    : 'Tradeoff identified. Progress on one goal may pressure the other.')
                  : (lang === 'pt' ? 'Sinergia positiva. O avanço em uma meta apoia a outra mutuamente.'
                    : lang === 'es' ? 'Sinergia positiva. El avance en una meta apoya a la otra mutuamente.'
                    : 'Positive synergy. Progress on one goal mutually supports the other.')}
              </p>
            </>
          ) : (
            <div className="map-info-empty">
              <div style={{ width: 'clamp(32px, 5vw, 40px)', height: 'clamp(32px, 5vw, 40px)', margin: '0 auto 12px' }}>
                {getIcon('sliders', '', 'var(--text-muted)')}
              </div>
              <span className="map-info-ods-number">
                {lang === 'pt' ? 'Mapa de Sinergias' : lang === 'es' ? 'Mapa de Sinergias' : 'Synergy Map'}
              </span>
              <p className="map-info-empty-text">
                {lang === 'pt' ? 'Passe o cursor sobre os nós ou linhas para ver a análise de sinergias.'
                  : lang === 'es' ? 'Pase el cursor sobre los nodos o líneas para ver el análisis.'
                  : 'Hover over nodes or edges to explore synergies and conflicts.'}
              </p>
            </div>
          )}
        </div>

        {/* Stats cards */}
        <div className="map-stats-col">
          {[
            { val: selected.length, color: 'var(--accent-color)', label: lang === 'pt' ? 'ODS selecionados' : lang === 'es' ? 'ODS seleccionados' : 'Selected SDGs' },
            { val: strongSynergies, color: '#10b981',             label: lang === 'pt' ? 'Sinergias fortes' : lang === 'es' ? 'Sinergias fuertes' : 'Strong synergies' },
            { val: conflicts,       color: '#ef4444',             label: lang === 'pt' ? 'Conflitos' : lang === 'es' ? 'Conflictos' : 'Conflicts' },
          ].map(s => (
            <div key={s.label} className="clay-card map-stat-card">
              <span className="map-stat-value" style={{ color: s.color }}>{s.val}</span>
              <span className="map-stat-label">{s.label}</span>
            </div>
          ))}

          <div className="clay-card map-hint-card">
            <p style={{ fontSize: 'clamp(11px, 1.2vw, 12px)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {t('map_explanation')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ODSMap;
