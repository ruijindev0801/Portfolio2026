import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { skillIcon } from "@/lib/skill-icons";

export type Fact = { label: string; value: string };

/** About text, with an "At a glance" card beside it on wide screens (below it on phones). */
export function About({
  paragraphs,
  facts = [],
  tech = [],
}: {
  paragraphs: string[];
  facts?: Fact[];
  tech?: string[];
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
      <div className="max-w-prose space-y-4 text-pretty text-foreground/90">
        {paragraphs.map((text, i) => (
          <BlurFade key={text} inView direction="up" delay={0.05 * i}>
            <p>{text}</p>
          </BlurFade>
        ))}
      </div>

      {(facts.length > 0 || tech.length > 0) && (
        <BlurFade inView direction="up" delay={0.1} className="h-fit lg:sticky lg:top-24 lg:self-start">
          <aside aria-label="At a glance" className="rounded-xl border bg-card/80 p-5 backdrop-blur-sm">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">At a glance</p>
            <dl className="mt-4 space-y-3.5 text-sm">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-muted-foreground">{fact.label}</dt>
                  <dd className="mt-0.5 font-medium text-pretty">{fact.value}</dd>
                </div>
              ))}
              {tech.length > 0 && (
                <div>
                  <dt className="text-muted-foreground">Main tech</dt>
                  <dd className="mt-2">
                    <ul className="flex flex-wrap gap-1.5">
                      {tech.map((item) => {
                        const Icon = skillIcon(item);
                        return (
                          <li key={item}>
                            <Badge variant="outline" className="h-6 gap-1 rounded-md bg-background font-normal">
                              {Icon && <Icon aria-hidden="true" />}
                              {item}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </BlurFade>
      )}
    </div>
  );
}
