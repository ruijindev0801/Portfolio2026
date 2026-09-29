import { Entry, TextLink } from "@/components/entry";
import { LinkButtons } from "@/components/link-buttons";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import type { Publication } from "@/lib/types";

export function PublicationList({ items, author }: { items: Publication[]; author: string }) {
  return (
    <ol className="space-y-8">
      {items.map((paper, i) => (
        <li key={paper.title}>
          <BlurFade inView direction="up" delay={0.05 * i}>
            <Entry
              title={paper.url ? <TextLink href={paper.url}>{paper.title}</TextLink> : paper.title}
              subtitle={paper.authors.map((name, index) => (
                <span key={name}>
                  {index > 0 && ", "}
                  {name === author ? <span className="font-medium text-foreground">{name}</span> : name}
                </span>
              ))}
              meta={paper.year}
            >
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="italic">{paper.venue}</span>
                {paper.note && (
                  <Badge variant="secondary" className="rounded-md font-mono text-[11px]">
                    {paper.note}
                  </Badge>
                )}
              </p>
              <LinkButtons links={paper.links} size="xs" className="mt-3" />
            </Entry>
          </BlurFade>
        </li>
      ))}
    </ol>
  );
}
