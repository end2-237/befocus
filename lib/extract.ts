import type { Page } from "puppeteer-core";

/**
 * Exécute, à l'intérieur de la page chargée, un script d'inspection complet du
 * DOM rendu. Tout le code de `page.evaluate` tourne dans le contexte du
 * navigateur : il ne peut donc rien importer et doit être autonome.
 *
 * Retourne les données brutes (sans `url`/`finalUrl`, ajoutés côté Node).
 */
export async function extractSnapshot(page: Page) {
  return page.evaluate(() => {
    // ── Helpers couleur / contraste (WCAG) ───────────────────────────────
    function parseRGB(str: string): [number, number, number, number] | null {
      const m = str.match(
        /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/i,
      );
      if (!m) return null;
      return [
        parseFloat(m[1]),
        parseFloat(m[2]),
        parseFloat(m[3]),
        m[4] !== undefined ? parseFloat(m[4]) : 1,
      ];
    }
    function toHex(r: number, g: number, b: number): string {
      const h = (n: number) =>
        Math.round(n).toString(16).padStart(2, "0").slice(0, 2);
      return `#${h(r)}${h(g)}${h(b)}`;
    }
    function relLum(r: number, g: number, b: number): number {
      const f = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }
    function contrastRatio(
      c1: [number, number, number],
      c2: [number, number, number],
    ): number {
      const l1 = relLum(c1[0], c1[1], c1[2]);
      const l2 = relLum(c2[0], c2[1], c2[2]);
      const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
      return (hi + 0.05) / (lo + 0.05);
    }
    /** Remonte les ancêtres pour trouver un fond opaque réel. */
    function effectiveBg(el: Element): [number, number, number] {
      let node: Element | null = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        const p = parseRGB(bg);
        if (p && p[3] > 0.5) return [p[0], p[1], p[2]];
        node = node.parentElement;
      }
      return [255, 255, 255]; // fallback : fond blanc
    }
    function isVisible(el: Element): boolean {
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden" || s.opacity === "0")
        return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const docH = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
    );

    function aboveFold(el: Element): boolean {
      const r = el.getBoundingClientRect();
      // `getBoundingClientRect` est relatif au scroll courant (en haut de page).
      return r.top < vh && r.bottom > 0;
    }

    // ── Palette de fonds ──────────────────────────────────────────────────
    const bgCount = new Map<string, number>();
    const textCount = new Map<string, number>();
    const fontSet = new Set<string>();

    const all = Array.from(document.querySelectorAll<HTMLElement>("*")).slice(
      0,
      4000,
    );
    for (const el of all) {
      const cs = getComputedStyle(el);
      const bg = parseRGB(cs.backgroundColor);
      if (bg && bg[3] > 0.05) {
        const key = `rgb(${Math.round(bg[0])}, ${Math.round(bg[1])}, ${Math.round(
          bg[2],
        )})`;
        bgCount.set(key, (bgCount.get(key) || 0) + 1);
      }
      if (el.textContent && el.textContent.trim().length > 0) {
        const col = parseRGB(cs.color);
        if (col) {
          const key = `rgb(${Math.round(col[0])}, ${Math.round(col[1])}, ${Math.round(
            col[2],
          )})`;
          textCount.set(key, (textCount.get(key) || 0) + 1);
        }
        const fam = cs.fontFamily.split(",")[0].replace(/['"]/g, "").trim();
        if (fam) fontSet.add(fam);
      }
    }

    const toUsage = (map: Map<string, number>, limit: number) =>
      Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([color, count]) => {
          const p = parseRGB(color)!;
          return { color, hex: toHex(p[0], p[1], p[2]), count };
        });

    const palette = toUsage(bgCount, 15);
    const textColors = toUsage(textCount, 10);

    // ── Titres ────────────────────────────────────────────────────────────
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6"),
    )
      .filter(isVisible)
      .slice(0, 60)
      .map((h) => ({
        level: parseInt(h.tagName[1], 10),
        text: (h.innerText || "").trim().slice(0, 140),
        fontSize: parseFloat(getComputedStyle(h).fontSize) || 0,
      }));

    const bodyFontSize =
      parseFloat(getComputedStyle(document.body).fontSize) || 16;

    // ── Échantillons de contraste ─────────────────────────────────────────
    const textEls = Array.from(
      document.querySelectorAll<HTMLElement>(
        "h1,h2,h3,h4,p,a,button,span,li,label",
      ),
    ).filter(
      (el) =>
        isVisible(el) &&
        el.childElementCount === 0 &&
        (el.innerText || "").trim().length > 3,
    );

    const contrastSamples = textEls.slice(0, 80).map((el) => {
      const cs = getComputedStyle(el);
      const col = parseRGB(cs.color) || [0, 0, 0, 1];
      const bg = effectiveBg(el);
      const fontSize = parseFloat(cs.fontSize) || 16;
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const isLarge = fontSize >= 24 || (fontSize >= 18.66 && bold);
      const ratio = contrastRatio([col[0], col[1], col[2]], bg);
      return {
        color: `rgb(${Math.round(col[0])}, ${Math.round(col[1])}, ${Math.round(
          col[2],
        )})`,
        background: `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`,
        ratio: Math.round(ratio * 100) / 100,
        fontSize,
        text: (el.innerText || "").trim().slice(0, 60),
        passesAA: ratio >= (isLarge ? 3 : 4.5),
      };
    });

    // ── Interactivité / UX ────────────────────────────────────────────────
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a")).filter(
      isVisible,
    );
    const buttons = Array.from(
      document.querySelectorAll<HTMLElement>("button,[role='button'],input[type='submit'],input[type='button']"),
    ).filter(isVisible);

    const navContainer = document.querySelector("nav,header");
    const navLinks = navContainer
      ? Array.from(navContainer.querySelectorAll("a,button")).filter(isVisible)
          .length
      : 0;

    const interactiveAboveFold = [...links, ...buttons].filter(aboveFold).length;

    const paragraphs = Array.from(
      document.querySelectorAll<HTMLElement>("p,li"),
    ).filter(isVisible);
    const textBlocks = paragraphs.slice(0, 200).map((p) => ({
      length: (p.innerText || "").trim().length,
      aboveFold: aboveFold(p),
    }));
    const longestParagraph = textBlocks.reduce(
      (m, b) => Math.max(m, b.length),
      0,
    );

    // ── Formulaires ───────────────────────────────────────────────────────
    const forms = Array.from(document.querySelectorAll("form")).map((f) => {
      const fields = Array.from(
        f.querySelectorAll<HTMLElement>(
          "input:not([type='hidden']):not([type='submit']):not([type='button']),select,textarea",
        ),
      ).filter(isVisible);
      return {
        fields: fields.length,
        required: fields.filter((el) => el.hasAttribute("required")).length,
        hasSubmit:
          !!f.querySelector("button,input[type='submit']") &&
          fields.length > 0,
      };
    });

    const images = Array.from(document.querySelectorAll("img")).filter(isVisible);
    const imagesMissingAlt = images.filter(
      (img) => !img.getAttribute("alt") || img.getAttribute("alt")!.trim() === "",
    ).length;

    // ── CTA / CRO ─────────────────────────────────────────────────────────
    const ctaActionRe =
      /\b(start|get|try|buy|sign|join|book|demo|free|download|subscribe|contact|order|commenc|essay|acheter|inscri|gratuit|d[ée]marrer|r[ée]server|t[ée]l[ée]charger|contacter)\b/i;
    const ctaCandidates = [...buttons, ...links].filter((el) => {
      const cs = getComputedStyle(el);
      const hasBg = (() => {
        const p = parseRGB(cs.backgroundColor);
        return !!p && p[3] > 0.1;
      })();
      const txt = (el as HTMLElement).innerText || "";
      return hasBg || ctaActionRe.test(txt);
    });
    const ctas = ctaCandidates.slice(0, 40).map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const col = parseRGB(cs.color) || [0, 0, 0, 1];
      const bgp = parseRGB(cs.backgroundColor) || [0, 0, 0, 0];
      return {
        text: ((el as HTMLElement).innerText || "").trim().slice(0, 60),
        tag: el.tagName.toLowerCase(),
        aboveFold: aboveFold(el),
        width: Math.round(r.width),
        height: Math.round(r.height),
        area: Math.round(r.width * r.height),
        background: `rgb(${Math.round(bgp[0])}, ${Math.round(bgp[1])}, ${Math.round(
          bgp[2],
        )})`,
        color: `rgb(${Math.round(col[0])}, ${Math.round(col[1])}, ${Math.round(
          col[2],
        )})`,
      };
    });

    const h1s = Array.from(document.querySelectorAll<HTMLElement>("h1")).filter(
      isVisible,
    );

    // Texte above the fold
    let aboveFoldText = "";
    for (const el of Array.from(
      document.querySelectorAll<HTMLElement>("h1,h2,h3,p,span,li,a,button"),
    )) {
      if (!isVisible(el) || !aboveFold(el)) continue;
      if (el.childElementCount > 0) continue;
      const t = (el.innerText || "").trim();
      if (t) aboveFoldText += t + " ";
      if (aboveFoldText.length > 1200) break;
    }

    const bodyText = (document.body.innerText || "").toLowerCase();
    const hasPricing =
      /[$€£]\s?\d|\b\d+\s?(\/|par)\s?(mo|month|mois|yr|year|an)\b|\bpricing\b|\btarif/i.test(
        bodyText,
      );
    const hasSocialProof =
      /\b(testimonial|t[ée]moignage|review|avis|trusted by|rated|rating|customers|clients|join \d|\d+[k,]* (users|customers|utilisateurs))\b/i.test(
        bodyText,
      );

    return {
      finalUrl: location.href,
      title: document.title || "",
      metaDescription:
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "",
      lang: document.documentElement.lang || "",
      viewport: { width: vw, height: vh },
      pageHeight: docH,
      scrollPages: Math.round((docH / vh) * 10) / 10,
      palette,
      textColors,
      fontFamilies: Array.from(fontSet).slice(0, 12),
      headings,
      bodyFontSize,
      contrastSamples,
      navLinks,
      totalLinks: links.length,
      totalButtons: buttons.length,
      interactiveAboveFold,
      textBlocks,
      longestParagraph,
      forms,
      imagesMissingAlt,
      totalImages: images.length,
      ctas,
      h1Count: h1s.length,
      h1Text: (h1s[0]?.innerText || "").trim().slice(0, 200),
      aboveFoldText: aboveFoldText.trim().slice(0, 1200),
      hasPricing,
      hasSocialProof,
    };
  });
}
