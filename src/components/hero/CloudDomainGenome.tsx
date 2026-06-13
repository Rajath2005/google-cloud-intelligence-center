import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ChartBar } from 'lucide-react';

interface CategoryBreakdown {
  [key: string]: number;
}

interface CloudDomainGenomeProps {
  breakdown: CategoryBreakdown;
  total: number;
  onHover: (category: string | null) => void;
  activeCategory: string | null;
}

const DOMAIN_CONFIG: Record<string, { label: string, color: string, bg: string }> = {
  'cloud-infrastructure': { label: 'Infrastructure', color: 'bg-blue-500', bg: 'bg-blue-500/20' },
  'ai-and-ml': { label: 'AI & ML', color: 'bg-purple-500', bg: 'bg-purple-500/20' },
  'data-analytics': { label: 'Data', color: 'bg-emerald-500', bg: 'bg-emerald-500/20' },
  'security': { label: 'Security', color: 'bg-rose-500', bg: 'bg-rose-500/20' },
  'networking': { label: 'Networking', color: 'bg-orange-500', bg: 'bg-orange-500/20' },
  'devops': { label: 'DevOps', color: 'bg-yellow-500', bg: 'bg-yellow-500/20' },
  'application-development': { label: 'App Dev', color: 'bg-cyan-500', bg: 'bg-cyan-500/20' },
};

export const CloudDomainGenome: React.FC<CloudDomainGenomeProps> = ({ breakdown, total, onHover, activeCategory }) => {
  // Sort categories by size descending
  const segments = Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({
      id,
      count,
      percent: (count / total) * 100,
      config: DOMAIN_CONFIG[id] || { label: id, color: 'bg-zinc-500', bg: 'bg-zinc-500/20' }
    }));

  return (
    <motion.div 
      className="flex flex-col gap-4 p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2 mb-1">
        <ChartBar className="w-4 h-4 text-zinc-400" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Cloud Domain Genome</h3>
      </div>

      {/* The Visual Genome Bar */}
      <div className="flex w-full h-3 rounded-full overflow-hidden gap-[1px] bg-zinc-800">
        {segments.map((segment) => (
          <motion.div
            key={`bar-${segment.id}`}
            className={clsx("h-full transition-all duration-300", segment.config.color)}
            style={{ width: `${segment.percent}%` }}
            animate={{
              opacity: activeCategory === null || activeCategory === segment.id ? 1 : 0.3
            }}
          />
        ))}
      </div>

      {/* The Legend / Interactive Labels */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {segments.map((segment) => {
          const isActive = activeCategory === segment.id;
          return (
            <div
              key={`legend-${segment.id}`}
              className={clsx(
                "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors duration-200",
                isActive ? segment.config.bg : "hover:bg-zinc-800/50"
              )}
              onMouseEnter={() => onHover(segment.id)}
            >
              <div className="flex items-center gap-2">
                <div className={clsx("w-2 h-2 rounded-full", segment.config.color)} />
                <span className={clsx(
                  "text-sm font-medium transition-colors",
                  isActive ? "text-white" : "text-zinc-300"
                )}>
                  {segment.config.label}
                </span>
              </div>
              <span className={clsx(
                "text-xs font-mono",
                isActive ? "text-white" : "text-zinc-500"
              )}>
                {segment.count}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
