import { ArrowDown, BadgeCheck, FileText, Mail, MapPin } from "lucide-react";
import { PoseDemo } from "@/components/sections/pose-demo";
import { SocialLinks } from "@/components/social-links";
import { Typewriter } from "@/components/typewriter";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import type { Info, Link, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

// Staggered blur-in entrance (tw-animate-css). Pure CSS, so it plays from the
// first paint without waiting for JavaScript; the delay-* class sets the order.
const enter =
  "animate-in fade-in blur-in-6 slide-in-from-bottom-2 duration-700 ease-out fill-mode-both motion-reduce:animate-none";

/** `showExperience` adds a "View my experience" button that scrolls to the Experience section. */
type Props = { profile: Profile; social?: Link[]; demo?: Info["demo"]; showExperience?: boolean };

/** Intro on the left and the live pose demo on the right; they stack on smaller screens. */
export function Hero({ profile, social = [], demo, showExperience = false }: Props) {
  return (
    <section
      aria-label="Introduction"
      className={cn(
        "grid gap-12 pt-14 sm:pt-20",
        demo && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14",
      )}
    >
      <div className="min-w-0">
        {profile.status && (
          <p
            className={cn(
              enter,
              "inline-flex items-center gap-2 rounded-full border bg-background/70 py-1 pr-3 pl-2.5 text-xs backdrop-blur-sm",
            )}
          >
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/40 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-foreground" />
            </span>
            {/* Full-strength muted color: Magic UI's default 70% gray is ~3.6:1, below WCAG AA. */}
            <AnimatedShinyText className="mx-0 max-w-none text-muted-foreground dark:text-muted-foreground">
              {profile.status}
            </AnimatedShinyText>
          </p>
        )}

        <h1
          className={cn(
            enter,
            "mt-6 text-4xl font-semibold tracking-tighter text-balance delay-80 sm:text-5xl lg:text-6xl",
          )}
        >
          {profile.name}
        </h1>
        <p className={cn(enter, "mt-2 text-lg text-muted-foreground delay-160 sm:text-xl")}>{profile.headline}</p>
        {(profile.location || profile.workAuthorization) && (
          <ul className={cn(enter, "mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground delay-240")}>
            {profile.location && (
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden="true" />
                {profile.location}
              </li>
            )}
            {profile.workAuthorization && (
              <li className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                {profile.workAuthorization}
              </li>
            )}
          </ul>
        )}

        <p
          className={cn(
            enter,
            "mt-8 max-w-prose text-base leading-relaxed text-pretty text-foreground/80 delay-320 sm:text-lg",
          )}
        >
          <Typewriter text={profile.bio} />
        </p>

        <div className={cn(enter, "mt-8 flex flex-wrap items-center gap-x-2 gap-y-3 delay-400")}>
          {profile.resume && (
            <Button asChild size="lg">
              <a href={profile.resume} target="_blank" rel="noreferrer">
                <FileText data-icon="inline-start" />
                Resume
              </a>
            </Button>
          )}
          {profile.email && (
            <Button asChild size="lg" variant="outline">
              <a href={`mailto:${profile.email}`}>
                <Mail data-icon="inline-start" />
                Email me
              </a>
            </Button>
          )}
          {showExperience && (
            <Button asChild size="lg" variant="outline">
              <a href="#experience">
                View my experience
                <ArrowDown data-icon="inline-end" />
              </a>
            </Button>
          )}
        </div>

        {/* Profile icons get their own row, so the buttons never wrap around them. -ml lines the
            first icon up with the text above (icon buttons have built-in padding). */}
        <SocialLinks links={social} className={cn(enter, "mt-4 -ml-2.5 delay-480")} />
      </div>

      {demo && (
        <div id="demo" className={cn(enter, "min-w-0 scroll-mt-20 delay-480")}>
          <PoseDemo description={demo.description} />
        </div>
      )}
    </section>
  );
}
