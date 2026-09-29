"use client";

import { ArrowUpRight, Copy, FileText, Hash, Laptop, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { copyEmail } from "@/lib/clipboard";
import { linkIcon } from "@/lib/link-icons";
import type { Link } from "@/lib/types";

const noopSubscribe = () => () => {};

/** "⌘" on Apple devices, "Ctrl" elsewhere. The server renders "⌘". */
function useModifierKey() {
  return useSyncExternalStore(
    noopSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "⌘",
  );
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

type Props = {
  sections: { id: string; title: string }[];
  links: Link[];
  email?: string;
  resume?: string;
};

/** ⌘K / Ctrl+K palette: jump to a section, open a link, copy the email, switch theme. */
export function CommandMenu({ sections, links, email, resume }: Props) {
  const [open, setOpen] = useState(false);
  const { setTheme } = useTheme();
  const modifier = useModifierKey();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };
  const openLink = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden gap-2 pr-1.5 text-muted-foreground sm:inline-flex"
      >
        <Search />
        Search
        <Kbd>{modifier} K</Kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
        className="sm:hidden"
      >
        <Search />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Command menu"
        description="Jump to a section, open a link, or run an action."
      >
        {/* This version of CommandDialog expects its own <Command> root inside. */}
        <Command>
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Sections">
              {sections.map((section) => (
                <CommandItem key={section.id} onSelect={() => run(() => scrollToSection(section.id))}>
                  <Hash />
                  {section.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              {email && (
                <CommandItem onSelect={() => run(() => copyEmail(email))}>
                  <Copy />
                  Copy email address
                </CommandItem>
              )}
              {resume && (
                <CommandItem onSelect={() => run(() => openLink(resume))}>
                  <FileText />
                  Open resume
                </CommandItem>
              )}
              <CommandItem onSelect={() => run(() => setTheme("light"))}>
                <Sun />
                Light theme
              </CommandItem>
              <CommandItem onSelect={() => run(() => setTheme("dark"))}>
                <Moon />
                Dark theme
              </CommandItem>
              <CommandItem onSelect={() => run(() => setTheme("system"))}>
                <Laptop />
                System theme
              </CommandItem>
            </CommandGroup>
            {links.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Links">
                  {links.map((link) => {
                    const Icon = linkIcon(link.label, link.url);
                    return (
                      <CommandItem key={link.url} onSelect={() => run(() => openLink(link.url))}>
                        <Icon aria-hidden="true" />
                        {link.label}
                        <CommandShortcut>
                          <ArrowUpRight />
                        </CommandShortcut>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
