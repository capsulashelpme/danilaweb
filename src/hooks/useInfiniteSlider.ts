import { useEffect, useRef } from 'react'

/**
 * Hook para un slider de loop infinito sin bugs de salto.
 * Requisito: el track debe tener exactamente 3 copias del contenido.
 */
export function useInfiniteSlider(speed = 0.036) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const L = () => el.scrollWidth / 3

    const wrap = () => {
      const l = L()
      if (l <= 0) return
      if (el.scrollLeft >= 2 * l) el.scrollLeft -= l
      else if (el.scrollLeft < l)  el.scrollLeft += l
    }

    // Inicializar posición después de que el layout esté listo
    const init = () => {
      const l = L()
      if (l > 0) el.scrollLeft = l
    }
    // Doble rAF para asegurar que el browser hizo layout antes de leer scrollWidth
    requestAnimationFrame(() => requestAnimationFrame(init))

    let raf: number
    let lastT   = performance.now()
    let paused  = false
    let dragging = false
    let prevPointerX = 0
    let prevTouchX   = 0

    const tick = (t: number) => {
      const dt = Math.min(t - lastT, 50)
      lastT = t
      if (!paused && !document.hidden && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += dt * speed
        wrap()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Pausar solo cuando el tab está oculto (no cuando el slider está fuera del viewport)
    const onVisibility = () => { if (!document.hidden) lastT = performance.now() }
    document.addEventListener('visibilitychange', onVisibility)

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
      document.removeEventListener('visibilitychange', onVisibility)
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
