import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { NeuralBackdrop } from "@/components/neural-backdrop";
import { Section } from "@/components/section";
import { About, type Fact } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { CredentialList } from "@/components/sections/credentials";
import { EducationList } from "@/components/sections/education";
import { ExperienceList } from "@/components/sections/experience";
import { Expertise } from "@/components/sections/expertise";
import { FunFactsSection } from "@/components/sections/fun-facts";
import { Hero } from "@/components/sections/hero";
import { NowSection } from "@/components/sections/now";
import { ProjectList } from "@/components/sections/projects";
import { PublicationList } from "@/components/sections/publications";
import { Skills } from "@/components/sections/skills";
import { WritingList } from "@/components/sections/writing";
import { initials } from "@/lib/format";
import { info, navItems, SECTIONS, type SectionKey, sections } from "@/lib/info";
import { personJsonLd } from "@/lib/json-ld";

// "At a glance" card next to About, built from data that's already in info.json.
function glanceFacts(): Fact[] {
  const { profile } = info;
  const platforms = info.now?.links?.map((link) => link.label) ?? [];
  const certificate = info.certifications?.[0];
  return [
    ...(info.now ? [{ label: "Currently", value: info.now.title }] : []),
    ...(platforms.length ? [{ label: "Platforms", value: platforms.join(", ") }] : []),
    ...(profile.status ? [{ label: "Looking for", value: profile.status.replace(/^open to /i, "") }] : []),
    ...(profile.location ? [{ label: "Based in", value: profile.location }] : []),
    ...(certificate
      ? [{ label: "Certified", value: [certificate.name, certificate.issuer].filter(Boolean).join(", ") }]
      : []),
  ];
}

function SectionContent({ id }: { id: Exclude<SectionKey, "contact"> }) {
  switch (id) {
    case "now":
      return info.now ? <NowSection now={info.now} /> : null;
    case "fun":
      return <FunFactsSection funFacts={info.funFacts ?? {}} />;
    case "about":
      return <About paragraphs={info.about ?? []} facts={glanceFacts()} tech={info.profile.mainTech} />;
    case "expertise":
      return <Expertise items={info.expertise ?? []} />;
    case "experience":
      // Long bullet lines read badly at full width, so the timeline keeps a comfortable measure.
      return (
        <div className="max-w-4xl">
          <ExperienceList items={info.experience ?? []} />
        </div>
      );
    case "projects":
      return <ProjectList items={info.projects ?? []} />;
    case "publications":
      return <PublicationList items={info.publications ?? []} author={info.profile.name} />;
    case "writing":
      return <WritingList items={info.writing ?? []} />;
    case "skills":
      return <Skills groups={info.skills ?? []} />;
    case "education":
      return (
        <div className="max-w-4xl">
          <EducationList items={info.education ?? []} />
        </div>
      );
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

      {/* "Neural network" behind the whole page, fixed to the viewport. The mask keeps it faint
          behind the text in the middle and fuller toward the edges. */}
      <NeuralBackdrop className="[mask-image:radial-gradient(ellipse_at_center,rgb(0_0_0/0.35),black_75%)]" />

      <main id="main" className="mx-auto max-w-6xl px-6 lg:px-8">
        <Hero
          profile={profile}
          social={info.social}
          demo={info.demo}
          showExperience={sections.includes("experience")}
        />
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
