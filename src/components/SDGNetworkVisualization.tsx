import { useState, useEffect, useRef } from 'react';
import { SDG_METADATA } from '../utils/projectGenerator';
import { type Graph } from '../utils/graphAlgorithms';
import { useTranslation } from '../i18n';

interface SDGNetworkVisualizationProps {
  selectedSDGs: number[];
  graph: Graph;
  degCentrality: Map<number, number> | null;
  betweennessCentrality: Map<number, number> | null;
  pageRank: Map<number, number> | null;
}

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  influence: number;
}

export function SDGNetworkVisualization({
  selectedSDGs,
  graph,
  degCentrality,
  betweennessCentrality,
  pageRank,
}: SDGNetworkVisualizationProps) {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>();

  // Calculate influence score for each SDG
  const calculateInfluence = (sdgId: number): number => {
    const dc = degCentrality?.get(sdgId) || 0;
    const pr = pageRank?.get(sdgId) || 0;
    const bc = betweennessCentrality?.get(sdgId) || 0;
    return (dc * 0.4 + pr * 0.3 + bc * 0.3) * 100;
  };

  // Initialize nodes in a circular layout
  useEffect(() => {
    if (selectedSDGs.length === 0) return;

    const centerX = 300;
    const centerY = 250;
    const radius = 150;

    const initialNodes: Node[] = selectedSDGs.map((id, i) => {
      const angle = (2 * Math.PI * i) / selectedSDGs.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const influence = calculateInfluence(id);
      const metadata = SDG_METADATA.find(s => s.id === id);
      
      return {
        id,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 20 + (influence / 100) * 20, // Size based on influence
        color: metadata?.color || '#6366f1',
        influence,
      };
    });

    setNodes(initialNodes);
  }, [selectedSDGs, degCentrality, pageRank, betweennessCentrality]);

  // Force-directed simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulate = () => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(node => ({ ...node }));
        
        // Repulsion force between nodes
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const dx = newNodes[j].x - newNodes[i].x;
            const dy = newNodes[j].y - newNodes[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 5000 / (distance * distance);
            
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            newNodes[i].vx -= fx;
            newNodes[i].vy -= fy;
            newNodes[j].vx += fx;
            newNodes[j].vy += fy;
          }
        }

        // Attraction force for edges
        graph.edges.forEach(edge => {
          const nodeA = newNodes.find(n => n.id === edge.from);
          const nodeB = newNodes.find(n => n.id === edge.to);
          
          if (nodeA && nodeB) {
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (distance - 100) * 0.01 * Math.abs(edge.weight);
            
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            nodeA.vx += fx;
            nodeA.vy += fy;
            nodeB.vx -= fx;
            nodeB.vy -= fy;
          }
        });

        // Center gravity
        const centerX = 300;
        const centerY = 250;
        newNodes.forEach(node => {
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          node.vx += dx * 0.001;
          node.vy += dy * 0.001;
          
          // Apply velocity with damping
          node.vx *= 0.9;
          node.vy *= 0.9;
          
          // Update position
          node.x += node.vx;
          node.y += node.vy;
          
          // Keep within bounds
          node.x = Math.max(50, Math.min(550, node.x));
          node.y = Math.max(50, Math.min(450, node.y));
        });

        return newNodes;
      });

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, graph.edges]);

  if (selectedSDGs.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 12,
      }}>
        Selecione ODS para visualizar a rede
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 600 500"
        style={{ width: '100%', height: '100%', background: 'var(--bg-glass)', borderRadius: 12 }}
      >
        {/* Edges */}
        {graph.edges.map((edge, i) => {
          const nodeA = nodes.find(n => n.id === edge.from);
          const nodeB = nodes.find(n => n.id === edge.to);
          
          if (!nodeA || !nodeB) return null;
          
          const isPositive = edge.weight > 0;
          const opacity = Math.abs(edge.weight) * 0.8;
          
          return (
            <line
              key={i}
              x1={nodeA.x}
              y1={nodeA.y}
              x2={nodeB.x}
              y2={nodeB.y}
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={Math.abs(edge.weight) * 3}
              opacity={opacity}
              strokeDasharray={isPositive ? 'none' : '5,5'}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const isHovered = hoveredNode === node.id;
          
          return (
            <g key={node.id}>
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={node.color}
                opacity={isHovered ? 1 : 0.8}
                stroke={isHovered ? 'var(--text-primary)' : 'none'}
                strokeWidth={2}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              />
              
              {/* SDG number */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--text-primary)"
                fontSize={12}
                fontWeight={800}
                style={{ pointerEvents: 'none' }}
              >
                {node.id}
              </text>
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoveredNode && (() => {
          const node = nodes.find(n => n.id === hoveredNode);
          if (!node) return null;
          
          const metadata = SDG_METADATA.find(s => s.id === hoveredNode);
          const dc = degCentrality?.get(hoveredNode) || 0;
          const bc = betweennessCentrality?.get(hoveredNode) || 0;
          const pr = pageRank?.get(hoveredNode) || 0;
          
          return (
            <g>
              <rect
                x={node.x + node.radius + 10}
                y={node.y - 40}
                width={180}
                height={100}
                fill="var(--bg-card)"
                rx={8}
                opacity={0.95}
              />
              <text
                x={node.x + node.radius + 20}
                y={node.y - 25}
                fill="var(--text-primary)"
                fontSize={11}
                fontWeight={700}
              >
                {metadata?.name.pt || `ODS ${hoveredNode}`}
              </text>
              <text
                x={node.x + node.radius + 20}
                y={node.y - 10}
                fill="#10b981"
                fontSize={9}
              >
                {t('network_influence')}: {node.influence.toFixed(1)}/100
              </text>
              <text
                x={node.x + node.radius + 20}
                y={node.y + 5}
                fill="#6366f1"
                fontSize={9}
              >
                Centralidade: {(dc * 100).toFixed(1)}%
              </text>
              <text
                x={node.x + node.radius + 20}
                y={node.y + 20}
                fill="#f59e0b"
                fontSize={9}
              >
                PageRank: {(pr * 100).toFixed(1)}%
              </text>
              <text
                x={node.x + node.radius + 20}
                y={node.y + 35}
                fill="#ec4899"
                fontSize={9}
              >
                Betweenness: {(bc * 100).toFixed(1)}%
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        background: 'var(--bg-glass)',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 9,
        boxShadow: 'var(--clay-card-shadow)',
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Legenda</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ width: 12, height: 12, background: '#10b981', borderRadius: 2 }} />
          <span>Sinergia (positivo)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: 2, border: '1px dashed #ef4444' }} />
          <span>Trade-off (negativo)</span>
        </div>
      </div>
    </div>
  );
}
