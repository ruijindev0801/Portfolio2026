import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { linkIcon } from "@/lib/link-icons";
import type { Link } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Row of brand-icon buttons (GitHub, LinkedIn, …) with a tooltip naming each one. */
export function SocialLinks({ links, className }: { links?: Link[]; className?: string }) {
  if (!links?.length) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-0.5", className)}>
      {links.map((link) => {
        const Icon = linkIcon(link.label, link.url);
        return (
          <li key={link.url}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="ghost" size="icon-lg" className="text-muted-foreground hover:text-foreground">
                  <a href={link.url} target="_blank" rel="noreferrer" aria-label={link.label}>
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{link.label}</TooltipContent>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
