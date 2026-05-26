// TrustStrip — marquee con RAF (requestAnimationFrame)
//
// Por qué RAF y no CSS animation:
// Safari iOS calcula translateX(-50%) ANTES de que las imágenes carguen.
// El ancho medido es 0 → el offset es incorrecto → flash y reinicio al llegar al punto equivocado.
//
// Con RAF: medimos el ancho REAL del grupo tras carga de imágenes,
// movemos por píxeles exactos, y reseteamos cuando pos >= groupWidth.
// Sin porcentajes. Sin bugs de cálculo. Funciona en todos los browsers.

import { useEffect, useRef } from 'react'

const LOGOS = [
  { src: '/logos/1.png', alt: 'Cliente 1' },
  { src: '/logos/2.png', alt: 'Cliente 2' },
  { src: '/logos/3.png', alt: 'Cliente 3' },
  { src: '/logos/4.png', alt: 'Cliente 4' },
  { src: '/logos/5.png', alt: 'Cliente 5' },
  { src: '/logos/6.png', alt: 'Cliente 6' },
  { src: '/logos/7.png', alt: 'Cliente 7' },
  { src: '/logos/8.png', alt: 'Cliente 8' },
  { src: '/logos/9.png', alt: 'Cliente 9' },
]

// Velocidad en píxeles por frame a 60fps
// 1.8px/frame × 60fps = 108px/s
const PX_PER_FRAME = 1.8

export function TrustStrip() {
  const trackRef = useRef<HTMLDivElement>(null)
  const group1Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    const group1 = group1Ref.current
    if (!track || !group1) return

    let pos = 0
    let raf = 0
    let groupWidth = 0
    let running = false

    function start() {
      groupWidth = group1!.offsetWidth
      if (groupWidth === 0) return // imágenes aún no listas

      function step() {
        pos += PX_PER_FRAME
        // Al llegar al ancho de un grupo, reset instantáneo (el grupo 2 es idéntico)
        if (pos >= groupWidth) pos = 0
        track!.style.transform = `translateX(-${pos}px)`
        raf = requestAnimationFrame(step)
      }

      if (!running) {
        running = true
        raf = requestAnimationFrame(step)
      }
    }

    // Esperar a que todas las imágenes del grupo 1 carguen para medir bien
    const imgs = Array.from(group1.querySelectorAll('img'))
    let pending = imgs.filter(img => !img.complete).length

    if (pending === 0) {
      start()
    } else {
      imgs.forEach(img => {
        if (!img.complete) {
          img.addEventListener('load',  () => { pending--; if (pending === 0) start() }, { once: true })
          img.addEventListener('error', () => { pending--; if (pending === 0) start() }, { once: true })
        }
      })
    }

    // Fallback: si en 2s aún no arrancó (imágenes lentas), arrancar igual
    const fallback = setTimeout(start, 2000)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fallback)
    }
  }, [])

  return (
    <section className="brands-section">
      <p className="brands-title">Marcas con las que he trabajado</p>

      <div className="brands-marquee">
        <div ref={trackRef} className="brands-track">

          {/* Grupo 1 — el que medimos */}
          <div ref={group1Ref} className="brands-group">
            {LOGOS.map((b, i) => (
              <div key={i} className="brand-item">
                <img src={b.src} alt={b.alt} className="brand-img" />
              </div>
            ))}
          </div>

          {/* Grupo 2 — copia exacta, aria-hidden */}
          <div className="brands-group" aria-hidden="true">
            {LOGOS.map((b, i) => (
              <div key={i} className="brand-item">
                <img src={b.src} alt="" className="brand-img" />
              </div>
            ))}
          </div>

        </div>

        {/* Fade bordes — divs separados, no interfieren con la capa del track */}
        <div className="brands-fade-left"  aria-hidden="true" />
        <div className="brands-fade-right" aria-hidden="true" />
      </div>
    </section>
  )
}
