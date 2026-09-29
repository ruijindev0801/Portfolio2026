import {
  BookOpen,
  Box,
  Code,
  Database,
  FileText,
  Globe,
  Link as LinkIcon,
  Mail,
  Mic,
  PenLine,
  Play,
  Podcast,
  Presentation,
  Video,
} from "lucide-react";
import type { ComponentType } from "react";
import { FaKaggle, FaLinkedin } from "react-icons/fa6";
import {
  SiArxiv,
  SiBluesky,
  SiGithub,
  SiGooglescholar,
  SiHuggingface,
  SiLeetcode,
  SiMedium,
  SiOrcid,
  SiResearchgate,
  SiSubstack,
  SiUpwork,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";

/** Any icon component: lucide-react and react-icons both accept `className`. */
export type Icon = ComponentType<{ className?: string }>;

// Brand logos, matched against the link's host.
const BRANDS: [RegExp, Icon][] = [
  [/(^|\.)github\.com$/, SiGithub],
  [/(^|\.)linkedin\.com$/, FaLinkedin],
  [/^scholar\.google\./, SiGooglescholar],
  [/(^|\.)huggingface\.co$/, SiHuggingface],
  [/(^|\.)(x|twitter)\.com$/, SiX],
  [/(^|\.)kaggle\.com$/, FaKaggle], // Simple Icons' Kaggle logo is a wordmark, unreadable at icon size
  [/(^|\.)arxiv\.org$/, SiArxiv],
  [/(^|\.)medium\.com$/, SiMedium],
  [/(^|\.)(youtube\.com|youtu\.be)$/, SiYoutube],
  [/(^|\.)substack\.com$/, SiSubstack],
  [/(^|\.)orcid\.org$/, SiOrcid],
  [/(^|\.)bsky\.app$/, SiBluesky],
  [/(^|\.)researchgate\.net$/, SiResearchgate],
  [/(^|\.)leetcode\.com$/, SiLeetcode],
  [/(^|\.)upwork\.com$/, SiUpwork],
  [/^(wa\.me|(api\.|web\.)?whatsapp\.com)$/, SiWhatsapp],
];

// Fallback by label, for links on your own domain or anywhere else.
const LABELS: [RegExp, Icon][] = [
  [/github/i, SiGithub],
  [/linkedin/i, FaLinkedin],
  [/scholar/i, SiGooglescholar],
  [/hugging ?face/i, SiHuggingface],
  [/^x$|twitter/i, SiX],
  [/kaggle/i, FaKaggle],
  [/whatsapp/i, SiWhatsapp],
  [/arxiv/i, SiArxiv],
  [/^(code|source|repo)/i, Code],
  [/paper|pdf|preprint/i, FileText],
  [/demo|playground|app\b/i, Play],
  [/docs|documentation/i, BookOpen],
  [/model|weights|checkpoint/i, Box],
  [/data(set)?/i, Database],
  [/slides|deck/i, Presentation],
  [/video|recording/i, Video],
  [/write-?up|blog|post|article/i, PenLine],
  [/e-?mail/i, Mail],
  [/website|homepage|site/i, Globe],
  [/^[\w-]+(\.[\w-]+)+$/, Globe], // a label that is itself a domain, e.g. "example.com"
];

function host(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Icon for a link: brand logo from the URL, else a hint from the label, else a generic link. */
export function linkIcon(label: string, url: string): Icon {
  const h = host(url);
  return (
    BRANDS.find(([pattern]) => pattern.test(h))?.[1] ??
    LABELS.find(([pattern]) => pattern.test(label))?.[1] ??
    LinkIcon
  );
}

/** Icon for an entry in "Writing & Talks", from its `kind`. */
export function writingIcon(kind = ""): Icon {
  if (/talk|keynote|lecture|presentation/i.test(kind)) return Mic;
  if (/podcast/i.test(kind)) return Podcast;
  if (/video/i.test(kind)) return Video;
  if (/paper/i.test(kind)) return FileText;
  return PenLine;
}
