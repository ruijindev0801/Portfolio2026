"use client";

import { Menu } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { linkIcon } from "@/lib/link-icons";
import type { Link } from "@/lib/types";
import { scrollToSection } from "./command-menu";

type Props = {
  name: string;
  headline: string;
  sections: { id: string; title: string }[];
  links: Link[];
};

/** Slide-over menu for phones; the desktop header shows the nav inline instead. */
export function MobileNav({ name, headline, sections, links }: Props) {
  const [open, setOpen] = useState(false);
  // Scroll after the sheet has closed and released its scroll lock.
  const target = useRef<string | null>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-72"
        onCloseAutoFocus={(event) => {
          if (!target.current) return;
          event.preventDefault();
          scrollToSection(target.current);
          target.current = null;
        }}
      >
        <SheetHeader>
          <SheetTitle>{name}</SheetTitle>
          <SheetDescription>{headline}</SheetDescription>
        </SheetHeader>
        <nav aria-label="Sections" className="px-2">
          <ul className="grid gap-0.5">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    target.current = section.id;
                    setOpen(false);
                  }}
                  className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {links.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1 border-t p-4">
            {links.map((link) => {
              const Icon = linkIcon(link.label, link.url);
              return (
                <li key={link.url}>
                  <Button asChild variant="ghost" size="icon">
                    <a href={link.url} target="_blank" rel="noreferrer" aria-label={link.label}>
                      <Icon className="size-4" aria-hidden="true" />
                    </a>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
