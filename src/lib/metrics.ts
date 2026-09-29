export type ParsedMetric = {
  prefix: string;
  value: number;
  decimals: number;
  suffix: string;
};

/**
 * Splits a metric like "$1.2M", "98%", "2.3k" or "11×" into the number and its
 * surrounding text, so the number can count up while the rest stays put.
 * Returns null when there is no number to animate.
 */
export function parseMetric(raw: string): ParsedMetric | null {
  const match = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(raw.trim());
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const number = digits.replace(/,/g, "");
  return {
    prefix,
    value: Number(number),
    decimals: number.includes(".") ? number.split(".")[1].length : 0,
    suffix,
  };
}
