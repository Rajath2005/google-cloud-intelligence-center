import { useMemo } from 'react';
import * as d3 from 'd3';
import type { GraphData } from '../../lib/analytics/computeStats';

interface StaticGraphFallbackProps {
  data: GraphData;
}

const CATEGORY_COLORS: Record<string, string> = {
  'ai-and-ml': '#4285f4',
  'data-analytics': '#fbbc04',
  'cloud-infrastructure': '#34a853',
  'networking': '#ea4335',
  'security': '#ff6d00',
  'devops': '#00bcd4',
  'application-development': '#ab47bc',
};

export default function StaticGraphFallback({ data }: StaticGraphFallbackProps) {
  const width = 800;
  const height = 600;

  const { nodes, links } = useMemo(() => {
    // Clone for D3
    const d3Nodes = data.nodes.map((n) => ({ ...n, x: width / 2, y: height / 2 }));
    const d3Links = data.edges.map((e) => ({
      ...e,
      source: d3Nodes.find((n) => n.id === e.source),
      target: d3Nodes.find((n) => n.id === e.target),
    })).filter((l) => l.source && l.target);

    const simulation = d3.forceSimulation(d3Nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(d3Links).id((d: any) => d.id).distance(40))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .stop();

    // Run simulation to steady state
    for (let i = 0; i < 300; i++) simulation.tick();

    return { nodes: d3Nodes, links: d3Links };
  }, [data]);

  return (
    <div className="universe-fallback">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        width="100%" 
        height="100%" 
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Static knowledge graph showing relationships between cloud domains, technologies, and badges"
      >
        <g stroke="#ffffff" strokeOpacity={0.15} strokeWidth={1}>
          {links.map((link, i) => {
            const src = link.source as any;
            const tgt = link.target as any;
            return (
              <line 
                key={`link-${i}`} 
                x1={src.x} 
                y1={src.y} 
                x2={tgt.x} 
                y2={tgt.y} 
              />
            );
          })}
        </g>
        <g>
          {nodes.map((node) => {
            let color = '#4285f4';
            if (node.type === 'PERSON') color = '#ffffff';
            else if (node.type === 'BADGE') color = '#ea4335';
            else if (node.category) color = CATEGORY_COLORS[node.category] ?? color;

            const size = Math.max(2, (node.weight / 10) * 8);
            
            return (
              <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                <circle 
                  r={size} 
                  fill={color} 
                  opacity={node.type === 'PERSON' ? 1 : 0.8}
                />
                {(node.type === 'CATEGORY' || node.type === 'PERSON') && (
                  <text 
                    dy={-size - 4} 
                    textAnchor="middle" 
                    fill="#a1a1aa" 
                    fontSize={10} 
                    fontFamily="monospace"
                  >
                    {node.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
