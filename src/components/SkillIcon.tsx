export default function SkillIcon({ icon }: { icon: string }) {
  return (
    <span
      title={icon}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/80 transition-colors hover:text-white"
    >
      <img
        src={`/skill-icons/${icon}.svg`}
        alt=""
        width="15"
        height="15"
        loading="lazy"
        className="h-[15px] w-[15px] object-contain opacity-80 brightness-0 invert transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </span>
  )
}
