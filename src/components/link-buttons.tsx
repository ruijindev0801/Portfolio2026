import { Button } from "@/components/ui/button";
import { linkIcon } from "@/lib/link-icons";
import type { Link } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Small outline buttons with an icon per link: GitHub logo for repos, a page for papers, … */
export function LinkButtons({
  links,
  size = "sm",
  className,
}: {
  links?: Link[];
  size?: "xs" | "sm";
  className?: string;
}) {
  if (!links?.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {links.map((link) => {
        const Icon = linkIcon(link.label, link.url);
        return (
          <li key={link.url}>
            <Button asChild variant="outline" size={size} className="text-muted-foreground hover:text-foreground">
              <a href={link.url} target="_blank" rel="noreferrer">
                <Icon data-icon="inline-start" aria-hidden="true" />
                {link.label}
              </a>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
