import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { WA_LINK } from '@/lib/constants'

const cards = [
  {
    id: 'web',
    label: 'Páginas web',
    title: 'Diseñadas para convertir',
    gradient: 'from-orange-950/80 via-red-950/60 to-transparent',
    accent: '#FF5A1F',
  },
  {
    id: 'ads',
    label: 'Meta Ads',
    title: 'Campañas que traen clientes',
    gradient: 'from-amber-950/70 via-orange-950/50 to-transparent',
    accent: '#FF7A45',
  },
  {
    id: 'brand',
    label: 'Branding & Dashboard',
    title: 'Imagen que genera confianza',
    gradient: 'from-red-950/70 via-rose-950/50 to-transparent',
    accent: '#C93A12',
  },
]

export function BehindSection() {
  return (
    <section className="px-3 sm:px-4 py-4">
      <div className="bg-brand-surface rounded-4xl sm:rounded-5xl overflow-hidden">

        {/* ── Top block: title left + text right ── */}
        <div className="px-8 sm:px-12 lg:px-16 pt-14 sm:pt-16 pb-12 sm:pb-14">
          <AnimatedSection>
            <span className="text-xs font-bold text-brand-orange uppercase tracking-[0.2em] mb-6 block">
              Detrás de la estrategia
            </span>
          </AnimatedSection>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-20">
            {/* Big title */}
            <AnimatedSection delay={0.1} className="lg:flex-1">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight text-brand-text">
                Construyo<br />
                experiencias<br />
                digitales que<br />
                <span className="text-gradient-orange">ayudan</span><br />
                a vender mejor.
              </h2>
            </AnimatedSection>

            {/* Right: text + button */}
            <AnimatedSection delay={0.2} className="lg:max-w-xs shrink-0">
              <p className="text-brand-muted text-base leading-relaxed mb-8">
                Diseño páginas, campañas y sistemas con enfoque comercial,
                claridad visual y conversión. Cada pieza está construida para
                generar resultados reales.
              </p>
              <motion.a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
                className="inline-flex items-center gap-2 bg-white text-black font-bold text-sm px-6 py-3 rounded-full hover:bg-brand-text/90 transition-colors"
              >
                Hablemos
                <ArrowUpRight size={14} />
              </motion.a>
            </AnimatedSection>
          </div>
        </div>

        {/* ── 3 Cards row ── */}
        <div className="px-8 sm:px-12 lg:px-16 pb-14 sm:pb-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <AnimatedSection key={card.id} delay={i * 0.12}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
                className="group relative bg-brand-card rounded-3xl overflow-hidden cursor-pointer"
                style={{ minHeight: '320px' }}
              >
                {/* Gradient bg */}
                <div className={`absolute inset-0 bg-gradient-to-b ${card.gradient}`} />

                {/* Glow dot */}
                <div
                  className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"
                  style={{ background: card.accent }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end h-full p-6 min-h-[320px]">
                  <span className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: card.accent }}>
                    {card.label}
                  </span>
                  <h3 className="text-brand-text font-bold text-xl leading-snug mb-3">
                    {card.title}
                  </h3>
                  <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center
                    group-hover:bg-white group-hover:border-white transition-all">
                    <ArrowUpRight size={13} className="text-white/60 group-hover:text-black transition-colors" />
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
