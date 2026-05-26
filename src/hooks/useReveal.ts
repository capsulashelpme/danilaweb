import { useEffect } from 'react'

/** Watches .reveal elements and adds .in once they enter the viewport.
 *  rootMargin generoso: activa la animación 280px antes de que el elemento
 *  entre al viewport, así el usuario nunca lo ve invisible.
 */
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px 280px 0px', threshold: 0 }
    )

    const observeAll = () => {
      document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
    }

    observeAll()

    // Re-escanear solo cuando React agrega nuevos nodos al DOM
    // childList:true + subtree:true pero SIN attributeFilter para no dispararse en cada animación
    const mo = new MutationObserver(observeAll)
    mo.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false })

    return () => { io.disconnect(); mo.disconnect() }
  }, [])
}
