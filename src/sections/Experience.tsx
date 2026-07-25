import { useState } from 'react'
import SkillIcon from '../components/SkillIcon'
import SectionHead from '../components/SectionHead'
import { content } from '../lib/content'
import { useScrollFade } from '../lib/useScrollFade'

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Experience() {
  const exp = content.experiences
  const [sel, setSel] = useState(0)
  const e = exp[sel]
  const go = (d: number) => setSel((s) => (s + d + exp.length) % exp.length)
  const detail = useScrollFade<HTMLDivElement>()

  // "Title · Dates" -> separate the title from the dates so it lays out cleanly
  const sep = e.role.indexOf(' · ')
  const roleTitle = sep === -1 ? e.role : e.role.slice(0, sep)
  const roleDate = sep === -1 ? '' : e.role.slice(sep + 3)
  const roleMeta = [roleDate, e.location].filter(Boolean).join(' · ')

  return (
    <div className="flex h-full flex-col py-2">
      <SectionHead num="03" eyebrow="Experience" title={['Where I have', 'spent my time.']} />

      <div className="mt-4 grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-4 md:mt-6 md:grid-cols-[minmax(220px,300px)_1fr] md:grid-rows-1 md:gap-12">
        {/* Mobile stepper */}
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/[0.12] bg-[rgba(10,12,32,0.32)] px-2 py-2 backdrop-blur-md md:hidden">
          <button
            onClick={() => go(-1)}
            aria-label="Previous role"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Chevron dir="left" />
          </button>
          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
              {String(sel + 1).padStart(2, '0')} / {String(exp.length).padStart(2, '0')}
            </span>
            <span className="font-sans text-[13px] text-white">{e.title}</span>
          </div>
          <button
            onClick={() => go(1)}
            aria-label="Next role"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Chevron dir="right" />
          </button>
        </div>

        {/* Desktop vertical list */}
        <ul className="hidden md:flex md:flex-col md:border-l md:border-white/[0.12]">
          {exp.map((x, i) => (
            <li key={i}>
              <button
                onClick={() => setSel(i)}
                className={`-ml-px w-full border-l-2 px-4 py-2.5 text-left font-sans text-sm transition-colors ${
                  i === sel
                    ? 'border-[#ffecb2] bg-white/[0.04] text-white'
                    : 'border-transparent text-white/45 hover:text-white/80'
                }`}
              >
                {x.title}
              </button>
            </li>
          ))}
        </ul>

        {/* Detail */}
        <div
          key={sel}
          ref={detail.ref}
          style={detail.style}
          className="anim-in no-scrollbar flex min-h-0 flex-col overflow-y-auto pr-1"
        >
          <h3 className="font-serif text-xl text-white md:text-3xl">{e.title}</h3>
          <div className="mt-1.5 flex flex-col gap-0.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#ffecb2]/80 md:text-[11px]">{roleTitle}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">{roleMeta}</span>
          </div>
          <ul className="mt-4 flex flex-col gap-2.5 md:mt-5 md:gap-3">
            {e.description.map((d, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-white/70 md:gap-3 md:text-sm">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#ffecb2]/75" />
                {d}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-1.5 md:mt-6">
            {e.skills.map((s, i) => (
              <SkillIcon key={i} icon={s.icon} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
