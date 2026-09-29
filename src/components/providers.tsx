"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ThemePreference } from "@/lib/theme";

export function Providers({ children, defaultTheme }: { children: ReactNode; defaultTheme: ThemePreference }) {
  return (
    <ThemeProvider attribute="class" defaultTheme={defaultTheme} enableSystem disableTransitionOnChange>
      {/* Honors the OS "reduce motion" setting for every animation on the site. */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster position="bottom-center" />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
