import { AppWindow, Cpu, Database, type LucideIcon, MessagesSquare, ScanEye, Sparkles, Workflow } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import type { FocusArea } from "@/lib/types";

// Icon picked from keywords in the area's title; anything else gets a neutral sparkle.
const ICONS: [RegExp, LucideIcon][] = [
  [/vision|image|video/i, ScanEye],
  [/device|edge|embedded/i, Cpu],
  [/mlops|pipeline|infra/i, Workflow],
  [/llm|nlp|language|prompt/i, MessagesSquare],
  [/full.?stack|web|app/i, AppWindow],
  [/data|analytics|etl/i, Database],
];

function areaIcon(title: string): LucideIcon {
  return ICONS.find(([pattern]) => pattern.test(title))?.[1] ?? Sparkles;
}

/** "What I work on": one card per focus area, two columns on wider screens. */
export function Expertise({ items }: { items: FocusArea[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((area, i) => {
        const Icon = areaIcon(area.title);
        return (
          <li key={area.title}>
            <BlurFade inView direction="up" delay={0.05 * (i % 2)} className="h-full">
              <div className="flex h-full gap-4 rounded-xl border bg-card p-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/60">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-medium">{area.title}</h3>
                  <p className="mt-1 text-sm text-pretty text-muted-foreground">{area.description}</p>
                </div>
              </div>
            </BlurFade>
          </li>
        );
      })}
    </ul>
  );
}
