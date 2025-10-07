import type { Config } from "tailwindcss";
import preset from "@knots/tailwind/preset.mjs";
import plugin from "@knots/tailwind/plugin.mjs";

// Tailwind v4 config for cilantro-site, consuming shared preset/plugin
export default {
  content: ["src/**/*.{astro,md,mdx,svelte,ts,tsx}"],
  presets: [preset],
  plugins: [plugin],
  theme: { extend: {} }
} satisfies Config;