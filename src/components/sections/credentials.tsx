import { Award, BadgeCheck } from "lucide-react";
import { TextLink } from "@/components/entry";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { Credential } from "@/lib/types";

/** Certifications and Awards: small cards in a two-column grid. */
export function CredentialList({ items, kind }: { items: Credential[]; kind: "certification" | "award" }) {
  const Icon = kind === "award" ? Award : BadgeCheck;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <li key={`${item.name}-${item.date ?? ""}`}>
          <BlurFade inView direction="up" delay={0.05 * i} className="h-full">
            <Card size="sm" className="h-full flex-row items-center gap-3 px-4 transition-colors hover:bg-muted/40">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="leading-snug font-medium text-pretty">
                  {/* New tab: often a certificate image or verification page. */}
                  {item.url ? (
                    <TextLink href={item.url} newTab>
                      {item.name}
                    </TextLink>
                  ) : (
                    item.name
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {[item.issuer, item.date && formatDate(item.date)].filter(Boolean).join(" · ")}
                </p>
              </div>
            </Card>
          </BlurFade>
        </li>
      ))}
    </ul>
  );
}
