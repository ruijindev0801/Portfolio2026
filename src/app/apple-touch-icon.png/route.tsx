import { monogram } from "@/lib/monogram";

// Monogram icon, used as the favicon and the iOS home-screen icon.
// iOS also requests /apple-touch-icon.png by default, so this exact name matters.
export const dynamic = "force-static";

export function GET() {
  return monogram(180);
}
