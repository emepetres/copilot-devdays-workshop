// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkGithubAdmonitionsToDirectives from 'remark-github-admonitions-to-directives';

// Lessons use GitHub admonition syntax (`> [!NOTE]`) so callouts also render on
// github.com. This remark plugin turns them into Starlight asides at build time.
const githubAdmonitionMapping = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'note',
  WARNING: 'caution',
  CAUTION: 'caution',
};

// The base workshop (VS Code track of Real-world development) is used as is,
// from its published site.
const baseWorkshopUrl =
  'https://github-samples.github.io/copilot-workshops/real-world-development/vscode/';

/**
 * Sidebar entry for a base exercise: an external link, badged so it stands out
 * from the mod lessons.
 * @param {string} label
 * @param {string} slug
 * @param {string} [badge]
 */
const baseExercise = (label, slug, badge = 'base') => ({
  label,
  link: `${baseWorkshopUrl}${slug}/`,
  badge: { text: badge, variant: /** @type {const} */ ('note') },
});

// https://astro.build/config
export default defineConfig({
  site: 'https://emepetres.github.io',
  base: '/copilot-devdays-workshop',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [
      [remarkGithubAdmonitionsToDirectives, { mapping: githubAdmonitionMapping }],
    ],
  },
  integrations: [
    starlight({
      title: 'Build your Engineering Reviewer',
      description:
        "A mod of the GitHub Copilot Dev Days workshop: Matt Pocock's workflow, a skill that reads images and an Engineering Reviewer with Docling MCP, in VS Code.",
      // English only: no i18n, just the root locale, matching the base workshop.
      locales: {
        root: { label: 'English', lang: 'en' },
      },
      customCss: ['./src/styles/custom.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/emepetres/copilot-devdays-workshop',
        },
      ],
      // Lessons live outside `src/content/docs`, so Starlight's Markdown
      // plugins (asides, heading links) must be told to process them.
      markdown: {
        processedDirs: ['../lessons'],
      },
      editLink: {
        baseUrl: 'https://github.com/emepetres/copilot-devdays-workshop/edit/main/lessons/',
      },
      // Maintained by hand: the order here is the itinerary attendees follow.
      // Base exercises link out to the base site; mod lessons are local pages.
      sidebar: [
        { label: 'Home', link: '/' },
        {
          label: 'Itinerary',
          items: [
            baseExercise('Exercise 0 · Prerequisites', '0-prerequisites'),
            { label: 'Extra prerequisites', link: '/prerequisites/' },
            baseExercise('Exercise 1 · Custom instructions', '1-custom-instructions'),
            baseExercise('Exercise 2 · Agent mode', '2-agent-mode'),
            { label: "Matt Pocock's workflow", link: '/pocock-workflow/' },
            baseExercise('Exercise 3 · Playwright MCP', '3-mcp', 'base · skippable'),
            { label: 'A skill that reads images', link: '/image-skill/' },
            { label: 'The Engineering Reviewer with Docling MCP', link: '/engineering-reviewer/' },
            { label: 'Extra: orchestration in code', link: '/extra-orchestration/' },
          ],
        },
      ],
    }),
  ],
});
