// ─────────────────────────────────────────────────────────────────────────────
// Types partagés entre l'extraction (in-page) et les analyseurs (Node).
// ─────────────────────────────────────────────────────────────────────────────

export interface ColorUsage {
  /** Couleur au format `rgb(r, g, b)`. */
  color: string;
  /** Hex équivalent, ex: #ff7a18. */
  hex: string;
  /** Nombre d'éléments utilisant cette couleur. */
  count: number;
}

export interface TextSample {
  color: string;
  background: string;
  /** Ratio de contraste WCAG (1 → 21). */
  ratio: number;
  fontSize: number;
  /** Extrait de texte (tronqué). */
  text: string;
  /** Respecte AA pour ce corps de texte. */
  passesAA: boolean;
}

export interface HeadingInfo {
  level: number; // 1..6
  text: string;
  fontSize: number;
}

export interface CtaInfo {
  text: string;
  tag: string;
  /** Visible sans scroller (above the fold). */
  aboveFold: boolean;
  width: number;
  height: number;
  /** Surface cliquable en px². */
  area: number;
  background: string;
  color: string;
}

export interface FormInfo {
  /** Nombre de champs saisissables (input/select/textarea visibles). */
  fields: number;
  /** Nombre de champs requis. */
  required: number;
  /** Le formulaire a-t-il un bouton de soumission ? */
  hasSubmit: boolean;
}

export interface RawSnapshot {
  url: string;
  finalUrl: string;
  title: string;
  metaDescription: string;
  lang: string;

  viewport: { width: number; height: number };
  pageHeight: number;
  /** Combien de "pages" (viewports) de hauteur. */
  scrollPages: number;

  // ── UI ──────────────────────────────────────────────────────────────────
  palette: ColorUsage[];
  textColors: ColorUsage[];
  fontFamilies: string[];
  headings: HeadingInfo[];
  bodyFontSize: number;
  contrastSamples: TextSample[];

  // ── UX ──────────────────────────────────────────────────────────────────
  navLinks: number;
  totalLinks: number;
  totalButtons: number;
  /** Nombre d'éléments interactifs distincts above the fold. */
  interactiveAboveFold: number;
  textBlocks: { length: number; aboveFold: boolean }[];
  /** Densité de texte = caractères / pixels de viewport. */
  longestParagraph: number;
  forms: FormInfo[];
  imagesMissingAlt: number;
  totalImages: number;

  // ── CRO ─────────────────────────────────────────────────────────────────
  ctas: CtaInfo[];
  h1Count: number;
  h1Text: string;
  /** Texte visible above the fold (proposition de valeur). */
  aboveFoldText: string;
  hasPricing: boolean;
  hasSocialProof: boolean;
}

export type Dimension = "ui" | "ux" | "cro";

export interface Finding {
  /** "critical" | "warning" | "ok" */
  severity: "critical" | "warning" | "ok";
  title: string;
  detail: string;
}

export interface DimensionReport {
  dimension: Dimension;
  label: string;
  /** Score sur 10. */
  score: number;
  findings: Finding[];
  /** Recommandations priorisées, prêtes pour A/B test. */
  recommendations: string[];
  metrics: Record<string, string | number | boolean>;
}

export interface FrictionReport {
  /** Profondeur de scroll (0→1) où l'abandon est le plus probable. */
  predictedDropoffDepth: number;
  /** Description textuelle de la zone de friction maximale. */
  maxFrictionZone: string;
  /** Indice de charge cognitive (0→100, plus bas = mieux). */
  cognitiveLoadIndex: number;
}
