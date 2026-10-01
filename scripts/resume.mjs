// Builds an ATS-friendly resume PDF from data/info.json.
//
//   npm run resume
//
// Writes the PDF to the path in profile.resume (e.g. "/Rui_Jin_Resume.pdf" ->
// public/Rui_Jin_Resume.pdf), which the site's Resume button links to.
// Needs Chrome, Edge or Chromium installed; set CHROME_PATH to use another browser.
//
// ATS rules followed: one column, real text (no images or tables), a standard
// font, standard section headings, contact details in the page body (not in a
// header/footer), plain black text, US Letter.

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const info = JSON.parse(readFileSync(join(root, "data", "info.json"), "utf8"));
const { profile, settings } = info;

// ---------- helpers ----------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (value) => {
  const [year, month] = String(value).split("-");
  const index = Number(month) - 1;
  return index >= 0 && index < 12 ? `${MONTHS[index]} ${year}` : year;
};
// Plain hyphen, not an en dash: some ATS parsers garble "–" and then misread the dates.
const formatRange = (start, end) => {
  if (!start) return end ? formatDate(end) : "";
  const from = formatDate(start);
  const to = end ? formatDate(end) : "Present";
  return from === to ? from : `${from} - ${to}`;
};
const escapeHtml = (text = "") =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// "https://www.linkedin.com/in/name/" -> "linkedin.com/in/name"
const displayUrl = (url) =>
  url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
const link = (url, text = displayUrl(url)) => `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`;
const absolute = (url) => new URL(url, settings.siteUrl).href;
const isMessaging = (url) => /wa\.me|whatsapp\.com/i.test(url);

// ---------- content ----------

const contactLine = [
  profile.location && escapeHtml(profile.location),
  profile.phone &&
    `${escapeHtml(profile.phone)}${(info.social ?? []).some((l) => isMessaging(l.url)) ? " (WhatsApp)" : ""}`,
  profile.email && link(`mailto:${profile.email}`, profile.email),
].filter(Boolean);

// Portfolio first, then the first three profiles in info.json order, so the line fits
// on one row (the portfolio links to the rest). WhatsApp is covered by the phone number.
const linkLine = [
  link(settings.siteUrl),
  ...(info.social ?? [])
    .filter((l) => !isMessaging(l.url))
    .slice(0, 3)
    .map((l) => link(l.url)),
];

const section = (title, body) => (body ? `<section><h2>${title}</h2>${body}</section>` : "");
const bullets = (items = []) =>
  items.length ? `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : "";

const summary = profile.summary ? `<p>${escapeHtml(profile.summary)}</p>` : "";

const skills = (info.skills ?? [])
  .map((g) => `<p class="skill"><b>${escapeHtml(g.category)}:</b> ${escapeHtml(g.items.join(", "))}</p>`)
  .join("");

const experience = (info.experience ?? [])
  .map(
    (job) => `
    <div class="entry">
      <div class="row"><span><b>${escapeHtml(job.role)}</b> | ${escapeHtml(job.company)}</span><span class="dates">${formatRange(job.start, job.end)}</span></div>
      <div class="meta">${escapeHtml([job.location, job.type].filter(Boolean).join(", "))}</div>
      ${job.summary ? `<p class="summary">${escapeHtml(job.summary)}</p>` : ""}
      ${bullets(job.highlights)}
    </div>`,
  )
  .join("");

const projects = (info.projects ?? [])
  .map((project) => {
    const url = project.url ?? project.links?.[0]?.url;
    // Right column: the link, or the note (e.g. "Client work · NDA") when there's nothing to link.
    const aside = url ? link(absolute(url)) : project.note ? escapeHtml(project.note) : "";
    return `
    <div class="entry">
      <div class="row"><span><b>${escapeHtml(project.name)}</b>${project.tech?.length ? ` | ${escapeHtml(project.tech.join(", "))}` : ""}</span>${aside ? `<span class="dates">${aside}</span>` : ""}</div>
      <p>${escapeHtml(project.description)}</p>
    </div>`;
  })
  .join("");

const education = (info.education ?? [])
  .map(
    (school) => `
    <div class="entry">
      <div class="row"><span><b>${escapeHtml(school.degree)}</b> | ${escapeHtml(school.school)}${school.location ? `, ${escapeHtml(school.location)}` : ""}</span><span class="dates">${formatRange(school.start, school.end)}</span></div>
      ${school.details?.length ? `<p>${escapeHtml(school.details.join(". "))}.</p>` : ""}
    </div>`,
  )
  .join("");

const credentials = (items = []) =>
  items
    .map(
      (item) => `
    <div class="row"><span><b>${escapeHtml(item.name)}</b>${item.issuer ? `, ${escapeHtml(item.issuer)}` : ""}</span>${item.date ? `<span class="dates">${formatDate(item.date)}</span>` : ""}</div>`,
    )
    .join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(profile.name)} Resume</title>
<style>
  @page { size: Letter; margin: 0.5in 0.6in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, "Liberation Sans", sans-serif; font-size: 9.8pt; line-height: 1.32; color: #000; }
  a { color: inherit; text-decoration: none; }
  header { text-align: center; }
  h1 { font-size: 19pt; line-height: 1.15; }
  .headline { font-size: 11pt; margin-top: 1pt; }
  .contact { font-size: 9.3pt; margin-top: 2pt; }
  h2 { font-size: 10.3pt; text-transform: uppercase; letter-spacing: 0.6pt; border-bottom: 0.8pt solid #000; padding-bottom: 1.5pt; margin: 9pt 0 4pt; }
  .row { display: flex; justify-content: space-between; gap: 12pt; }
  .dates { white-space: nowrap; }
  .entry { margin-bottom: 5pt; break-inside: avoid; }
  .meta { font-style: italic; font-size: 9.3pt; }
  .summary { margin-top: 1pt; }
  ul { margin: 1.5pt 0 0 13pt; }
  li { margin-bottom: 1pt; padding-left: 1pt; }
  .skill { margin-bottom: 1pt; }
</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(profile.name)}</h1>
    <p class="headline">${escapeHtml(profile.headline)}</p>
    <p class="contact">${contactLine.join(" | ")}</p>
    <p class="contact">${linkLine.join(" | ")}</p>
  </header>
  ${section("Summary", summary)}
  ${section("Skills", skills)}
  ${section("Experience", experience)}
  ${section("Projects", projects)}
  ${section("Education", education)}
  ${section("Certifications", credentials(info.certifications))}
  ${section("Awards", credentials(info.awards))}
</body>
</html>`;

// ---------- print ----------

const target = profile.resume?.startsWith("/") ? profile.resume : "/resume.pdf";
if (target !== profile.resume) {
  console.warn(
    `profile.resume is "${profile.resume ?? ""}"; writing /resume.pdf. Set profile.resume to "/resume.pdf" to link it.`,
  );
}
const outFile = join(root, "public", ...target.split("/").filter(Boolean));

const env = process.env;
const candidates = [
  env.CHROME_PATH,
  env.ProgramFiles && join(env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
  env["ProgramFiles(x86)"] && join(env["ProgramFiles(x86)"], "Google", "Chrome", "Application", "chrome.exe"),
  env.LOCALAPPDATA && join(env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
  env["ProgramFiles(x86)"] && join(env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  env.ProgramFiles && join(env.ProgramFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/microsoft-edge",
].filter(Boolean);
const browser = candidates.find((path) => existsSync(path));
if (!browser) {
  console.error("Couldn't find Chrome, Edge or Chromium. Install one, or set CHROME_PATH to a Chromium-based browser.");
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "resume-"));
const htmlFile = join(work, "resume.html");
writeFileSync(htmlFile, html, "utf8");

const result = spawnSync(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--print-to-pdf-no-header",
    `--user-data-dir=${join(work, "profile")}`,
    `--print-to-pdf=${outFile}`,
    pathToFileURL(htmlFile).href,
  ],
  { encoding: "utf8", timeout: 60_000 },
);
rmSync(work, { recursive: true, force: true });

if (!existsSync(outFile) || statSync(outFile).size === 0) {
  console.error("Printing the PDF failed.", result.error?.message ?? result.stderr ?? "");
  process.exit(1);
}
console.log(`Resume written to public${target} (${Math.round(statSync(outFile).size / 1024)} KB)`);
