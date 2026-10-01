"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useActiveSection } from "@/hooks/use-active-section";
import type { Link } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CommandMenu } from "./command-menu";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

type Props = {
  name: string;
  headline: string;
  initials: string;
  avatar?: string;
  /** Sections shown in the desktop nav. */
  nav: { id: string; label: string }[];
  /** Every section, for the command menu and the phone menu. */
  sections: { id: string; title: string }[];
  links: Link[];
  email?: string;
  resume?: string;
};

export function Header({ name, headline, initials, avatar, nav, sections, links, email, resume }: Props) {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);
  const [showName, setShowName] = useState(false);
  const active = useActiveSection();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 8);
    setShowName(y > 220); // roughly when the big name in the hero leaves the screen
  });

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300 print:hidden",
        scrolled ? "border-border bg-background/75 backdrop-blur-xl" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6 lg:px-8">
        <a href="#top" aria-label={`${name}, back to top`} className="flex min-w-0 items-center gap-2.5 rounded-md">
          <Avatar className="size-7">
            {avatar && <AvatarImage src={avatar} alt="" />}
            <AvatarFallback className="font-mono text-[10px]">{initials}</AvatarFallback>
          </Avatar>
          <AnimatePresence initial={false}>
            {showName && (
              <motion.span
                initial={{ opacity: 0, x: -6, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -6, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="max-w-40 truncate text-sm font-semibold tracking-tight whitespace-nowrap"
              >
                {name}
              </motion.span>
            )}
          </AnimatePresence>
        </a>

        <div className="flex items-center gap-1">
          {nav.length > 0 && (
            <nav aria-label="Sections" className="mr-1 hidden md:block">
              <ul className="flex items-center">
                {nav.map((item) => {
                  const isActive = active === item.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "relative block rounded-full px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="nav-active"
                            className="absolute inset-0 rounded-full bg-muted"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                          />
                        )}
                        <span className="relative">{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
          <CommandMenu sections={sections} links={links} email={email} resume={resume} />
          <ThemeToggle />
          <MobileNav name={name} headline={headline} sections={sections} links={links} />
        </div>
      </div>

      {/* Reading progress */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 -bottom-px h-px origin-left bg-foreground/70"
      />
    </header>
  );
}
