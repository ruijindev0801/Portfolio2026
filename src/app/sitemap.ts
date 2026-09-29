import type { MetadataRoute } from "next";
import { info } from "@/lib/info";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: info.settings.siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
