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
      title: 'Construye tu Engineering Reviewer',
      description:
        'Workshop práctico de GitHub Copilot en VS Code: instrucciones, skills, MCP y agentes. GitHub Copilot Dev Days Sevilla.',
      // Spanish only: no i18n, just the root locale.
      locales: {
        root: { label: 'Español', lang: 'es' },
      },
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
      // Maintained by hand: the order here is the order attendees see.
      sidebar: [
        { label: 'Inicio', link: '/' },
        {
          label: 'Lecciones',
          items: [
            { label: '0 · Prerrequisitos', link: '/0-prerrequisitos/' },
            { label: '1 · Custom instructions', link: '/1-custom-instructions/' },
            { label: '2 · Agent mode', link: '/2-agent-mode/' },
            { label: '3 · El flujo de Matt Pocock', link: '/3-flujo-matt-pocock/' },
            { label: '4 · Una skill que analiza imágenes', link: '/4-skill-imagenes/' },
            { label: '5 · Playwright MCP', link: '/5-playwright-mcp/' },
            { label: '6 · El Engineering Reviewer con Docling MCP', link: '/6-engineering-reviewer/' },
            { label: 'Extra · Orquestación por código', link: '/extra-orquestacion/' },
          ],
        },
      ],
    }),
  ],
});
