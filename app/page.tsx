// Icônes SVG (line icons, jamais d'emoji) ───────────────────────────────────
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Reticle() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
function EyeMeasure() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}
function Nodes() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="5" cy="6" r="2.2" />
      <circle cx="19" cy="6" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <path d="M6.8 7.4 10.5 16M17.2 7.4 13.5 16M7 6h10" />
    </svg>
  );
}
function Target() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function Plug() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...stroke}>
      <path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v6" />
    </svg>
  );
}

export default function Home() {
  const ticker = [
    "WCAG AA",
    "LOI DE HICK",
    "LOI DE FITTS",
    "MODÈLE LIFT",
    "SCROLL DEPTH",
    "DESKTOP + MOBILE",
    "SCORE /10",
    "A/B-READY",
  ];

  return (
    <>
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-in">
          <a className="brand" href="#top" aria-label="BeFocus, accueil">
            <span className="mark">
              <Reticle />
            </span>
            BeFocus
          </a>
          <nav className="navlinks" aria-label="Principale">
            <a href="#dimensions">Les 3 canaux</a>
            <a href="#tools">Outils</a>
            <a href="#connect">Connexion</a>
            <a href="#specs">Specs</a>
          </nav>
          <a className="btn btn-solid" href="#connect">
            <Plug /> Connecter à Claude
          </a>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero" id="top">
        <div className="hero-in">
          <div className="hero-left">
            <span className="kicker">Serveur MCP · UI · UX · CRO</span>
            <h1>
              Le banc de mesure
              <br />
              de vos <em>interfaces</em>.
            </h1>
            <p className="lead">
              BeFocus donne à Claude Code des yeux et des instruments de mesure :
              il inspecte le rendu réel, chiffre la friction et note la
              conversion. Aucune approximation.
            </p>
            <div className="hero-actions">
              <a className="btn btn-solid" href="#connect">
                Brancher en 30 s <Arrow />
              </a>
              <a className="btn btn-line" href="#dimensions">
                Voir une mesure
              </a>
            </div>
          </div>

          <div className="hero-right">
            {/* Élément signature : le rapport que produit réellement l'outil */}
            <div className="scorecard" role="img" aria-label="Exemple de rapport BeFocus : score global 6,4 sur 10. UI 7,2. UX 5,8. CRO 6,1.">
              <div className="sc-head">
                <span>Rapport · app.exemple.com</span>
                <span>23.06</span>
              </div>
              <div className="sc-score">
                <b>6.4</b>
                <span>/ 10 global</span>
              </div>
              <div className="sc-bars">
                {[
                  { k: "UI — visuelle", v: 7.2 },
                  { k: "UX — cognitive", v: 5.8 },
                  { k: "CRO — business", v: 6.1 },
                ].map((b) => (
                  <div className="sc-bar" key={b.k}>
                    <div className="sc-bar-top">
                      <span>{b.k}</span>
                      <span>{b.v.toFixed(1)}</span>
                    </div>
                    <div className="sc-track">
                      <div
                        className="sc-fill"
                        style={{ width: `${b.v * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="sc-notes">
                <div className="sc-note">
                  <span className="tag">CRITIQUE</span>
                  <span>Aucun CTA above the fold</span>
                </div>
                <div className="sc-note">
                  <span className="tag">FRICTION</span>
                  <span>Décrochage prédit ~58 % de scroll</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker ──────────────────────────────────────────────────────── */}
      <div className="ticker" aria-hidden>
        <div className="ticker-track">
          <span>
            {ticker.map((t) => (
              <span key={`a-${t}`}>
                <span className="dot">●</span> {t}
              </span>
            ))}
          </span>
          <span>
            {ticker.map((t) => (
              <span key={`b-${t}`}>
                <span className="dot">●</span> {t}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* ── Les 3 canaux de mesure ──────────────────────────────────────── */}
      <section className="section" id="dimensions">
        <div className="wrap">
          <div className="shead">
            <span className="kicker">Trois canaux, une lecture</span>
            <h2>Ce que l&apos;instrument mesure</h2>
            <p>
              Chaque page est inspectée sur trois canaux indépendants. Pas de
              ressenti : des grandeurs, des seuils, un verdict.
            </p>
          </div>

          <div className="channels">
            <article className="channel">
              <div className="ch-icon">
                <EyeMeasure />
              </div>
              <div className="ch-meta">
                <div className="ch-id">Canal 01 · Visuel</div>
                <h3>Dimension visuelle</h3>
                <div className="ch-sub">UI &amp; Design System</div>
                <p className="ch-desc">
                  Capture du rendu réel en desktop et mobile, puis lecture de la
                  cohérence visuelle.
                </p>
              </div>
              <ul className="metric-list">
                <li>Captures desktop &amp; mobile</li>
                <li>Contrastes WCAG AA</li>
                <li>Palette &amp; cohérence</li>
                <li>Hiérarchie typographique</li>
              </ul>
            </article>

            <article className="channel">
              <div className="ch-icon">
                <Nodes />
              </div>
              <div className="ch-meta">
                <div className="ch-id">Canal 02 · Cognitif</div>
                <h3>Dimension cognitive</h3>
                <div className="ch-sub">UX &amp; Friction Mapping</div>
                <p className="ch-desc">
                  Lecture de la charge cognitive à partir du DOM et des lois
                  fondamentales de l&apos;UX.
                </p>
              </div>
              <ul className="metric-list">
                <li>Loi de Hick (choix)</li>
                <li>Loi de Fitts (cibles)</li>
                <li>Zone de friction max</li>
                <li>Profondeur d&apos;abandon</li>
              </ul>
            </article>

            <article className="channel">
              <div className="ch-icon">
                <Target />
              </div>
              <div className="ch-meta">
                <div className="ch-id">Canal 03 · Business</div>
                <h3>Dimension business</h3>
                <div className="ch-sub">CRO &amp; Conversion</div>
                <p className="ch-desc">
                  Confrontation au modèle LIFT des interfaces à plus fort taux
                  de conversion. Verdict /10.
                </p>
              </div>
              <ul className="metric-list">
                <li>Proposition de valeur</li>
                <li>Clarté des CTA</li>
                <li>Tarif &amp; preuve sociale</li>
                <li>Recos A/B-ready</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ── Outils ──────────────────────────────────────────────────────── */}
      <section className="section dark" id="tools">
        <div className="wrap">
          <div className="shead">
            <span className="kicker">Surface MCP</span>
            <h2>Les outils exposés à Claude</h2>
            <p>
              Six commandes appelables directement depuis Claude Code, en
              langage naturel ou explicitement.
            </p>
          </div>

          <div className="tools">
            {[
              [
                "analyze_page",
                "Analyse complète des 3 canaux + cartographie de friction + score global pondéré.",
              ],
              [
                "analyze_ui",
                "Dimension visuelle seule : contrastes, palette, typographie.",
              ],
              [
                "analyze_ux",
                "Dimension cognitive seule : Hick, Fitts, charge, décrochage.",
              ],
              [
                "analyze_cro",
                "Dimension business seule : LIFT, CTA, valeur, tarif.",
              ],
              [
                "capture_screenshot",
                "Rendu visuel réel en desktop (1440px) et mobile (390px).",
              ],
              [
                "befocus_status",
                "Vérifie la connexion au navigateur distant.",
              ],
            ].map(([name, desc]) => (
              <div className="tool-row" key={name}>
                <code>{name}</code>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Connexion (séquence réelle) ─────────────────────────────────── */}
      <section className="section" id="connect">
        <div className="wrap">
          <div className="shead">
            <span className="kicker">Mise en service</span>
            <h2>Branché à Claude en trois temps</h2>
            <p>
              Tout tourne sur Vercel. Aucune installation locale, aucun Chromium
              à embarquer.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <span className="sn">01 / Déployer</span>
              <h4>Sur Vercel</h4>
              <p>
                Importez le dépôt et renseignez{" "}
                <code>BROWSER_WS_ENDPOINT</code> (un navigateur distant type
                Browserless).
              </p>
            </div>
            <div className="step">
              <span className="sn">02 / Connecter</span>
              <h4>L&apos;endpoint MCP</h4>
              <p>
                Pointez Claude Code vers <code>/api/mcp</code> de votre
                déploiement.
              </p>
            </div>
            <div className="step">
              <span className="sn">03 / Mesurer</span>
              <h4>Demander une analyse</h4>
              <p>
                « Mesure l&apos;UX de ma landing page » — Claude appelle BeFocus
                et renvoie le rapport.
              </p>
            </div>
          </div>

          <div className="codeblock">
            <div>
              <span className="c"># Ajouter BeFocus à Claude Code</span>
            </div>
            <div>
              <span className="o">claude mcp add</span> --transport http befocus
              https://&lt;votre-app&gt;.vercel.app/api/mcp
            </div>
            <div>&nbsp;</div>
            <div>
              <span className="c"># ou dans .mcp.json</span>
            </div>
            <div>{`{ "mcpServers": { "befocus": {`}</div>
            <div>{`    "type": "http",`}</div>
            <div>{`    "url": "https://<votre-app>.vercel.app/api/mcp" } } }`}</div>
          </div>
        </div>
      </section>

      {/* ── Specs ───────────────────────────────────────────────────────── */}
      <section className="section" id="specs">
        <div className="wrap">
          <div className="shead">
            <span className="kicker">Fiche technique</span>
            <h2>Conçu pour le cloud</h2>
          </div>

          <div className="specsheet">
            {[
              ["Serveur MCP", "befocus"],
              ["Runtime", "Node.js · TypeScript · Next.js"],
              ["Hébergement", "Vercel (serverless)"],
              ["Transport", "Streamable HTTP + SSE"],
              ["Inspection", "Puppeteer-core → Browserless"],
              ["Frameworks", "Hick · Fitts · LIFT · WCAG"],
            ].map(([k, v]) => (
              <div className="specrow" key={k}>
                <span className="k">{k}</span>
                <span className="v">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer>
        <div className="wrap foot-in">
          <a className="brand" href="#top" style={{ fontSize: 17 }}>
            <span className="mark">
              <Reticle />
            </span>
            BeFocus
          </a>
          <span>Le banc de mesure des interfaces — propulsé par MCP.</span>
        </div>
      </footer>
    </>
  );
}
