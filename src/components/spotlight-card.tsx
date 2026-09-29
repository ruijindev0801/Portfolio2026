"use client";

import { type ComponentProps, type MouseEvent, useRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** shadcn Card with a soft gray spotlight that follows the cursor, and a gentle lift on hover. */
export function SpotlightCard({ className, children, ...props }: ComponentProps<typeof Card>) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(event: MouseEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <Card
      ref={ref}
      onMouseMove={onMouseMove}
      className={cn(
        "group/spotlight relative transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 hover:ring-foreground/20 motion-reduce:hover:translate-y-0",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--spot-x) var(--spot-y), color-mix(in oklab, var(--foreground) 7%, transparent), transparent 65%)",
        }}
      />
      {children}
    </Card>
  );
}
