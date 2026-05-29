import { motion } from 'framer-motion'
import { ArrowRight, Eye } from 'lucide-react'
import { GradientText } from '@/components/ui/GradientText'

const stats = [
  { value: '+50', label: 'Proyectos completados' },
  { value: '5+', label: 'Años de experiencia' },
  { value: '3x', label: 'ROI promedio' },
]

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col justify-center pt-20 pb-16 px-4 sm:px-6 overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-hero-gradient pointer-events-none" />

      {/* Floating orb */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.38, 0.2], y: [0, -16, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
        className="absolute top-24 right-8 md:right-24 w-72 h-72 rounded-full bg-brand-orange/8 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto w-full">
        <div className="max-w-3xl">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 32, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', damping: 22, stiffness: 120, delay: 0 }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-orange uppercase tracking-widest bg-brand-orange/10 border border-brand-orange/20 px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
              Estrategia Digital & Comercial
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.08 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-brand-text mb-6"
          >
            Construyo sistemas digitales para que tu negocio{' '}
            <GradientText>venda mejor.</GradientText>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 110, delay: 0.18 }}
            className="text-brand-muted text-base sm:text-lg leading-relaxed max-w-xl mb-10"
          >
            Páginas web, campañas, creativos y estrategias comerciales diseñadas
            para convertir visitas en clientes reales.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 120, delay: 0.28 }}
            className="flex flex-col sm:flex-row gap-3 mb-16"
          >
            <motion.a
              href="#selector"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', damping: 18, stiffness: 300 }}
              className="inline-flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-light text-white font-semibold px-6 py-3.5 rounded-full transition-colors text-sm"
            >
              Descubrir mi solución
              <ArrowRight size={16} />
            </motion.a>
            <motion.a
              href="#proyectos"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', damping: 18, stiffness: 300 }}
              className="inline-flex items-center justify-center gap-2 border border-brand-border hover:border-brand-orange/40 text-brand-muted hover:text-brand-text font-semibold px-6 py-3.5 rounded-full transition-colors text-sm"
            >
              <Eye size={16} />
              Ver proyectos
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 130, delay: 0.38 }}
            className="flex gap-8 sm:gap-12"
          >
            {stats.map((stat) => (
              <div key={stat.value}>
                <p className="text-2xl sm:text-3xl font-extrabold text-gradient-orange leading-none">
                  {stat.value}
                </p>
                <p className="text-brand-dim text-xs mt-1 leading-tight max-w-[80px]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom scroll hint */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
          className="w-5 h-8 rounded-full border border-brand-border flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-brand-orange" />
        </motion.div>
      </motion.div>
    </section>
  )
}
