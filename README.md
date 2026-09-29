# Portfolio

A monochrome, animated portfolio for an AI/ML engineer. One page, light and dark themes, no color accents: typography, spacing and subtle motion do the work.

All of the content lives in **one file: [`data/info.json`](data/info.json)**. You never need to touch the components to update the site.

## Stack

| Layer | Library |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, static export), React 19, TypeScript |
| Styling | [Tailwind CSS 4](https://tailwindcss.com), [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) |
| UI components | [shadcn/ui](https://ui.shadcn.com) (Radix primitives, "Nova" style, neutral palette): Button, Badge, Card, Avatar, Tooltip, Sheet, Command, Kbd, Sonner |
| Animated components | [Magic UI](https://magicui.design): FlickeringGrid, BlurFade, NumberTicker, DotPattern, AnimatedShinyText |
| Animation | [Motion](https://motion.dev) (formerly Framer Motion) |
| Icons | [lucide-react](https://lucide.dev) for UI icons, [react-icons](https://react-icons.github.io/react-icons/) (Simple Icons) for brand logos |
| Theme / toasts / palette | [next-themes](https://github.com/pacocoursey/next-themes), [sonner](https://sonner.emilkowal.ski), [cmdk](https://cmdk.paco.me) |
| Tooling | [Biome](https://biomejs.dev) (lint + format), TypeScript 6, Node.js 24 LTS |

## Quick start

```bash
npm install
npm run dev     # http://localhost:3000, reloads as you edit info.json
npm run build   # static site in out/
npm start       # preview the built site from out/
npm run resume  # regenerate the resume PDF from info.json
npm run lint    # Biome: lint + formatting check
npm run format  # Biome: format all files
```

Requires Node.js 24 (the current LTS). `package.json` pins `"engines": { "node": "24.x" }`, so Vercel builds on the same version.

> **Windows PowerShell:** if `npm` fails with "running scripts is disabled on this system", run
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use `npm.cmd run dev`.

## What's on the page

- **Animated background:** a grid of small gray squares that softly flicker behind the hero and the contact card. It's drawn on a canvas that pauses when off-screen, and becomes static dots under "reduce motion". Tune `maxOpacity` and `flickerChance` on `<GridBackdrop>` in [`page.tsx`](src/app/page.tsx) and [`contact.tsx`](src/components/sections/contact.tsx), or delete it to remove it.
- **Mouse tracker + sparkles:** a ring follows the pointer with a slight spring. It inverts against whatever is under it, so it works in both themes, grows over links and buttons, and squeezes on click. Small four-point stars trail behind the cursor and burst on click ([`cursor-effects.tsx`](src/components/cursor-effects.tsx)). The native cursor is kept. Mouse and trackpad only; off on touch screens and with "reduce motion". Sparkles draw on one canvas that stops completely when nothing is sparkling.
- **Hero:** availability pill with a shimmer, name/title/location blurring in one after another, avatar, Resume and Email buttons, and social icons with tooltips.
- **Typing bio:** your `profile.bio` types itself out behind a caret on load ([`typewriter.tsx`](src/components/typewriter.tsx)). The full text is always in the page (the untyped part is just transparent), so nothing below it moves, words never jump lines, and search engines and screen readers get the whole bio. Adjust `delay` and `speed` on `<Typewriter>` in [`hero.tsx`](src/components/sections/hero.tsx).
- **Header:** turns frosted once you scroll, shows your name after the hero scrolls away, highlights the current section with a sliding pill, and draws a reading-progress line.
- **⌘K / Ctrl+K command palette:** jump to any section, copy your email, open your resume, switch theme, open your profiles.
- **Theme switch:** the new theme grows out of the button in a circle (View Transitions API). It follows the OS until the visitor picks a theme.
- **Experience and Education:** a timeline whose line draws itself in as you scroll.
- **Projects:** cards with a cursor-following spotlight, metrics that count up when they come into view, and icon links.
- **Skills:** badges with technology logos (PyTorch, Docker, Kubernetes, …).
- **Contact:** a closing call-to-action card; copying the email shows a toast.
- **Phones:** a slide-over menu.

Every animation respects the OS "reduce motion" setting. When the page is printed or JavaScript is off, all content still shows in full: sections appear without their reveal animations and metrics show their final numbers.

## Editing your content

Everything shown on the page comes from `data/info.json`. The build type-checks that file against [`src/lib/types.ts`](src/lib/types.ts), so a misspelled field or wrong type fails `npm run build` with a clear error instead of shipping a broken page.

For a fully filled-in example of every section, see [`data/info.example.json`](data/info.example.json). It's reference only; the site never reads it.

| Key | What it holds |
| --- | --- |
| `settings` | `siteUrl` (your domain), `defaultTheme` (`"system"`, `"light"` or `"dark"`), `sections` (order and visibility) |
| `profile` | `name`, `headline`, `location`, `email`, `avatar`, `status`, `workAuthorization`, `bio`, `resume`, `stats[{ value, label }]` (numbers under the intro); resume-only: `summary`, `phone` |
| `social` | `[{ "label": "GitHub", "url": "…" }, …]`, shown as icons in the intro, contact card, menu and palette |
| `about` | Paragraphs of text |
| `expertise` | "What I work on" cards: `[{ "title": "Computer vision", "description": "…" }, …]`; the icon is picked from the title |
| `experience` | `role`, `company`, `url`, `logo`, `location`, `type`, `start`, `end`, `summary`, `highlights[]`, `tech[]` |
| `projects` | `name`, `description`, `year`, `url`, `metrics[{ value, label }]`, `highlights[]`, `tech[]`, `links[]` |
| `publications` | `title`, `authors[]`, `venue`, `year`, `note` (e.g. "Spotlight"), `url`, `links[]` |
| `writing` | Posts and talks: `title`, `url`, `kind`, `publisher`, `date` |
| `skills` | `[{ "category": "Languages", "items": ["Python", …] }, …]` |
| `education` | `degree`, `school`, `url`, `logo`, `location`, `start`, `end`, `details[]` |
| `certifications`, `awards` | `name`, `issuer`, `date`, `url` |
| `contact` | `heading` (default "Get in touch"), `message`, and `booking` (`{ "label": "Book a call", "url": "…" }`) for the closing card |

Conventions:

- **Dates** are strings: `"2024"`, `"2024-03"` or `"2024-03-15"`. They display as "Mar 2024". Set `end` to `null` (or leave it out) for a current role; it shows as "Present".
- **Hiding things.** Leave out an optional field and it isn't shown. An empty array hides its section. To reorder or remove whole sections, edit `settings.sections`.
- **Metrics** are the numbers a reviewer should see first: `{ "value": "42%", "label": "lower p95 latency" }`. Keep `value` short; the number part counts up.
- **Icons are automatic.** Links get a brand logo from their URL (github.com, linkedin.com, scholar.google.com, huggingface.co, x.com, kaggle.com, arxiv.org, …) or an icon from their label ("Code", "Paper", "Demo", "Docs", "Model", …). Skills get a logo when one exists ([`src/lib/skill-icons.ts`](src/lib/skill-icons.ts)); otherwise a small dot.
- **Publications.** Your name is emphasized in the author list when it matches `profile.name` exactly.
- **Files.** Put your photo in `public/` (e.g. `public/avatar.jpg`) and set `"avatar": "/avatar.jpg"`; company or school logos work the same way through `logo`. Initials are shown when these are empty. The resume PDF is generated by `npm run resume` (see below); set `"resume": ""` to hide the Resume button.

## Resume PDF

```bash
npm run resume
```

This builds an ATS-friendly resume PDF from `data/info.json` and saves it where `profile.resume` points, e.g. `"/Rui_Jin_Resume.pdf"` → `public/Rui_Jin_Resume.pdf`. The site's Resume button links to it. Run it again whenever you change your info, then rebuild or redeploy.

- **Format:** one column, real text, Arial, standard section headings, contact details in the page body, US Letter, plain hyphens in date ranges. Some ATS parsers garble en dashes.
- **Resume-only fields:** `profile.summary` (a short summary written without "I") and `profile.phone` appear only on the PDF. WhatsApp is shown as the phone number, and the header lists your site plus your first three profile links.
- **Requirements:** Chrome, Edge or Chromium must be installed. Set `CHROME_PATH` to use a different browser. The script lives in [`scripts/resume.mjs`](scripts/resume.mjs).

## Generated from `info.json`

Beyond the page itself, the build generates:

- `<title>`, meta description, canonical URL, Open Graph and Twitter/X cards
- `/og.png`: the social preview image (name, title, location)
- `/apple-touch-icon.png`: the favicon and iOS home-screen icon (your initials)
- `/sitemap.xml` and `/robots.txt`
- `/llms.txt`: a plain-Markdown copy of the portfolio for AI assistants and crawlers ([llmstxt.org](https://llmstxt.org))
- schema.org `Person` data (JSON-LD), so search engines can show your name, title and profiles

Set `settings.siteUrl` to your real domain before deploying; all absolute links are built from it.

## Deploying

- **Vercel** (simplest): import the repository at vercel.com/new. No configuration needed.
- **Netlify or Cloudflare Pages**: build command `npm run build`, output directory `out`.
- **GitHub Pages**: deploy the `out` folder with the official "Next.js" Pages workflow. If the site is served from a subpath (`username.github.io/portfolio`), add `basePath: "/portfolio"` to [`next.config.ts`](next.config.ts).

## Project structure

```
data/info.json              your content (the only file you need to edit)
scripts/resume.mjs          builds the resume PDF from info.json (npm run resume)
public/                     resume.pdf, avatar, logos, any other static files
components.json             shadcn/ui configuration
src/app/
  layout.tsx                fonts, metadata, providers
  page.tsx                  renders the sections in settings.sections order
  globals.css               theme tokens (light/dark), print styles
  og.png/  apple-touch-icon.png/  llms.txt/  sitemap.ts  robots.ts
src/components/
  ui/                       shadcn/ui and Magic UI components (added with the shadcn CLI)
  sections/                 one component per section
  header.tsx  footer.tsx  command-menu.tsx  mobile-nav.tsx  theme-toggle.tsx
  section.tsx  timeline.tsx  entry.tsx  spotlight-card.tsx  metric.tsx  grid-backdrop.tsx  typewriter.tsx  cursor-effects.tsx
  social-links.tsx  link-buttons.tsx  copy-email-button.tsx  providers.tsx
src/hooks/use-active-section.ts   which section is on screen (header highlight)
src/lib/
  info.ts                   loads and validates info.json
  types.ts                  the info.json schema
  link-icons.ts  skill-icons.ts  metrics.ts  format.ts  theme.ts  json-ld.ts  clipboard.ts  monogram.tsx
```

### Adding more components

```bash
npx shadcn@latest add accordion            # any shadcn/ui component
npx shadcn@latest add @magicui/marquee     # any Magic UI component
```

Components land in `src/components/ui/` and are yours to edit. Four have local changes, each marked with a comment:

- `flickering-grid`: redraws only the squares that change, which cuts the main-thread cost from ~60% to under 1%. Same props and look.
- `dot-pattern`: static dots use one SVG pattern, and glow timing is deterministic.
- `number-ticker`: a spring that lands exactly on the value, using the theme color.
- `blur-fade`: a `data-slot` attribute used by the print and no-JavaScript styles.

## Design notes

- **Color.** Every color comes from the shadcn/ui "neutral" tokens in [`src/app/globals.css`](src/app/globals.css). All of them are pure grays (OKLCH chroma 0), defined once for light and once for dark. Secondary text is darkened slightly from the shadcn default so it meets WCAG AA contrast in both themes.
- **Type.** Geist Sans for prose; Geist Mono for data such as dates, tags and metrics.
- **Motion.** The hero entrance is pure CSS (tw-animate-css), so it plays from the first paint. Scroll reveals, the timeline, the header and number tickers use Motion.
- **Print.** Printing the page (Ctrl/Cmd + P) produces a clean black-on-white resume without the header or buttons.
- **Accessibility.** Semantic landmarks, a skip link, focus rings, labelled icon buttons, a screen-reader-friendly command palette, and reduced-motion support.

## Versions

Everything is on its latest release except where the newest major version doesn't work with Next.js 16.3 yet. A clean install prints no warnings.

- **Biome instead of ESLint.** ESLint 9 is end-of-life, and Next's ESLint config (`eslint-config-next`) depends on plugins that don't support ESLint 10 yet. Biome is the alternative that `create-next-app` offers, and this project uses the same setup. A few deliberate exceptions are marked in the code with `biome-ignore` comments explaining why.
- **TypeScript 6, not 7.** TypeScript 7 is the new native compiler and drops the JavaScript API that `next build` uses for type-checking. Next 16.3 itself installs `typescript@^6`. Upgrade once Next supports 7.
- **Node.js 24.x.** This is the current LTS. Vercel warns about open-ended ranges like `>=20`, so the major version is pinned. Move to `26.x` once Node 26 becomes LTS in October 2026. `@types/node` follows the same major version.

## Contact: ruijin.developer@gmail.com
