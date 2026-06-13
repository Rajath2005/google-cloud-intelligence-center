/**
 * parse-profile.mjs
 * Pure-HTML parser for cloudskillsboost.google public profiles.
 * No browser, no DOM, no puppeteer — just fetch + regex.
 *
 * Source HTML structure (verified 2026-06-13):
 *   <div class='profile-badge'>
 *     <a class="badge-image" href="...badges/{id}"><img src="{imageUrl}" /></a>
 *     <span class='ql-title-medium'>{name}</span>
 *     <span class='ql-body-medium'>Earned {date}</span>
 *   </div>
 */

const PROFILE_URL = 'https://www.cloudskillsboost.google/public_profiles/09886862-52b8-44a4-86a5-9559a3952dd0';

/**
 * Fetches the live profile page and returns the raw HTML string.
 */
export async function fetchProfileHtml() {
  console.log(`  → Fetching: ${PROFILE_URL}`);
  const res = await fetch(PROFILE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,*/*',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Profile fetch failed: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  console.log(`  ✓ Fetched ${Math.round(html.length / 1024)}KB of HTML`);
  return html;
}

/**
 * Parses profile metadata from the HTML.
 */
export function parseProfile(html) {
  const name = extract(html, /<h1[^>]*>\s*([\s\S]*?)\s*<\/h1>/)?.trim() ?? 'Unknown';
  const memberSince = extract(html, /Member since (\d{4})/) ?? null;
  const league = extract(html, /<h2[^>]*>([^<]+ League)<\/h2>/) ?? null;
  const pointsRaw = extract(html, /<strong>([\d,]+ points)<\/strong>/);
  const points = pointsRaw ? parseInt(pointsRaw.replace(/[^\d]/g, ''), 10) : 0;
  const avatarUrl = extract(html, /<ql-avatar[^>]+src='([^']+)'/) ?? null;

  return {
    name: cleanText(name),
    profileUrl: PROFILE_URL,
    publicProfileUrl: `https://www.skills.google/public_profiles/09886862-52b8-44a4-86a5-9559a3952dd0`,
    avatarUrl,
    memberSince,
    league: league ? league.replace(' League', '') : null,
    points,
    lastFetched: new Date().toISOString(),
  };
}

/**
 * Parses all badge entries from the HTML.
 * Returns an array of raw badge objects.
 */
export function parseBadges(html) {
  const badges = [];

  // Split on <div class='profile-badge'> to get individual badge blocks
  const blocks = html.split("<div class='profile-badge'>");
  // Skip block[0] — it's content before the first badge

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];

    try {
      // Badge detail URL and ID
      const badgeUrlMatch = block.match(/href="(https:\/\/www\.skills\.google\/public_profiles\/[^"]+\/badges\/(\d+))"/);
      const badgeUrl = badgeUrlMatch?.[1] ?? null;
      const badgeId = badgeUrlMatch?.[2] ?? `badge-${i}`;

      // Badge image URL
      const imageUrl = extract(block, /<img[^>]+src="([^"]+)"/) ?? null;

      // Badge name
      const rawName = extract(block, /<span class='ql-title-medium[^']*'>\s*([\s\S]*?)\s*<\/span>/) ?? '';
      const name = cleanText(rawName);

      // Earned date
      const earnedRaw = extract(block, /<span class='ql-body-medium[^']*'>\s*Earned ([^<]+?)\s*<\/span>/) ?? '';
      const earnedDate = parseDate(earnedRaw.trim());

      // Description is in the modal — we'll use the aria-label as fallback
      const ariaLabel = extract(block, /ariaLabel='Learn more about ([^']+)'/) ?? name;

      if (!name) continue; // Skip blocks with no name (might be partial)

      badges.push({
        id: badgeId,
        name,
        badgeUrl: badgeUrl ?? `${PROFILE_URL}/badges/${badgeId}`,
        imageUrl,
        earnedDate,
        earnedDateRaw: earnedRaw.trim(),
        ariaLabel: cleanText(ariaLabel),
      });
    } catch (err) {
      console.warn(`  ⚠ Could not parse badge block ${i}: ${err.message}`);
    }
  }

  console.log(`  ✓ Parsed ${badges.length} badges from profile`);
  return badges;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extract(html, regex) {
  return html.match(regex)?.[1] ?? null;
}

function cleanText(raw) {
  return raw
    .replace(/<[^>]+>/g, '')       // Strip any HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')          // Collapse whitespace
    .trim();
}

/**
 * Parses "Jun 11, 2026 EDT" → "2026-06-11"
 */
function parseDate(raw) {
  if (!raw) return null;

  // Remove timezone suffix (EDT, PDT, UTC etc.)
  const cleaned = raw.replace(/\s+[A-Z]{2,4}$/, '').trim();

  const months = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04',
    May: '05', Jun: '06', Jul: '07', Aug: '08',
    Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };

  // "Jun 11, 2026"
  const match = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    const mm = months[month] ?? '01';
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  // Fallback: try native Date parse
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }

  return null;
}
