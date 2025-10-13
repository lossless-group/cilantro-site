import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

// https://docs.astro.build/en/guides/integrations-guide/tailwind/#tailwind-v4
// Detect if we're in the monorepo with local workspace packages available.
const workspaceRootUrl = new URL('../../..', import.meta.url)
const workspacePackagesUrl = new URL('../../packages', import.meta.url)
const tokensCssUrl = new URL('../../packages/tokens/css', import.meta.url)
const brandConfigSrcUrl = new URL('../../packages/brand-config/src', import.meta.url)
const hasWorkspaceTokensCss = existsSync(fileURLToPath(tokensCssUrl))
const hasWorkspaceBrandConfig = existsSync(fileURLToPath(brandConfigSrcUrl))

// Build aliases conditionally so standalone deployments don't depend on monorepo paths.
const aliases = {
  '@brand': fileURLToPath(new URL('./src/config/brand.ts', import.meta.url)),
  '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
  '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
  '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
  '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
  '@base': fileURLToPath(new URL('./src/base', import.meta.url)),
  '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
  ...(hasWorkspaceTokensCss
    ? { '@knots/tokens/css': fileURLToPath(tokensCssUrl) }
    : {}),
  ...(hasWorkspaceBrandConfig
    ? { '@knots/brand-config': fileURLToPath(brandConfigSrcUrl) }
    : {})
}

export default defineConfig({
  vite: {
    plugins: [tailwind()],
    // In monorepo dev, allow reading shared packages; omit in standalone.
    server: hasWorkspaceTokensCss
      ? {
          fs: {
            allow: [
              fileURLToPath(workspaceRootUrl),
              fileURLToPath(workspacePackagesUrl)
            ]
          }
        }
      : undefined,
    resolve: {
      alias: aliases
    }
  }
})
