import type { APIRoute } from 'astro';
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import os from 'os';

/**
 * API endpoint for generating dynamic Open Graph images
 *
 * Usage:
 *   /api/og-image?template=social-share-banner&title=Your+Title&subtitle=Your+Subtitle
 *
 * Query Parameters:
 *   - template: HTML template name (without .html extension)
 *   - Any additional params are passed to the template as URL params
 *
 * Note: On serverless platforms (like Vercel), filesystem caching is ephemeral.
 * Set cache-control headers to leverage CDN caching instead.
 */

// CRITICAL: Disable pre-rendering so this endpoint is server-rendered on each request
export const prerender = false;

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const params = url.searchParams;
    const template = params.get('template') || 'social-share-banner';
    const debug = params.get('debug') === 'true';

    // Generate cache key from all parameters
    const cacheKey = crypto
      .createHash('md5')
      .update(url.search)
      .digest('hex');

    // Determine cache directory based on environment
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    const cacheDir = isServerless
      ? join(os.tmpdir(), 'og-cache')
      : './public/generated-og';
    const cachePath = join(cacheDir, `${cacheKey}.webp`);

    // Return cached image if it exists (mainly useful in dev)
    if (!isServerless && existsSync(cachePath)) {
      const imageBuffer = readFileSync(cachePath);
      return new Response(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Ensure cache directory exists
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }

    // Build template URL with parameters
    // Use the full origin from the request to ensure proper URL resolution
    const origin = url.origin || `${url.protocol}//${url.host}`;
    // Templates are Astro pages, so no .html extension needed
    const templatePath = `/share-images/${template}`;

    // Construct full template URL
    let templateUrl: URL;
    try {
      templateUrl = new URL(templatePath, origin);
    } catch (err) {
      // Fallback: try constructing with request URL
      templateUrl = new URL(templatePath, request.url);
    }

    // Pass all query params except 'template' to the HTML template
    params.forEach((value, key) => {
      if (key !== 'template') {
        templateUrl.searchParams.set(key, value);
      }
    });

    const templateUrlString = templateUrl.toString();

    // ALWAYS log this so we can see what's happening
    console.log('='.repeat(80));
    console.log('📸 OG IMAGE GENERATION REQUEST');
    console.log('Request URL:', url.toString());
    console.log('Template name:', template);
    console.log('Template URL Playwright will visit:', templateUrlString);
    console.log('All params:', Object.fromEntries(params.entries()));
    console.log('='.repeat(80));

    // Debug mode: return info without generating image
    if (debug) {
      return new Response(JSON.stringify({
        message: 'Debug mode - no image generated',
        templateUrl: templateUrlString,
        params: Object.fromEntries(params.entries()),
        origin: origin,
        requestUrl: url.toString(),
        isDev: process.env.NODE_ENV === 'development',
        testDirectly: `Visit this URL to test: ${templateUrlString}`,
      }, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Launch headless browser
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 2, // 2x for retina displays
    });

    // Navigate to template with error handling
    // In dev mode, use 'domcontentloaded' instead of 'networkidle' because Vite's HMR keeps connections open
    const isDev = process.env.NODE_ENV === 'development';

    try {
      const response = await page.goto(templateUrlString, {
        waitUntil: isDev ? 'domcontentloaded' : 'networkidle',
        timeout: 15000,
      });

      if (!response) {
        throw new Error(`No response received for: ${templateUrlString}`);
      }

      const status = response.status();
      console.log(`📸 Template response status: ${status}`);

      if (status !== 200) {
        // Take a screenshot of the error page for debugging
        const errorScreenshot = await page.screenshot({ type: 'png' });
        console.error(`❌ Template returned ${status}, screenshot saved for debugging`);
        throw new Error(`Template returned status ${status}: ${templateUrlString}`);
      }
    } catch (navError) {
      await browser.close();
      throw new Error(`Failed to load template: ${navError instanceof Error ? navError.message : 'Unknown error'}. URL: ${templateUrlString}`);
    }

    // Check what content Playwright actually sees
    const pageContent = await page.content();
    console.log('📄 Page title from Playwright:', await page.title());

    // Get the actual text content that Playwright sees
    const taglineText = await page.textContent('#tagline').catch(() => 'Not found');
    const subtitleText = await page.textContent('#subtitle').catch(() => 'Not found');
    console.log('📝 Tagline text Playwright sees:', taglineText);
    console.log('📝 Subtitle text Playwright sees:', subtitleText);

    // Wait for the dynamic content to be ready
    console.log('⏳ Waiting for dynamic content to load...');
    try {
      await page.waitForSelector('[data-og-ready="true"]', { timeout: 5000 });
      console.log('✅ Dynamic content loaded');

      // Check again after waiting
      const taglineAfter = await page.textContent('#tagline').catch(() => 'Not found');
      const subtitleAfter = await page.textContent('#subtitle').catch(() => 'Not found');
      console.log('📝 After JS - Tagline:', taglineAfter);
      console.log('📝 After JS - Subtitle:', subtitleAfter);
    } catch (err) {
      console.warn('⚠️  Timeout waiting for data-og-ready, proceeding anyway');
      console.warn('⚠️  This means JavaScript did not execute or set the flag');
    }

    // Wait a bit for any animations to settle
    await page.waitForTimeout(500);

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    });

    await browser.close();

    // Convert PNG to WebP using sharp if available, otherwise save as PNG
    let finalImage: Buffer;
    let contentType: string;

    try {
      // Try to use sharp for WebP conversion
      const sharp = await import('sharp').catch(() => null);

      if (sharp) {
        finalImage = await sharp.default(screenshot)
          .webp({ quality: 90 })
          .toBuffer();
        contentType = 'image/webp';

        // Save to cache (only in dev, serverless is ephemeral)
        if (!isServerless) {
          try {
            writeFileSync(cachePath, finalImage);
          } catch (err) {
            console.warn('Failed to write cache:', err);
          }
        }
      } else {
        // Fallback to PNG if sharp is not available
        finalImage = screenshot;
        contentType = 'image/png';

        if (!isServerless) {
          try {
            const pngCachePath = cachePath.replace('.webp', '.png');
            writeFileSync(pngCachePath, finalImage);
          } catch (err) {
            console.warn('Failed to write cache:', err);
          }
        }
      }
    } catch (error) {
      // Fallback to PNG
      finalImage = screenshot;
      contentType = 'image/png';

      if (!isServerless) {
        try {
          const pngCachePath = cachePath.replace('.webp', '.png');
          writeFileSync(pngCachePath, finalImage);
        } catch (err) {
          console.warn('Failed to write cache:', err);
        }
      }
    }

    // Cache headers: CDN will cache for us in production
    const cacheControl = isServerless
      ? 'public, max-age=31536000, s-maxage=31536000, immutable'
      : 'public, max-age=31536000, immutable';

    return new Response(finalImage, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
      },
    });

  } catch (error) {
    console.error('Error generating OG image:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      error: 'Failed to generate image',
      message: errorMessage,
      template: params.get('template') || 'social-share-banner',
      requestUrl: url.toString(),
      origin: url.origin,
      timestamp: new Date().toISOString(),
    };

    console.error('Error details:', errorDetails);

    return new Response(
      JSON.stringify(errorDetails),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
