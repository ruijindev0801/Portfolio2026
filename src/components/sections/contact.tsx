import { Mail } from "lucide-react";
import { CopyEmailButton } from "@/components/copy-email-button";
import { GridBackdrop } from "@/components/grid-backdrop";
import { SocialLinks } from "@/components/social-links";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import type { Info } from "@/lib/types";

/** Closing call-to-action card. Rendered in place of a regular Section. */
export function Contact({ info }: { info: Info }) {
  const { email } = info.profile;
  return (
    <section id="contact" aria-labelledby="contact-title" className="pt-24 sm:pt-28">
      <BlurFade inView direction="up">
        <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-14 text-center sm:px-12 sm:py-16">
          <GridBackdrop
            maxOpacity={0.15}
            flickerChance={0.12}
            className="[mask-image:radial-gradient(420px_circle_at_center,black,transparent)]"
          />
          <div className="relative">
            <Badge variant="secondary">Contact</Badge>
            <h2 id="contact-title" className="mt-4 text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
              {info.contact?.heading ?? "Get in touch"}
            </h2>
            {info.contact?.message && (
              <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground">{info.contact.message}</p>
            )}
            {email && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Button asChild size="lg">
                  <a href={`mailto:${email}`}>
                    <Mail data-icon="inline-start" />
                    {email}
                  </a>
                </Button>
                <CopyEmailButton email={email} />
              </div>
            )}
            <SocialLinks links={info.social} className="mt-6 justify-center" />
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
