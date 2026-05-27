import { useEffect, useRef } from 'react'

/**
 * Slider infinito con RAF + arrastre táctil (compatible iOS Safari).
 *
 * Estrategia táctil:
 *  - touch-action: pan-y en el container Y en el track (via JS)
 *  - CSS global aplica pan-y a todos los hijos del track (index.css)
 *  - Con pan-y el browser maneja scroll vertical y cede el horizontal a JS
 *  - touchmove passive:true — no necesitamos preventDefault, pan-y lo gestiona
 *  - Pointer events solo para mouse (desktop)
 */
export function useInfiniteSlider(speed = 0.036) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // Aplicar touch-action en el container (overflow:hidden) Y en el track
    const container = track.parentElement
    if (container) {
      container.style.overflow   = 'hidden'
      container.style.touchAction = 'pan-y'
    }
    track.style.touchAction = 'pan-y'
    track.style.userSelect  = 'none'

    let x     = 0
    let raf: number
    let lastT = performance.now()
    let paused = false

    // Touch state
    let touchStartX = 0
    let touchStartY = 0
    let touchDir: 'h' | 'v' | null = null
    let touchActive = false

    const oneThird = () => track.scrollWidth / 3

    const move = (newX: number) => {
      const L = oneThird()
      if (L <= 0) return
      if (newX <= -2 * L) newX += L
      if (newX > -L)      newX -= L
      x = newX
      track.style.transform = `translateX(${x}px)`
    }

    // Inicializar posición en el segundo tramo (loop infinito)
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

    // ── Mouse / desktop (pointer events) ────────────────────────
    let dragging = false
    let prevPX   = 0

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return   // manejado por touch events
      paused = true; dragging = true; prevPX = e.clientX
      track.setPointerCapture(e.pointerId)
      track.style.cursor = 'grabbing'
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !dragging) return
      move(x + (e.clientX - prevPX))
      prevPX = e.clientX
    }
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      dragging = false
      track.style.cursor = 'grab'
      setTimeout(() => { paused = false; lastT = performance.now() }, 800)
    }

    // ── Touch — iOS Safari ────────────────────────────────────────
    // Se registran en el DOCUMENTO durante un toque activo para garantizar
    // que recibimos todos los eventos aunque el dedo salga del track.
    const onTouchStart = (e: TouchEvent) => {
      // Solo nos interesa si el toque empezó dentro del track o sus hijos
      if (!track.contains(e.target as Node) && e.target !== track) return
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      touchDir    = null
      touchActive = true
      paused      = true
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive) return

      const curX = e.touches[0].clientX
      const curY = e.touches[0].clientY
      const dx   = curX - touchStartX
      const dy   = curY - touchStartY

      // Detectar dirección la primera vez que hay movimiento significativo
      if (!touchDir && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        touchDir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
      }

      if (touchDir === 'h') {
        move(x + (curX - touchStartX))
        // Actualizar origen para el siguiente frame (delta incremental)
        touchStartX = curX
        touchStartY = curY
      }
      // Si es vertical, no tocamos el slider; el browser hace scroll de página
    }

    const onTouchEnd = () => {
      if (!touchActive) return
      touchActive = false
      touchDir    = null
      setTimeout(() => { paused = false; lastT = performance.now() }, 800)
    }

    // Registrar touch en document para capturar aunque el dedo salga del track
    track.addEventListener('pointerdown',   onPointerDown)
    track.addEventListener('pointermove',   onPointerMove)
    track.addEventListener('pointerup',     onPointerUp)
    track.addEventListener('pointercancel', onPointerUp)

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove',  onTouchMove,  { passive: true })
    document.addEventListener('touchend',   onTouchEnd,   { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      track.removeEventListener('pointerdown',   onPointerDown)
      track.removeEventListener('pointermove',   onPointerMove)
      track.removeEventListener('pointerup',     onPointerUp)
      track.removeEventListener('pointercancel', onPointerUp)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove',  onTouchMove)
      document.removeEventListener('touchend',   onTouchEnd)
    }
  }, [speed])

  return trackRef
}
