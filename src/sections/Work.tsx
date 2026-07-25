import { useState } from 'react'
import Arrow from '../components/Arrow'
import SkillIcon from '../components/SkillIcon'
import SectionHead from '../components/SectionHead'
import { content } from '../lib/content'
import { useScrollFade } from '../lib/useScrollFade'

export default function Work() {
  const [hover, setHover] = useState<number | null>(null)
  const list = useScrollFade<HTMLUListElement>()

  return (
    <div className="flex h-full flex-col py-2">
      <SectionHead num="02" eyebrow="Selected work" title={['A handful of', "things I've shipped."]} />

      <ul
        ref={list.ref}
        style={list.style}
        className="no-scrollbar mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-white/[0.12] md:mt-6"
        onMouseLeave={() => setHover(null)}
      >
        {content.projects.map((p, i) => (
          <li key={p.title} onMouseEnter={() => setHover(i)}>
            <a
              href={p.link}
              target="_blank"
              rel="noreferrer"
              className={`grid grid-cols-[1fr_auto] items-center gap-4 border-b border-white/[0.12] px-1 py-3 transition-all hover:bg-white/[0.03] hover:pl-3 md:grid-cols-[300px_minmax(0,1fr)_210px_20px] md:gap-6 md:py-4 ${
                hover != null && hover !== i ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div className="flex flex-col gap-1">
                <span className="font-serif text-[18px] leading-none text-white md:text-[26px]">{p.title}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/45">{p.type}</span>
              </div>
              <span className="hidden max-w-[540px] text-sm leading-relaxed text-white/60 md:block">
                {p.description}
              </span>
              <span className="hidden flex-wrap justify-end gap-1.5 md:flex">
                {p.skills.map((s, j) => (
                  <SkillIcon key={j} icon={s.icon} />
                ))}
              </span>
              <span className="flex justify-end text-white/40">
                <Arrow />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
