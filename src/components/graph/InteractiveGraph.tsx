import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GraphData, GraphNode, GraphEdge } from '../../lib/analytics/computeStats';

interface InteractiveGraphProps {
  graphData: GraphData;
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  'ai-and-ml': '#4285f4', // Blue
  'data-analytics': '#fbbc04', // Yellow
  'cloud-infrastructure': '#34a853', // Green
  'networking': '#ea4335', // Red
  'security': '#ff6d00', // Orange
  'devops': '#00bcd4', // Cyan
  'application-development': '#ab47bc', // Purple
  'default': '#ffffff', // Fallback
};

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({ graphData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const [isSimulationReady, setIsSimulationReady] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    // Prevent React StrictMode double rendering issue by checking if we already appended the root group
    if (svgRef.current.querySelector('.graph-root')) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 800;
    
    console.log("Initializing D3 Graph with Data:", graphData);
    console.log("Container dimensions:", width, height);

    // Deep copy data for D3 mutation
    const nodes = graphData.nodes.map(d => ({ ...d }));
    const links = graphData.edges.map(d => ({ ...d }));

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("width", "100%")
      .style("height", "100%");
      
    // Clear previous renders
    svg.selectAll("*").remove();

    // Add a group for semantic zooming
    const g = svg.append("g").attr("class", "graph-root");

    // Implement Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      
    svg.call(zoom);
    
    // Center initially
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));

    try {
      // Simulation
      const simulation = d3.forceSimulation(nodes as any)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance((d: any) => {
          if (d.type === 'PERSON_CATEGORY') return 120;
          if (d.type === 'CATEGORY_TECHNOLOGY') return 90;
          if (d.type === 'TECHNOLOGY_BADGE') return 60;
          return 40;
        }))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("collide", d3.forceCollide().radius((d: any) => Math.max((d.weight || 1) * 5 + 10, 15)))
        .force("center", d3.forceCenter(0, 0).strength(0.05));

      // Draw edges
      const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#ffffff")
        .attr("stroke-opacity", 0.15)
        .attr("stroke-width", (d: any) => Math.sqrt(d.weight || 1));

      // Draw nodes
      const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes as any)
        .join("g")
        .call(drag(simulation) as any);

      // Node circles
      node.append("circle")
        .attr("r", (d: any) => Math.max((d.weight || 1) * 4, 8))
        .attr("fill", (d: any) => {
          if (d.type === 'PERSON') return '#ffffff';
          return CATEGORY_COLOR_MAP[d.categoryId] || CATEGORY_COLOR_MAP['default'];
        })
        .attr("stroke", "#09090b")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("mouseover", (event, d: any) => {
          link.attr("stroke", (l: any) => l.source.id === d.id || l.target.id === d.id ? "#ffffff" : "#ffffff")
              .attr("stroke-opacity", (l: any) => l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.05);
              
          node.style("opacity", (n: any) => {
            if (n.id === d.id) return 1;
            const isConnected = links.some((l: any) => 
              (l.source.id === d.id && l.target.id === n.id) || 
              (l.target.id === d.id && l.source.id === n.id)
            );
            return isConnected ? 1 : 0.1;
          });

          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '1';
            tooltipRef.current.innerHTML = `
              <div class="text-xs uppercase tracking-widest text-zinc-500 mb-1">${d.type}</div>
              <div class="text-sm font-bold text-white">${d.label}</div>
              ${d.slug ? `<div class="text-[10px] text-blue-400 mt-1">Click to view details</div>` : ''}
            `;
            tooltipRef.current.style.left = `${event.pageX + 15}px`;
            tooltipRef.current.style.top = `${event.pageY + 15}px`;
          }
        })
        .on("mousemove", (event) => {
          if (tooltipRef.current) {
            tooltipRef.current.style.left = `${event.pageX + 15}px`;
            tooltipRef.current.style.top = `${event.pageY + 15}px`;
          }
        })
        .on("mouseout", () => {
          link.attr("stroke-opacity", 0.15);
          node.style("opacity", 1);
          if (tooltipRef.current) {
            tooltipRef.current.style.opacity = '0';
          }
        })
        .on("click", (event, d: any) => {
          if (d.slug) {
            window.location.href = d.slug;
          }
        });

      // Node labels
      node.filter((d: any) => d.type !== 'BADGE')
        .append("text")
        .text((d: any) => d.label)
        .attr("x", (d: any) => Math.max((d.weight || 1) * 4, 8) + 6)
        .attr("y", 4)
        .style("font-family", "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace")
        .style("font-size", "11px")
        .style("fill", "#a1a1aa")
        .style("pointer-events", "none");

      simulation.on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x || 0)
          .attr("y1", (d: any) => d.source.y || 0)
          .attr("x2", (d: any) => d.target.x || 0)
          .attr("y2", (d: any) => d.target.y || 0);

        node.attr("transform", (d: any) => `translate(${d.x || 0},${d.y || 0})`);
      });
      
      // Simulate
      for (let i = 0; i < 50; i++) {
        simulation.tick();
      }
      
      setIsSimulationReady(true);
      console.log("D3 Graph rendered successfully. First node x/y:", nodes[0]?.x, nodes[0]?.y);

      return () => {
        simulation.stop();
      };
    } catch (e) {
      console.error("D3 Force Simulation Error:", e);
      // Let the UI know it failed but hide the spinner
      setIsSimulationReady(true);
    }

    function drag(simulation: d3.Simulation<any, any>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }, [graphData]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[600px] lg:h-[800px] bg-[#09090b] rounded-3xl border border-white/5 overflow-hidden"
    >
      {!isSimulationReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#09090b] z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest text-zinc-500">Initializing Knowledge Graph...</span>
          </div>
        </div>
      )}
      
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing outline-none" />
      
      {/* Floating Tooltip */}
      <div 
        ref={tooltipRef}
        className="fixed z-50 pointer-events-none opacity-0 transition-opacity duration-150 p-3 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-white/10 shadow-xl"
        style={{ transform: 'translate(0, 0)' }}
      />
      
      {/* Graph Controls Legend */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2 pointer-events-none opacity-50">
        <div className="text-[10px] uppercase tracking-widest text-zinc-400">Controls</div>
        <div className="text-xs text-zinc-500 flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">Scroll</kbd> Zoom
        </div>
        <div className="text-xs text-zinc-500 flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">Drag</kbd> Pan / Move Node
        </div>
      </div>
    </div>
  );
};
