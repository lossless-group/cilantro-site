# Cilantro Site

Seed site for new AI core technology, which parses documents and creates a Context AST. 

## Made with Astro Knots. 
[The Lossless Group](https://www.lossless.group/)’s multi‑site Astro starter is called [Astro Knots](https://github.com/lossless-group/astro-knots.git). 

Astro-Knots demonstrates:
- Documentation-driven development with AI-Code Assistants: write docs, get code.
- Environment‑driven configuration: flip site modes and brand via `.env` and config files.
- Opinionated theming with design tokens: consistent branding across sites.
- Vigilant configuration with Tailwind: catch errors early.
- Component reuse or adaptability: build sites quickly.
- Optimized for multi‑site reuse: a small set of env and config switches change brand, theme, content focus, and component presence without forking code.
- Fast standing‑up new sites: clone the seed, wire brand/content, deploy.

## Cilantro local development

To run the site locally, clone the repo and run `pnpm dev`.

## Overview

- Built with Astro, using Svelte where interactivity makes sense.
- Avoidant of React patterns and JSX, TSX syntax in clean Astro.
- Preference from HTML > CSS > Astro > JavaScript > Svelte.  If it can be done with cannonical code, do it with cannonical code.  
- Designed to consume shared packages (tokens, Tailwind presets, component library, brand config, icons) from the `astro-knots` ecosystem.
- Lives as a Git submodule under `astro-knots/sites/cilantro-site` and as a standalone repo.

## Goals

- Environment‑first theme customization: flip site modes and brand via `.env` and config files, which enable rapid theming and multi-branding.
- Strong theming: design tokens map to Tailwind and CSS variables, enabling consistent branding.
- Reusable components: Svelte + Astro building blocks that can be themed without duplication.

## Repo Layout

- `src/` — pages, layouts, components, styles, and config.
- `public/` — static assets.
- `.env.example` — example environment variables (copy to `.env`).
- `package.json` — Astro scripts and dependencies.

Exact layout may evolve as the starter grows; prefer adding brand/mode switches under `src/config/` and centralizing theme tokens under `src/styles/`.

## Getting Started

Prereqs

- `node >= 18`
- `pnpm >= 8`

Install and run

- Install: `pnpm install`
- Dev server: `pnpm dev` then open `http://localhost:4321/`
- Build: `pnpm build` (outputs to `dist/`)

## Configuration Model

- `.env` — top‑level toggles and secrets; use `.env.example` as reference.
- `src/config/*` — site configuration (brand, theme, feature flags, content mode).
- `src/styles/*` — CSS variables and Tailwind setup sourced from design tokens.

Recommended variables

- `SITE_BRAND` — brand key (e.g. `cilantro`).
- `SITE_MODE` — site mode (e.g. `dark`, `light`, `vibrant`).
- `FEATURE_FLAGS` — comma‑separated flags (e.g. `search,  blog, changelog, `).

These are suggestions; wire them to your runtime as needed.

## Theming and Tokens

Consume shared theming from `astro-knots` packages to avoid drift:

- `@knots/tokens` — design tokens (colors, spacing, typography) exported for CSS/Tailwind.
- `@knots/tailwind` — Tailwind preset and utilities wired to tokens.
- `@knots/icons` — icon set with consistent naming.
- `@knots/brand-config` — brand metadata (logos, palettes, tone) referenced by `SITE_BRAND`.

Example usage

- Add deps (standalone): `pnpm add -D @knots/tailwind @knots/tokens @knots/icons @knots/brand-config`
- In `tailwind.config.cjs`, extend with the preset: `presets: [require('@knots/tailwind').preset]`
- In `src/styles/base.css`, import token CSS variables: `@import '@knots/tokens/css/variables.css';`
- Use brand config at runtime to select palette/assets based on `SITE_BRAND`.

## Component Architecture

- Astro layouts compose site shells; Svelte components handle interactivity.
- Components read brand/theme via context or props; avoid hardcoding colors.
- Prefer slots and small compositional pieces over monolith components.

## Content and Modes

- Content lives under `src/content/` (MD/MDX), or sourced via adapters.
- Modes (e.g. marketing vs docs) toggle routes/layouts/components via `SITE_MODE`.
- Optional: integrate a docs subsystem (e.g. Starlight) behind a flag.

## Working With Shared Packages

There are two ways to consume `@knots/*`:

- Same workspace (recommended in `lossless-monorepo`): add the site to `pnpm-workspace.yaml` and reference packages directly. This gives local dev on tokens/components.
- Separate repo: depend on published versions or use `file:` links pointing to a Git submodule directory in the parent monorepo.

If using workspace, run commands from the monorepo root to leverage hoisted installs.

## Submodule Notes

- Cilantro is a Git submodule under `astro-knots/sites/cilantro-site` and tracks `main`.
- Parent repo commands:
  - Initialize: `git submodule update --init sites/cilantro-site`
  - Sync config: `git submodule sync`
  - Update to latest remote: `git submodule update --remote sites/cilantro-site`
- Commit changes inside the submodule root. Then return to parent and commit the gitlink change.

## Create a New Site From Cilantro

- In GitHub: create a new repo (e.g. `parslee-site`).
- In parent monorepo: add as submodule: `git submodule add https://github.com/lossless-group/parslee-site.git astro-knots/sites/parslee-site`
- Copy initial config/content from Cilantro; adjust `SITE_BRAND`, theme tokens, and assets.
- Optionally add `astro-knots/sites/parslee-site` to `pnpm-workspace.yaml` for local package linking.

## Development

- Lint: `pnpm lint`
- Format: `pnpm format`
- Typecheck: `pnpm typecheck`
- Preview: `pnpm preview`

Scripts may vary; see `package.json` for the authoritative list.

## Deployment

- Static build via `pnpm build`; deploy `dist/` to your provider (Vercel/Netlify/etc.).
- Environment variables should be configured in the host (CI or platform) to select brand/mode.

## Troubleshooting

- Folder shows red in the parent repo: the submodule isn’t initialized or has local changes. Run `git submodule update --init` and commit inside the submodule.
- Shared package resolution fails: ensure workspace membership or correct package versions.
- Theme not applying: verify token CSS is imported and Tailwind preset is configured.

## Links

- Cilantro repo: https://github.com/lossless-group/cilantro-site

## License

See `LICENSE` in the repository.
