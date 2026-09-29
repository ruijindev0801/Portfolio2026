import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CursorEffects } from "@/components/cursor-effects";
import { Providers } from "@/components/providers";
import { info, themePreference } from "@/lib/info";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const { profile, settings } = info;
const title = `${profile.name} | ${profile.headline}`;
// Generated at build time by src/app/og.png and src/app/apple-touch-icon.png.
const ogImage = { url: "/og.png", width: 1200, height: 630, alt: title };

export const metadata: Metadata = {
  metadataBase: new URL(settings.siteUrl),
  // Other pages (like the 404) read "Page not found · Name".
  title: { default: title, template: `%s · ${profile.name}` },
  description: profile.bio,
  authors: [{ name: profile.name, url: settings.siteUrl }],
  alternates: { canonical: "/" },
  icons: {
    icon: { url: "/apple-touch-icon.png", type: "image/png" },
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: profile.name,
    title,
    description: profile.bio,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: profile.bio,
    images: [ogImage],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Without JavaScript, show everything that would otherwise wait for an animation.
const noScriptStyles = `<style>[data-slot="blur-fade"],[data-slot="section-rule"]{opacity:1!important;transform:none!important;filter:none!important}.metric-animated,[data-slot="typing-caret"]{display:none!important}[data-slot="typing-rest"]{color:inherit!important}.metric-static{position:static!important;width:auto!important;height:auto!important;margin:0!important;overflow:visible!important;clip-path:none!important;white-space:normal!important}</style>`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // next-themes sets the theme class on <html> before hydration, hence suppressHydrationWarning.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a static style string defined above, no user input */}
        <noscript dangerouslySetInnerHTML={{ __html: noScriptStyles }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
        >
          Skip to content
        </a>
        <Providers defaultTheme={themePreference}>
          {children}
          <CursorEffects />
        </Providers>
      </body>
    </html>
  );
}
