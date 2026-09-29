import { Footer } from "@/components/footer";
import { GridBackdrop } from "@/components/grid-backdrop";
import { Header } from "@/components/header";
import { Section } from "@/components/section";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { CredentialList } from "@/components/sections/credentials";
import { EducationList } from "@/components/sections/education";
import { ExperienceList } from "@/components/sections/experience";
import { Hero } from "@/components/sections/hero";
import { ProjectList } from "@/components/sections/projects";
import { PublicationList } from "@/components/sections/publications";
import { Skills } from "@/components/sections/skills";
import { WritingList } from "@/components/sections/writing";
import { initials } from "@/lib/format";
import { info, navItems, SECTIONS, type SectionKey, sections } from "@/lib/info";
import { personJsonLd } from "@/lib/json-ld";

function SectionContent({ id }: { id: Exclude<SectionKey, "contact"> }) {
  switch (id) {
    case "about":
      return <About paragraphs={info.about ?? []} />;
    case "experience":
      return <ExperienceList items={info.experience ?? []} />;
    case "projects":
      return <ProjectList items={info.projects ?? []} />;
    case "publications":
      return <PublicationList items={info.publications ?? []} author={info.profile.name} />;
    case "writing":
      return <WritingList items={info.writing ?? []} />;
    case "skills":
      return <Skills groups={info.skills ?? []} />;
    case "education":
      return <EducationList items={info.education ?? []} />;
    case "certifications":
      return <CredentialList items={info.certifications ?? []} kind="certification" />;
    case "awards":
      return <CredentialList items={info.awards ?? []} kind="award" />;
  }
}

export default function Home() {
  const { profile } = info;
  const allSections = sections.map((id) => ({ id, title: SECTIONS[id].title }));

  return (
    <>
      <Header
        name={profile.name}
        headline={profile.headline}
        initials={initials(profile.name)}
        avatar={profile.avatar}
        nav={navItems}
        sections={allSections}
        links={info.social ?? []}
        email={profile.email}
        resume={profile.resume}
      />

      {/* Animated grid behind the intro. Two masks (intersected): a vertical fade that keeps
          the header area clear and dissolves before the About section, and a radial fade
          toward the sides. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]">
        <GridBackdrop
          maxOpacity={0.15}
          className="[mask-composite:intersect] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_45%,transparent_90%),radial-gradient(ellipse_70%_100%_at_50%_30%,black_30%,transparent)]"
        />
      </div>

      <main id="main" className="mx-auto max-w-3xl px-6">
        <Hero profile={profile} social={info.social} />
        {sections.map((id) =>
          id === "contact" ? (
            <Contact key={id} info={info} />
          ) : (
            <Section key={id} id={id} title={SECTIONS[id].title}>
              <SectionContent id={id} />
            </Section>
          ),
        )}
      </main>

      <Footer name={profile.name} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD built from our own data, with "<" escaped (see json-ld.ts) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd(info) }} />
    </>
  );
}
