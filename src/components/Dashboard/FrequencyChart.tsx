/**
 * FrequencyChart Component
 * Renders a bar chart showing ODS frequency with systemic influence overlay
 */

import { SDG_METADATA } from '../../utils/projectGenerator';
import { CHART_DIMENSIONS } from '../../constants/chartDimensions';

interface FrequencyChartProps {
  odsCounts: Record<number, number>;
  maxCount: number;
  normalizedInfluence: Record<number, number>;
}

export function FrequencyChart({ odsCounts, maxCount, normalizedInfluence }: FrequencyChartProps) {
  const { HEIGHT: chartHeight, BAR_WIDTH: barWidth, GAP: gap } = CHART_DIMENSIONS.FREQUENCY_CHART;
  const chartWidth = 17 * (barWidth + gap) + gap;

  return (
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
          const influence = normalizedInfluence[id];
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
  );
}
