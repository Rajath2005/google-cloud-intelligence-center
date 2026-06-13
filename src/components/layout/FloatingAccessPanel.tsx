'use client';

/**
 * FloatingAccessPanel.tsx
 * Always-visible floating quick-access panel with identity links.
 * Fixed bottom-right on desktop, bottom-center on mobile.
 * client:load — always interactive immediately.
 *
 * Never hides identity links. One click to any destination.
 * AGENTS.md: identity links must be within one click from anywhere.
 */

import { useState } from 'react';
import { ArrowSquareOut, GithubLogo, LinkedinLogo, Medal, User } from '@phosphor-icons/react';

const links = [
  {
    href: 'https://rajathkiran.me',
    label: 'Portfolio',
    title: 'Rajath Kiran — Main Portfolio',
    Icon: User,
    accent: '#4285f4',
  },
  {
    href: 'https://github.com/Rajath2005',
    label: 'GitHub',
    title: 'Rajath Kiran on GitHub',
    Icon: GithubLogo,
    accent: '#e8edf5',
  },
  {
    href: 'http://linkedin.com/in/rajath-kiran/',
    label: 'LinkedIn',
    title: 'Rajath Kiran on LinkedIn',
    Icon: LinkedinLogo,
    accent: '#0a66c2',
  },
  {
    href: 'https://www.skills.google/public_profiles/09886862-52b8-44a4-86a5-9559a3952dd0',
    label: 'Skills',
    title: 'Google Skills Profile',
    Icon: Medal,
    accent: '#34a853',
  },
];

export default function FloatingAccessPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 'var(--z-float)' as any,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '8px',
      }}
      aria-label="Quick access to external profiles"
    >
      {/* Link items — visible when expanded or always on wide screens */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px',
          overflow: 'hidden',
          maxHeight: expanded ? '240px' : '0',
          transition: 'max-height 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        aria-hidden={!expanded}
      >
        {links.map(({ href, label, title, Icon, accent }) => (
          <a
            key={href}
            href={href}
            title={title}
            target="_blank"
            rel="noopener noreferrer me"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '9999px',
              background: 'rgba(13, 21, 37, 0.95)',
              border: '1px solid rgba(30, 45, 69, 0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              transition: 'color 150ms ease, border-color 150ms ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = accent;
              (e.currentTarget as HTMLElement).style.borderColor = `${accent}40`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30, 45, 69, 0.8)';
            }}
          >
            <Icon size={14} weight="bold" aria-hidden />
            {label}
            <ArrowSquareOut size={10} aria-hidden />
          </a>
        ))}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        aria-label={expanded ? 'Close quick access panel' : 'Open quick access panel'}
        aria-expanded={expanded}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '9999px',
          background: expanded
            ? 'var(--color-accent)'
            : 'rgba(13, 21, 37, 0.95)',
          border: `1px solid ${expanded ? 'var(--color-accent)' : 'var(--color-border)'}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: expanded ? '#ffffff' : 'var(--color-text-secondary)',
          transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        <ArrowSquareOut
          size={18}
          weight="bold"
          style={{ transform: expanded ? 'rotate(135deg)' : 'none', transition: 'transform 200ms ease' }}
          aria-hidden
        />
      </button>
    </div>
  );
}
