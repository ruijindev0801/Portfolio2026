const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formats "YYYY", "YYYY-MM" or "YYYY-MM-DD" as "2024" / "Mar 2024".
 * Parsed by hand (not `new Date`) so time zones can never shift the month.
 */
export function formatDate(value: string | number): string {
  const [year, month] = String(value).split("-");
  const index = Number(month) - 1;
  return index >= 0 && index < 12 ? `${MONTHS[index]} ${year}` : year;
}

/** "Mar 2023 – Present", "2018 – 2020", or a single date when both ends match. */
export function formatRange(start?: string | number, end?: string | number | null): string {
  if (!start) return end ? formatDate(end) : "";
  const from = formatDate(start);
  const to = end ? formatDate(end) : "Present";
  return from === to ? from : `${from} – ${to}`;
}

/** "https://www.example.com/path" -> "example.com" */
export function displayHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
