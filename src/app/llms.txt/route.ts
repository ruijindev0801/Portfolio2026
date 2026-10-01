import { formatDate, formatRange } from "@/lib/format";
import { info, SECTIONS, type SectionKey, sections } from "@/lib/info";
import type { Link } from "@/lib/types";

// Plain-Markdown version of the portfolio for AI assistants and crawlers (https://llmstxt.org).
// Generated at build time from data/info.json, so it never drifts from the site.
export const dynamic = "force-static";

// Absolute URLs: this file is read outside the site, where "/certificates/…" means nothing.
const link = (label: string, url?: string) => (url ? `[${label}](${new URL(url, info.settings.siteUrl).href})` : label);
const joinLinks = (links?: Link[]) => (links?.length ? ` (${links.map((l) => link(l.label, l.url)).join(", ")})` : "");

function section(key: SectionKey): string[] {
  switch (key) {
    case "now":
      return info.now
        ? [
            `**${info.now.title}**${info.now.since ? ` (since ${formatDate(info.now.since)})` : ""}${joinLinks(info.now.links)}`,
            "",
            info.now.description,
            ...(info.now.points ?? []).map((point) => `- ${point.title}: ${point.text}`),
          ]
        : [];
    case "fun":
      return [
        ...(info.funFacts?.facts ?? []).map((fact) => `- ${fact.title}: ${fact.text}`),
        ...(info.funFacts?.quotes ?? []).map((quote) => `- "${quote.text}"${quote.author ? ` (${quote.author})` : ""}`),
      ];
    case "about":
      return (info.about ?? []).flatMap((paragraph, i) => (i ? ["", paragraph] : [paragraph]));
    case "expertise":
      return (info.expertise ?? []).map((area) => `- ${area.title}: ${area.description}`);
    case "experience":
      return (info.experience ?? []).flatMap((job) => [
        `- **${job.role}**, ${link(job.company, job.url)} — ${formatRange(job.start, job.end)}${job.location ? `, ${job.location}` : ""}`,
        ...(job.summary ? [`  ${job.summary}`] : []),
        ...(job.highlights ?? []).map((item) => `  - ${item}`),
      ]);
    case "projects":
      return (info.projects ?? []).map((project) => {
        const results = project.metrics?.map((m) => `${m.value} ${m.label}`).join("; ");
        return `- **${link(project.name, project.url ?? project.links?.[0]?.url)}**${project.note ? ` (${project.note})` : ""}: ${project.description}${results ? ` Results: ${results}.` : ""}`;
      });
    case "publications":
      return (info.publications ?? []).map(
        (paper) =>
          `- ${link(paper.title, paper.url)}. ${paper.authors.join(", ")}. *${paper.venue}*, ${paper.year}.${joinLinks(paper.links)}`,
      );
    case "writing":
      return (info.writing ?? []).map(
        (item) =>
          `- ${link(item.title, item.url)} — ${[item.kind, item.publisher, formatDate(item.date)].filter(Boolean).join(", ")}`,
      );
    case "skills":
      return (info.skills ?? []).map((group) => `- ${group.category}: ${group.items.join(", ")}`);
    case "education":
      return (info.education ?? []).map(
        (school) => `- ${school.degree}, ${school.school} (${formatRange(school.start, school.end)})`,
      );
    case "certifications":
    case "awards":
      return (info[key] ?? []).map(
        (item) =>
          `- ${link(item.name, item.url)}${item.issuer ? `, ${item.issuer}` : ""}${item.date ? ` (${formatDate(item.date)})` : ""}`,
      );
    case "contact":
      return [
        ...(info.contact?.message ? [info.contact.message] : []),
        ...(info.profile.email ? [`- Email: ${info.profile.email}`] : []),
        ...(info.contact?.booking ? [`- ${link(info.contact.booking.label, info.contact.booking.url)}`] : []),
        ...(info.social ?? []).map((l) => `- ${link(l.label, l.url)}`),
      ];
  }
}

export function GET() {
  const { profile } = info;
  const facts = [profile.headline, profile.location, profile.workAuthorization, profile.status].filter(Boolean);
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${facts.join(" · ")}. ${profile.bio}`,
    "",
    ...(info.demo ? [`Live demo on the site: ${info.demo.description}`, ""] : []),
    ...(profile.resume ? [`Resume: ${new URL(profile.resume, info.settings.siteUrl).href}`, ""] : []),
    ...sections.flatMap((key) => [`## ${SECTIONS[key].title}`, "", ...section(key), ""]),
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
