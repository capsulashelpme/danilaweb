import { useEffect, useRef } from 'react'

/**
 * Slider infinito con transform (compatible iOS Safari).
 * Touch: detecta dirección del swipe — horizontal arrastra el slider,
 * vertical deja pasar el scroll de la página.
 */
export function useInfiniteSlider(speed = 0.036) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const container = track.parentElement
    if (container) container.style.overflow = 'hidden'

    // Decirle a Safari iOS: el scroll vertical es del browser, el horizontal lo manejamos nosotros
    track.style.touchAction = 'pan-y'

    let x      = 0
    let raf: number
    let lastT  = performance.now()
    let paused = false

    // Touch state
    let touchStartX = 0
    let touchStartY = 0
    let touchDir: 'h' | 'v' | null = null  // dirección detectada del swipe

    const oneThird = () => track.scrollWidth / 3

    const move = (newX: number) => {
      const L = oneThird()
      if (L <= 0) return
      if (newX <= -2 * L) newX += L
      if (newX > -L)      newX -= L
      x = newX
      track.style.transform = `translateX(${x}px)`
    }

    requestAnimationFrame(() => requestAnimationFrame(() => {
      const L = oneThird()
      if (L > 0) { x = -L; track.style.transform = `translateX(${x}px)` }
    }))

    const tick = (t: number) => {
      const dt = Math.min(t - lastT, 50)
      lastT = t
      if (!paused && !document.hidden) move(x - dt * speed)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onVisibility = () => { if (!document.hidden) lastT = performance.now() }
    document.addEventListener('visibilitychange', onVisibility)

    // ── Pointer (mouse/desktop) ───────────────────────────────────
    let dragging = false
    let prevPX = 0
    const onPointerDown = (e: PointerEvent) => {
      // Ignorar eventos de touch aquí — los maneja el bloque touch
      if (e.pointerType === 'touch') return
      paused = true; dragging = true; prevPX = e.clientX
      track.style.cursor = 'grabbing'
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !dragging) return
      move(x + (e.clientX - prevPX)); prevPX = e.clientX
    }
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      dragging = false; track.style.cursor = 'grab'
      setTimeout(() => { paused = false; lastT = performance.now() }, 600)
    }

    // ── Touch (iOS Safari) ───────────────────────────────────────
    let touchActive = false
    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      touchDir = null
      touchActive = true
      paused = true
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive) return
      const dx = e.touches[0].clientX - touchStartX
      const dy = e.touches[0].clientY - touchStartY

      if (!touchDir && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        touchDir = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v'
      }

      if (touchDir === 'h') {
        // Aplicar el delta del frame actual (incremental)
        const curX = e.touches[0].clientX
        const delta = curX - touchStartX
        move(x + delta)
        touchStartX = curX
        touchStartY = e.touches[0].clientY
      }
      // Si es vertical, no hacemos nada — el browser maneja el scroll de página
    }
    const onTouchEnd = () => {
      touchActive = false
      touchDir = null
      setTimeout(() => { paused = false; lastT = performance.now() }, 600)
    }

    track.addEventListener('pointerdown',   onPointerDown)
    track.addEventListener('pointermove',   onPointerMove)
    track.addEventListener('pointerup',     onPointerUp)
    track.addEventListener('pointercancel', onPointerUp)
    track.addEventListener('touchstart',    onTouchStart, { passive: true })
    track.addEventListener('touchmove',     onTouchMove,  { passive: true })
    track.addEventListener('touchend',      onTouchEnd,   { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      track.removeEventListener('pointerdown',   onPointerDown)
      track.removeEventListener('pointermove',   onPointerMove)
      track.removeEventListener('pointerup',     onPointerUp)
      track.removeEventListener('pointercancel', onPointerUp)
      track.removeEventListener('touchstart',    onTouchStart)
      track.removeEventListener('touchmove',     onTouchMove)
      track.removeEventListener('touchend',      onTouchEnd)
    }
  }, [speed])

  return trackRef
}
