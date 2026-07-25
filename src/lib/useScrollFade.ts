import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

// Fades the top/bottom edge of a scroll container, but only when there is
// actually more content to scroll toward — a subtle "there's more" cue.
// Uses a callback ref so it re-binds if the element remounts (e.g. keyed).
export function useScrollFade<T extends HTMLElement>() {
  const [edge, setEdge] = useState({ top: false, bottom: false })
  const cleanupRef = useRef<(() => void) | undefined>(undefined)

  const ref = useCallback((el: T | null) => {
    cleanupRef.current?.()
    cleanupRef.current = undefined
    if (!el) return
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      setEdge({
        top: scrollTop > 4,
        bottom: scrollTop + clientHeight < scrollHeight - 4,
      })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    cleanupRef.current = () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  useEffect(() => () => cleanupRef.current?.(), [])

  const F = 28
  const topStop = edge.top ? `transparent, #000 ${F}px` : '#000 0'
  const bottomStop = edge.bottom ? `#000 calc(100% - ${F}px), transparent` : '#000 100%'
  const maskImage = `linear-gradient(to bottom, ${topStop}, ${bottomStop})`
  const style: CSSProperties = { maskImage, WebkitMaskImage: maskImage }

  return { ref, style }
}
