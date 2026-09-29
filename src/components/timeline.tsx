"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { type ReactNode, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlurFade } from "@/components/ui/blur-fade";

export type TimelineItem = {
  key: string;
  /** Logo image path; `icon` is shown when missing. */
  logo?: string;
  icon: ReactNode;
  content: ReactNode;
};

/** Vertical timeline whose line draws itself in as you scroll through it. */
export function Timeline({ items }: { items: TimelineItem[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const reduceMotion = useReducedMotion();

  return (
    <ol ref={ref} className="relative">
      <span
        aria-hidden="true"
        className="absolute top-5 bottom-0 left-5 w-px -translate-x-1/2 bg-linear-to-b from-border via-border to-transparent"
      />
      <motion.span
        aria-hidden="true"
        style={{ scaleY: reduceMotion ? 1 : progress }}
        className="absolute top-5 bottom-0 left-5 w-px origin-top -translate-x-1/2 bg-linear-to-b from-foreground/60 via-foreground/40 to-transparent print:hidden"
      />
      {items.map((item) => (
        <li key={item.key} className="relative pb-12 pl-16 last:pb-2">
          <BlurFade inView direction="up" className="absolute top-0 left-0">
            <Avatar className="size-10 bg-background ring-4 ring-background">
              {item.logo && <AvatarImage src={item.logo} alt="" />}
              <AvatarFallback className="bg-card text-muted-foreground [&_svg]:size-4">{item.icon}</AvatarFallback>
            </Avatar>
          </BlurFade>
          <BlurFade inView direction="up" delay={0.05}>
            {item.content}
          </BlurFade>
        </li>
      ))}
    </ol>
  );
}
