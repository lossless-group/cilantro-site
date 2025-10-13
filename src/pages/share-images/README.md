# Dynamic Social Share Image System

This directory contains Astro templates for generating dynamic Open Graph (OG) images on-the-fly. The system allows the marketing team to create and customize social share images using HTML/CSS in Astro components, with content dynamically inserted via URL parameters.

## 🎨 How It Works

1. **Edit Astro Templates** - Create or modify `.astro` templates in this directory
2. **Preview in Browser** - Astro renders templates as HTML pages for live preview
3. **Generate Images** - API endpoint uses Playwright to screenshot the rendered page
4. **Automatic Caching** - Generated images are cached for performance

## 📁 File Structure

```
src/pages/share-images/
├── README.md                         # This file
├── social-share-banner.astro         # Main banner template (Astro component)
└── [your-custom-template].astro      # Add more templates here

public/generated-og/                  # Auto-generated images (cached)
└── [hash].webp                       # Cached image files
```

## 🚀 Quick Start

### Preview a Template

Astro renders the template as an HTML page:

```
http://localhost:4321/share-images/social-share-banner
```

Add URL parameters to test dynamic content:

```
http://localhost:4321/share-images/social-share-banner?title=New+Feature+Launch&highlight=New+Feature&subtitle=AI+Platform
```

### Generate an Image

Use the API endpoint to generate a WebP image:

```
http://localhost:4321/api/og-image?template=social-share-banner&title=Your+Title&highlight=Your+Highlight&subtitle=Your+Subtitle
```

## 📝 Available Templates

### `social-share-banner.html`

**Dimensions:** 1200×630px (standard social media)

**Supported Parameters:**
- `title` - Main tagline text
- `highlight` - Text portion to highlight with gradient
- `subtitle` - Footer card text

**Example Usage:**

```html
<!-- In your page's <head> tag -->
<meta property="og:image" content="/api/og-image?template=social-share-banner&title=The missing Context Layer&highlight=missing Context Layer&subtitle=Document AI Platform" />
```

## 🎯 Creating Custom Templates

### Step 1: Create HTML File

Save your template in `/public/share-images/your-template-name.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your Template - 1200x630</title>
  <style>
    .banner {
      width: 1200px;
      height: 630px;
      /* Your styles here */
    }
    #dynamic-title {
      /* Element that will be updated via URL params */
    }
  </style>
</head>
<body>
  <div class="banner">
    <h1 id="dynamic-title">Default Title</h1>
  </div>

  <script>
    // Read URL parameters and update content
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title');
    if (title) {
      document.getElementById('dynamic-title').textContent = title;
    }
  </script>
</body>
</html>
```

### Step 2: Preview Your Template

```
http://localhost:4321/share-images/your-template-name.html?title=Test
```

### Step 3: Generate Images

```
http://localhost:4321/api/og-image?template=your-template-name&title=Test
```

## 💡 Best Practices

### Design Guidelines

✅ **Do:**
- Use standard dimensions: 1200×630px (Twitter, LinkedIn, Facebook)
- Design at 2x resolution for retina displays
- Use web-safe fonts or include font files
- Keep text readable at small sizes
- Use high contrast for accessibility
- Test on dark mode browsers

❌ **Don't:**
- Put critical info near edges (safe zone: 100px padding)
- Use tiny fonts (minimum 24px for body text)
- Rely on external resources that may fail to load
- Use animations (screenshots are static)

### Performance Tips

- **Cache is automatic** - Identical URLs return cached images
- **Clear cache** - Delete files in `/public/generated-og/`
- **Optimize assets** - Keep SVGs and images small
- **Use system fonts** when possible for faster rendering

### URL Parameter Safety

The system automatically URL-encodes parameters. Use these encodings:

| Character | Encoded |
|-----------|---------|
| Space     | `+` or `%20` |
| &         | `%26` |
| =         | `%3D` |
| ?         | `%3F` |

**Example:**
```
?title=AI+%26+Machine+Learning
```

## 🔧 Advanced Usage

### Dynamic Content from CMS

```typescript
// In your Astro page
---
const title = post.title;
const subtitle = post.category;
const ogImageUrl = `/api/og-image?template=social-share-banner&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle)}`;
---

<meta property="og:image" content={ogImageUrl} />
```

### A/B Testing Different Designs

Create multiple templates and switch between them:

```html
<!-- Template A: Bold and colorful -->
<meta property="og:image" content="/api/og-image?template=banner-bold&title=..." />

<!-- Template B: Minimal and clean -->
<meta property="og:image" content="/api/og-image?template=banner-minimal&title=..." />
```

### Custom Styling per Category

Pass additional parameters for styling:

```html
<!-- In your template -->
<script>
  const theme = params.get('theme'); // 'dark', 'light', 'brand'
  if (theme === 'dark') {
    document.body.classList.add('theme-dark');
  }
</script>
```

## 🐛 Troubleshooting

### Images not generating?

1. **Check the API endpoint logs** - Look for errors in terminal
2. **Verify template exists** - File must be in `/public/share-images/`
3. **Test template directly** - Open HTML file in browser first
4. **Check Playwright installation** - Run `pnpm playwright install chromium`

### Styles look different?

- Playwright uses Chromium - test in Chrome for consistency
- External resources (fonts, images) must be accessible
- Use inline styles or `<style>` tags, not external CSS

### Cache not working?

- Cache key is generated from URL parameters
- Change any parameter to generate new image
- Delete `/public/generated-og/` to force regeneration

## 📚 Reference

### Standard Social Media Sizes

| Platform   | Recommended Size | Aspect Ratio |
|------------|------------------|--------------|
| Twitter    | 1200×675         | 16:9        |
| Facebook   | 1200×630         | 1.91:1      |
| LinkedIn   | 1200×627         | 1.91:1      |
| Instagram  | 1080×1080        | 1:1         |

### Useful Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## 🎓 Examples

### Blog Post Share Image

```typescript
// pages/blog/[slug].astro
---
const { title, author, category } = post;
const ogImage = `/api/og-image?template=blog-post&title=${encodeURIComponent(title)}&subtitle=by ${encodeURIComponent(author)}&category=${encodeURIComponent(category)}`;
---

<head>
  <meta property="og:image" content={ogImage} />
  <meta name="twitter:image" content={ogImage} />
</head>
```

### Event Announcement

```typescript
const ogImage = `/api/og-image?template=event&title=${event.name}&subtitle=${event.date}&highlight=${event.type}`;
```

### Product Launch

```typescript
const ogImage = `/api/og-image?template=product&title=${product.name}&subtitle=Now Available&highlight=${product.price}`;
```

## 🤝 Need Help?

- **Development Team** - For API or technical issues
- **This README** - For template creation and usage
- **Design System** - For brand colors, fonts, and guidelines

---

**Last Updated:** 2025-01-13
**Version:** 1.0.0
