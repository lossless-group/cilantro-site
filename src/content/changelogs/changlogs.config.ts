import { z, defineCollection } from 'astro:content';
  import { glob } from 'astro/loaders';

  const changelogSchema = z.object({
    version: z.string().optional(),
    title: z.string(),
    date: z.date(),
    product: z.enum(['neo', 'parslee', 'site']),
    type: z.enum(['major', 'minor', 'patch', 'documentation', 'refactor',
  'infrastructure']),
    published: z.boolean().default(true),
    summary: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  });

  export const changelogNeo = defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/changelogs/neo'
    }),
    schema: changelogSchema.extend({
      product: z.literal('neo'),
    }),
  });

  export const changelogParslee = defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/changelogs/parslee'
    }),
    schema: changelogSchema.extend({
      product: z.literal('parslee'),
    }),
  });

  export const changelogSite = defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/changelogs/site'
    }),
    schema: changelogSchema.extend({
      product: z.literal('site'),
    }),
  });
