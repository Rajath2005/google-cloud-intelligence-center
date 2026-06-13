/**
 * sync-profile.mjs
 * Main orchestrator for Phase 3.5 Real Data Foundation.
 * Fetches the live Google Cloud Skills profile, normalizes data,
 * downloads media, and generates Astro content collections.
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { fetchProfileHtml, parseProfile, parseBadges } from './lib/parse-profile.mjs';
import { classifyCategory } from './lib/classify-categories.mjs';
import { inferTechnologies } from './lib/infer-technologies.mjs';
import { downloadBadgeImages, downloadAvatar } from './lib/fetch-media.mjs';
import { generateDatasets } from './lib/generate-datasets.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const PUBLIC_DIR = join(ROOT_DIR, 'public');

async function main() {
  console.log('\n🚀 Starting Cloud Intelligence Core Sync Pipeline...\n');

  try {
    // 1. Fetch live HTML
    console.log('── Step 1: Live Profile Extraction ──');
    const html = await fetchProfileHtml();
    const rawProfile = parseProfile(html);
    const rawBadges = parseBadges(html);

    if (rawBadges.length === 0) {
      throw new Error('No badges found in the profile HTML.');
    }

    // 2. Enrich badges with Category & Technology inference
    console.log('\n── Step 2: Inference & Classification ──');
    const enrichedBadges = rawBadges.map(badge => {
      const technologies = inferTechnologies(badge.name, [badge.ariaLabel]);
      const category = classifyCategory(badge.name, [badge.ariaLabel, ...technologies]);
      
      return {
        ...badge,
        category,
        technologies,
      };
    });
    
    // Quick summary
    const categorizedCount = enrichedBadges.reduce((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {});
    console.log(`  ✓ Classified into ${Object.keys(categorizedCount).length} categories`);

    // 3. Media Pipeline
    console.log('\n── Step 3: Media & Asset Management ──');
    const mediaRecords = await downloadBadgeImages(enrichedBadges, PUBLIC_DIR, false);
    const avatarRecord = await downloadAvatar(rawProfile.avatarUrl, PUBLIC_DIR, false);

    // 4. Generate Datasets
    console.log('\n── Step 4: Normalization & Dataset Generation ──');
    const { report } = await generateDatasets({
      profile: rawProfile,
      badges: enrichedBadges,
      mediaRecords,
      avatarRecord,
      rootDir: ROOT_DIR,
    });

    // 5. Output Verification Report
    console.log('\n✅ Sync Pipeline Complete! Verification Report:\n');
    console.log(JSON.stringify(report, null, 2));
    console.log('\nData is ready for the Cloud Intelligence Core.');

  } catch (err) {
    console.error('\n❌ Sync Pipeline Failed:');
    console.error(err);
    process.exit(1);
  }
}

main();
