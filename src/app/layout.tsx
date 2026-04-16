import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import Script from "next/script";

import { TopNavigation } from "@/components/navigation/topNavigation";
import { getSessionUser } from "@/lib/auth";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SocialDeck",
  description: "Publier image et video sur plusieurs plateformes sociales en simultane.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "(() => { try { const key = 'socialdeck-theme'; const stored = window.localStorage.getItem(key); const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; const resolved = stored === 'dark' || stored === 'light' ? stored : (prefersDark ? 'dark' : 'light'); document.documentElement.setAttribute('data-theme', resolved); } catch (_) {} })();",
          }}
        />

        <div className="app-shell">
          <TopNavigation userDisplayName={user?.displayName ?? null} />

          <main className="page-wrap">{children}</main>
        </div>
      </body>
    </html>
  );
}

