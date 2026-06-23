import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { runAnalysis, renderMarkdown } from "@/lib/analyze";

export const maxDuration = 60;

const dimensionEnum = z.enum(["ui", "ux", "cro"]);

const handler = createMcpHandler(
  (server) => {
    // ─────────────────────────────────────────────────────────────────────
    // Outil principal : analyse 3 dimensions (UI + UX + CRO)
    // ─────────────────────────────────────────────────────────────────────
    server.tool(
      "analyze_page",
      "Analyse chirurgicale d'une page web sur 3 dimensions (UI visuelle, UX cognitive, CRO business). " +
        "Capture le rendu réel (desktop & mobile), inspecte le DOM, applique les lois UX (Hick, Fitts) et le " +
        "modèle LIFT, puis renvoie un score /10 par dimension + une cartographie de friction et des " +
        "recommandations priorisées prêtes pour des tests A/B.",
      {
        url: z.string().describe("URL de la page à analyser (https://...)."),
        dimensions: z
          .array(dimensionEnum)
          .optional()
          .describe(
            "Dimensions à évaluer. Par défaut les trois : ['ui','ux','cro'].",
          ),
        includeScreenshots: z
          .boolean()
          .optional()
          .describe(
            "Joindre les captures desktop+mobile dans la réponse (défaut: false).",
          ),
        fullPage: z
          .boolean()
          .optional()
          .describe("Capturer la page entière plutôt que le premier écran."),
      },
      async ({ url, dimensions, includeScreenshots, fullPage }) => {
        const result = await runAnalysis({
          url,
          dimensions,
          includeScreenshots: includeScreenshots ?? false,
          fullPage,
        });

        const content: Array<
          | { type: "text"; text: string }
          | { type: "image"; data: string; mimeType: string }
        > = [{ type: "text", text: renderMarkdown(result) }];

        if (includeScreenshots) {
          for (const shot of result.screenshots) {
            content.push({
              type: "image",
              data: shot.base64,
              mimeType: "image/png",
            });
          }
        }

        return { content };
      },
    );

    // ─────────────────────────────────────────────────────────────────────
    // Outils ciblés par dimension
    // ─────────────────────────────────────────────────────────────────────
    const single = (
      name: string,
      dim: "ui" | "ux" | "cro",
      label: string,
    ) =>
      server.tool(
        name,
        `Analyse uniquement la dimension ${label} d'une page web et renvoie un score /10 + recommandations.`,
        { url: z.string().describe("URL à analyser (https://...).") },
        async ({ url }) => {
          const result = await runAnalysis({
            url,
            dimensions: [dim],
            includeScreenshots: false,
          });
          return { content: [{ type: "text", text: renderMarkdown(result) }] };
        },
      );

    single("analyze_ui", "ui", "visuelle (UI & Design System)");
    single("analyze_ux", "ux", "cognitive (UX & Friction Mapping)");
    single("analyze_cro", "cro", "business (CRO & Conversion)");

    // ─────────────────────────────────────────────────────────────────────
    // Capture pure (desktop + mobile)
    // ─────────────────────────────────────────────────────────────────────
    server.tool(
      "capture_screenshot",
      "Capture le rendu visuel réel d'une page web en desktop (1440px) et mobile (390px) et renvoie les images PNG.",
      {
        url: z.string().describe("URL à capturer (https://...)."),
        fullPage: z
          .boolean()
          .optional()
          .describe("Capturer la page entière (défaut: premier écran)."),
      },
      async ({ url, fullPage }) => {
        const result = await runAnalysis({
          url,
          dimensions: [],
          includeScreenshots: true,
          fullPage,
        });
        const content: Array<
          | { type: "text"; text: string }
          | { type: "image"; data: string; mimeType: string }
        > = [
          {
            type: "text",
            text: `Captures de ${result.finalUrl} (${result.screenshots
              .map((s) => s.device)
              .join(", ")}).`,
          },
        ];
        for (const shot of result.screenshots) {
          content.push({
            type: "image",
            data: shot.base64,
            mimeType: "image/png",
          });
        }
        return { content };
      },
    );

    // ─────────────────────────────────────────────────────────────────────
    // Diagnostic de configuration
    // ─────────────────────────────────────────────────────────────────────
    server.tool(
      "befocus_status",
      "Vérifie la configuration du serveur BeFocus (connexion au navigateur distant).",
      {},
      async () => {
        const configured = Boolean(process.env.BROWSER_WS_ENDPOINT);
        return {
          content: [
            {
              type: "text",
              text: configured
                ? "✅ BeFocus opérationnel : navigateur distant configuré (BROWSER_WS_ENDPOINT)."
                : "⚠️ BROWSER_WS_ENDPOINT non défini. Configurez l'endpoint WebSocket d'un service de navigation (ex: Browserless) dans les variables d'environnement Vercel.",
            },
          ],
        };
      },
    );
  },
  {
    // Métadonnées du serveur exposées au client MCP.
    serverInfo: { name: "befocus", version: "1.0.0" },
  },
  {
    basePath: "/api",
    maxDuration: 60,
    // Le transport SSE résiliable nécessite Redis ; le Streamable HTTP (/api/mcp)
    // fonctionne sans. On active SSE seulement si REDIS_URL est fourni.
    redisUrl: process.env.REDIS_URL,
    verboseLogs: true,
  },
);

// ── Auth optionnelle par jeton partagé ─────────────────────────────────────
function authorized(req: Request): boolean {
  const token = process.env.BEFOCUS_AUTH_TOKEN;
  if (!token) return true; // pas de protection configurée
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${token}`;
}

async function guarded(req: Request): Promise<Response> {
  if (!authorized(req)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "content-type": "application/json" } },
    );
  }
  return handler(req);
}

export { guarded as GET, guarded as POST, guarded as DELETE };
