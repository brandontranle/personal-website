// Skill icons render via Devicon (loaded in index.html), forced to a uniform
// light monochrome so they stay legible on the dark theme and read as one set.
// "-plain" variants follow currentColor; the few "-original"-only icons are
// normalized with a filter.
const ORIGINAL = new Set(['express', 'sass'])

export default function SkillIcon({ icon }: { icon: string }) {
  const isOriginal = ORIGINAL.has(icon)
  const variant = isOriginal ? 'original' : 'plain'
  return (
    <span
      title={icon}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/80 transition-colors hover:text-white"
    >
      <i
        className={`devicon-${icon}-${variant} text-[15px]`}
        aria-hidden="true"
        style={isOriginal ? { filter: 'grayscale(1) brightness(2.2)' } : undefined}
      />
    </span>
  )
}
