import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ─── Badge ────────────────────────────────────────────────────────────────────
const badges = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/badges' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    provider: z.literal('Google Cloud Skills Boost'),
    badgeImageUrl: z.string().url(),
    badgeUrl: z.string().url(),
    earnedDate: z.string().optional(),
    category: z.string(),
    technologies: z.array(z.string()),
    difficulty: z.enum(['introductory', 'intermediate', 'advanced']),
    type: z.enum(['skill_badge', 'course_completion', 'quest']),
    labCount: z.number().optional(),
    tags: z.array(z.string()).default([]),
    relatedPaths: z.array(z.string()).default([]),
  }),
});

// ─── Technology ───────────────────────────────────────────────────────────────
const technologies = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/technologies' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    category: z.string(),
    logoSlug: z.string().optional(),
    gcpProductUrl: z.string().url().optional(),
    relatedTechnologies: z.array(z.string()).default([]),
  }),
});

// ─── Category ─────────────────────────────────────────────────────────────────
const categories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    colorToken: z.string(),
    shortName: z.string(),
  }),
});

// ─── Learning Path ────────────────────────────────────────────────────────────
const learningPaths = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/learning-paths' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    badges: z.array(z.string()),
    difficulty: z.enum(['introductory', 'intermediate', 'advanced']),
    estimatedHours: z.number().optional(),
    pathUrl: z.string().url().optional(),
  }),
});

// ─── Certificate ─────────────────────────────────────────────────────────────
const certificates = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/certificates' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    issuer: z.string(),
    earnedDate: z.string().optional(),
    expiryDate: z.string().optional(),
    credentialUrl: z.string().url().optional(),
    badgeImageUrl: z.string().url().optional(),
    skills: z.array(z.string()),
  }),
});

export const collections = {
  badges,
  technologies,
  categories,
  learningPaths,
  certificates,
};
