import { Bullets, TechTags, TextLink } from "@/components/entry";
import { LinkButtons } from "@/components/link-buttons";
import { Metric } from "@/components/metric";
import { SpotlightCard } from "@/components/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/lib/types";

export function ProjectList({ items }: { items: Project[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((project, i) => {
        const href = project.url ?? project.links?.[0]?.url;
        return (
          // Each card spans three rows of this grid (header, body, footer) and shares
          // them through subgrid, so cards side by side line up row by row: the
          // metrics start at the same height even when one description is longer.
          <BlurFade
            key={project.name}
            inView
            direction="up"
            delay={0.06 * (i % 2)}
            className="row-span-3 grid grid-rows-subgrid"
          >
            <SpotlightCard className="row-span-3 grid grid-rows-subgrid">
              {/* content-start: keep title + description at the top when a neighbor's is taller */}
              <CardHeader className="content-start">
                <div className="flex items-baseline justify-between gap-3">
                  <CardTitle className="text-base font-semibold">
                    {href ? <TextLink href={href}>{project.name}</TextLink> : project.name}
                  </CardTitle>
                  {project.year && (
                    <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                      {project.year}
                    </span>
                  )}
                </div>
                {project.note && (
                  <Badge variant="outline" className="w-fit rounded-md font-normal text-muted-foreground">
                    {project.note}
                  </Badge>
                )}
                <CardDescription className="text-pretty">{project.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-4">
                {project.metrics?.length ? (
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {project.metrics.map((metric) => (
                      <Metric key={metric.label} {...metric} />
                    ))}
                  </div>
                ) : null}
                <Bullets items={project.highlights} className="text-sm" />
                <TechTags items={project.tech} className="mt-auto" />
              </CardContent>

              {project.links?.length ? (
                <CardFooter className="bg-transparent">
                  <LinkButtons links={project.links} size="sm" />
                </CardFooter>
              ) : null}
            </SpotlightCard>
          </BlurFade>
        );
      })}
    </div>
  );
}
