import type { MetadataRoute } from "next";
import { info } from "@/lib/info";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", info.settings.siteUrl).href,
  };
}
