import { BookOpen, Coffee, type LucideIcon, Popcorn, Quote, Sparkles } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import type { FunFacts } from "@/lib/types";

// Icon picked from keywords in the fact; anything else gets a neutral sparkle.
const ICONS: [RegExp, LucideIcon][] = [
  [/coffee|espresso|latte|tea/i, Coffee],
  [/book|read|hogwarts|potter/i, BookOpen],
  [/comed|movie|film|cartoon|minion/i, Popcorn],
];

function factIcon(fact: { title: string; text: string }): LucideIcon {
  const words = `${fact.title} ${fact.text}`;
  return ICONS.find(([pattern]) => pattern.test(words))?.[1] ?? Sparkles;
}

/** Three wisps of steam drifting up from the coffee icon (hidden with reduced motion). */
function Steam() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute top-1 left-[46%] flex -translate-x-1/2 gap-1">
      {[0, 0.5, 1].map((delay) => (
        <span
          key={delay}
          className="h-2 w-px animate-steam rounded-full bg-muted-foreground/70 opacity-0 motion-reduce:hidden"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

/** A couple of personal notes, then favorite quotes. Icons wiggle on hover; the coffee steams. */
export function FunFactsSection({ funFacts }: { funFacts: FunFacts }) {
  const { facts = [], quotes = [] } = funFacts;
  return (
    <div className="space-y-8">
      {facts.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact, i) => {
            const Icon = factIcon(fact);
            return (
              <li key={fact.title} className="sm:odd:last:col-span-2 lg:odd:last:col-span-1">
                <BlurFade inView direction="up" delay={0.05 * i} className="h-full">
                  <div className="group flex h-full gap-4 rounded-xl border bg-card/80 p-5 backdrop-blur-sm transition-colors hover:bg-card">
                    <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-muted">
                      {Icon === Coffee && <Steam />}
                      <Icon
                        className="size-5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-pretty">{fact.title}</p>
                      <p className="mt-1 text-sm text-pretty text-muted-foreground">{fact.text}</p>
                    </div>
                  </div>
                </BlurFade>
              </li>
            );
          })}
        </ul>
      )}

      {quotes.length > 0 && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">Lines I live by</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {quotes.map((quote, i) => (
              <li key={quote.text}>
                <BlurFade inView direction="up" delay={0.05 * i} className="h-full">
                  <figure className="group h-full rounded-xl border bg-card/80 p-6 backdrop-blur-sm transition-colors hover:bg-card">
                    <Quote
                      className="size-5 text-muted-foreground/60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                      aria-hidden="true"
                    />
                    <blockquote className="mt-3 text-lg font-medium tracking-tight text-pretty">
                      “{quote.text}”
                    </blockquote>
                    {quote.author && (
                      <figcaption className="mt-3 text-sm text-muted-foreground">{quote.author}</figcaption>
                    )}
                  </figure>
                </BlurFade>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
