import { NumberTicker } from "@/components/ui/number-ticker";
import { parseMetric } from "@/lib/metrics";
import { cn } from "@/lib/utils";

/**
 * A headline number ("42%", "2.3k") that counts up when scrolled into view.
 * The real value is also in the HTML (visually hidden), so screen readers,
 * search engines, printing and no-JS visitors always get the final number.
 * `size="lg"` is the bigger version used in the intro.
 */
export function Metric({ value, label, size = "md" }: { value: string; label: string; size?: "md" | "lg" }) {
  const parsed = parseMetric(value);
  return (
    <div>
      <p
        className={cn(
          "font-mono font-semibold tracking-tight tabular-nums",
          size === "lg" ? "text-2xl sm:text-3xl" : "text-xl",
        )}
      >
        {parsed ? (
          <>
            <span className="metric-static sr-only">{value}</span>
            <span className="metric-animated" aria-hidden="true">
              {parsed.prefix}
              <NumberTicker value={parsed.value} decimalPlaces={parsed.decimals} className="tracking-tight" />
              {parsed.suffix}
            </span>
          </>
        ) : (
          value
        )}
      </p>
      <p className={cn("text-muted-foreground", size === "lg" ? "mt-1 text-sm text-pretty" : "text-xs")}>{label}</p>
    </div>
  );
}
