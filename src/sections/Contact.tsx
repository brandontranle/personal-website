import Arrow from '../components/Arrow'
import SectionHead from '../components/SectionHead'
import { content } from '../lib/content'

export default function Contact() {
  const { contact, profile } = content

  return (
    <div className="flex h-full flex-col py-2">
      <SectionHead num="05" eyebrow="Contact" title={['Have something', 'worth building?']} />

      <div className="flex min-h-0 flex-1 items-center py-4 md:py-6">
        <div className="grid w-full gap-4 md:grid-cols-[1.05fr_1fr]">
          {/* Email */}
          <a
            href={`mailto:${contact.email}`}
            className="group relative flex min-h-[130px] flex-col justify-end gap-2 rounded-3xl border border-white/[0.12] bg-[rgba(10,12,32,0.32)] p-5 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.06] md:min-h-[200px] md:p-7"
          >
            <Arrow className="absolute right-5 top-5 h-5 w-5 text-white md:right-7 md:top-7" />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/45 md:text-[11px]">Drop a line</span>
            <span className="font-serif text-[22px] italic leading-none text-white md:text-[clamp(26px,3.2vw,44px)]">
              {contact.email}
            </span>
            <p className="mt-1.5 max-w-[420px] text-[13px] leading-relaxed text-white/60 md:mt-2 md:text-sm">{contact.blurb}</p>
          </a>

          {/* Links */}
          <ul className="flex flex-col overflow-hidden rounded-3xl border border-white/[0.12] bg-[rgba(10,12,32,0.32)] backdrop-blur-md">
            {profile.socials.map((s) => (
              <li key={s.label} className="flex-1 border-t border-white/[0.08] first:border-t-0">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-full grid-cols-[92px_1fr_18px] items-center gap-3 px-5 py-3 transition hover:bg-white/[0.06] md:grid-cols-[100px_1fr_18px] md:px-6 md:py-4"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/45 md:text-[11px]">{s.label}</span>
                  <span className="truncate font-sans text-[13px] text-white md:text-sm">{s.handle}</span>
                  <Arrow className="text-white/40" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
