import type {
  DimensionReport,
  Finding,
  FrictionReport,
  RawSnapshot,
} from "./types";

const clamp = (n: number, lo = 0, hi = 10) => Math.max(lo, Math.min(hi, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

// ─────────────────────────────────────────────────────────────────────────────
// 1. DIMENSION VISUELLE — UI & Design System
// ─────────────────────────────────────────────────────────────────────────────
export function analyzeUI(s: RawSnapshot): DimensionReport {
  const findings: Finding[] = [];
  const recommendations: string[] = [];

  // — Contraste —
  const samples = s.contrastSamples;
  const passRate = samples.length
    ? samples.filter((t) => t.passesAA).length / samples.length
    : 1;
  const failing = samples.filter((t) => !t.passesAA);
  if (passRate >= 0.95) {
    findings.push({
      severity: "ok",
      title: "Contraste texte conforme WCAG AA",
      detail: `${Math.round(passRate * 100)}% des échantillons de texte passent le seuil AA.`,
    });
  } else {
    findings.push({
      severity: passRate < 0.8 ? "critical" : "warning",
      title: "Contraste insuffisant",
      detail: `${failing.length}/${samples.length} échantillons sous le seuil AA (ex: "${failing[0]?.text}" ratio ${failing[0]?.ratio}).`,
    });
    recommendations.push(
      `Augmenter le contraste des textes faibles (cibler un ratio ≥ 4.5:1). Premier fautif : « ${failing[0]?.text ?? ""} ».`,
    );
  }

  // — Cohérence de palette —
  const significantBg = s.palette.filter((c) => c.count >= 3);
  if (significantBg.length > 8) {
    findings.push({
      severity: "warning",
      title: "Palette de fonds trop dispersée",
      detail: `${significantBg.length} couleurs de fond significatives détectées — risque d'incohérence visuelle.`,
    });
    recommendations.push(
      "Resserrer le design system à 3–5 couleurs de fond pour une image plus premium et cohérente.",
    );
  } else {
    findings.push({
      severity: "ok",
      title: "Palette maîtrisée",
      detail: `${significantBg.length} couleurs de fond principales — design system cohérent.`,
    });
  }

  // — Typographie —
  const families = s.fontFamilies.length;
  if (families > 3) {
    findings.push({
      severity: "warning",
      title: "Trop de familles typographiques",
      detail: `${families} polices distinctes (${s.fontFamilies.join(", ")}).`,
    });
    recommendations.push(
      "Limiter à 2 familles typographiques (titre + corps) pour renforcer la lisibilité et l'identité.",
    );
  } else {
    findings.push({
      severity: "ok",
      title: "Typographie disciplinée",
      detail: `${families} famille(s) : ${s.fontFamilies.join(", ")}.`,
    });
  }

  // — Hiérarchie des titres —
  const h1 = s.headings.filter((h) => h.level === 1);
  const h2 = s.headings.filter((h) => h.level === 2);
  const hierarchyOk =
    h1.length > 0 &&
    (h2.length === 0 || h1[0].fontSize >= (h2[0]?.fontSize ?? 0));
  if (!hierarchyOk) {
    findings.push({
      severity: "warning",
      title: "Hiérarchie typographique faible",
      detail: "Le H1 n'est pas visuellement dominant par rapport aux H2.",
    });
    recommendations.push(
      "Accentuer l'échelle typographique : le titre principal (H1) doit être nettement plus grand que les sous-titres.",
    );
  }

  // — Lisibilité du corps —
  if (s.bodyFontSize < 15) {
    findings.push({
      severity: "warning",
      title: "Corps de texte petit",
      detail: `Taille de base ${s.bodyFontSize}px (< 16px recommandé).`,
    });
    recommendations.push(
      "Porter la taille du corps de texte à 16px minimum pour le confort de lecture, surtout sur mobile.",
    );
  }

  let score = 10;
  score -= (1 - passRate) * 5;
  score -= Math.max(0, significantBg.length - 6) * 0.4;
  score -= Math.max(0, families - 3) * 0.7;
  score -= hierarchyOk ? 0 : 1;
  score -= s.bodyFontSize < 15 ? 0.8 : 0;

  return {
    dimension: "ui",
    label: "Dimension Visuelle (UI & Design System)",
    score: round1(clamp(score)),
    findings,
    recommendations,
    metrics: {
      contrastPassRate: `${Math.round(passRate * 100)}%`,
      backgroundColors: significantBg.length,
      fontFamilies: families,
      bodyFontSize: `${s.bodyFontSize}px`,
      headings: s.headings.length,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DIMENSION COGNITIVE — UX & Friction Mapping (Hick, Fitts)
// ─────────────────────────────────────────────────────────────────────────────
export function analyzeUX(s: RawSnapshot): DimensionReport {
  const findings: Finding[] = [];
  const recommendations: string[] = [];

  // — Loi de Hick : trop de choix simultanés ralentit la décision —
  if (s.interactiveAboveFold > 12) {
    findings.push({
      severity: s.interactiveAboveFold > 20 ? "critical" : "warning",
      title: "Surcharge de choix (Loi de Hick)",
      detail: `${s.interactiveAboveFold} éléments interactifs visibles d'emblée — le temps de décision augmente avec le nombre d'options.`,
    });
    recommendations.push(
      "Réduire le nombre d'options above the fold : hiérarchiser un seul CTA principal et reléguer le reste.",
    );
  } else {
    findings.push({
      severity: "ok",
      title: "Charge de choix maîtrisée (Hick)",
      detail: `${s.interactiveAboveFold} éléments interactifs above the fold.`,
    });
  }

  if (s.navLinks > 7) {
    findings.push({
      severity: "warning",
      title: "Navigation chargée",
      detail: `${s.navLinks} liens de navigation (≤ 7 recommandé, loi de Miller).`,
    });
    recommendations.push(
      "Regrouper la navigation principale en ≤ 7 entrées pour soulager la mémoire de travail.",
    );
  }

  // — Loi de Fitts : cibles cliquables trop petites —
  const tinyCtas = s.ctas.filter((c) => c.height < 36 || c.area < 36 * 80);
  if (tinyCtas.length) {
    findings.push({
      severity: "warning",
      title: "Cibles cliquables trop petites (Loi de Fitts)",
      detail: `${tinyCtas.length} CTA sous 36px de hauteur — difficiles à atteindre, surtout au doigt.`,
    });
    recommendations.push(
      "Porter les boutons à ≥ 44px de hauteur (zone tactile confortable) pour réduire le temps/erreur d'accès.",
    );
  }

  // — Charge cognitive textuelle —
  if (s.longestParagraph > 600) {
    findings.push({
      severity: "warning",
      title: "Blocs de texte denses",
      detail: `Le plus long bloc fait ${s.longestParagraph} caractères — lecture pénible.`,
    });
    recommendations.push(
      "Fractionner les paragraphes longs en puces ou phrases courtes pour fluidifier la lecture (scannabilité).",
    );
  }

  // — Formulaires —
  const heaviestForm = s.forms.reduce((m, f) => Math.max(m, f.fields), 0);
  if (heaviestForm > 5) {
    findings.push({
      severity: heaviestForm > 8 ? "critical" : "warning",
      title: "Formulaire trop long",
      detail: `Un formulaire comporte ${heaviestForm} champs — chaque champ supplémentaire réduit le taux de complétion.`,
    });
    recommendations.push(
      `Réduire le formulaire à l'essentiel (idéalement ≤ 3 champs). Actuellement ${heaviestForm} champs.`,
    );
  }

  // — Accessibilité images —
  if (s.totalImages > 0 && s.imagesMissingAlt / s.totalImages > 0.3) {
    findings.push({
      severity: "warning",
      title: "Textes alternatifs manquants",
      detail: `${s.imagesMissingAlt}/${s.totalImages} images sans attribut alt.`,
    });
    recommendations.push(
      "Ajouter des `alt` descriptifs aux images pour l'accessibilité et le SEO.",
    );
  }

  let score = 10;
  score -= Math.max(0, s.interactiveAboveFold - 12) * 0.25;
  score -= Math.max(0, s.navLinks - 7) * 0.3;
  score -= tinyCtas.length * 0.4;
  score -= s.longestParagraph > 600 ? 1 : 0;
  score -= Math.max(0, heaviestForm - 5) * 0.5;
  score -=
    s.totalImages > 0 && s.imagesMissingAlt / s.totalImages > 0.3 ? 0.7 : 0;

  return {
    dimension: "ux",
    label: "Dimension Cognitive (UX & Friction Mapping)",
    score: round1(clamp(score)),
    findings,
    recommendations,
    metrics: {
      interactiveAboveFold: s.interactiveAboveFold,
      navLinks: s.navLinks,
      smallTargets: tinyCtas.length,
      longestParagraph: s.longestParagraph,
      heaviestForm: heaviestForm,
      scrollPages: s.scrollPages,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DIMENSION BUSINESS — CRO & Conversion (modèle LIFT)
// ─────────────────────────────────────────────────────────────────────────────
export function analyzeCRO(s: RawSnapshot): DimensionReport {
  const findings: Finding[] = [];
  const recommendations: string[] = [];

  const ctaAboveFold = s.ctas.filter((c) => c.aboveFold);

  // — LIFT : Proposition de valeur —
  const vp = s.h1Text || s.aboveFoldText.slice(0, 120);
  if (!s.h1Text) {
    findings.push({
      severity: "critical",
      title: "Proposition de valeur absente (H1)",
      detail: "Aucun titre H1 clair above the fold pour porter la promesse.",
    });
    recommendations.push(
      "Ajouter un H1 explicite formulant le bénéfice principal en < 10 mots (test A/B sur la promesse).",
    );
  } else if (s.h1Text.length > 90) {
    findings.push({
      severity: "warning",
      title: "Proposition de valeur trop longue",
      detail: `H1 de ${s.h1Text.length} caractères — manque d'impact.`,
    });
    recommendations.push(
      "Raccourcir le H1 à une promesse percutante (≤ 60 caractères).",
    );
  } else {
    findings.push({
      severity: "ok",
      title: "Proposition de valeur présente",
      detail: `H1 : « ${s.h1Text} ».`,
    });
  }

  if (s.h1Count > 1) {
    findings.push({
      severity: "warning",
      title: "Plusieurs H1",
      detail: `${s.h1Count} H1 détectés — dilue le message et nuit au SEO.`,
    });
    recommendations.push("Conserver un seul H1 par page.");
  }

  // — LIFT : Clarté / Appel à l'action —
  if (ctaAboveFold.length === 0) {
    findings.push({
      severity: "critical",
      title: "Aucun CTA above the fold",
      detail: "L'utilisateur ne voit aucune action claire sans scroller.",
    });
    recommendations.push(
      "Placer un CTA principal contrasté dès le premier écran (test A/B : libellé orienté bénéfice vs générique).",
    );
  } else {
    findings.push({
      severity: "ok",
      title: "CTA visible d'emblée",
      detail: `${ctaAboveFold.length} CTA above the fold (ex: « ${ctaAboveFold[0].text}» ).`,
    });
  }

  // — LIFT : Distraction —
  if (ctaAboveFold.length > 4) {
    findings.push({
      severity: "warning",
      title: "Trop de CTA concurrents",
      detail: `${ctaAboveFold.length} CTA above the fold se disputent l'attention.`,
    });
    recommendations.push(
      "Désigner un CTA primaire unique et passer les autres en style secondaire (réduire la distraction LIFT).",
    );
  }

  // — LIFT : Anxiété / réassurance —
  if (!s.hasSocialProof) {
    findings.push({
      severity: "warning",
      title: "Preuve sociale absente",
      detail: "Aucun témoignage, note ou logo client détecté.",
    });
    recommendations.push(
      "Ajouter de la preuve sociale (témoignages, logos, chiffres) près du CTA pour lever l'anxiété.",
    );
  }

  // — Clarté tarifaire —
  if (!s.hasPricing) {
    findings.push({
      severity: "warning",
      title: "Tarification non visible",
      detail: "Aucune indication de prix détectée sur la page.",
    });
    recommendations.push(
      "Clarifier le prix ou l'offre (gratuit, essai, à partir de…) pour réduire l'incertitude.",
    );
  }

  let score = 10;
  score -= s.h1Text ? 0 : 2.5;
  score -= s.h1Text.length > 90 ? 0.7 : 0;
  score -= s.h1Count > 1 ? 0.5 : 0;
  score -= ctaAboveFold.length === 0 ? 2.5 : 0;
  score -= Math.max(0, ctaAboveFold.length - 4) * 0.4;
  score -= s.hasSocialProof ? 0 : 1;
  score -= s.hasPricing ? 0 : 0.8;

  return {
    dimension: "cro",
    label: "Dimension Business (CRO & Conversion)",
    score: round1(clamp(score)),
    findings,
    recommendations,
    metrics: {
      valueProposition: vp,
      ctaAboveFold: ctaAboveFold.length,
      totalCtas: s.ctas.length,
      hasPricing: s.hasPricing,
      hasSocialProof: s.hasSocialProof,
      h1Count: s.h1Count,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cartographie de friction & prédiction de décrochage
// ─────────────────────────────────────────────────────────────────────────────
export function mapFriction(s: RawSnapshot): FrictionReport {
  // Charge cognitive : combine choix (Hick), densité de texte et longueur de page.
  const choiceLoad = Math.min(40, s.interactiveAboveFold * 2);
  const textLoad = Math.min(30, s.longestParagraph / 30);
  const lengthLoad = Math.min(20, Math.max(0, (s.scrollPages - 3) * 4));
  const formLoad = Math.min(
    10,
    s.forms.reduce((m, f) => Math.max(m, f.fields), 0),
  );
  const cognitiveLoadIndex = Math.round(
    choiceLoad + textLoad + lengthLoad + formLoad,
  );

  // Décrochage : plus la page est longue et la charge forte, plus tôt on décroche.
  // Base ~0.7 (les gens scrollent ~70% en moyenne), corrigé par la friction.
  let dropoff = 0.7;
  dropoff -= cognitiveLoadIndex / 400; // jusqu'à -0.25
  dropoff -= s.ctas.some((c) => c.aboveFold) ? 0 : 0.1;
  dropoff += s.hasSocialProof ? 0.05 : 0;
  dropoff = Math.max(0.2, Math.min(0.9, dropoff));

  // Localisation de la zone de friction maximale.
  let zone = "Premier écran (above the fold)";
  if (s.ctas.some((c) => c.aboveFold) && s.scrollPages > 2) {
    const pct = Math.round(dropoff * 100);
    zone = `Aux alentours de ${pct}% de la hauteur de page (≈ écran ${Math.max(
      1,
      Math.round(dropoff * s.scrollPages),
    )}/${Math.round(s.scrollPages)}), là où l'intérêt retombe avant une relance ou un CTA secondaire.`;
  } else if (!s.ctas.some((c) => c.aboveFold)) {
    zone =
      "Dès le premier écran : absence de CTA/action claire visible immédiatement.";
  }

  return {
    predictedDropoffDepth: Math.round(dropoff * 100) / 100,
    maxFrictionZone: zone,
    cognitiveLoadIndex,
  };
}

export function overallScore(reports: DimensionReport[]): number {
  // Pondération orientée business : CRO 40%, UX 35%, UI 25%.
  const weights: Record<string, number> = { cro: 0.4, ux: 0.35, ui: 0.25 };
  const total = reports.reduce(
    (sum, r) => sum + r.score * (weights[r.dimension] ?? 0.33),
    0,
  );
  return round1(clamp(total));
}
