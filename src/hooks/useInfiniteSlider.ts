import { useEffect, useRef } from 'react'

/**
 * Slider infinito basado en CSS transform (no scrollLeft).
 * Funciona correctamente en iOS Safari, donde scrollLeft programático
 * es bloqueado por el scroll nativo con momentum.
 *
 * El contenedor debe ser overflow:hidden.
 * El track interno tiene 3 copias del contenido y se mueve con translateX.
 */
export function useInfiniteSlider(speed = 0.036) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // El padre del track debe ser overflow:hidden para recortar el contenido
    const container = track.parentElement
    if (container) {
      container.style.overflow = 'hidden'
    }

    let x        = 0          // posición actual en px (negativo = mover a la izquierda)
    let raf: number
    let lastT    = performance.now()
    let paused   = false
    let dragging = false
    let prevX    = 0          // última posición del puntero/dedo

    // Un tercio del ancho total = longitud de una copia
    const oneThird = () => track.scrollWidth / 3

    // Aplicar transform y hacer wrap invisible
    const move = (newX: number) => {
      const L = oneThird()
      if (L <= 0) return
      // Mantener x en el rango [-2L, -L] para loop invisible
      if (newX <= -2 * L) newX += L
      if (newX > -L)      newX -= L
      x = newX
      track.style.transform = `translateX(${x}px)`
    }

    // Iniciar en la copia central
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const L = oneThird()
        if (L > 0) { x = -L; track.style.transform = `translateX(${x}px)` }
      })
    })

    const tick = (t: number) => {
      const dt = Math.min(t - lastT, 50)
      lastT = t
      if (!paused && !document.hidden) {
        move(x - dt * speed)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onVisibility = () => { if (!document.hidden) lastT = performance.now() }
    document.addEventListener('visibilitychange', onVisibility)

    // ── Pointer (mouse / stylus) ──────────────────────────────────
    const onPointerDown = (e: PointerEvent) => {
      paused = true; dragging = true
      prevX = e.clientX
      track.style.cursor = 'grabbing'
      e.preventDefault()
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      move(x + (e.clientX - prevX))
      prevX = e.clientX
    }
    const onPointerUp = () => {
      dragging = false
      track.style.cursor = 'grab'
      setTimeout(() => { paused = false; lastT = performance.now() }, 600)
    }

    // ── Touch (iOS Safari) ───────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      paused = true
      prevX = e.touches[0].clientX
    }
    const onTouchMove = (e: TouchEvent) => {
      move(x + (e.touches[0].clientX - prevX))
      prevX = e.touches[0].clientX
      e.preventDefault()   // evita que iOS scroll la página mientras arrastramos
    }
    const onTouchEnd = () => {
      setTimeout(() => { paused = false; lastT = performance.now() }, 600)
    }

    track.addEventListener('pointerdown',   onPointerDown)
    track.addEventListener('pointermove',   onPointerMove)
    track.addEventListener('pointerup',     onPointerUp)
    track.addEventListener('pointercancel', onPointerUp)
    track.addEventListener('touchstart',    onTouchStart, { passive: true })
    track.addEventListener('touchmove',     onTouchMove,  { passive: false })
    track.addEventListener('touchend',      onTouchEnd)

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
