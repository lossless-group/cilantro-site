import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  // Fetch all changelog entries from all products
  const neoEntries = await getCollection('changelog-neo', ({ data }) => data.publish === true);
  const parsleeEntries = await getCollection('changelog-parslee', ({ data }) => data.publish === true);
  const siteEntries = await getCollection('changelog-cilantro-site', ({ data }) => data.publish === true);

  // Combine and sort by date (most recent first)
  const allEntries = [...neoEntries, ...parsleeEntries, ...siteEntries]
    .filter(entry => entry.data.date_shipped)
    .sort((a, b) => {
      const dateA = a.data.date_shipped?.getTime() || 0;
      const dateB = b.data.date_shipped?.getTime() || 0;
      return dateB - dateA;
    });

  // Map URL params for each product
  const productMap: Record<string, string> = {
    'Neo': 'neo',
    'Parslee': 'parslee',
    'Cilantro-Site': 'cilantro-site'
  };

  return rss({
    title: 'Lossless Group Product Updates',
    description: 'Latest changes, features, and improvements across all Lossless Group products including Neo, Parslee, and Cilantro Site.',
    site: context.site?.toString() || 'https://example.com',
    items: allEntries.map((entry) => {
      const { data } = entry;
      const productSlug = productMap[data.product] || data.product.toLowerCase();

      return {
        title: `${data.product} ${data.version ? `${data.version} - ` : ''}${data.title}`,
        pubDate: data.date_shipped!,
        description: data.summary || data.lede || '',
        link: `/changelog/${productSlug}/${data.slug}/`,
        categories: [
          data.product,
          data.type,
          ...(data.tags || [])
        ],
        author: data.authors?.join(', '),
        customData: `
          <product>${data.product}</product>
          <version>${data.version || 'N/A'}</version>
          <type>${data.type}</type>
          <isRelease>${data.is_release}</isRelease>
        `
      };
    }),
    customData: `<language>en-us</language>`,
  });
}
