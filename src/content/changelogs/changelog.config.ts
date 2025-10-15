import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Unified changelog schema for all Lossless Group products
 * Matches the frontmatter structure in your changelog entries
 */
const changelogSchema = z.object({
  // Core metadata
  version: z.string().optional(),
  title: z.string(),
  lede: z.string().optional(),
  slug: z.string(),

  // Dates - using coerce to handle YAML string dates like '2025-10-14'
  date_created: z.coerce.date().optional(),
  date_modified: z.coerce.date().optional(),
  date_started: z.coerce.date().optional(),
  date_shipped: z.coerce.date().optional(),

  // Classification
  product: z.enum(['Neo', 'Parslee', 'Cilantro-Site']),
  type: z.enum(['Major', 'Minor', 'Patch', 'Documentation', 'Refactor', 'Infrastructure']),
  is_release: z.boolean().optional().default(false),
  publish: z.boolean().default(true),

  // Content
  summary: z.string().optional(),
  why_care: z.string().optional(),

  // Attribution
  authors: z.array(z.string()).optional(),
  contributors: z.array(z.string()).optional(),
  signed_off: z.array(z.string()).optional(),

  // Organization
  tags: z.array(z.string()).optional(),
});

/**
 * Neo changelog collection
 * Git submodule maintained by Neo team
 */
export const changelogNeo = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/changelogs/changelog-neo'
  }),
  schema: changelogSchema.extend({
    product: z.literal('Neo'),
  }),
});

/**
 * Parslee changelog collection
 * Git submodule maintained by Parslee team
 */
export const changelogParslee = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/changelogs/changelog-parslee'
  }),
  schema: changelogSchema.extend({
    product: z.literal('Parslee'),
  }),
});

/**
 * Cilantro Site changelog collection
 * Git submodule maintained by site team
 */
export const changelogCilantroSite = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/changelogs/changelog-cilantro-site'
  }),
  schema: changelogSchema.extend({
    product: z.literal('Cilantro-Site'),
  }),
});

// Export type for use in pages/components
export type ChangelogEntry = z.infer<typeof changelogSchema>;
