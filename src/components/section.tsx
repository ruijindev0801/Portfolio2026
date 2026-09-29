"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { BlurFade } from "@/components/ui/blur-fade";

/** Page section: a heading with a hairline that draws itself in, then the content. */
export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="pt-20 sm:pt-24">
      <div className="mb-8 flex items-center gap-4">
        <BlurFade inView direction="up">
          <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
            {title}
          </h2>
        </BlurFade>
        <motion.span
          aria-hidden="true"
          data-slot="section-rule"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="h-px flex-1 origin-left bg-linear-to-r from-border to-transparent"
        />
      </div>
      {children}
    </section>
  );
}
