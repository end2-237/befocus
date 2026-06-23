import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ff6a00",
};

export const metadata: Metadata = {
  title: "BeFocus — Analyse chirurgicale UI · UX · CRO pour Claude Code",
  description:
    "Serveur MCP haute précision qui donne à Claude Code des yeux et des outils de mesure pour inspecter l'UI, cartographier la friction UX et optimiser la conversion (CRO). Hébergé sur Vercel.",
  metadataBase: new URL("https://befocus.vercel.app"),
  openGraph: {
    title: "BeFocus — UI · UX · CRO inside Claude",
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
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
