import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Trophy, Hexagon, Layers, Clock } from 'lucide-react';
import { CloudDomainGenome } from './CloudDomainGenome';

interface ProfileData {
  league: string;
  points: number;
}

interface AnalyticsData {
  totalBadges: number;
  totalTechnologies: number;
  latestBadgeName: string;
  categoryBreakdown: Record<string, number>;
}

interface SyncData {
  lastSynced: string;
  syncStatus: string;
}

interface IntelligenceHubProps {
  profile: ProfileData;
  analytics: AnalyticsData;
  sync: SyncData;
  onHoverCategory: (category: string | null) => void;
  activeCategory: string | null;
}

export const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ 
  profile, 
  analytics, 
  sync, 
  onHoverCategory, 
  activeCategory 
}) => {
  // Format the sync time nicely
  const syncTime = new Date(sync.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm pointer-events-auto">
      
      {/* 1. Core Metrics Panel */}
      <motion.div 
        className="flex flex-col gap-4 p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* League & Points */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700">
              <Trophy className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <div className="text-sm text-zinc-400 font-medium">League</div>
              <div className="text-lg font-bold text-white tracking-tight">{profile.league}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-400 font-medium">Points</div>
            <div className="text-xl font-mono text-white">{profile.points.toLocaleString()}</div>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-between px-2 pt-2">
          <div className="flex flex-col items-center gap-1">
            <Hexagon className="w-4 h-4 text-emerald-400" />
            <span className="text-2xl font-mono font-bold text-white">{analytics.totalBadges}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Badges</span>
          </div>
          <div className="w-px h-12 bg-white/5" />
          <div className="flex flex-col items-center gap-1">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-2xl font-mono font-bold text-white">{analytics.totalTechnologies}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Tech</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Cloud Domain Genome */}
      <CloudDomainGenome 
        breakdown={analytics.categoryBreakdown} 
        total={analytics.totalBadges} 
        onHover={onHoverCategory}
        activeCategory={activeCategory}
      />

      {/* 3. Live Sync & Latest Panel */}
      <motion.div 
        className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/10 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {sync.syncStatus === 'success' && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              )}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
              Live Sync Active
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            <span>{syncTime}</span>
          </div>
        </div>

        <div className="p-3 mt-1 rounded-xl bg-zinc-800/50 border border-white/5">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Latest Achievement</div>
          <div className="text-sm font-medium text-zinc-200 line-clamp-2 leading-snug">
            {analytics.latestBadgeName}
          </div>
        </div>
      </motion.div>

    </div>
  );
};
