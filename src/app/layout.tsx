import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { BASE } from "@/lib/base";
import { AppProvider } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hablarrr",
  description: "Mexican Spanish for dinner with the family.",
  applicationName: "Hablarrr",
  manifest: `${BASE}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: "Hablarrr",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1a1310",
};

// Runs before first paint so the saved theme never flashes.
const themeScript = `try{var t=localStorage.getItem("hablarrr-theme");document.documentElement.dataset.theme=t==="light"?"light":"night"}catch(e){document.documentElement.dataset.theme="night"}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-MX"
      data-theme="night"
      suppressHydrationWarning
      className={`${bricolage.variable} ${figtree.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full antialiased">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
