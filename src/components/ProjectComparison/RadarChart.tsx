/**
 * RadarChart Component
 * Renders a radar/spider chart for comparing multiple projects across metrics
 */

import { CHART_DIMENSIONS } from '../../constants/chartDimensions';
import { CHART_COLORS } from '../../constants/chartColors';

interface RadarChartProps {
  projects: any[];
  metrics: any[];
}

export function RadarChart({ projects, metrics }: RadarChartProps) {
  const { CENTER_X: centerX, CENTER_Y: centerY, RADIUS: radius, LABEL_RADIUS: labelRadius } = CHART_DIMENSIONS.RADAR_CHART;
  const numAxes = metrics.length;
  const angleStep = (Math.PI * 2) / numAxes;

  const colors = CHART_COLORS.PALETTE;

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
              {project.name}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}
