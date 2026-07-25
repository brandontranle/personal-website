import SectionHead from '../components/SectionHead'
import { content } from '../lib/content'

export default function About() {
  const { about } = content

  return (
    <div className="flex h-full flex-col py-2">
      <SectionHead num="04" eyebrow="About" title={['An engineer with a', 'soft spot for craft.']} />

      <div className="mt-5 grid min-h-0 flex-1 gap-5 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
        {/* Bio */}
        <div className="flex flex-col justify-center gap-3">
          {about.paragraphs.map((p, i) => (
            <p key={i} className="max-w-[560px] font-serif text-[16px] leading-[1.4] text-white/90 md:text-[21px] md:leading-[1.45]">
              {p}
            </p>
          ))}
        </div>

        {/* Facts + focus */}
        <div className="flex flex-col justify-center gap-5">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            {about.facts.map((f) => (
              <div key={f.label} className="flex flex-col gap-1">
                <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/45">{f.label}</dt>
                <dd className="text-sm text-white">{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-3 border-t border-white/[0.12] pt-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/45">Battlestation</span>
            <div className="flex flex-wrap gap-2">
              {about.rig.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[12px] text-white/80"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
