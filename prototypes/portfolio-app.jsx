// Portfolio app — React UI with crossfading sections, mounted over the flow background.
const { useState, useEffect, useRef } = React;

// --- Content -----------------------------------------------------------------

const PROJECTS = [
  {
    id: 'vitametrics',
    year: '2024',
    name: 'Vitametrics',
    role: 'Co-Founder · Full-stack',
    blurb: 'Non-profit health analytics platform turning wearable data into research insights for clinicians.',
    stack: ['Next.js', 'Python', 'AWS', 'Fitbit API'],
    href: '#',
  },
  {
    id: 'crystal',
    year: '2024',
    name: 'Crystal',
    role: 'Systems · Cybersecurity',
    blurb: 'Encrypted peer-to-peer file relay with zero-knowledge auth. Cross-platform CLI in Rust.',
    stack: ['Rust', 'libsodium', 'Tauri'],
    href: '#',
  },
  {
    id: 'lumen',
    year: '2023',
    name: 'Lumen',
    role: 'AI · Frontend',
    blurb: 'Real-time semantic search over lecture videos with on-the-fly transcript embeddings.',
    stack: ['React', 'FastAPI', 'pgvector', 'OpenAI'],
    href: '#',
  },
  {
    id: 'driftlog',
    year: '2023',
    name: 'Driftlog',
    role: 'Open-source',
    blurb: 'Observability tool for tracking schema drift across postgres replicas. 1.2k stars.',
    stack: ['Go', 'Postgres', 'Grafana'],
    href: '#',
  },
];

const SKILLS = [
  { group: 'Languages',  items: ['TypeScript', 'Python', 'Rust', 'Go', 'C++'] },
  { group: 'Frontend',   items: ['React', 'Next.js', 'Three.js', 'WebGL'] },
  { group: 'Backend',    items: ['Node', 'FastAPI', 'Postgres', 'Redis'] },
  { group: 'Infra',      items: ['AWS', 'Docker', 'Terraform', 'GitHub Actions'] },
];

const SOCIALS = [
  { label: 'GitHub',    handle: '@brandonle',     href: 'https://github.com' },
  { label: 'LinkedIn',  handle: 'in/brandon-le',  href: 'https://linkedin.com' },
  { label: 'X',         handle: '@brandonle',     href: 'https://x.com' },
  { label: 'Email',     handle: 'hi@brandonle.dev', href: 'mailto:hi@brandonle.dev' },
];

const CONCEPTS = [
  { id: 'marble',    label: 'Marble',     desc: 'Liquid color flows' },
  { id: 'halo',      label: 'Halo',       desc: 'Crimson blobs + lit ring with halftone screen' },
  { id: 'citygrid',  label: 'City Grid',  desc: 'Neon pixel cells fading across a dark field' },
  { id: 'concentric',label: 'Concentric', desc: 'Wide soft arcs from an off-screen source' },
  { id: 'deepsignal',label: 'Deep Signal',desc: 'Oscilloscope traces over a deep field' },
  { id: 'glass',     label: 'Floating Glass', desc: 'Smooth folded sheets with crease light' },
  { id: 'rings',     label: 'Metallic Rings', desc: 'Deep dark concentric bevels with grain' },
  { id: 'voronoi',   label: 'Voronoi',    desc: 'Animated cellular tessellation' },
  { id: 'nebula',    label: 'Nebula',     desc: 'Cosmic gas clouds with stars' },
  { id: 'aurora',    label: 'Aurora',     desc: 'Vertical light curtains' },
  { id: 'caustics',  label: 'Caustics',   desc: 'Refractive water' },
  { id: 'mesh',      label: 'Mesh',       desc: 'Drifting gradient blobs' },
  { id: 'pixel',     label: 'Pixel',      desc: 'Chunky dithered flow grid' },
  { id: 'halftone',  label: 'Halftone',   desc: 'Dot grid sized by flow' },
  { id: 'topo',      label: 'Topo',       desc: 'Topographic contour lines' },
  { id: 'ink',       label: 'Ink',        desc: 'Sumi-e ink blooms in water' },
  { id: 'plasma',    label: 'Plasma',     desc: 'Neon plasma waves' },
  { id: 'strata',    label: 'Strata',     desc: 'Warped geological bands' },
  { id: 'linework',  label: 'Linework',   desc: 'Crosshatched flow ink' },
  { id: 'petals',    label: 'Petals',     desc: 'Radial flower bloom' },
  { id: 'ascii',     label: 'ASCII',      desc: 'Flow field as terminal glyphs' },
  { id: 'glitch',    label: 'Glitch',     desc: 'CRT datamosh with aberration' },
];

const NAV = [
  { id: 'index',   label: 'Index',   num: '01' },
  { id: 'work',    label: 'Work',    num: '02' },
  { id: 'about',   label: 'About',   num: '03' },
  { id: 'contact', label: 'Contact', num: '04' },
];

// --- Sections ----------------------------------------------------------------

function IndexSection({ onNav }) {
  return (
    <div className="section section--index">
      <div className="hero">
        <div className="hero__meta">
          <span className="dot" />
          <span className="hero__status">Available · Summer 2026</span>
        </div>
        <h1 className="hero__title">
          <span className="line">Brandon Le.</span>
          <span className="line line--italic">software engineer.</span>
        </h1>
        <p className="hero__sub">
          UCLA CS · Co-founder, Vitametrics.
        </p>
        <div className="hero__cta">
          <button className="btn btn--primary" onClick={() => onNav('work')}>
            <span>Selected work</span>
            <Arrow />
          </button>
          <button className="btn btn--ghost" onClick={() => onNav('contact')}>
            Get in touch
          </button>
        </div>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="marquee__run">
              {['Full-stack', '·', 'Systems', '·', 'WebGL', '·', 'AI', '·',
                'Open-source', '·', 'Cybersecurity', '·'].map((w, j) => (
                <span key={j} className={w === '·' ? 'marquee__dot' : 'marquee__word'}>{w}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkSection({ onNav }) {
  const [hover, setHover] = useState(null);
  return (
    <div className="section section--work">
      <div className="section__head">
        <span className="eyebrow">02 — Selected work</span>
        <h2 className="section__title">
          <span>A handful of</span>
          <span className="italic">things I&rsquo;ve shipped.</span>
        </h2>
      </div>
      <ul
        className="worklist"
        onMouseLeave={() => setHover(null)}
      >
        {PROJECTS.map((p, i) => (
          <li
            key={p.id}
            className={`workrow ${hover != null && hover !== i ? 'workrow--dim' : ''}`}
            onMouseEnter={() => setHover(i)}
          >
            <span className="workrow__year">{p.year}</span>
            <div className="workrow__main">
              <span className="workrow__name">{p.name}</span>
              <span className="workrow__role">{p.role}</span>
            </div>
            <span className="workrow__blurb">{p.blurb}</span>
            <span className="workrow__stack">
              {p.stack.map((s, j) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </span>
            <span className="workrow__arrow"><Arrow /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="section section--about">
      <div className="section__head">
        <span className="eyebrow">03 — About</span>
        <h2 className="section__title">
          <span>An engineer with a</span>
          <span className="italic">soft spot for craft.</span>
        </h2>
      </div>
      <div className="about__grid">
        <div className="about__col about__col--bio">
          <p>
            I&rsquo;m Brandon, a software engineer studying CS at <em>UCLA</em>.
            I like systems that feel honest — fast, legible, free of clutter — and
            I&rsquo;ll happily spend an afternoon tuning a fragment shader or chasing
            a memory leak across a stack.
          </p>
          <p>
            Outside of the terminal: bouldering, film photography, and trying to
            beat my dad at chess.
          </p>
          <dl className="about__facts">
            <div><dt>Based in</dt><dd>Los Angeles, CA</dd></div>
            <div><dt>Studying</dt><dd>Computer Science, UCLA</dd></div>
            <div><dt>Building</dt><dd>Vitametrics (Co-founder)</dd></div>
            <div><dt>Open to</dt><dd>SWE internships, summer 2026</dd></div>
          </dl>
        </div>
        <div className="about__col about__col--skills">
          {SKILLS.map((s) => (
            <div key={s.group} className="skillblock">
              <div className="skillblock__label">{s.group}</div>
              <div className="skillblock__items">
                {s.items.map((it) => <span key={it} className="chip">{it}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="section section--contact">
      <div className="section__head">
        <span className="eyebrow">04 — Contact</span>
        <h2 className="section__title">
          <span>Have something</span>
          <span className="italic">worth building?</span>
        </h2>
      </div>
      <div className="contact__grid">
        <a className="contact__primary" href="mailto:hi@brandonle.dev">
          <span className="contact__primary-label">Drop a line</span>
          <span className="contact__primary-email">hi@brandonle.dev</span>
          <Arrow />
        </a>
        <ul className="socials">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer">
                <span className="socials__label">{s.label}</span>
                <span className="socials__handle">{s.handle}</span>
                <Arrow />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg className="arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 11L11 3M11 3H4.5M11 3V9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// --- App ---------------------------------------------------------------------

// Palette swatches (UI) ↔ palette name (shader). Match by JSON equality.
const PALETTE_OPTIONS = [
  { name: 'indigo',   swatch: ['#0a0c20', '#7c83f0', '#7bd9eb', '#9a8af2'] },
  { name: 'sunset',   swatch: ['#1a0a14', '#ff8e5a', '#f24d8b', '#ffcc66'] },
  { name: 'forest',   swatch: ['#08120e', '#8df0b4', '#d9f08c', '#3aa676'] },
  { name: 'mono',     swatch: ['#0a0a0d', '#dfe2ec', '#8c93a7', '#5a5e6f'] },
  { name: 'sakura',   swatch: ['#d1d1d4', '#382420', '#f5bcd3', '#dc6694'] },
  { name: 'damascus', swatch: ['#0d101a', '#363a48', '#d2d8ea', '#9e8052'] },
];

function App() {
  const defaults = /*EDITMODE-BEGIN*/{
    "concept": "halo",
    "palette": ["#0a0c20", "#7c83f0", "#7bd9eb", "#9a8af2"],
    "speed": 1.0,
    "grain": 0.05,
    "serifDisplay": true
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = window.useTweaks ? window.useTweaks(defaults)
    : [defaults, () => {}];

  // Resolve palette swatch array → shader palette name
  const paletteName = (() => {
    const key = JSON.stringify(tweaks.palette);
    const hit = PALETTE_OPTIONS.find((p) => JSON.stringify(p.swatch) === key);
    return hit ? hit.name : 'indigo';
  })();

  const [active, setActive] = useState('index');
  const [phase, setPhase] = useState('in'); // 'in' | 'out'
  const [pending, setPending] = useState(null);
  const clockRef = useRef(null);

  // Live clock for footer
  const [time, setTime] = useState(formatTime());
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(id);
  }, []);

  function navigate(id) {
    if (id === active) return;
    setPending(id);
    setPhase('out');
  }

  useEffect(() => {
    if (phase === 'out' && pending) {
      const id = setTimeout(() => {
        setActive(pending);
        setPending(null);
        setPhase('in');
      }, 360);
      return () => clearTimeout(id);
    }
  }, [phase, pending]);

  // wire tweaks into the shader
  useEffect(() => {
    if (!window.FlowBG) return;
    window.FlowBG.setConcept(tweaks.concept);
    window.FlowBG.setPalette(paletteName);
    window.FlowBG.setSpeed(tweaks.speed);
    window.FlowBG.setGrain(tweaks.grain);
  }, [tweaks.concept, paletteName, tweaks.speed, tweaks.grain]);

  useEffect(() => {
    document.documentElement.classList.toggle('no-serif', !tweaks.serifDisplay);
  }, [tweaks.serifDisplay]);

  const Section = {
    index: IndexSection,
    work: WorkSection,
    about: AboutSection,
    contact: ContactSection,
  }[active];

  const activeNum = NAV.find((n) => n.id === active)?.num || '01';

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); navigate('index'); }}>
          <span className="brand__mark">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1"/>
              <path d="M5 14 Q 11 4, 17 14" stroke="currentColor" strokeWidth="1" fill="none"/>
              <path d="M5 11 Q 11 1, 17 11" stroke="currentColor" strokeWidth="1" fill="none" opacity=".5"/>
            </svg>
          </span>
          <span className="brand__name"><em>Brandon</em> Le</span>
        </a>
        <nav className="nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav__item ${active === n.id ? 'nav__item--active' : ''}`}
              onClick={() => navigate(n.id)}
            >
              <span className="nav__num">{n.num}</span>
              <span className="nav__label">{n.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Main content (crossfade) */}
      <main className={`stage stage--${phase}`} key={active}>
        <Section onNav={navigate} />
      </main>

      {/* Concept switcher (always visible) */}
      <div className="bgswitch">
        <span className="bgswitch__label">Background</span>
        <div className="bgswitch__chips">
          {CONCEPTS.map((c) => (
            <button
              key={c.id}
              className={`bgchip ${tweaks.concept === c.id ? 'bgchip--active' : ''}`}
              onClick={() => setTweak('concept', c.id)}
              title={c.desc}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <footer className="bottombar">
        <span className="meta">
          <span className="meta__k">Los Angeles</span>
          <span className="meta__v">{time}</span>
        </span>
        <span className="meta meta__center">
          <span className="meta__k">Section</span>
          <span className="meta__v">{activeNum} / 04</span>
        </span>
        <a className="meta meta__right" href="mailto:hi@brandonle.dev">
          <span className="meta__k">Currently</span>
          <span className="meta__v">Open to opportunities<Arrow /></span>
        </a>
      </footer>

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel>
          <window.TweakSection title="Background">
            <window.TweakSelect
              label="Concept"
              value={tweaks.concept}
              onChange={(v) => setTweak('concept', v)}
              options={CONCEPTS.map((c) => ({ value: c.id, label: c.label }))}
            />
            <window.TweakColor
              label="Palette"
              value={tweaks.palette}
              onChange={(v) => setTweak('palette', v)}
              options={PALETTE_OPTIONS.map((p) => p.swatch)}
            />
            <window.TweakSlider
              label="Flow speed" value={tweaks.speed} min={0} max={3} step={0.1}
              onChange={(v) => setTweak('speed', v)}
            />
            <window.TweakSlider
              label="Grain" value={tweaks.grain} min={0} max={0.15} step={0.005}
              onChange={(v) => setTweak('grain', v)}
            />
          </window.TweakSection>
          <window.TweakSection title="Type">
            <window.TweakToggle
              label="Serif display"
              value={tweaks.serifDisplay}
              onChange={(v) => setTweak('serifDisplay', v)}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

function formatTime() {
  const d = new Date();
  // LA local time
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Los_Angeles', hour12: false }) + ' PT';
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
