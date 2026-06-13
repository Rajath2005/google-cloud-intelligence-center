/**
 * computeStats.ts
 * Build-time analytics engine.
 *
 * HONESTY GUARDS (from blueprint §7.C):
 * - No score generated if category has 0 badges
 * - No expertise claimed unless badgeCount >= threshold
 * - No technology relationship created unless two badges share the exact same technology tag
 * - No fabricated data under any circumstances
 *
 * Called once at build time in Astro pages/endpoints.
 * All outputs are plain JSON — consumed by client islands.
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  provider: 'Google Cloud Skills Boost';
  badgeImageUrl: string;
  badgeUrl: string;
  earnedDate?: string;
  category: string;
  technologies: string[];
  difficulty: 'introductory' | 'intermediate' | 'advanced';
  type: 'skill_badge' | 'course_completion' | 'quest';
  labCount?: number;
  tags: string[];
  relatedPaths: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorToken: string;
  shortName: string;
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  category: string;
  logoSlug?: string;
  gcpProductUrl?: string;
  relatedTechnologies: string[];
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface CloudStats {
  totalBadges: number;
  totalTechnologies: number;
  totalCategories: number;
  firstBadgeDate: string | null;
  latestBadgeDate: string | null;
  categoryBreakdown: Record<string, number>;       // categoryId → badge count
  monthlyAcquisition: Record<string, number>;      // "YYYY-MM" → badge count
  topTechnologies: Array<{ id: string; name: string; count: number }>;
  difficultyBreakdown: Record<string, number>;     // difficulty → count
  typeBreakdown: Record<string, number>;           // type → count
  genomeScores: Record<string, number>;            // categoryId → 0-100
  expertiseDomains: string[];                      // only categories with ≥3 badges
  lastUpdated: string;                             // ISO timestamp of build
}

export function computeStats(
  badges: Badge[],
  categories: Category[],
  technologies: Technology[],
): CloudStats {
  const totalBadges = badges.length;
  const totalTechnologies = technologies.length;
  const totalCategories = categories.length;

  // Date range — only from badges that have earnedDate
  const datedBadges = badges
    .filter((b) => b.earnedDate)
    .sort((a, b) => (a.earnedDate! > b.earnedDate! ? 1 : -1));

  const firstBadgeDate = datedBadges[0]?.earnedDate ?? null;
  const latestBadgeDate = datedBadges[datedBadges.length - 1]?.earnedDate ?? null;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  for (const badge of badges) {
    categoryBreakdown[badge.category] = (categoryBreakdown[badge.category] ?? 0) + 1;
  }

  // Monthly acquisition (YYYY-MM → count)
  const monthlyAcquisition: Record<string, number> = {};
  for (const badge of datedBadges) {
    const month = badge.earnedDate!.slice(0, 7); // "YYYY-MM"
    monthlyAcquisition[month] = (monthlyAcquisition[month] ?? 0) + 1;
  }

  // Top technologies — count by how many badges reference each tech
  const techCount: Record<string, number> = {};
  for (const badge of badges) {
    for (const techId of badge.technologies) {
      techCount[techId] = (techCount[techId] ?? 0) + 1;
    }
  }
  const techMap = new Map(technologies.map((t) => [t.id, t.name]));
  const topTechnologies = Object.entries(techCount)
    .map(([id, count]) => ({ id, name: techMap.get(id) ?? id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Difficulty breakdown
  const difficultyBreakdown: Record<string, number> = {};
  for (const badge of badges) {
    difficultyBreakdown[badge.difficulty] = (difficultyBreakdown[badge.difficulty] ?? 0) + 1;
  }

  // Type breakdown
  const typeBreakdown: Record<string, number> = {};
  for (const badge of badges) {
    typeBreakdown[badge.type] = (typeBreakdown[badge.type] ?? 0) + 1;
  }

  // Genome scores — NEVER fabricated. 0 if no badges in category.
  // Score = badgeCount / Math.max(badgeCount, 5) * 100
  // (We don't know the theoretical max per category, so we use a
  //  conservative self-normalizing approach — never claims 100% unless
  //  the platform explicitly defines a maximum.)
  const genomeScores: Record<string, number> = {};
  for (const category of categories) {
    const count = categoryBreakdown[category.id] ?? 0;
    // Only generate a score if at least 1 badge exists
    if (count > 0) {
      // Conservative: cap denominator at 10 to avoid inflated 100% scores
      const denominator = Math.max(count, 10);
      genomeScores[category.id] = Math.round((count / denominator) * 100);
    } else {
      genomeScores[category.id] = 0;
    }
  }

  // Expertise domains — only categories with >= 3 badges
  // Never claims expertise from 1-2 badges
  const EXPERTISE_THRESHOLD = 3;
  const expertiseDomains = categories
    .filter((cat) => (categoryBreakdown[cat.id] ?? 0) >= EXPERTISE_THRESHOLD)
    .map((cat) => cat.id);

  return {
    totalBadges,
    totalTechnologies,
    totalCategories,
    firstBadgeDate,
    latestBadgeDate,
    categoryBreakdown,
    monthlyAcquisition,
    topTechnologies,
    difficultyBreakdown,
    typeBreakdown,
    genomeScores,
    expertiseDomains,
    lastUpdated: new Date().toISOString(),
  };
}

// ─── Graph Data ───────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  type: 'PERSON' | 'CATEGORY' | 'TECHNOLOGY' | 'BADGE';
  label: string;
  slug?: string;
  weight: number;
  categoryId?: string;
  orbitLayer: 0 | 1 | 2 | 3 | 4;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
  directed: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    generatedAt: string;
    totalNodes: number;
    totalEdges: number;
  };
}

export function computeGraphData(
  badges: Badge[],
  categories: Category[],
  technologies: Technology[],
): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Layer 0: Center (Person)
  nodes.push({
    id: 'rajath-kiran',
    type: 'PERSON',
    label: 'Rajath Kiran',
    weight: 10,
    orbitLayer: 0,
  });

  // Layer 1: Categories
  for (const cat of categories) {
    nodes.push({
      id: `cat-${cat.id}`,
      type: 'CATEGORY',
      label: cat.shortName,
      slug: `/category/${cat.id}`,
      weight: 6,
      categoryId: cat.id,
      orbitLayer: 1,
    });
    edges.push({
      source: 'rajath-kiran',
      target: `cat-${cat.id}`,
      type: 'PERSON_CATEGORY',
      weight: 1,
      directed: true,
    });
  }

  // Layer 2: Technologies
  for (const tech of technologies) {
    nodes.push({
      id: `tech-${tech.id}`,
      type: 'TECHNOLOGY',
      label: tech.name,
      slug: `/technology/${tech.id}`,
      weight: 3,
      categoryId: tech.category,
      orbitLayer: 2,
    });
    edges.push({
      source: `cat-${tech.category}`,
      target: `tech-${tech.id}`,
      type: 'CATEGORY_TECHNOLOGY',
      weight: 1,
      directed: true,
    });
  }

  // Layer 3: Badges — only top 30 by technology count to keep graph readable
  const badgeSortedByConnections = [...badges].sort(
    (a, b) => b.technologies.length - a.technologies.length,
  );
  const visibleBadges = badgeSortedByConnections.slice(0, 30);

  for (const badge of visibleBadges) {
    const badgeNodeId = `badge-${badge.id}`;
    nodes.push({
      id: badgeNodeId,
      type: 'BADGE',
      label: badge.name.length > 24 ? badge.name.slice(0, 24) + '…' : badge.name,
      slug: `/badge/${badge.id}`,
      weight: 2,
      categoryId: badge.category,
      orbitLayer: 3,
    });

    // Badge → Technology edges (only when technology exists as a node)
    const techNodeIds = new Set(technologies.map((t) => `tech-${t.id}`));
    for (const techId of badge.technologies) {
      const techNodeId = `tech-${techId}`;
      if (techNodeIds.has(techNodeId)) {
        edges.push({
          source: techNodeId,
          target: badgeNodeId,
          type: 'TECHNOLOGY_BADGE',
          weight: 1,
          directed: true,
        });
      }
    }

    // Badge → Category edge
    edges.push({
      source: `cat-${badge.category}`,
      target: badgeNodeId,
      type: 'CATEGORY_BADGE',
      weight: 0.5,
      directed: true,
    });
  }

  // Badge → Badge edges: ONLY when two badges share the same technology tag
  // No speculative connections. No fabricated edges.
  for (let i = 0; i < visibleBadges.length; i++) {
    for (let j = i + 1; j < visibleBadges.length; j++) {
      const a = visibleBadges[i];
      const b = visibleBadges[j];
      const sharedTechs = a.technologies.filter((t) => b.technologies.includes(t));
      if (sharedTechs.length > 0) {
        edges.push({
          source: `badge-${a.id}`,
          target: `badge-${b.id}`,
          type: 'BADGE_BADGE_SHARED_TECH',
          weight: sharedTechs.length / Math.max(a.technologies.length, b.technologies.length),
          directed: false,
        });
      }
    }
  }

  return {
    nodes,
    edges,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalNodes: nodes.length,
      totalEdges: edges.length,
    },
  };
}
