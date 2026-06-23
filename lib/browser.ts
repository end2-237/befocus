import puppeteer, { type Browser } from "puppeteer-core";

/**
 * Ouvre une connexion vers un navigateur Chrome distant (Browserless ou
 * équivalent) via WebSocket.
 *
 * On utilise volontairement `puppeteer.connect` plutôt que `puppeteer.launch` :
 * aucun binaire Chromium n'est embarqué dans la fonction serverless, ce qui
 * permet de rester très en dessous de la limite de poids (~50 Mo) des fonctions
 * Vercel. Le navigateur tourne ailleurs ; on ne fait que le piloter.
 */
export async function connectBrowser(): Promise<Browser> {
  const endpoint = process.env.BROWSER_WS_ENDPOINT;

  if (!endpoint) {
    throw new Error(
      "BROWSER_WS_ENDPOINT manquant. Définissez l'URL WebSocket d'un service " +
        "de navigation distant (ex: wss://production-sfo.browserless.io?token=...) " +
        "dans les variables d'environnement Vercel.",
    );
  }

  return puppeteer.connect({
    browserWSEndpoint: endpoint,
    // L'instantané du DOM peut être lourd ; on laisse Chrome gérer la viewport.
    defaultViewport: null,
  });
}

/** Ferme proprement la connexion sans tuer le navigateur distant partagé. */
export async function disconnectBrowser(browser: Browser | null): Promise<void> {
  if (!browser) return;
  try {
    // `disconnect` détache puppeteer ; le service distant recycle l'onglet.
    await browser.disconnect();
  } catch {
    /* on ignore : la connexion peut déjà être fermée */
  }
}
