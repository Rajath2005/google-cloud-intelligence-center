import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { $isTransitioning, $targetEnvironment, commitEnvironmentChange, $isTransitioning as setIsTransitioning } from '../../store/envStore';

export function GlassTransition() {
  const isTransitioning = useStore($isTransitioning);
  const targetEnv = useStore($targetEnvironment);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // If the user prefers reduced motion, skip the animation and just commit.
    if (isTransitioning && prefersReducedMotion) {
      commitEnvironmentChange();
      setIsTransitioning.set(false);
    }
  }, [isTransitioning, prefersReducedMotion]);

  const handleAnimationComplete = (definition: any) => {
    if (definition === 'peak') {
      commitEnvironmentChange();
      setIsTransitioning.set(false);
    }
  };

  if (prefersReducedMotion) return null;

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px) saturate(100%)' }}
          animate="peak"
          exit={{ opacity: 0, backdropFilter: 'blur(0px) saturate(100%)' }}
          variants={{
            peak: {
              opacity: 1,
              backdropFilter: 'blur(40px) saturate(150%)',
              transition: { duration: 0.4, ease: 'easeIn' }
            }
          }}
          exit={{ 
            opacity: 0, 
            backdropFilter: 'blur(0px) saturate(100%)',
            transition: { duration: 0.4, ease: 'easeOut' }
          }}
          onAnimationComplete={handleAnimationComplete}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Ambient Lighting Orbs that move during the transition */}
          <motion.div
            initial={{ x: '-100%', y: '50%', scale: 0.5, opacity: 0 }}
            animate={{ x: '100%', y: '-50%', scale: 2, opacity: 0.8 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: targetEnv === 'aurora' ? 'radial-gradient(circle, #14b8a6, transparent 70%)' 
                        : targetEnv === 'mission-control' ? 'radial-gradient(circle, #f59e0b, transparent 70%)'
                        : targetEnv === 'deep-space' ? 'radial-gradient(circle, #e2e8f0, transparent 70%)'
                        : 'radial-gradient(circle, #4285f4, transparent 70%)',
              mixBlendMode: 'screen',
              filter: 'blur(60px)'
            }}
          />
          <motion.div
            initial={{ x: '100%', y: '-50%', scale: 0.5, opacity: 0 }}
            animate={{ x: '-100%', y: '50%', scale: 2, opacity: 0.8 }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.1 }}
            style={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: targetEnv === 'aurora' ? 'radial-gradient(circle, #d946ef, transparent 70%)' 
                        : targetEnv === 'mission-control' ? 'radial-gradient(circle, #b45309, transparent 70%)'
                        : targetEnv === 'deep-space' ? 'radial-gradient(circle, #94a3b8, transparent 70%)'
                        : 'radial-gradient(circle, #1e2d45, transparent 70%)',
              mixBlendMode: 'screen',
              filter: 'blur(60px)'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
