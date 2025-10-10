export interface SiteSEO {
  siteName: string;
  baseUrl?: string;
  twitterHandle?: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string; // path under /public
}

export const SITE_SEO: SiteSEO = {
  siteName: 'Parslee',
  defaultTitle: 'The missing Context Layer for AI Workloads and Document Intelligence',
  defaultDescription:
    'Enabling better use of AI through contextual understanding of documents.',
  defaultImage: '/shareBanner__Parslee-Zinger.webp',
  twitterHandle: '@parslee_ai',
};

export type ShareMetaInput = {
  title?: string;
  description?: string;
  image?: string; // absolute or public-relative path
  url?: string; // absolute preferred, pathname acceptable in dev
  type?: 'website' | 'article';
};