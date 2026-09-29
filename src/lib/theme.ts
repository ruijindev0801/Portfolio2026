export type ThemePreference = "light" | "dark" | "system";

export function normalizeThemePreference(value: string | undefined): ThemePreference {
  return value === "light" || value === "dark" ? value : "system";
}
