import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { projects } from '@/data/projects'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

export function ProjectsGallery() {
  return (
    <section id="proyectos" className="px-3 sm:px-4 py-4">
      <div className="bg-brand-surface rounded-4xl sm:rounded-5xl overflow-hidden px-8 sm:px-12 lg:px-16 py-14 sm:py-16">

        <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold text-brand-orange uppercase tracking-[0.2em] mb-3 block">
              Resultados reales
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-brand-text">
              Proyectos
            </h2>
          </div>
          <p className="text-brand-muted text-sm max-w-xs sm:text-right">
            Negocios transformados con estrategia digital bien ejecutada.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {projects.map((p, i) => (
            <AnimatedSection key={p.id} delay={i * 0.09} className={i % 2 === 1 ? 'lg:mt-8' : ''}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.22 }}
                className="group bg-brand-card border border-brand-border rounded-3xl overflow-hidden cursor-pointer"
              >
                {/* Visual placeholder */}
                <div className={`relative h-52 bg-gradient-to-b ${p.gradient} flex flex-col justify-between p-5`}>
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-white/60 bg-black/30 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full">
                      {p.category}
                    </span>
                    <span className="text-xs font-black text-white bg-brand-orange px-2.5 py-1 rounded-full">
                      {p.metric}
                    </span>
                  </div>
                  {/* Ambient glow */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="w-24 h-24 rounded-full bg-brand-orange blur-3xl" />
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity self-end">
                    <ArrowUpRight size={13} className="text-white" />
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-brand-dim text-xs mb-0.5">{p.client}</p>
                  <h3 className="text-brand-text font-bold text-sm leading-snug mb-1">{p.title}</h3>
                  <p className="text-brand-muted text-xs">{p.metricLabel}</p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
