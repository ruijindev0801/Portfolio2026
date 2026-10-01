import { ArrowUpRight, CodeXml, ListChecks, type LucideIcon, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { Now } from "@/lib/types";

// Step icon picked from keywords in the step's title; anything else gets a neutral sparkle.
const ICONS: [RegExp, LucideIcon][] = [
  [/code/i, CodeXml],
  [/prompt|write/i, PenLine],
  [/grade|score|rate|compare/i, ListChecks],
  [/hallucination|fix|data|quality|improve/i, ShieldCheck],
];

function stepIcon(title: string): LucideIcon {
  return ICONS.find(([pattern]) => pattern.test(title))?.[1] ?? Sparkles;
}

/** Current work, featured: a live status line, what it is, where it happens, and the steps of the job. */
export function NowSection({ now }: { now: Now }) {
  return (
    <BlurFade inView direction="up">
      <div className="rounded-2xl border bg-card p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/40 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-foreground" />
          </span>
          Currently{now.since && ` · since ${formatDate(now.since)}`}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance">{now.title}</h3>
        <p className="mt-3 max-w-prose text-pretty text-muted-foreground">{now.description}</p>
        {now.links?.length ? (
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Platforms">
            {now.links.map((link) => (
              <li key={link.url}>
                <Button asChild variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                    <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        {now.points?.length ? (
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {now.points.map((point, i) => {
              const Icon = stepIcon(point.title);
              return (
                <li key={point.title} className="rounded-xl border bg-background/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="grid size-8 place-items-center rounded-lg bg-muted">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-muted-foreground" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-3 font-medium">{point.title}</p>
                  <p className="mt-1 text-sm text-pretty text-muted-foreground">{point.text}</p>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    </BlurFade>
  );
}
