import type { APIRoute } from 'astro';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Debug endpoint to help troubleshoot OG image generation
 *
 * Usage: /api/og-debug
 */
export const GET: APIRoute = async ({ url, request }) => {
  const params = url.searchParams;
  const template = params.get('template') || 'social-share-banner';

  // Check various path configurations
  const publicDir = './public';
  const shareImagesDir = './public/share-images';
  const templateFileName = `${template}.html`;
  const templatePath = join(shareImagesDir, templateFileName);

  const debugInfo = {
    request: {
      url: url.toString(),
      origin: url.origin,
      protocol: url.protocol,
      host: url.host,
      pathname: url.pathname,
    },
    template: {
      name: template,
      fileName: templateFileName,
      expectedPath: templatePath,
      exists: existsSync(templatePath),
    },
    directories: {
      publicExists: existsSync(publicDir),
      shareImagesExists: existsSync(shareImagesDir),
    },
    files: {},
    constructedUrls: {
      method1: new URL(`/share-images/${template}.html`, url.origin).toString(),
      method2: new URL(`/share-images/${template}.html`, request.url).toString(),
      method3: `${url.origin}/share-images/${template}.html`,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      cwd: process.cwd(),
    },
  };

  // List files in share-images directory if it exists
  if (existsSync(shareImagesDir)) {
    try {
      const files = readdirSync(shareImagesDir);
      debugInfo.files = {
        shareImagesDir: files,
      };
    } catch (err) {
      debugInfo.files = {
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  return new Response(JSON.stringify(debugInfo, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
