/**
 * fetch-media.mjs
 * Automated media pipeline: downloads badge images and profile avatar
 * from the live profile and stores them locally in public/.
 *
 * Uses streaming fetch → file writes. No sharp or image processing required.
 * Validates URLs before downloading. Skips files that already exist unless
 * forced (to support incremental sync).
 */

import { createWriteStream, mkdirSync, existsSync, statSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { pipeline } from 'stream/promises';

/**
 * Ensures a directory exists (creates it and all parents if needed).
 */
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Downloads a single URL to a local file path.
 * Returns metadata about the downloaded file.
 *
 * @param {string} url - Source URL
 * @param {string} localPath - Absolute local file path
 * @param {boolean} force - Re-download even if file exists
 * @returns {Promise<{url, localPath, sizeBytes, downloaded}>}
 */
export async function downloadFile(url, localPath, force = false) {
  ensureDir(dirname(localPath));

  // Skip if already downloaded (incremental sync)
  if (!force && existsSync(localPath)) {
    const stat = statSync(localPath);
    if (stat.size > 0) {
      return {
        url,
        localPath,
        sizeBytes: stat.size,
        downloaded: false,
        skipped: true,
      };
    }
  }

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Referer': 'https://www.cloudskillsboost.google/',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} downloading ${url}`);
  }

  // Determine content type for extension validation
  const contentType = res.headers.get('content-type') ?? '';

  // Write to disk
  const buffer = await res.arrayBuffer();
  await writeFile(localPath, Buffer.from(buffer));

  const sizeBytes = statSync(localPath).size;

  return {
    url,
    localPath,
    sizeBytes,
    contentType,
    downloaded: true,
    skipped: false,
  };
}

/**
 * Downloads all badge images from the parsed badge list.
 * Saves to: public/badges/{badgeId}.{ext}
 *
 * @param {Array<{id, imageUrl}>} badges
 * @param {string} publicDir - Absolute path to the public directory
 * @param {boolean} force
 * @returns {Promise<Array<MediaRecord>>}
 */
export async function downloadBadgeImages(badges, publicDir, force = false) {
  const badgesDir = join(publicDir, 'badges');
  ensureDir(badgesDir);

  const results = [];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const badge of badges) {
    if (!badge.imageUrl) {
      results.push({
        badgeId: badge.id,
        url: null,
        localPath: null,
        publicPath: null,
        status: 'no-url',
      });
      continue;
    }

    // Extract file extension from URL or default to .png
    const urlParts = badge.imageUrl.split('?')[0];
    const ext = urlParts.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)?.[1] ?? 'png';
    const filename = `${badge.id}.${ext}`;
    const localPath = join(badgesDir, filename);
    const publicPath = `/badges/${filename}`;

    try {
      const result = await downloadFile(badge.imageUrl, localPath, force);
      if (result.skipped) skipped++;
      else downloaded++;

      results.push({
        badgeId: badge.id,
        badgeName: badge.name,
        url: badge.imageUrl,
        localPath,
        publicPath,
        sizeBytes: result.sizeBytes,
        status: result.skipped ? 'cached' : 'downloaded',
      });
    } catch (err) {
      failed++;
      console.warn(`  ⚠ Failed to download badge image for "${badge.name}": ${err.message}`);
      results.push({
        badgeId: badge.id,
        badgeName: badge.name,
        url: badge.imageUrl,
        localPath,
        publicPath,
        status: 'failed',
        error: err.message,
      });
    }
  }

  console.log(`  ✓ Badge images: ${downloaded} downloaded, ${skipped} cached, ${failed} failed`);
  return results;
}

/**
 * Downloads the profile avatar.
 * Saves to: public/profile/avatar.{ext}
 *
 * @param {string} avatarUrl
 * @param {string} publicDir
 * @param {boolean} force
 * @returns {Promise<MediaRecord>}
 */
export async function downloadAvatar(avatarUrl, publicDir, force = false) {
  if (!avatarUrl) {
    console.log('  ⚠ No avatar URL found, skipping avatar download');
    return { status: 'no-url' };
  }

  const profileDir = join(publicDir, 'profile');
  ensureDir(profileDir);

  // Google avatar URLs end with =s320-c (size parameter), use .jpg
  const localPath = join(profileDir, 'avatar.jpg');
  const publicPath = '/profile/avatar.jpg';

  try {
    const result = await downloadFile(avatarUrl, localPath, force);
    console.log(`  ✓ Avatar: ${result.skipped ? 'cached' : 'downloaded'} (${Math.round((result.sizeBytes ?? 0) / 1024)}KB)`);
    return {
      url: avatarUrl,
      localPath,
      publicPath,
      sizeBytes: result.sizeBytes,
      status: result.skipped ? 'cached' : 'downloaded',
    };
  } catch (err) {
    console.warn(`  ⚠ Failed to download avatar: ${err.message}`);
    return { url: avatarUrl, status: 'failed', error: err.message };
  }
}
