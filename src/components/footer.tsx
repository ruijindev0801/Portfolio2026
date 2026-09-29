import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Rendered at build time, so "last updated" is the date of the latest deploy.
const builtAt = new Date();

export function Footer({ name }: { name: string }) {
  const updated = builtAt.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <footer className="mx-auto mt-24 max-w-3xl px-6 pb-10">
      <Separator />
      <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {builtAt.getUTCFullYear()} {name} · Last updated {updated}
        </p>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground print:hidden">
          <a href="#top">
            <ArrowUp data-icon="inline-start" />
            Back to top
          </a>
        </Button>
      </div>
    </footer>
  );
}
