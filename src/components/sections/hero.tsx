import { BadgeCheck, FileText, Mail, MapPin } from "lucide-react";
import { SocialLinks } from "@/components/social-links";
import { Typewriter } from "@/components/typewriter";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/format";
import type { Link, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

// Staggered blur-in entrance (tw-animate-css). Pure CSS, so it plays from the
// first paint without waiting for JavaScript; the delay-* class sets the order.
const enter =
  "animate-in fade-in blur-in-6 slide-in-from-bottom-2 duration-700 ease-out fill-mode-both motion-reduce:animate-none";

export function Hero({ profile, social = [] }: { profile: Profile; social?: Link[] }) {
  return (
    <section aria-label="Introduction" className="pt-14 sm:pt-20">
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

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className={cn(enter, "text-4xl font-semibold tracking-tighter text-balance delay-80 sm:text-5xl")}>
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
        </div>
        <div className={cn(enter, "zoom-in-95 delay-80")}>
          <Avatar className="size-20 shadow-sm sm:size-28">
            {profile.avatar && <AvatarImage src={profile.avatar} alt={profile.name} />}
            <AvatarFallback className="bg-card font-mono text-xl sm:text-2xl">{initials(profile.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

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
        {social.length > 0 && <span aria-hidden="true" className="mx-2 hidden h-5 w-px bg-border sm:block" />}
        <SocialLinks links={social} />
      </div>
    </section>
  );
}
