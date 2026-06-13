import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function DiscoveryPrompt() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('hasSeenEnvPrompt');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('hasSeenEnvPrompt', 'true');
        
        // Auto-hide after 8 seconds so it doesn't stay forever
        setTimeout(() => {
          setIsVisible(false);
        }, 8000);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            right: 'calc(100% + 12px)', // To the left of the switcher
            transform: 'translateY(-50%)',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ 
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--color-accent)',
            boxShadow: '0 0 8px var(--color-accent-glow)'
          }} />
          Explore Environments <span aria-hidden="true">→</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
