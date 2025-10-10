import type { Config } from "tailwindcss";

// Tailwind v4 standalone config for cilantro-site
// Avoids depending on workspace-only @knots/tailwind preset/plugin
export default {
  content: ["src/**/*.{astro,md,mdx,svelte,ts,tsx}"],
  theme: { extend: {} },
  presets: [],
  plugins: []
} satisfies Config;