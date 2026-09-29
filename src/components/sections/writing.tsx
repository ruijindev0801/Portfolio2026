import { ArrowUpRight } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { formatDate } from "@/lib/format";
import { writingIcon } from "@/lib/link-icons";
import type { Writing } from "@/lib/types";

export function WritingList({ items }: { items: Writing[] }) {
  return (
    <ul className="-mx-3 space-y-1">
      {items.map((item, i) => {
        const Icon = writingIcon(item.kind);
        const date = formatDate(item.date);
        return (
          <li key={item.url}>
            <BlurFade inView direction="up" delay={0.04 * i}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground transition-colors group-hover:text-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block leading-snug font-medium text-pretty">{item.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {[item.kind, item.publisher].filter(Boolean).join(" · ")}
                    <span className="sm:hidden"> · {date}</span>
                  </span>
                </span>
                <time
                  dateTime={item.date}
                  className="hidden shrink-0 pt-0.5 font-mono text-[13px] text-muted-foreground tabular-nums sm:block"
                >
                  {date}
                </time>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                />
              </a>
            </BlurFade>
          </li>
        );
      })}
    </ul>
  );
}
