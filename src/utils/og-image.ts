/**
 * Utility for generating Open Graph image URLs
 *
 * Usage:
 *   import { buildOgImageUrl } from '@/utils/og-image';
 *
 *   const imageUrl = buildOgImageUrl({
 *     template: 'social-share-banner',
 *     title: 'My Awesome Post',
 *     highlight: 'Awesome',
 *     subtitle: 'Blog Post'
 *   });
 */

interface OgImageParams {
  template?: string;
  title?: string;
  highlight?: string;
  subtitle?: string;
  [key: string]: string | undefined;
}

/**
 * Build an OG image URL with proper encoding
 *
 * @param params - Object containing template name and dynamic content
 * @returns URL string for the generated image
 */
export function buildOgImageUrl(params: OgImageParams): string {
  const { template = 'social-share-banner', ...rest } = params;

  const searchParams = new URLSearchParams();
  searchParams.set('template', template);

  // Add all other parameters
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value);
    }
  });

  return `/api/og-image?${searchParams.toString()}`;
}

/**
 * Generate OG meta tags for a page
 *
 * @param params - Same as buildOgImageUrl
 * @returns Object with meta tag properties
 */
export function buildOgImageMeta(params: OgImageParams) {
  const imageUrl = buildOgImageUrl(params);

  return {
    'og:image': imageUrl,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/webp',
    'twitter:card': 'summary_large_image',
    'twitter:image': imageUrl,
  };
}
