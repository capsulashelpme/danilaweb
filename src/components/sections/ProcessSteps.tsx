import { motion } from 'framer-motion'

const STEPS = [
  { num: '01', title: 'Diagnóstico',  desc: 'Vemos qué frena tus ventas — sin adornos.',      pct: 100 },
  { num: '02', title: 'Estrategia',   desc: 'Plan claro y enfocado a resultados.',            pct: 100 },
  { num: '03', title: 'Diseño y dev', desc: 'Producción mobile-first y orientada a vender.',  pct: 100 },
  { num: '04', title: 'Lanzamiento',  desc: 'Salimos al mercado con todo listo y medible.',   pct: 70 },
  { num: '05', title: 'Optimización', desc: 'Escalamos lo que funciona, semana a semana.',    pct: 35 },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, damping: 22, stiffness: 120, delay: i * 0.08 },
  }),
}

export function ProcessSteps() {
  return (
    <section id="proceso" style={{ padding: '56px 0' }}>
      <div style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        <div className="reveal" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Proceso</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,5vw,60px)', lineHeight: 1.0, letterSpacing: '-0.025em', marginTop: 16, maxWidth: '22ch', margin: '16px auto 0' }}>
            De diagnóstico a resultado,{' '}
            <em style={{ fontStyle: 'italic', fontFamily: '"Instrument Serif", serif', fontWeight: 400, color: 'var(--orange-1)' }}>sin atajos</em>.
          </h2>
          <p style={{ marginTop: 18, fontSize: 'clamp(15px,1.4vw,17px)', color: 'var(--fg-2)', maxWidth: '52ch', lineHeight: 1.55, margin: '18px auto 0' }}>
            Cada etapa con entregables y métricas. Siempre sabes dónde estás.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 40, gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))' }}>
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ y: -3, scale: 1.02, transition: { type: 'spring' as const, damping: 18, stiffness: 280 } }}
              style={{
                padding: '22px 20px',
                borderRadius: 'var(--r-lg)',
                background: 'var(--bg-2)',
                border: '1px solid var(--card-border)',
                position: 'relative',
                display: 'flex', flexDirection: 'column', gap: 10,
                minWidth: 0, minHeight: 170,
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--orange-1)', letterSpacing: '-.03em', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-.01em' }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>{s.desc}</div>
              <div className="progress-bar" style={{ marginTop: 'auto' }}>
                <span style={{ width: `${s.pct}%` }}/>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
