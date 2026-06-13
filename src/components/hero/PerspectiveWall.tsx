import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface BadgeWallItem {
  id: string;
  name: string;
  category: string;
  badgeImageUrl: string;
}

interface PerspectiveWallProps {
  badges: BadgeWallItem[];
  activeCategory: string | null;
}

// Category token mapping for subtle glows
const CATEGORY_GLOW_MAP: Record<string, string> = {
  'cloud-infrastructure': 'shadow-[0_0_15px_rgba(59,130,246,0.3)] border-blue-500/30', // Infra: Blue
  'ai-and-ml': 'shadow-[0_0_15px_rgba(168,85,247,0.3)] border-purple-500/30',       // AI: Purple
  'data-analytics': 'shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500/30', // Data: Emerald
  'security': 'shadow-[0_0_15px_rgba(244,63,94,0.3)] border-rose-500/30',           // Security: Rose
  'networking': 'shadow-[0_0_15px_rgba(249,115,22,0.3)] border-orange-500/30',      // Network: Orange
  'devops': 'shadow-[0_0_15px_rgba(234,179,8,0.3)] border-yellow-500/30',           // DevOps: Yellow
  'application-development': 'shadow-[0_0_15px_rgba(6,182,212,0.3)] border-cyan-500/30', // App Dev: Cyan
};

export const PerspectiveWall: React.FC<PerspectiveWallProps> = ({ badges, activeCategory }) => {
  // We want to create a rich grid. If there are 62 badges, a 8x8 or 10x10 grid is good.
  // We'll duplicate some visually if we need more density to fill the infinite perspective.
  const gridBadges = useMemo(() => {
    const extended = [...badges, ...badges, ...badges]; // Triple it for massive scale
    return extended.slice(0, 150); // Cap at 150 for performance
  }, [badges]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none perspective-container z-0">
      {/* 
        The perspective container creates the deep architectural vanishing point.
        We rotate it heavily so it looks like a wall extending into the deep background.
      */}
      <motion.div
        className="absolute w-[200%] h-[200%] left-[-50%] top-[-50%] flex flex-wrap gap-4 p-8 justify-center items-center"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: [60, 60],
          rotateZ: [25, 27, 25],
          translateY: ['-5%', '5%', '-5%'],
        }}
        transition={{
          rotateZ: { repeat: Infinity, duration: 40, ease: 'linear' },
          translateY: { repeat: Infinity, duration: 30, ease: 'easeInOut' },
        }}
        initial={{ rotateX: 60, rotateZ: 25, rotateY: 0, scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1.5, opacity: 1 }}
        viewport={{ once: true }}
      >
        {gridBadges.map((badge, idx) => {
          const isHighlighted = activeCategory === badge.category;
          const isDimmed = activeCategory !== null && !isHighlighted;
          
          return (
            <motion.div
              key={`${badge.id}-${idx}`}
              initial={{ opacity: 0, z: -500 }}
              animate={{ 
                opacity: isDimmed ? 0.2 : (isHighlighted ? 1 : 0.7), 
                z: isHighlighted ? 50 : 0,
                scale: isHighlighted ? 1.1 : 1
              }}
              transition={{ 
                opacity: { duration: 0.5 },
                z: { duration: 0.8, type: 'spring' }
              }}
              className={clsx(
                "relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 transition-all duration-500 flex items-center justify-center overflow-hidden",
                isHighlighted && CATEGORY_GLOW_MAP[badge.category]
              )}
            >
              <img 
                src={badge.badgeImageUrl} 
                alt={badge.name}
                loading="lazy"
                className="w-3/4 h-3/4 object-contain opacity-100"
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dark gradient fade-out to blend the edges into the hero background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#09090b] via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
