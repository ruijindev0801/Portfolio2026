import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const EXTERNAL = /^https?:\/\//;

/**
 * Resume-style row: title with a right-aligned date on wide screens (the date
 * moves above the title on phones), a muted subtitle underneath, then content.
 */
export function Entry({
  title,
  subtitle,
  meta,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div>
      <div className="grid items-baseline gap-x-6 gap-y-0.5 sm:grid-cols-[1fr_auto]">
        <h3 className="font-medium text-pretty">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {meta && (
          <p className="order-first font-mono text-[13px] leading-6 text-muted-foreground tabular-nums sm:order-none sm:col-start-2 sm:row-start-1 sm:text-right">
            {meta}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

/** Underlined text link; opens in a new tab when it leaves the site (or when `newTab` is set). */
export function TextLink({
  href,
  children,
  className,
  newTab = EXTERNAL.test(href),
}: {
  href: string;
  children: ReactNode;
  className?: string;
  newTab?: boolean;
}) {
  return (
    <a
      href={href}
      className={cn("link", className)}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

export function Bullets({ items, className }: { items?: string[]; className?: string }) {
  if (!items?.length) return null;
  return (
    <ul className={cn("list-disc space-y-1.5 pl-5 text-foreground/90 marker:text-muted-foreground/50", className)}>
      {items.map((item) => (
        <li key={item} className="pl-1 text-pretty">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function TechTags({ items, className }: { items?: string[]; className?: string }) {
  if (!items?.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Technologies">
      {items.map((item) => (
        <li key={item}>
          <Badge variant="secondary" className="rounded-md font-mono text-[11px] font-normal">
            {item}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
