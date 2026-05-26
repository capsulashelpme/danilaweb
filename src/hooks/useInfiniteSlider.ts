import { useEffect, useRef } from 'react'

/**
 * Hook para un slider de loop infinito sin bugs de salto.
 * El RAF se pausa automáticamente cuando el slider sale del viewport
 * para no desperdiciar CPU/GPU en secciones invisibles.
 */
export function useInfiniteSlider(speed = 0.036) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const L = () => el.scrollWidth / 3

    const wrap = () => {
      const l = L()
      if (el.scrollLeft >= 2 * l) el.scrollLeft -= l
      else if (el.scrollLeft < l)  el.scrollLeft += l
    }

    el.scrollLeft = L()

    let raf: number
    let lastT = performance.now()
    let paused    = false
    let offscreen = false   // pausa RAF cuando el slider no está visible
    let dragging  = false
    let prevPointerX = 0
    let prevTouchX   = 0

    const tick = (t: number) => {
      const dt = Math.min(t - lastT, 50)   // cap a 50ms para evitar saltos tras tab-switch
      lastT = t
      if (!paused && !offscreen && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += dt * speed
        wrap()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Pausar RAF cuando el slider no es visible (ahorra CPU en secciones fuera de pantalla)
    const io = new IntersectionObserver(
      ([entry]) => { offscreen = !entry.isIntersecting },
      { rootMargin: '200px 0px 200px 0px' }
    )
    io.observe(el)

    // ── Pointer ──────────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      paused = true; dragging = true
      prevPointerX = e.clientX
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      el.scrollLeft -= e.clientX - prevPointerX
      prevPointerX = e.clientX
      wrap()
    }
    const onUp = () => {
      dragging = false
      el.style.cursor = 'grab'
      setTimeout(() => { paused = false; lastT = performance.now() }, 600)
    }

    // ── Touch ────────────────────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      paused = true
      prevTouchX = e.touches[0].clientX
    }
    const onTouchMove = (e: TouchEvent) => {
      el.scrollLeft -= e.touches[0].clientX - prevTouchX
      prevTouchX = e.touches[0].clientX
      wrap()
    }
    const onTouchEnd = () => {
      setTimeout(() => { paused = false; lastT = performance.now() }, 600)
    }

    el.addEventListener('pointerdown',   onDown)
    el.addEventListener('pointermove',   onMove)
    el.addEventListener('pointerup',     onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('touchstart',    onTouchStart, { passive: true })
    el.addEventListener('touchmove',     onTouchMove,  { passive: true })
    el.addEventListener('touchend',      onTouchEnd)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointerdown',   onDown)
      el.removeEventListener('pointermove',   onMove)
      el.removeEventListener('pointerup',     onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('touchstart',    onTouchStart)
      el.removeEventListener('touchmove',     onTouchMove)
      el.removeEventListener('touchend',      onTouchEnd)
    }
  }, [speed])

  return trackRef
}
