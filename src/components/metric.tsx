import { NumberTicker } from "@/components/ui/number-ticker";
import { parseMetric } from "@/lib/metrics";

/**
 * A headline number ("42%", "2.3k") that counts up when scrolled into view.
 * The real value is also in the HTML (visually hidden), so screen readers,
 * search engines, printing and no-JS visitors always get the final number.
 */
export function Metric({ value, label }: { value: string; label: string }) {
  const parsed = parseMetric(value);
  return (
    <div>
      <p className="font-mono text-xl font-semibold tracking-tight tabular-nums">
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
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
