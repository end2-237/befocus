import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Type system hi-fi : un grotesque géométrique net pour les titres, un
// grotesque doux pour le corps, un mono technique pour les données mesurées.
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const body = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FF5A1F",
};

export const metadata: Metadata = {
  title: "BeFocus — Le banc de mesure des interfaces · UI · UX · CRO",
  description:
    "Serveur MCP de précision : il donne à Claude Code des yeux et des instruments de mesure pour inspecter une interface, cartographier la friction et noter la conversion. Hébergé sur Vercel.",
  metadataBase: new URL("https://befocus.vercel.app"),
  openGraph: {
    title: "BeFocus — Le banc de mesure des interfaces",
    description:
      "Inspection chirurgicale en 3 dimensions : Visuelle, Cognitive, Business. Score /10 et recommandations A/B-ready.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
