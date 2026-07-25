import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import Arrow from './components/Arrow'
import Beams from './components/Beams'
import Index from './sections/Index'
import Work from './sections/Work'
import Experience from './sections/Experience'
import About from './sections/About'
import Contact from './sections/Contact'
import { NAV } from './lib/nav'
import type { NavHandler, SectionId } from './lib/nav'
import { content } from './lib/content'

const SECTIONS: Record<SectionId, ComponentType<{ onNav: NavHandler }>> = {
  index: Index,
  work: Work,
  experience: Experience,
  about: About,
  contact: Contact,
}

function formatTime() {
  return (
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Los_Angeles',
      hour12: false,
    }) + ' PT'
  )
}

function PacificClock() {
  const [time, setTime] = useState(formatTime)

  useEffect(() => {
    const id = window.setInterval(() => setTime(formatTime()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return <span className="text-white">{time}</span>
}

export default function App() {
  const [active, setActive] = useState<SectionId>(() => {
    const section = window.location.hash.slice(1) as SectionId
    return NAV.some((item) => item.id === section) ? section : 'index'
  })
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const [pending, setPending] = useState<SectionId | null>(null)

  const navigate: NavHandler = (id) => {
    if (id === active) return
    setPending(id)
    setPhase('out')
  }

  useEffect(() => {
    if (phase === 'out' && pending) {
      const t = setTimeout(() => {
        setActive(pending)
        window.history.pushState(null, '', `#${pending}`)
        setPending(null)
        setPhase('in')
      }, 360)
      return () => clearTimeout(t)
    }
  }, [phase, pending])

  useEffect(() => {
    const syncFromUrl = () => {
      const section = window.location.hash.slice(1) as SectionId
      setActive(NAV.some((item) => item.id === section) ? section : 'index')
      setPending(null)
      setPhase('in')
    }

    window.addEventListener('popstate', syncFromUrl)
    window.addEventListener('hashchange', syncFromUrl)
    return () => {
      window.removeEventListener('popstate', syncFromUrl)
      window.removeEventListener('hashchange', syncFromUrl)
    }
  }, [])

  const activeNum = NAV.find((n) => n.id === active)?.num ?? '01'

  return (
    <div className="text-white">
      {/* Persistent beam background (fixed so it stays put while mobile scrolls) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#ffecb2"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>
      <div className="veil pointer-events-none fixed inset-0 z-0" />

      {/* App shell: fixed single-view (footer pinned, no page scroll) on every size */}
      <div className="relative z-10 flex h-[100dvh] flex-col overflow-hidden">
        {/* Top bar */}
        <header className="px-5 py-3 md:px-8 md:py-5">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4">
            <a
              href="#index"
              onClick={(event) => {
                event.preventDefault()
                navigate('index')
              }}
              className="group relative flex items-center text-white outline-none"
              aria-label="Brandon Tran Le — home"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-1 rounded-full bg-[#ffecb2]/0 blur-xl transition-all duration-300 group-hover:scale-150 group-hover:bg-[#ffecb2]/60 group-focus-visible:scale-150 group-focus-visible:bg-[#ffecb2]/60 motion-reduce:transition-none"
              />
              <img
                src="/logo.webp"
                alt=""
                width="48"
                height="48"
                className="relative z-10 h-9 w-9 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.12)] transition-[filter,transform] duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_14px_rgba(255,236,178,0.9)] group-focus-visible:scale-105 group-focus-visible:drop-shadow-[0_0_14px_rgba(255,236,178,0.9)] motion-reduce:transition-none md:h-12 md:w-12"
              />
            </a>

            <nav
              aria-label="Primary navigation"
              className="flex items-center gap-0.5 rounded-full border border-white/[0.12] bg-[rgba(10,12,32,0.32)] p-1 backdrop-blur-md md:gap-1 md:p-1.5"
            >
              {NAV.map((n) => (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    navigate(n.id)
                  }}
                  aria-label={n.label}
                  aria-current={active === n.id ? 'page' : undefined}
                  className={`flex items-baseline gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] transition-colors md:px-3 md:py-2 md:text-[13px] ${
                    active === n.id ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <span className="font-mono text-[10px] text-white/40">{n.num}</span>
                  <span className="hidden md:inline">{n.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </header>

        {/* Stage — crossfades on navigate; background persists */}
        <main
          key={active}
          className={`relative min-h-0 flex-1 px-5 md:px-8 ${phase === 'in' ? 'stage-in' : 'stage-out'}`}
        >
          <div className="mx-auto h-full w-full max-w-[1200px]">
            {NAV.map((item) => {
              const Section = SECTIONS[item.id]
              return (
                <section
                  key={item.id}
                  id={item.id}
                  aria-label={item.label}
                  hidden={active !== item.id}
                  className="h-full"
                >
                  <Section onNav={navigate} />
                </section>
              )
            })}
          </div>
        </main>

        {/* Bottom bar */}
        <footer className="px-5 py-4 md:px-8">
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-white/45 md:grid-cols-3">
            <span className="inline-flex items-center gap-2.5">
              <span className="text-white/45">{content.profile.location.split(',')[0]}</span>
              <PacificClock />
            </span>
            <span className="hidden items-center justify-center gap-2.5 md:inline-flex">
              <span className="text-white/45">Section</span>
              <span className="text-white">
                {activeNum} / 0{NAV.length}
              </span>
            </span>
            <a
              href={`mailto:${content.contact.email}`}
              className="inline-flex items-center justify-end gap-2 justify-self-end text-white/70 transition-colors hover:text-white"
            >
              <span className="hidden text-white/45 sm:inline">Currently</span>
              <span className="inline-flex items-center gap-1.5 text-white">
                Open to opportunities <Arrow />
              </span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
