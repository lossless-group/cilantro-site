import { z, defineCollection } from 'astro:content';
  import { glob } from 'astro/loaders';

  const changelogSchema = z.object({
    version: z.string().optional(),
    title: z.string(),
    lede: z.string().optional(),
    slug: z.string(),
    date_created: z.date().optional(),
    date_modified: z.date().optional(),
    date_started: z.date().optional(),
    date_shipped: z.date().optional(),
    product: z.enum(['Neo', 'Parslee', 'Cilantro-Site']),
    type: z.enum(['Major', 'Minor', 'Patch', 'Documentation', 'Refactor',
  'Infrastructure']),
    is_release: z.boolean().optional().default(false),
    publish: z.boolean().default(true),
    summary: z.string().optional(),
    why_care: z.string().optional(),
    authors: z.array(z.string()).optional(),
    contributors: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }); 

  export const changelogNeo = defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/changelogs/changelog_neo'
    }),
    schema: changelogSchema.extend({
      product: z.literal('neo'),
    }),
  });

  export const changelogParslee = defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/changelogs/changelog_parslee'
    }),
    schema: changelogSchema.extend({
      product: z.literal('parslee'),
    }),
  });

  export const changelogSite = defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/changelogs/changelog_cilantro_site'
    }),
    schema: changelogSchema.extend({
      product: z.literal('site'),
    }),
  });
