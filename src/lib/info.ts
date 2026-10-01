import data from "../../data/info.json";
import { normalizeThemePreference } from "./theme";
import type { Info } from "./types";

// Assigning the JSON to `Info` makes TypeScript validate data/info.json at build time.
const raw: Info = data;

/** info.json with hidden profile links already removed, so no page has to filter them. */
export const info: Info = { ...raw, social: raw.social?.filter((link) => !link.hidden) };

export const SECTIONS = {
  now: { title: "What I'm doing now", nav: "Now" },
  about: { title: "About", nav: null },
  expertise: { title: "What I work on", nav: null },
  experience: { title: "Experience", nav: "Experience" },
  projects: { title: "Projects", nav: "Projects" },
  publications: { title: "Publications", nav: "Publications" },
  writing: { title: "Writing & Talks", nav: "Writing" },
  skills: { title: "Skills", nav: null },
  education: { title: "Education", nav: null },
  certifications: { title: "Certifications", nav: null },
  awards: { title: "Awards", nav: null },
  fun: { title: "Fun facts", nav: null },
  contact: { title: "Contact", nav: "Contact" },
} as const;

export type SectionKey = keyof typeof SECTIONS;

function isSectionKey(key: string): key is SectionKey {
  if (Object.hasOwn(SECTIONS, key)) return true;
  console.warn(`[info.json] Unknown section "${key}" in settings.sections — skipped.`);
  return false;
}

function hasContent(key: SectionKey): boolean {
  if (key === "contact") {
    return Boolean(info.profile.email || info.contact?.message || info.social?.length);
  }
  if (key === "now") return Boolean(info.now);
  if (key === "fun") return Boolean(info.funFacts?.facts?.length || info.funFacts?.quotes?.length);
  const value = info[key];
  return Array.isArray(value) && value.length > 0;
}

/** Sections to render, in the order given by `settings.sections`, skipping empty ones. */
export const sections: SectionKey[] = info.settings.sections.filter(isSectionKey).filter(hasContent);

export const navItems = sections.flatMap((key) => {
  const label = SECTIONS[key].nav;
  return label ? [{ id: key, label }] : [];
});

export const themePreference = normalizeThemePreference(info.settings.defaultTheme);
