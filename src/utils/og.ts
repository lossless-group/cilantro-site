import { SITE_SEO } from '../config/seo';
import type { ShareMetaInput } from '../config/seo';

type MetaTag = {
  name?: string;
  content: string;
  property?: string;
};

export function buildOgMeta(input: ShareMetaInput = {}): MetaTag[] {
  const title = input.title ?? SITE_SEO.defaultTitle;
  const description = input.description ?? SITE_SEO.defaultDescription;
  const image = input.image ?? SITE_SEO.defaultImage;
  const url = input.url; // optional; recommended to pass absolute in production
  const type = input.type ?? 'website';

  const meta: MetaTag[] = [
    // Basic
    { name: 'description', content: description },

    // Open Graph
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE_SEO.siteName },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
  ];

  if (url) meta.push({ property: 'og:url', content: url });

  // Twitter
  meta.push({ name: 'twitter:card', content: 'summary_large_image' });
  if (SITE_SEO.twitterHandle) meta.push({ name: 'twitter:site', content: SITE_SEO.twitterHandle });
  meta.push({ name: 'twitter:title', content: title });
  meta.push({ name: 'twitter:description', content: description });
  meta.push({ name: 'twitter:image', content: image });

  return meta;
}