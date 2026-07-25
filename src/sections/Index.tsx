import Arrow from '../components/Arrow'
import type { NavHandler } from '../lib/nav'
import { content } from '../lib/content'


function Marquee({ quotes }: { quotes: { quote: string; film: string }[] }) {
  return (
    <div className="overflow-hidden border-y border-white/[0.08] py-2.5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] md:py-3.5">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {quotes.map((q, j) => (
              <span key={j} className="flex items-center whitespace-nowrap">
                <span className="pl-4 font-serif text-[16px] italic leading-none text-white md:pl-5 md:text-[26px]">
                  &ldquo;{q.quote}&rdquo;
                </span>
                <span className="px-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40 md:px-3">{q.film}</span>
                <span className="font-sans text-[15px] leading-none text-white/20 md:text-[20px]">/</span>
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
    <div className="grid max-w-[760px] gap-3 sm:grid-cols-2 md:gap-5">
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">Outside of work</span>
        <span className="text-[13px] text-white/85 md:text-sm">{profile.outsideOfWork}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">In a sentence</span>
        <span className="font-serif text-base italic leading-snug text-white md:text-lg">&ldquo;{profile.quote}&rdquo;</span>
      </div>
    </div>
  )
}

export default function Index({ onNav }: { onNav: NavHandler }) {
  const { profile, marquee } = content
  return (
    <div className="flex h-full flex-col justify-between py-3 md:py-4">
      <div className="mt-2 flex max-w-[1200px] flex-col gap-4 md:mt-[clamp(12px,4vh,52px)] md:gap-6">
        <div className="inline-flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/70 md:text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7cc]" />
          {profile.status}
        </div>

        <h1 className="flex flex-col font-serif text-[38px] leading-[1.02] tracking-[-0.025em] text-white md:text-[clamp(60px,9vw,144px)] md:leading-[0.95]">
          <span>{profile.name}.</span>
          <span className="shiny-text">{profile.role}.</span>
        </h1>

        <p className="max-w-[580px] text-[13px] leading-relaxed text-white/70 md:text-base">{profile.tagline}</p>

        <div className="flex flex-wrap gap-2.5 md:gap-3">
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-sans text-[13px] text-[#0b0d1f] transition hover:-translate-y-px md:gap-2.5 md:px-5 md:py-3 md:text-sm"
          >
            Résumé <Arrow />
          </a>
          <a
            href="#contact"
            onClick={(event) => {
              event.preventDefault()
              onNav('contact')
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 font-sans text-[13px] text-white transition hover:border-white/40 hover:bg-white/5 md:gap-2.5 md:px-5 md:py-3 md:text-sm"
          >
            Get in touch
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-6">
        <Personality />
        <Marquee quotes={marquee} />
      </div>
    </div>
  )
}
