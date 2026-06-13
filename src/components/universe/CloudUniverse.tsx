import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import UniverseScene from './UniverseScene';
import StaticGraphFallback from './StaticGraphFallback';
import type { GraphData } from '../../lib/analytics/computeStats';

interface CloudUniverseProps {
  graphData: GraphData;
}

/** Synchronously detect WebGL support (safe — this component is client:only) */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export default function CloudUniverse({ graphData }: CloudUniverseProps) {
  // Synchronous detection — no useEffect needed, no null flash.
  // This component is mounted client:only so `document` is always available.
  const [hasWebGL] = useState<boolean>(() => detectWebGL());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!hasWebGL || prefersReducedMotion) {
    return <StaticGraphFallback data={graphData} />;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(66, 133, 244, 0.15)',
        background: '#06080a',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 18], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: false }}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <UniverseScene graphData={graphData} />
        </Suspense>
      </Canvas>
    </div>
  );
}
