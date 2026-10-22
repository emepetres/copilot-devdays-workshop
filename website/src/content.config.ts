import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Lessons live as plain Markdown in the repo-root `lessons/` folder, readable on
// github.com without a build. We use Astro's `glob()` loader (instead of
// Starlight's `docsLoader()`) to point at that folder and to exclude
// underscore-prefixed directories such as `_images/`.
export const collections = {
  docs: defineCollection({
    loader: glob({
      base: '../lessons',
      pattern: ['**/*.{md,mdx}', '!**/_*/**', '!**/_*'],
    }),
    schema: docsSchema(),
  }),
};
