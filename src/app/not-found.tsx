import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GridBackdrop } from "@/components/grid-backdrop";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

// Exported as out/404.html; static hosts serve it for unknown URLs.
export default function NotFound() {
  return (
    <main id="main" className="relative flex min-h-dvh items-center">
      <GridBackdrop
        maxOpacity={0.12}
        className="-z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]"
      />
      <div className="mx-auto w-full max-w-3xl px-6">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tighter sm:text-5xl">Page not found</h1>
        <p className="mt-4 max-w-prose text-muted-foreground">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            Back to home
          </Link>
        </Button>
      </div>
    </main>
  );
}
