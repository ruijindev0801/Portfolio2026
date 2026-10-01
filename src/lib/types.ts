// Shape of data/info.json. `src/lib/info.ts` assigns the JSON to `Info`,
// so `npm run build` fails with a clear type error if a field is misspelled
// or has the wrong type.
//
// Dates are strings: "YYYY", "YYYY-MM" or "YYYY-MM-DD".

/** Icons are picked automatically from the URL (github.com, huggingface.co, …) or the label. */
export type Link = {
  label: string;
  url: string;
};

/** A profile link. `hidden: true` keeps it in info.json but off the site and the resume. */
export type SocialLink = Link & { hidden?: boolean };

export type Profile = {
  name: string;
  /** Job title shown under your name, e.g. "Machine Learning Engineer". */
  headline: string;
  /** "City, ST" — e.g. "San Francisco, CA". */
  location?: string;
  email?: string;
  /** Path to a square photo in /public (e.g. "/avatar.jpg"). Initials are shown when empty. */
  avatar?: string;
  /** Short availability line, e.g. "Open to senior ML engineering roles". Hidden when empty. */
  status?: string;
  /** Optional, e.g. "U.S. Citizen". Hidden when empty. */
  workAuthorization?: string;
  /** One to three sentences shown at the top of the page. */
  bio: string;
  /** Path to a PDF in /public (e.g. "/resume.pdf") or an external URL. `npm run resume` writes it. */
  resume?: string;
  /** Resume PDF only: a 2–3 sentence professional summary, written without "I". */
  summary?: string;
  /** Resume PDF only (not shown on the site). */
  phone?: string;
  /** The tools you're best known for, shown with their logos in the intro's profile card. */
  mainTech?: string[];
};

/** A card in the "What I work on" section. Its icon is picked from the title (vision, device, MLOps, LLM, ...). */
export type FocusArea = {
  title: string;
  description: string;
};

/** The "What I'm doing now" section, and the "Now" line of the intro's profile card. */
export type Now = {
  /** Short, e.g. "AI training & LLM evaluation". */
  title: string;
  description: string;
  /** "YYYY-MM", shown as "Since Mar 2025". */
  since?: string;
  /** The steps of the work. Each icon is picked from its title (write, grade, data, ...). */
  points?: { title: string; text: string }[];
  /** Where the work happens, e.g. the platforms. */
  links?: Link[];
};

/** "Fun facts": a few personal notes and favorite quotes. Icons come from the title (coffee, book, ...). */
export type FunFacts = {
  facts?: { title: string; text: string }[];
  quotes?: { text: string; author?: string }[];
};

export type Experience = {
  role: string;
  company: string;
  url?: string;
  /** Square company logo in /public (e.g. "/logos/northwind.png"). Initials are shown when empty. */
  logo?: string;
  location?: string;
  /** "Full-time", "Contract", "Internship", "Remote", ... */
  type?: string;
  start: string;
  /** Omit or set to null while you still work there. */
  end?: string | null;
  summary?: string;
  highlights?: string[];
  tech?: string[];
};

export type Metric = {
  /** The number, kept short: "42%", "11×", "$1.2M". */
  value: string;
  label: string;
};

export type Project = {
  name: string;
  description: string;
  year?: string | number;
  /** Short tag shown on the card, e.g. "Client work · NDA" for projects that can't be linked. */
  note?: string;
  /** Where the project title links to. Falls back to the first entry in `links`. */
  url?: string;
  metrics?: Metric[];
  highlights?: string[];
  tech?: string[];
  links?: Link[];
};

export type Publication = {
  title: string;
  /** Your name is emphasized when it matches `profile.name` exactly. */
  authors: string[];
  venue: string;
  year: string | number;
  /** "Oral", "Spotlight", "Best Paper", ... */
  note?: string;
  url?: string;
  links?: Link[];
};

export type Writing = {
  title: string;
  url: string;
  /** "Post", "Talk", "Podcast", ... */
  kind?: string;
  /** Blog, publication, conference or meetup. */
  publisher?: string;
  date: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type Education = {
  degree: string;
  school: string;
  url?: string;
  /** Square school logo in /public. Initials are shown when empty. */
  logo?: string;
  location?: string;
  start?: string;
  end?: string | null;
  details?: string[];
};

export type Credential = {
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
};

export type Settings = {
  /** Production URL, used for canonical links, Open Graph and the sitemap. */
  siteUrl: string;
  /** "system" (default), "light" or "dark" — the theme before a visitor picks one. */
  defaultTheme?: string;
  /** Section order. Leave a key out to hide that section. */
  sections: string[];
};

export type Info = {
  settings: Settings;
  profile: Profile;
  social?: SocialLink[];
  now?: Now;
  about?: string[];
  /** The live pose-tracking demo on the right of the intro (camera, runs in the browser). `description` is its caption. */
  demo?: { description: string };
  funFacts?: FunFacts;
  expertise?: FocusArea[];
  experience?: Experience[];
  projects?: Project[];
  publications?: Publication[];
  writing?: Writing[];
  skills?: SkillGroup[];
  education?: Education[];
  certifications?: Credential[];
  awards?: Credential[];
  contact?: {
    /** Heading of the closing call-to-action card. Defaults to "Get in touch". */
    heading?: string;
    message?: string;
    /** Scheduling link (Calendly, Cal.com, ...) shown as a button next to the email. */
    booking?: Link;
  };
};
