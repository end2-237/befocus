# 🎯 BeFocus

**Serveur MCP haute précision d'analyse chirurgicale UI · UX · CRO pour Claude Code.**
Hébergé sur Vercel, il donne à Claude des _yeux_ (captures du rendu réel) et des
_outils de mesure_ (inspection du DOM, lois UX, modèle LIFT) pour évaluer
n'importe quelle page web ou SaaS et produire un score `/10` accompagné de
recommandations priorisées prêtes pour des tests A/B.

---

## 🧠 Les trois dimensions

| Dimension | Axe | Ce qu'elle mesure |
|-----------|-----|-------------------|
| **🎨 Visuelle** | UI & Design System | Captures desktop/mobile, palette, typographie, contrastes WCAG AA |
| **🧠 Cognitive** | UX & Friction Mapping | Charge cognitive, lois de Hick & Fitts, zone de friction max, scroll d'abandon |
| **🎯 Business** | CRO & Conversion | CTA, proposition de valeur, modèle LIFT, clarté tarifaire, preuve sociale |

Le score global est pondéré business : **CRO 40 % · UX 35 % · UI 25 %**.

---

## 🛠️ Outils MCP exposés

| Outil | Description |
|-------|-------------|
| `analyze_page` | Analyse complète des 3 dimensions + friction + score global. Option `includeScreenshots`. |
| `analyze_ui` | Dimension visuelle uniquement. |
| `analyze_ux` | Dimension cognitive uniquement. |
| `analyze_cro` | Dimension business uniquement. |
| `capture_screenshot` | Rend la page en desktop (1440px) et mobile (390px). |
| `befocus_status` | Vérifie la configuration du navigateur distant. |

---

## 💻 Fiche technique

- **Serveur MCP :** `befocus`
- **Runtime :** Node.js / TypeScript (Next.js App Router, route serverless)
- **Hébergement :** Vercel
- **Transport :** Streamable HTTP (`/api/mcp`) + SSE legacy (`/api/sse`, nécessite Redis)
- **Moteur d'inspection :** `puppeteer-core` connecté en WebSocket à un navigateur
  distant (Browserless) — aucun binaire Chromium embarqué, ce qui maintient la
  fonction sous la limite de poids de Vercel.

---

## 🚀 Déploiement sur Vercel

1. **Importer le dépôt** dans Vercel (framework détecté : Next.js, aucune config).
2. **Définir les variables d'environnement** (Project → Settings → Environment Variables) :

   | Variable | Requis | Rôle |
   |----------|--------|------|
   | `BROWSER_WS_ENDPOINT` | ✅ | Endpoint WebSocket d'un navigateur distant. Ex : `wss://production-sfo.browserless.io?token=XXXX` |
   | `REDIS_URL` | ⛔️ optionnel | Active le transport SSE résiliable. Le Streamable HTTP fonctionne sans. |
   | `BEFOCUS_AUTH_TOKEN` | ⛔️ optionnel | Protège l'accès : exige `Authorization: Bearer <token>`. |

3. **Déployer.** L'endpoint MCP est disponible sur `https://<votre-app>.vercel.app/api/mcp`.

> **Navigateur distant** — créez un compte sur [Browserless](https://www.browserless.io/)
> (ou tout service compatible CDP) et récupérez l'URL WebSocket avec votre token.

---

## 🔌 Connecter à Claude Code

```bash
claude mcp add --transport http befocus https://<votre-app>.vercel.app/api/mcp
```

Ou dans `.mcp.json` / `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "befocus": {
      "type": "http",
      "url": "https://<votre-app>.vercel.app/api/mcp"
    }
  }
}
```

Si `BEFOCUS_AUTH_TOKEN` est défini, ajoutez l'en-tête :

```json
{
  "mcpServers": {
    "befocus": {
      "type": "http",
      "url": "https://<votre-app>.vercel.app/api/mcp",
      "headers": { "Authorization": "Bearer <votre-token>" }
    }
  }
}
```

Puis, dans Claude : _« Analyse la page d'accueil de mon SaaS et donne-moi le score CRO »_.

---

## 🧑‍💻 Développement local

```bash
npm install
cp .env.example .env.local   # renseigner BROWSER_WS_ENDPOINT
npm run dev                  # http://localhost:3000  ·  MCP : /api/mcp
npm run build                # build de production
```

---

## 📐 Architecture du code

```
app/
├─ layout.tsx              · métadonnées + thème orange
├─ page.tsx                · landing page (orange / dark)
├─ globals.css             · design system
└─ api/[transport]/route.ts· serveur MCP (Streamable HTTP + SSE)
lib/
├─ browser.ts              · connexion au navigateur distant (puppeteer-core)
├─ extract.ts              · script d'inspection in-page du DOM rendu
├─ analyzers.ts            · scoring UI / UX / CRO + cartographie de friction
├─ analyze.ts              · pipeline (capture → extraction → scoring → markdown)
└─ types.ts                · types partagés
```

---

_Propulsé par le Model Context Protocol._
