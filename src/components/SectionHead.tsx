interface SectionHeadProps {
  num: string
  eyebrow: string
  title: [string, string]
}

export default function SectionHead({ num, eyebrow, title }: SectionHeadProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/50">
        {num} · {eyebrow}
      </span>
      <h2 className="flex flex-col font-serif text-[24px] leading-[1.02] tracking-[-0.02em] text-white md:text-[clamp(32px,5.4vw,76px)] md:leading-[0.98]">
        <span>{title[0]}</span>
        <span className="italic shiny-text">{title[1]}</span>
      </h2>
    </div>
  )
}
