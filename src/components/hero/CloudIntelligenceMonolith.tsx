import React, { useState } from 'react';
import { PerspectiveWall, type BadgeWallItem } from './PerspectiveWall';
import { IntelligenceHub } from './IntelligenceHub';

interface CloudIntelligenceMonolithProps {
  badges: BadgeWallItem[];
  profile: any;
  analytics: any;
  sync: any;
}

export const CloudIntelligenceMonolith: React.FC<CloudIntelligenceMonolithProps> = ({
  badges,
  profile,
  analytics,
  sync
}) => {
  // Shared state for the interaction model
  // Hovering over a category in the Intelligence Hub highlights those badges in the Perspective Wall
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[480px] lg:h-[800px] flex items-center justify-center lg:justify-end overflow-hidden rounded-3xl bg-[#09090b] border border-white/5">
      
      {/* 
        Layer 1: The Foundation
        The infinite perspective wall providing architectural texture.
        It sits in the absolute background.
      */}
      <PerspectiveWall 
        badges={badges} 
        activeCategory={activeCategory} 
      />

      {/* 
        Layer 2: The Intelligence Hub
        The mission control overlays dominating the foreground.
        On desktop, aligned to the right. On mobile, centered.
      */}
      <div className="relative z-10 w-full px-2 py-4 lg:px-12 lg:py-8 flex justify-center lg:justify-end">
        <IntelligenceHub
          profile={profile}
          analytics={analytics}
          sync={sync}
          onHoverCategory={setActiveCategory}
          activeCategory={activeCategory}
        />
      </div>

    </div>
  );
};
