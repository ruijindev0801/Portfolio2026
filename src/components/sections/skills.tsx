import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { skillIcon } from "@/lib/skill-icons";
import type { SkillGroup } from "@/lib/types";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="space-y-6">
      {groups.map((group, i) => (
        <BlurFade key={group.category} inView direction="up" delay={0.04 * i}>
          <div className="grid gap-3 sm:grid-cols-[11rem_1fr] sm:gap-6">
            <h3 className="pt-1 text-sm text-muted-foreground">{group.category}</h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const Icon = skillIcon(item);
                return (
                  <li key={item}>
                    <Badge
                      variant="outline"
                      className="h-7 gap-1.5 rounded-lg px-2.5 text-[13px] font-normal transition-colors hover:bg-muted"
                    >
                      {Icon ? (
                        <Icon aria-hidden="true" />
                      ) : (
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-muted-foreground/50" />
                      )}
                      {item}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        </BlurFade>
      ))}
    </div>
  );
}
