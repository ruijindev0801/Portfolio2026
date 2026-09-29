import type { Info } from "./types";

/**
 * schema.org Person markup, so search engines can show your name, title and
 * profiles as a rich result. See https://schema.org/Person.
 */
export function personJsonLd(info: Info): string {
  const { profile, settings } = info;
  // Self-employment isn't an employer, and messaging links (WhatsApp) aren't profiles.
  const current = info.experience?.find((job) => !job.end && !/self[- ]?employed|freelance/i.test(job.company));
  const profiles = info.social?.map((link) => link.url).filter((url) => !/wa\.me|whatsapp\.com/i.test(url));

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.headline,
    description: profile.bio,
    url: settings.siteUrl,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    image: profile.avatar ? new URL(profile.avatar, settings.siteUrl).href : undefined,
    homeLocation: profile.location ? { "@type": "Place", name: profile.location } : undefined,
    sameAs: profiles,
    worksFor: current ? { "@type": "Organization", name: current.company, url: current.url } : undefined,
    alumniOf: info.education?.map((school) => ({ "@type": "CollegeOrUniversity", name: school.school })),
    knowsAbout: info.skills?.flatMap((group) => group.items),
  };

  // Escape "<" so the JSON can never close the surrounding <script> tag.
  return JSON.stringify(person).replace(/</g, "\\u003c");
}
