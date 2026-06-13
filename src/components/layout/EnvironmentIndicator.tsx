import React from 'react';
import { useStore } from '@nanostores/react';
import { $environment, type Environment } from '../../store/envStore';

export function EnvironmentIndicator() {
  const currentEnv = useStore($environment);

  const envNames: Record<Environment, string> = {
    'night-ops': 'NIGHT OPS',
    'deep-space': 'DEEP SPACE',
    'aurora': 'AURORA',
    'mission-control': 'MISSION CONTROL'
  };

  return (
    <div 
      className="env-indicator eyebrow" 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '16px',
        opacity: 0.8
      }}
    >
      <span>ENVIRONMENT</span>
      <span style={{ color: 'var(--color-border)' }}>•</span>
      <span style={{ color: 'var(--color-text-primary)' }}>{envNames[currentEnv]}</span>
    </div>
  );
}
