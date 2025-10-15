/**
 * Astro Content Collections Configuration
 *
 * This file aggregates all content collections used across the Cilantro site.
 * Collections are modularized and imported from their respective config files.
 */

// Import changelog collections
import {
  changelogNeo,
  changelogParslee,
  changelogCilantroSite
} from './content/changelogs/changelog.config';

/**
 * Export all collections for Astro to discover
 *
 * Collection names determine the API for accessing content:
 * - 'changelog-neo' → getCollection('changelog-neo')
 * - 'changelog-parslee' → getCollection('changelog-parslee')
 * - 'changelog-cilantro-site' → getCollection('changelog-cilantro-site')
 */
export const collections = {
  // Changelogs
  'changelog-neo': changelogNeo,
  'changelog-parslee': changelogParslee,
  'changelog-cilantro-site': changelogCilantroSite,

  // Future collections can be added here:
  // - Essays, concepts, vocabulary (knowledge base)
  // - Tooling documentation
  // - Project showcases
  // - Client content
};
