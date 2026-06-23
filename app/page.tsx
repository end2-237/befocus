export default function Home() {
  return (
    <>
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <header className="topbar">
        <div className="brand">
          <span className="logo-mark">B</span>
          <span>
            Be<span style={{ color: "var(--orange-bright)" }}>Focus</span>
          </span>
        </div>
        <nav className="nav-links">
          <a href="#dimensions">Dimensions</a>
          <a href="#commands">Command Set</a>
          <a href="#install">Connexion</a>
          <a href="#specs">Specs</a>
        </nav>
        <a className="btn btn-primary" href="#install">
          Connecter à Claude
        </a>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <span className="tagline">● Serveur MCP · UI · UX · CRO</span>
          <h1>
            UNE ANALYSE <span className="accent">CHIRURGICALE</span>
            <br />
            DE VOS INTERFACES
          </h1>
          <p className="sub">
            BeFocus donne à Claude Code des <strong>yeux</strong> et des{" "}
            <strong>outils de mesure</strong> pour inspecter le code réel,
            capturer le rendu et cartographier les zones de décrochage — sur
            n&apos;importe quel site web ou SaaS.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#install">
              Démarrer en 30 secondes
            </a>
            <a className="btn btn-ghost" href="#dimensions">
              Voir les 3 dimensions
            </a>
          </div>

          <div className="terminal">
            <div className="terminal-bar">
              <span className="dot r" />
              <span className="dot y" />
              <span className="dot g" />
              <span className="terminal-title">claude — befocus</span>
            </div>
            <div className="terminal-body">
              <div>
                <span className="prompt">&gt;</span> Analyse la page
                d&apos;accueil de mon SaaS et donne-moi un score CRO
              </div>
              <div className="muted">&nbsp;</div>
              <div>
                <span className="out">⚡ befocus › </span>
                <span className="flag">analyze_page</span>{" "}
                <span className="muted">--url</span> app.exemple.com
              </div>
              <div className="out">
                {" "}
                ├─ 📸 Capture desktop + mobile … ok
              </div>
              <div className="out"> ├─ 🧠 DOM · Hick · Fitts · LIFT … ok</div>
              <div className="out"> └─ 🎯 Score global : 6.4/10</div>
              <div className="muted">&nbsp;</div>
              <div className="out">
                {" "}
                🔴 Aucun CTA above the fold · 🟠 Formulaire à 7 champs
              </div>
              <div className="out">
                {" "}
                🔥 Décrochage prédit ~58% de scroll
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dimensions ────────────────────────────────────────────────── */}
      <section id="dimensions">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">L&apos;architecture fonctionnelle</span>
            <h2>Trois dimensions, zéro approximation</h2>
            <p>
              Plutôt que de laisser l&apos;IA deviner, BeFocus structure
              l&apos;analyse autour de trois axes stricts pour maximiser
              l&apos;impact business.
            </p>
          </div>

          <div className="grid-3">
            <article className="card">
              <span className="num">01</span>
              <div className="icon">🎨</div>
              <h3>Dimension Visuelle</h3>
              <div className="role">UI &amp; Design System Tracking</div>
              <p>
                Un navigateur invisible capture l&apos;interface en desktop et
                mobile, extrait la palette, la hiérarchie typographique et
                calcule les contrastes WCAG.
              </p>
              <ul>
                <li>Captures desktop &amp; mobile</li>
                <li>Palette &amp; contrastes AA</li>
                <li>Hiérarchie typographique</li>
                <li>Image premium en &lt; 3 s</li>
              </ul>
            </article>

            <article className="card">
              <span className="num">02</span>
              <div className="icon">🧠</div>
              <h3>Dimension Cognitive</h3>
              <div className="role">UX &amp; Friction Mapping</div>
              <p>
                Analyse de la structure du DOM et de la charge cognitive via les
                lois de Hick et Fitts. Identifie la zone de friction maximale et
                prédit le scroll d&apos;abandon.
              </p>
              <ul>
                <li>Loi de Hick &amp; Fitts</li>
                <li>Charge cognitive mesurée</li>
                <li>Zone de friction maximale</li>
                <li>Profondeur de décrochage</li>
              </ul>
            </article>

            <article className="card">
              <span className="num">03</span>
              <div className="icon">🎯</div>
              <h3>Dimension Business</h3>
              <div className="role">CRO &amp; Conversion Analytics</div>
              <p>
                Confronte les données (CTA, proposition de valeur above the
                fold) au modèle LIFT des plateformes à plus fort taux de
                conversion. Note stricte sur /10.
              </p>
              <ul>
                <li>Modèle LIFT</li>
                <li>Clarté des CTA &amp; tarifs</li>
                <li>Note /10 sans complaisance</li>
                <li>Recommandations A/B-ready</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ── Command set ───────────────────────────────────────────────── */}
      <section id="commands" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The command set</span>
            <h2>Les outils exposés à Claude</h2>
            <p>
              Chaque outil MCP est appelable directement depuis Claude Code.
            </p>
          </div>

          <div className="cmd-grid">
            <div className="cmd">
              <h4>
                <span className="ico">◆</span> analyze_page
              </h4>
              <p>
                Analyse complète des 3 dimensions, cartographie de friction et
                score global pondéré.
              </p>
              <div className="chips">
                <span className="chip">ui</span>
                <span className="chip">ux</span>
                <span className="chip">cro</span>
                <span className="chip">friction</span>
              </div>
            </div>

            <div className="cmd">
              <h4>
                <span className="ico">◆</span> analyze_ui · ux · cro
              </h4>
              <p>
                Cible une seule dimension pour une itération rapide et un
                feedback chirurgical.
              </p>
              <div className="chips">
                <span className="chip">contraste</span>
                <span className="chip">hick</span>
                <span className="chip">lift</span>
              </div>
            </div>

            <div className="cmd">
              <h4>
                <span className="ico">◆</span> capture_screenshot
              </h4>
              <p>
                Rend le visuel réel de la page en desktop (1440px) et mobile
                (390px).
              </p>
              <div className="chips">
                <span className="chip">desktop</span>
                <span className="chip">mobile</span>
                <span className="chip">png</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Install ───────────────────────────────────────────────────── */}
      <section id="install">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Connexion</span>
            <h2>Branché à Claude en 30 secondes</h2>
            <p>
              BeFocus parle le protocole MCP via HTTP. Aucune installation
              locale — tout tourne sur Vercel.
            </p>
          </div>

          <div className="steps">
            <div className="step">
              <span className="step-n">1</span>
              <h4>Déployez sur Vercel</h4>
              <p>
                Un clic. Renseignez l&apos;endpoint d&apos;un navigateur distant
                (Browserless) dans les variables d&apos;environnement.
              </p>
            </div>
            <div className="step">
              <span className="step-n">2</span>
              <h4>Ajoutez le serveur MCP</h4>
              <p>
                Pointez Claude Code vers l&apos;URL <code>/api/mcp</code> de
                votre déploiement.
              </p>
            </div>
            <div className="step">
              <span className="step-n">3</span>
              <h4>Demandez une analyse</h4>
              <p>
                « Analyse l&apos;UX de ma landing page » — Claude appelle BeFocus
                et renvoie le rapport.
              </p>
            </div>
          </div>

          <div className="code-block">
            <div>
              <span className="c"># Ajouter BeFocus à Claude Code</span>
            </div>
            <div>
              <span className="k">claude mcp add</span> --transport http befocus{" "}
              https://&lt;votre-app&gt;.vercel.app/api/mcp
            </div>
            <div>&nbsp;</div>
            <div>
              <span className="c">
                # … ou directement dans .mcp.json / claude_desktop_config.json
              </span>
            </div>
            <div>{`{ "mcpServers": { "befocus": {`}</div>
            <div>{`    "type": "http",`}</div>
            <div>{`    "url": "https://<votre-app>.vercel.app/api/mcp" } } }`}</div>
          </div>
        </div>
      </section>

      {/* ── Specs ─────────────────────────────────────────────────────── */}
      <section id="specs" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Fiche technique</span>
            <h2>Conçu pour le cloud</h2>
          </div>

          <div className="specs">
            <div className="spec">
              <span className="label">Serveur MCP</span>
              <span className="value">befocus</span>
            </div>
            <div className="spec">
              <span className="label">Runtime</span>
              <span className="value">Node.js · TypeScript</span>
            </div>
            <div className="spec">
              <span className="label">Hébergement</span>
              <span className="value">Vercel (Serverless)</span>
            </div>
            <div className="spec">
              <span className="label">Transport</span>
              <span className="value">Streamable HTTP + SSE</span>
            </div>
            <div className="spec">
              <span className="label">Moteur d&apos;inspection</span>
              <span className="value">Puppeteer-core → Browserless</span>
            </div>
            <div className="spec">
              <span className="label">Frameworks</span>
              <span className="value">Hick · Fitts · LIFT · WCAG</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer>
        <div className="container footer-inner">
          <div className="brand" style={{ fontSize: 16 }}>
            <span className="logo-mark" style={{ width: 28, height: 28 }}>
              B
            </span>
            <span>
              Be<span style={{ color: "var(--orange-bright)" }}>Focus</span>
            </span>
          </div>
          <span>
            Analyse chirurgicale UI · UX · CRO pour Claude Code — propulsé par
            MCP.
          </span>
        </div>
      </footer>
    </>
  );
}
