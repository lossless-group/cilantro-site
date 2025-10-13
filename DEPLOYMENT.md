# Deployment Guide

This document explains how the site is configured for automatic deployment to Vercel.

## 🚀 Automated Deployment

When you push to your connected Git branch, Vercel automatically:

1. **Installs dependencies** - `pnpm install`
2. **Runs postinstall scripts** - Approves builds and installs Playwright
3. **Builds the site** - `pnpm run build`
4. **Deploys to production**

## 📦 Build Configuration

### package.json Scripts

```json
{
  "scripts": {
    "postinstall": "pnpm run approve-builds && pnpm run setup-playwright",
    "approve-builds": "pnpm approve-builds || true",
    "setup-playwright": "playwright install chromium --with-deps || playwright install chromium || true"
  }
}
```

**What happens:**

1. **postinstall** - Runs automatically after `pnpm install`
2. **approve-builds** - Approves Astro telemetry/builds (with `|| true` to not fail if already approved)
3. **setup-playwright** - Installs Chromium browser for OG image generation

### vercel.json

```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install",
  "framework": "astro",
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

**Configuration:**
- **maxDuration: 30** - API routes can run for up to 30 seconds (needed for Playwright rendering)
- **memory: 1024** - 1GB RAM for serverless functions (needed for Chrome)

## 🖼️ OG Image Generation in Production

### How It Works

The `/api/og-image` endpoint generates images on-demand:

1. **First request** - Generates image with Playwright (~2-5 seconds)
2. **CDN caches response** - Subsequent requests served instantly
3. **Cache-Control headers** - Images cached for 1 year

### Serverless Considerations

On Vercel (serverless environment):
- **No persistent filesystem** - Can't cache to disk between requests
- **CDN caching** - Vercel's edge network caches the generated images
- **Cold starts** - First request may be slower (~3-10 seconds)

### Performance Optimization

**What we do:**
- Set `s-maxage=31536000` for CDN caching
- Generate images at 2x resolution for retina
- Use WebP format (smaller file size)
- Memory optimizations for Chromium

**Production tips:**
- Pre-generate common images during build (optional)
- Monitor function logs for cold start times
- Consider upgrading Vercel plan for better function performance

## 🔧 Environment Variables

### Required (None currently)

All dependencies are installed automatically.

### Optional

Add these in Vercel dashboard if needed:

```bash
# Playwright configuration
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

# Node environment
NODE_ENV=production

# Custom deployment settings
DEPLOY_ENV=Vercel
```

## 📝 Deployment Checklist

### First-Time Setup

- [ ] Connect repository to Vercel
- [ ] Ensure `pnpm` is selected as package manager
- [ ] Set root directory to `astro-knots/sites/cilantro-site` (if in monorepo)
- [ ] Verify build command: `pnpm run build`
- [ ] Check function settings: 30s timeout, 1GB memory

### Before Each Deploy

- [ ] Test OG images locally: `pnpm dev` → visit `/api/og-image?template=...`
- [ ] Verify build succeeds: `pnpm run build`
- [ ] Check for TypeScript errors
- [ ] Test in preview deployment first

### After Deploy

- [ ] Test OG image generation: `https://yoursite.com/api/og-image?template=social-share-banner`
- [ ] Check function logs in Vercel dashboard
- [ ] Validate social share previews:
  - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
  - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
  - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## 🐛 Troubleshooting

### Build Fails: "playwright not found"

**Problem:** Playwright didn't install during postinstall

**Solution:**
```bash
# Add to vercel.json
{
  "env": {
    "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD": "0"
  }
}
```

### Function Timeout: "Task timed out after 10 seconds"

**Problem:** Default timeout too short for Playwright rendering

**Solution:** Increase in `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Memory Error: "JavaScript heap out of memory"

**Problem:** Not enough memory for Chrome

**Solution:** Increase memory in `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024
    }
  }
}
```

### Images Don't Update

**Problem:** CDN cache not clearing

**Solutions:**
1. Change URL parameters to bust cache
2. Use Vercel dashboard to purge CDN cache
3. Wait for cache to expire (check `Cache-Control` headers)

## 📊 Monitoring

### Vercel Dashboard

Monitor these metrics:
- **Function Execution Time** - Should be 2-5s for image generation
- **Function Memory Usage** - Should stay under 1GB
- **Error Rate** - OG image generation errors
- **Bandwidth** - WebP images should be ~50-200KB each

### Logs

View function logs:
```bash
vercel logs --follow
```

Or in Vercel dashboard: Project → Functions → View Logs

## 🔄 Continuous Deployment

### Git Workflow

```bash
# Make changes
git add .
git commit -m "Update OG image template"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys to preview (for non-main branches)
# 4. Deploys to production (for main branch)
```

### Preview Deployments

- **Every branch** gets a preview deployment
- **Every commit** gets a unique URL
- **Production** only updates on main branch

Test OG images in preview:
```
https://yoursite-git-feature-branch-yourteam.vercel.app/api/og-image?template=...
```

## 🌐 Custom Domains

If using custom domain:
1. Add domain in Vercel dashboard
2. Update DNS records
3. OG images will work at `https://yourdomain.com/api/og-image`

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/vercel/)
- [Playwright Documentation](https://playwright.dev/)
- [pnpm Documentation](https://pnpm.io/)

## 💡 Performance Tips

### Cold Start Optimization

If cold starts are too slow:
1. Consider pre-warming functions with scheduled requests
2. Upgrade to Vercel Pro for better function performance
3. Pre-generate common OG images at build time

### Cost Optimization

Monitor function invocations:
- Each OG image generation = 1 function invocation
- CDN caching reduces subsequent invocations
- Consider pre-generating images for high-traffic pages

---

**Questions?** Check Vercel logs or contact the development team.
