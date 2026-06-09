import type { Initiative, Bottleneck } from '../types/initiative';

interface DependencyVisualizationProps {
  initiatives: Initiative[];
  bottlenecks: Bottleneck[];
}

export function DependencyVisualization({ initiatives, bottlenecks }: DependencyVisualizationProps) {
  // Build dependency graph
  const nodes = initiatives.map(initiative => ({
    id: initiative.id,
    name: initiative.name,
    sdgIds: initiative.sdgIds,
    timeline: initiative.timeline,
    budget: initiative.estimatedBudget
  }));
  
  const edges: DependencyEdge[] = [];
  initiatives.forEach(initiative => {
    initiative.dependencies.forEach(dep => {
      edges.push({
        from: dep.id,
        to: initiative.id,
        type: dep.category,
        severity: dep.severity,
        blocking: dep.blocking
      });
    });
  });
  
  // Calculate positions using simple force-directed layout simulation
  const positions = calculateLayout(nodes, edges);
  
  return (
    <div className="clay-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', paddingBottom: '12px', boxShadow: 'inset 0 -1px 0 var(--border-dark)' }}>
        Initiative Dependency Network
      </h3>
      
      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
          <span>Low Severity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
          <span>Medium Severity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
          <span>High Severity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#818cf8' }} />
          <span>Blocking</span>
        </div>
      </div>
      
      {/* SVG Visualization */}
      <svg viewBox="0 0 800 500" style={{ width: '100%', height: '500px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
        <defs>
          <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2"/>
          </filter>
          <filter id="edgeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15"/>
          </filter>
        </defs>
        {/* Edges */}
        {edges.map((edge, index) => {
          const fromNode = positions.find(p => p.id === edge.from);
          const toNode = positions.find(p => p.id === edge.to);
          if (!fromNode || !toNode) return null;
          
          const edgeColor = edge.blocking ? '#818cf8' : 
                          edge.severity === 'high' ? '#ef4444' : 
                          edge.severity === 'medium' ? '#f59e0b' : '#10b981';
          const strokeWidth = edge.blocking ? 3 : edge.severity === 'high' ? 2.5 : edge.severity === 'medium' ? 2 : 1.5;
          
          return (
            <g key={`edge-${index}`}>
              {/* Edge line */}
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={edgeColor}
                strokeWidth={strokeWidth}
                opacity={0.6}
                filter="url(#edgeShadow)"
              />
              
              {/* Arrow head */}
              <polygon
                points={calculateArrowHead(fromNode.x, fromNode.y, toNode.x, toNode.y)}
                fill={edgeColor}
                opacity={0.6}
                filter="url(#edgeShadow)"
              />
            </g>
          );
        })}
        
        {/* Nodes */}
        {positions.map((node, index) => {
          const initiative = initiatives.find(i => i.id === node.id);
          const nodeBottlenecks = bottlenecks.filter(b => b.affectedInitiatives.includes(node.id));
          const hasBottleneck = nodeBottlenecks.length > 0;
          
          return (
            <g key={`node-${index}`}>
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={hasBottleneck ? 35 : 30}
                fill={hasBottleneck ? '#ef4444' : '#6366f1'}
                stroke={hasBottleneck ? '#dc2626' : '#4f46e5'}
                strokeWidth={2}
                opacity={0.9}
                filter="url(#nodeShadow)"
              />
              
              {/* Node label */}
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#fff"
                style={{ fontSize: 'clamp(9px, 1.5vw, 11px)' }}
              >
                {initiative?.name.substring(0, 15)}
              </text>
              
              {/* SDG badges */}
              {initiative && initiative.sdgIds.slice(0, 3).map((_sdgId, sdgIndex) => (
                <circle
                  key={sdgIndex}
                  cx={node.x + 25 - (sdgIndex * 8)}
                  cy={node.y - 25}
                  r={6}
                  fill="#fff"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          );
        })}
        
        {/* Bottleneck indicators */}
        {bottlenecks.map((bottleneck, index) => {
          const affectedNodes = positions.filter(p => bottleneck.affectedInitiatives.includes(p.id));
          if (affectedNodes.length < 2) return null;
          
          const centerX = affectedNodes.reduce((sum, n) => sum + n.x, 0) / affectedNodes.length;
          const centerY = affectedNodes.reduce((sum, n) => sum + n.y, 0) / affectedNodes.length;
          
          return (
            <g key={`bottleneck-${index}`}>
              <circle
                cx={centerX}
                cy={centerY}
                r={20}
                fill="rgba(239, 68, 68, 0.2)"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 2"
              />
              <text
                x={centerX}
                y={centerY + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="#ef4444"
              >
                !
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Dependency List */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
          Dependencies by Category
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {['infrastructure', 'staff', 'institutional', 'policy', 'financial'].map(category => {
            const categoryEdges = edges.filter(e => e.type === category);
            return (
              <div key={category} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                background: 'var(--bg-glass)',
                fontSize: 'clamp(9px, 1vw, 10px)',
                lineHeight: 1.3
              }}>
                <h5 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'capitalize' }}>
                  {category}
                </h5>
                <p style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
                  {categoryEdges.length}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                  {categoryEdges.filter(e => e.blocking).length} blocking
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Critical Path */}
      {bottlenecks.length > 0 && (
        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#ef4444' }}>
            Critical Bottlenecks
          </h4>
          {bottlenecks.slice(0, 3).map((bottleneck, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 4px 0' }}>
                {bottleneck.type} - {bottleneck.severity}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                {bottleneck.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface DependencyEdge {
  from: string;
  to: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  blocking: boolean;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

function calculateLayout(nodes: any[], _edges: DependencyEdge[]): NodePosition[] {
  const positions: NodePosition[] = [];
  const width = 800;
  const height = 500;
  const padding = 60;
  
  // Simple circular layout
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - padding;
  
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    positions.push({
      id: node.id,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    });
  });
  
  return positions;
}

function calculateArrowHead(x1: number, y1: number, x2: number, y2: number): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLength = 10;
  const arrowAngle = Math.PI / 6;
  
  const x3 = x2 - arrowLength * Math.cos(angle - arrowAngle);
  const y3 = y2 - arrowLength * Math.sin(angle - arrowAngle);
  const x4 = x2 - arrowLength * Math.cos(angle + arrowAngle);
  const y4 = y2 - arrowLength * Math.sin(angle + arrowAngle);
  
  return `${x2},${y2} ${x3},${y3} ${x4},${y4}`;
}
