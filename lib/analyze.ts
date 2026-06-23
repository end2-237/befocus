import type { Browser } from "puppeteer-core";
import { connectBrowser, disconnectBrowser } from "./browser";
import { extractSnapshot } from "./extract";
import {
  analyzeCRO,
  analyzeUI,
  analyzeUX,
  mapFriction,
  overallScore,
} from "./analyzers";
import type { DimensionReport, FrictionReport, RawSnapshot } from "./types";

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

export interface AnalyzeOptions {
  url: string;
  /** Quelles dimensions analyser. Par défaut : les trois. */
  dimensions?: ("ui" | "ux" | "cro")[];
  /** Inclure les captures (base64). Coûteux en payload — désactivable. */
  includeScreenshots?: boolean;
  /** Capturer la page entière plutôt que la viewport. */
  fullPage?: boolean;
}

export interface Screenshot {
  device: "desktop" | "mobile";
  /** PNG encodé en base64 (sans préfixe data:). */
  base64: string;
}

export interface AnalyzeResult {
  url: string;
  finalUrl: string;
  title: string;
  capturedAt: string;
  overall: number;
  reports: DimensionReport[];
  friction: FrictionReport;
  screenshots: Screenshot[];
  snapshot: RawSnapshot;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

/**
 * Pipeline complet : connexion navigateur distant → navigation → capture
 * desktop & mobile → inspection DOM → scoring 3 dimensions → cartographie de
 * friction.
 */
export async function runAnalysis(opts: AnalyzeOptions): Promise<AnalyzeResult> {
  const url = normalizeUrl(opts.url);
  const dims = opts.dimensions?.length ? opts.dimensions : ["ui", "ux", "cro"];
  const includeScreenshots = opts.includeScreenshots ?? true;

  let browser: Browser | null = null;
  try {
    browser = await connectBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(45_000);

    const screenshots: Screenshot[] = [];

    // ── Desktop : navigation + capture + snapshot ─────────────────────────
    await page.setViewport({ ...DESKTOP, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45_000 });
    // Laisse les animations / lazy-load se stabiliser.
    await new Promise((r) => setTimeout(r, 1200));

    if (includeScreenshots) {
      const desktopShot = await page.screenshot({
        type: "png",
        fullPage: opts.fullPage ?? false,
        encoding: "base64",
      });
      screenshots.push({ device: "desktop", base64: String(desktopShot) });
    }

    const snapshotRaw = await extractSnapshot(page);

    // ── Mobile : re-render + capture ──────────────────────────────────────
    if (includeScreenshots) {
      await page.setViewport({
        ...MOBILE,
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      });
      await page.reload({ waitUntil: "networkidle2", timeout: 45_000 });
      await new Promise((r) => setTimeout(r, 800));
      const mobileShot = await page.screenshot({
        type: "png",
        fullPage: opts.fullPage ?? false,
        encoding: "base64",
      });
      screenshots.push({ device: "mobile", base64: String(mobileShot) });
    }

    const snapshot: RawSnapshot = { url, ...snapshotRaw };

    // ── Scoring ───────────────────────────────────────────────────────────
    const reports: DimensionReport[] = [];
    if (dims.includes("ui")) reports.push(analyzeUI(snapshot));
    if (dims.includes("ux")) reports.push(analyzeUX(snapshot));
    if (dims.includes("cro")) reports.push(analyzeCRO(snapshot));

    const friction = mapFriction(snapshot);

    return {
      url,
      finalUrl: snapshot.finalUrl,
      title: snapshot.title,
      capturedAt: new Date().toISOString(),
      overall: overallScore(reports),
      reports,
      friction,
      screenshots,
      snapshot,
    };
  } finally {
    await disconnectBrowser(browser);
  }
}

/** Rend un rapport au format Markdown lisible pour Claude / un humain. */
export function renderMarkdown(r: AnalyzeResult): string {
  const sev = (s: string) =>
    s === "critical" ? "🔴" : s === "warning" ? "🟠" : "🟢";
  const lines: string[] = [];

  lines.push(`# 🎯 BeFocus — Analyse de ${r.finalUrl}`);
  lines.push("");
  lines.push(`**Titre :** ${r.title || "—"}`);
  lines.push(`**Score global : ${r.overall}/10**`);
  lines.push(
    `**Capturé le :** ${r.capturedAt} · Hauteur : ${r.snapshot.scrollPages} écrans`,
  );
  lines.push("");

  lines.push("## 🔥 Cartographie de friction");
  lines.push(
    `- **Zone de friction maximale :** ${r.friction.maxFrictionZone}`,
  );
  lines.push(
    `- **Décrochage prédit :** ~${Math.round(
      r.friction.predictedDropoffDepth * 100,
    )}% de profondeur de scroll`,
  );
  lines.push(
    `- **Indice de charge cognitive :** ${r.friction.cognitiveLoadIndex}/100 (plus bas = mieux)`,
  );
  lines.push("");

  for (const rep of r.reports) {
    lines.push(`## ${rep.label} — ${rep.score}/10`);
    lines.push("");
    lines.push("**Constats :**");
    for (const f of rep.findings) {
      lines.push(`- ${sev(f.severity)} **${f.title}** — ${f.detail}`);
    }
    if (rep.recommendations.length) {
      lines.push("");
      lines.push("**Recommandations priorisées (A/B-ready) :**");
      rep.recommendations.forEach((rec, i) =>
        lines.push(`${i + 1}. ${rec}`),
      );
    }
    lines.push("");
    lines.push(
      "**Métriques :** " +
        Object.entries(rep.metrics)
          .map(([k, v]) => `\`${k}=${v}\``)
          .join(" · "),
    );
    lines.push("");
  }

  return lines.join("\n");
}
