/**
 * UniverseScene — R3F scene rendered inside <Canvas>.
 *
 * Deps deliberately kept minimal to avoid fragile import chains:
 *   - NO @react-three/postprocessing (EffectComposer / Bloom)
 *   - NO drei Environment (loads external HDR files)
 * Glow is achieved via emissive + emissiveIntensity on MeshStandardMaterial.
 */
import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
// @ts-expect-error - d3-force-3d is rarely typed perfectly
import * as d3Force3dModule from 'd3-force-3d';
const d3Force3d = d3Force3dModule.default || d3Force3dModule;
const { forceSimulation, forceLink, forceManyBody, forceCenter } = d3Force3d as any;
import type { GraphData, GraphNode } from '../../lib/analytics/computeStats';

interface UniverseSceneProps {
  graphData: GraphData;
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

const DEFAULT_COLOR = '#4285f4';

export default function UniverseScene({ graphData }: UniverseSceneProps) {
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // 1. Pre-compute 3D layout once using D3 force simulation
  const { nodes, links } = useMemo(() => {
    const d3Nodes = graphData.nodes.map((n) => ({
      ...n,
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
      vx: 0, vy: 0, vz: 0,
    }));

    const d3Links = graphData.edges.map((e) => ({
      ...e,
      source: d3Nodes.find((n) => n.id === e.source),
      target: d3Nodes.find((n) => n.id === e.target),
    })).filter((l) => l.source && l.target);

    const sim = forceSimulation(d3Nodes, 3)
      .force('link', forceLink(d3Links).id((d: any) => d.id).distance((d: any) => {
        if (d.type === 'CATEGORY_TO_TECH') return 4;
        if (d.type === 'TECH_TO_BADGE') return 2;
        if (d.type === 'PERSON_TO_CATEGORY') return 8;
        return 3;
      }))
      .force('charge', forceManyBody().strength((d: any) => {
        if (d.type === 'PERSON') return -200;
        if (d.type === 'CATEGORY') return -100;
        if (d.type === 'TECHNOLOGY') return -40;
        return -15;
      }))
      .force('center', forceCenter(0, 0, 0))
      .stop();

    for (let i = 0; i < 300; i++) sim.tick();

    return { nodes: d3Nodes, links: d3Links };
  }, [graphData]);

  // 2. Build line geometry for edges
  const linesGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(links.length * 2 * 3);

    links.forEach((link, i) => {
      const src = link.source as any;
      const tgt = link.target as any;
      positions[i * 6]     = src.x ?? 0;
      positions[i * 6 + 1] = src.y ?? 0;
      positions[i * 6 + 2] = src.z ?? 0;
      positions[i * 6 + 3] = tgt.x ?? 0;
      positions[i * 6 + 4] = tgt.y ?? 0;
      positions[i * 6 + 5] = tgt.z ?? 0;
    });

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [links]);

  const groupRef = useRef<THREE.Group>(null);

  // 3. Slow auto-rotation; pause on hover
  useFrame((_state, delta) => {
    if (groupRef.current && !hoveredNode) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <>
      {/* Background colour */}
      <color attach="background" args={['#06080a']} />

      {/* Simple lighting — no Environment needed */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4285f4" />

      <group ref={groupRef}>
        {/* Nodes */}
        {nodes.map((node) => {
          let color = DEFAULT_COLOR;
          if (node.type === 'PERSON') color = '#ffffff';
          else if (node.type === 'BADGE') color = '#ea4335';
          else if (node.category) color = CATEGORY_COLORS[node.category] ?? DEFAULT_COLOR;

          const size = Math.max(0.2, (node.weight / 10) * 1.5);
          const isHovered = hoveredNode?.id === node.id;

          return (
            <mesh
              key={node.id}
              position={[node.x ?? 0, node.y ?? 0, node.z ?? 0]}
              onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(node as GraphNode); }}
              onPointerOut={() => setHoveredNode(null)}
              onClick={() => {
                if (node.slug) {
                  const prefix =
                    node.type === 'CATEGORY' ? '/category' :
                    node.type === 'TECHNOLOGY' ? '/technology' : '/badge';
                  window.location.href = `${prefix}/${node.slug}`;
                }
              }}
            >
              <sphereGeometry args={[size * (isHovered ? 1.5 : 1), 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isHovered ? 3 : 1}
                roughness={0.2}
                metalness={0.1}
                toneMapped={false}
              />

              {isHovered && (
                <Html center distanceFactor={15} style={{ pointerEvents: 'none' }}>
                  <div className="universe-tooltip">
                    <span className="univ-tt-type">{node.type}</span>
                    <span className="univ-tt-label">{node.label}</span>
                  </div>
                </Html>
              )}
            </mesh>
          );
        })}

        {/* Edges */}
        <lineSegments geometry={linesGeometry}>
          <lineBasicMaterial color="#4285f4" transparent opacity={0.12} depthWrite={false} />
        </lineSegments>
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={40}
        autoRotate={false}
      />
    </>
  );
}
