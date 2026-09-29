"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};
/** False during server render and hydration, true afterwards. */
const useMounted = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

/**
 * Animated background: Magic UI's FlickeringGrid, a canvas of small squares that
 * softly twinkle in the theme's gray. It pauses while off-screen, and visitors who
 * prefer reduced motion get a static dot grid instead. Position and fade it with
 * `className` (e.g. a mask-image).
 */
export function GridBackdrop({
  className,
  maxOpacity = 0.2,
  flickerChance = 0.15,
}: {
  className?: string;
  maxOpacity?: number;
  flickerChance?: number;
}) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 print:hidden", className)}>
      {/* Rendered after hydration: the theme and motion preference are only known in the browser. */}
      {!mounted ? null : reduceMotion ? (
        <DotPattern width={20} height={20} className="text-foreground/15" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="size-full"
        >
          <FlickeringGrid
            squareSize={3}
            gridGap={6}
            flickerChance={flickerChance}
            maxOpacity={maxOpacity}
            color={resolvedTheme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
            className="size-full"
          />
        </motion.div>
      )}
    </div>
  );
}
