import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'

// https://docs.astro.build/en/guides/integrations-guide/tailwind/#tailwind-v4
export default defineConfig({
  vite: {
    plugins: [tailwind()]
  }
})
