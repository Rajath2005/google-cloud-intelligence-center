/**
 * generate-datasets.mjs
 * Takes enriched badge data and generates all JSON content files.
 *
 * Outputs:
 *   src/content/badges/{slug}.json       ← replaces seed data
 *   src/content/technologies/{id}.json   ← replaces seed data
 *   src/content/categories/{id}.json     ← refreshes from CATEGORY_META
 *   src/data/profile.json
 *   src/data/sync-metadata.json
 *   src/data/media.json
 *   src/data/analytics.json
 *   src/data/verification-report.json
 */

import { writeFile, mkdir, rm, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { CATEGORY_META } from './classify-categories.mjs';
import { collectUsedTechnologies } from './infer-technologies.mjs';

// ─── Path helpers ─────────────────────────────────────────────────────────────

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function writeJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * Converts a badge name to a URL-safe slug.
 * e.g. "Build Infrastructure with Terraform on Google Cloud" → "build-infrastructure-with-terraform-on-google-cloud"
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Infers badge difficulty from name keywords.
 * Defaults to 'intermediate' if no signal found.
 */
function inferDifficulty(name) {
  const lower = name.toLowerCase();
  if (lower.includes('introductory') || lower.includes('basics of') ||
      lower.includes('get started') || lower.includes('prepare data') ||
      lower.includes('base camp') || lower.includes('arcade sprint') ||
      lower.includes('arcade trivia') || lower.includes('microlearning') ||
      lower.includes('derive insights') || lower.includes('organize and govern') ||
      lower.includes('monitoring in google cloud') ||
      lower.includes('set up an app') || lower.includes('use apis to work') ||
      lower.includes('google cloud speech api') || lower.includes('using the google cloud speech') ||
      lower.includes('implement cloud collaboration') ||
      lower.includes('build a website') || lower.includes('streaming analytics') ||
      lower.includes('cloud storage and data protection') ||
      lower.includes('the basics of') || lower.includes('share data') ||
      lower.includes('implementing cloud load balancing') ||
      lower.includes('cloud spanner instances') || lower.includes('create and manage')) {
    return 'introductory';
  }
  if (lower.includes('advanced') || lower.includes('use machine learning apis') ||
      lower.includes('architect') || lower.includes('professional')) {
    return 'advanced';
  }
  return 'intermediate';
}

/**
 * Infers badge type from name.
 */
function inferType(name) {
  const lower = name.toLowerCase();
  if (lower.includes('quest') || lower.includes('arcade') ||
      lower.includes('trivia') || lower.includes('sprint') ||
      lower.includes('challenge') || lower.includes('adventure') ||
      lower.includes('voyage') || lower.includes('world cup') ||
      lower.includes('holi') || lower.includes('base camp') ||
      lower.includes('pup and kit') || lower.includes('cert zone')) {
    return 'quest';
  }
  if (lower.includes('course') || lower.includes('microlearning') ||
      lower.includes('certificate') || lower.includes('learning')) {
    return 'course_completion';
  }
  return 'skill_badge';
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Writes all dataset files for the Astro content collections.
 *
 * @param {object} opts
 * @param {object} opts.profile - Parsed profile metadata
 * @param {Array}  opts.badges - Enriched badge array (with category, technologies, etc.)
 * @param {Array}  opts.mediaRecords - Badge image download results
 * @param {object} opts.avatarRecord - Avatar download result
 * @param {string} opts.rootDir - Absolute path to project root
 */
export async function generateDatasets({ profile, badges, mediaRecords, avatarRecord, rootDir }) {
  const srcDir         = join(rootDir, 'src');
  const contentDir     = join(srcDir, 'content');
  const dataDir        = join(srcDir, 'data');
  const badgesDir      = join(contentDir, 'badges');
  const techDir        = join(contentDir, 'technologies');
  const catDir         = join(contentDir, 'categories');

  await ensureDir(dataDir);
  await ensureDir(badgesDir);
  await ensureDir(techDir);
  await ensureDir(catDir);

  // ── Step A: Clear existing seed badge files ──────────────────────────────
  console.log('\n  📂 Clearing seed badge files...');
  if (existsSync(badgesDir)) {
    const existing = await readdir(badgesDir);
    for (const f of existing) {
      if (f.endsWith('.json')) {
        await rm(join(badgesDir, f));
      }
    }
    console.log(`  ✓ Removed ${existing.length} seed badge files`);
  }

  // ── Step B: Clear existing seed technology files ─────────────────────────
  console.log('  📂 Clearing seed technology files...');
  if (existsSync(techDir)) {
    const existing = await readdir(techDir);
    for (const f of existing) {
      if (f.endsWith('.json')) {
        await rm(join(techDir, f));
      }
    }
    console.log(`  ✓ Removed ${existing.length} seed technology files`);
  }

  // ── Step C: Write real badge JSON files ─────────────────────────────────
  console.log(`\n  📝 Writing ${badges.length} badge JSON files...`);
  const mediaMap = new Map(mediaRecords.map(r => [r.badgeId, r]));

  let writtenBadges = 0;
  for (const badge of badges) {
    const slug = slugify(badge.name);
    const media = mediaMap.get(badge.id);

    // Use local image if downloaded successfully, otherwise CDN URL
    const badgeImageUrl =
      (media?.status === 'downloaded' || media?.status === 'cached')
        ? badge.imageUrl  // Keep CDN URL (Astro can't bundle remote images at build time)
        : badge.imageUrl ?? 'https://cdn.qwiklabs.com/placeholder.png';

    const badgeData = {
      id: badge.id,
      name: badge.name,
      description: badge.description ?? `Earned Google Cloud skill badge: ${badge.name}`,
      provider: 'Google Cloud Skills Boost',
      badgeImageUrl,
      localImagePath: media?.publicPath ?? null,
      badgeUrl: badge.badgeUrl,
      earnedDate: badge.earnedDate ?? null,
      earnedDateRaw: badge.earnedDateRaw ?? null,
      category: badge.category,
      technologies: badge.technologies ?? [],
      difficulty: inferDifficulty(badge.name),
      type: inferType(badge.name),
      tags: badge.technologies ?? [],
      relatedPaths: [],
    };

    await writeJson(join(badgesDir, `${slug}.json`), badgeData);
    writtenBadges++;
  }
  console.log(`  ✓ Written ${writtenBadges} badge files`);

  // ── Step D: Write technology JSON files ──────────────────────────────────
  const usedTechs = collectUsedTechnologies(badges);
  console.log(`\n  📝 Writing ${usedTechs.length} technology JSON files...`);

  for (const tech of usedTechs) {
    const techData = {
      id: tech.id,
      name: tech.name,
      description: tech.description,
      category: tech.category,
      gcpProductUrl: tech.gcpProductUrl ?? null,
      relatedTechnologies: [],
    };
    await writeJson(join(techDir, `${tech.id}.json`), techData);
  }
  console.log(`  ✓ Written ${usedTechs.length} technology files`);

  // ── Step E: Refresh category JSON files ──────────────────────────────────
  console.log(`\n  📝 Refreshing category JSON files...`);
  for (const [id, meta] of Object.entries(CATEGORY_META)) {
    const catData = {
      id,
      name: meta.name,
      description: getCategoryDescription(id),
      icon: meta.icon,
      colorToken: meta.colorToken,
      shortName: meta.shortName,
    };
    await writeJson(join(catDir, `${id}.json`), catData);
  }
  console.log(`  ✓ Written ${Object.keys(CATEGORY_META).length} category files`);

  // ── Step F: Write src/data/*.json ────────────────────────────────────────
  console.log('\n  📝 Writing data manifests...');

  // profile.json
  await writeJson(join(dataDir, 'profile.json'), {
    ...profile,
    avatarPublicPath: avatarRecord?.publicPath ?? null,
    avatarStatus: avatarRecord?.status ?? 'not-fetched',
  });

  // media.json
  await writeJson(join(dataDir, 'media.json'), {
    generatedAt: new Date().toISOString(),
    avatar: avatarRecord,
    badges: mediaRecords,
    summary: {
      totalBadgeImages: mediaRecords.length,
      downloaded: mediaRecords.filter(r => r.status === 'downloaded').length,
      cached: mediaRecords.filter(r => r.status === 'cached').length,
      failed: mediaRecords.filter(r => r.status === 'failed').length,
      coveragePercent: Math.round(
        (mediaRecords.filter(r => r.status !== 'failed' && r.status !== 'no-url').length / mediaRecords.length) * 100
      ),
    },
  });

  // analytics.json
  const analytics = computeAnalytics(badges);
  await writeJson(join(dataDir, 'analytics.json'), analytics);

  // sync-metadata.json
  const syncMeta = {
    lastSynced: new Date().toISOString(),
    syncStatus: 'success',
    profileUrl: profile.profileUrl,
    totalBadges: badges.length,
    totalTechnologies: usedTechs.length,
    totalCategories: Object.keys(CATEGORY_META).length,
    totalMediaAssets: mediaRecords.length,
    latestBadge: badges[0]?.name ?? null,
    latestBadgeDate: badges[0]?.earnedDate ?? null,
  };
  await writeJson(join(dataDir, 'sync-metadata.json'), syncMeta);

  // verification-report.json
  const report = generateVerificationReport({ profile, badges, mediaRecords, usedTechs, analytics });
  await writeJson(join(dataDir, 'verification-report.json'), report);

  console.log('  ✓ Data manifests written');

  return { usedTechs, analytics, report };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

function computeAnalytics(badges) {
  const categoryBreakdown = {};
  const monthlyAcquisition = {};
  const techCount = {};

  for (const badge of badges) {
    // Category breakdown
    categoryBreakdown[badge.category] = (categoryBreakdown[badge.category] ?? 0) + 1;

    // Monthly acquisition
    if (badge.earnedDate) {
      const month = badge.earnedDate.slice(0, 7); // YYYY-MM
      monthlyAcquisition[month] = (monthlyAcquisition[month] ?? 0) + 1;
    }

    // Technology count
    for (const techId of badge.technologies ?? []) {
      techCount[techId] = (techCount[techId] ?? 0) + 1;
    }
  }

  const topTechnologies = Object.entries(techCount)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const strongestCategory = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])[0];

  const datedBadges = badges.filter(b => b.earnedDate).sort((a, b) =>
    a.earnedDate > b.earnedDate ? 1 : -1
  );

  // Difficulty breakdown
  const difficultyBreakdown = {};
  for (const badge of badges) {
    const d = badge.difficulty ?? 'intermediate';
    difficultyBreakdown[d] = (difficultyBreakdown[d] ?? 0) + 1;
  }

  // Type breakdown
  const typeBreakdown = {};
  for (const badge of badges) {
    const t = badge.type ?? 'skill_badge';
    typeBreakdown[t] = (typeBreakdown[t] ?? 0) + 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    totalBadges: badges.length,
    totalTechnologies: Object.keys(techCount).length,
    totalCategories: Object.keys(categoryBreakdown).length,
    categoryBreakdown,
    monthlyAcquisition,
    topTechnologies,
    difficultyBreakdown,
    typeBreakdown,
    strongestCategoryId: strongestCategory?.[0] ?? null,
    strongestCategoryCount: strongestCategory?.[1] ?? 0,
    firstBadgeDate: datedBadges[0]?.earnedDate ?? null,
    latestBadgeDate: datedBadges[datedBadges.length - 1]?.earnedDate ?? null,
    latestBadgeName: datedBadges[datedBadges.length - 1]?.name ?? null,
  };
}

// ─── Verification Report ──────────────────────────────────────────────────────

function generateVerificationReport({ profile, badges, mediaRecords, usedTechs, analytics }) {
  const badgesByCategory = {};
  for (const badge of badges) {
    if (!badgesByCategory[badge.category]) badgesByCategory[badge.category] = [];
    badgesByCategory[badge.category].push(badge.name);
  }

  const topCategoryEntry = Object.entries(analytics.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])[0];

  const imageCoverage = mediaRecords.length > 0
    ? Math.round((mediaRecords.filter(r => r.status === 'downloaded' || r.status === 'cached').length / mediaRecords.length) * 100)
    : 0;

  return {
    generatedAt: new Date().toISOString(),
    profile: {
      name: profile.name,
      league: profile.league,
      points: profile.points,
      memberSince: profile.memberSince,
      avatarStatus: profile.avatarUrl ? 'found' : 'not-found',
    },
    badges: {
      total: badges.length,
      withImages: mediaRecords.filter(r => r.url).length,
      withEarnedDate: badges.filter(b => b.earnedDate).length,
      latestBadge: analytics.latestBadgeName,
      latestBadgeDate: analytics.latestBadgeDate,
      oldestBadgeDate: analytics.firstBadgeDate,
    },
    categories: {
      total: Object.keys(analytics.categoryBreakdown).length,
      mostActive: topCategoryEntry?.[0] ?? null,
      mostActiveBadgeCount: topCategoryEntry?.[1] ?? 0,
      breakdown: analytics.categoryBreakdown,
    },
    technologies: {
      total: usedTechs.length,
      topClusters: analytics.topTechnologies.slice(0, 10),
    },
    media: {
      totalBadgeImages: mediaRecords.length,
      imageCoveragePercent: imageCoverage,
    },
    difficulty: analytics.difficultyBreakdown,
    type: analytics.typeBreakdown,
  };
}

// ─── Category descriptions ────────────────────────────────────────────────────

function getCategoryDescription(id) {
  const descriptions = {
    'ai-and-ml': 'Artificial intelligence, machine learning, generative AI, large language models, and AI infrastructure on Google Cloud.',
    'data-analytics': 'Data warehousing, streaming analytics, business intelligence, and data governance on Google Cloud.',
    'cloud-infrastructure': 'Compute, storage, serverless, containers, Kubernetes, and core cloud infrastructure services.',
    'security': 'Identity and access management, encryption, threat detection, and security compliance on Google Cloud.',
    'networking': 'Virtual private cloud, load balancing, network connectivity, and hybrid networking on Google Cloud.',
    'devops': 'CI/CD pipelines, infrastructure as code, GitOps, and DevOps automation on Google Cloud.',
    'application-development': 'Serverless applications, Firebase, web development, APIs, and Google Workspace automation.',
  };
  return descriptions[id] ?? `Google Cloud ${id} skills and certifications.`;
}
