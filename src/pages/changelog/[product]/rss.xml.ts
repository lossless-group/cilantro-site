import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext, GetStaticPaths } from 'astro';

// Define valid product routes
export const getStaticPaths = (() => {
  return [
    { params: { product: 'neo' } },
    { params: { product: 'parslee' } },
    { params: { product: 'cilantro-site' } },
  ];
}) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
  const { product } = context.params;

  // Map URL params to collection names and display names
  const productMap: Record<string, { collection: string; display: string }> = {
    'neo': {
      collection: 'changelog-neo',
      display: 'Neo'
    },
    'parslee': {
      collection: 'changelog-parslee',
      display: 'Parslee'
    },
    'cilantro-site': {
      collection: 'changelog-cilantro-site',
      display: 'Cilantro Site'
    }
  };

  const productInfo = productMap[product!];
  if (!productInfo) {
    return new Response('Product not found', { status: 404 });
  }

  // Fetch entries for this product only
  const entries = await getCollection(productInfo.collection as any, ({ data }) => data.publish === true);

  // Sort by date (most recent first)
  const sortedEntries = entries
    .filter(entry => entry.data.date_shipped)
    .sort((a, b) => {
      const dateA = a.data.date_shipped?.getTime() || 0;
      const dateB = b.data.date_shipped?.getTime() || 0;
      return dateB - dateA;
    });

  return rss({
    title: `${productInfo.display} Changelog`,
    description: `Latest updates, features, and improvements for ${productInfo.display}.`,
    site: context.site?.toString() || 'https://example.com',
    items: sortedEntries.map((entry) => {
      const { data } = entry;

      return {
        title: `${data.version ? `${data.version} - ` : ''}${data.title}`,
        pubDate: data.date_shipped!,
        description: data.summary || data.lede || '',
        link: `/changelog/${product}/${data.slug}/`,
        categories: [
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
