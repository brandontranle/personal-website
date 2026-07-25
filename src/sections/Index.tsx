import Arrow from '../components/Arrow'
import type { NavHandler } from '../lib/nav'
import { content } from '../lib/content'


function Marquee({ quotes }: { quotes: { quote: string; film: string }[] }) {
  return (
    <div className="mt-7 overflow-hidden border-y border-white/[0.08] py-3.5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {quotes.map((q, j) => (
              <span key={j} className="flex items-center whitespace-nowrap">
                <span className="pl-5 font-serif text-[26px] italic leading-none text-white">
                  &ldquo;{q.quote}&rdquo;
                </span>
                <span className="px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">{q.film}</span>
                <span className="font-sans text-[20px] leading-none text-white/20">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Personality() {
  const { profile } = content
  return (
    <div className="grid max-w-[760px] gap-5 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">Outside of work</span>
        <span className="text-sm text-white/85">{profile.outsideOfWork}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">In a sentence</span>
        <span className="font-serif text-lg italic leading-snug text-white">&ldquo;{profile.quote}&rdquo;</span>
      </div>
    </div>
  )
}

export default function Index({ onNav }: { onNav: NavHandler }) {
  const { profile, marquee } = content
  return (
    <div className="flex h-full flex-col justify-between py-4">
      <div className="mt-[clamp(12px,4vh,52px)] flex max-w-[1200px] flex-col gap-6">
        <div className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7cc]" />
          {profile.status}
        </div>

        <h1 className="flex flex-col font-serif text-[clamp(60px,9vw,144px)] leading-[0.95] tracking-[-0.025em] text-white">
          <span>{profile.name}.</span>
          <span className="shiny-text">{profile.role}.</span>
        </h1>

        <p className="max-w-[580px] text-base leading-relaxed text-white/70">{profile.tagline}</p>

        <div className="flex flex-wrap gap-3">
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 font-sans text-sm text-[#0b0d1f] transition hover:-translate-y-px"
          >
            Résumé <Arrow />
          </a>
          <a
            href="#contact"
            onClick={(event) => {
              event.preventDefault()
              onNav('contact')
            }}
            className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-5 py-3 font-sans text-sm text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Get in touch
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Personality />
        <Marquee quotes={marquee} />
      </div>
    </div>
  )
}
