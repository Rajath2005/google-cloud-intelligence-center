import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $environment, triggerEnvironmentChange, type Environment } from '../../store/envStore';
import { Moon, Rocket, Sparkles, Terminal } from 'lucide-react';

const ENVIRONMENTS: { id: Environment; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'night-ops', name: 'Night Ops', icon: <Moon size={14} />, color: '#4285f4' },
  { id: 'deep-space', name: 'Deep Space', icon: <Rocket size={14} />, color: '#e2e8f0' },
  { id: 'aurora', name: 'Aurora', icon: <Sparkles size={14} />, color: '#14b8a6' },
  { id: 'mission-control', name: 'Mission Control', icon: <Terminal size={14} />, color: '#f59e0b' },
];

export function EnvironmentSwitcher() {
  const currentEnv = useStore($environment);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeEnv = ENVIRONMENTS.find((e) => e.id === currentEnv) || ENVIRONMENTS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (envId: Environment) => {
    triggerEnvironmentChange(envId);
    setIsOpen(false);
  };

  return (
    <div className="env-switcher" ref={menuRef} style={{ position: 'relative' }}>
      <button
        className="env-trigger hover-lift"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch Environment"
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-pill)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
      >
        <span style={{ color: activeEnv.color }}>{activeEnv.icon}</span>
        <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
          {activeEnv.name}
        </span>
      </button>

      {isOpen && (
        <div
          className="env-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '180px',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: '6px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <div style={{ padding: '6px 10px', fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            Environment
          </div>
          {ENVIRONMENTS.map((env) => (
            <button
              key={env.id}
              onClick={() => handleSelect(env.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '8px 10px',
                background: currentEnv === env.id ? 'var(--color-surface-hover)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: currentEnv === env.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                if (currentEnv !== env.id) e.currentTarget.style.background = 'var(--color-surface)';
              }}
              onMouseLeave={(e) => {
                if (currentEnv !== env.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ color: env.color }}>{env.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: currentEnv === env.id ? 600 : 500 }}>
                {env.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
