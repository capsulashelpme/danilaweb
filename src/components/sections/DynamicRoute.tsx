import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import type { SelectorId } from '@/types'
import { dynamicRoutes } from '@/data/dynamicRoutes'
import { GradientText } from '@/components/ui/GradientText'

interface Props {
  selectedId: SelectorId | null
}

export function DynamicRoute({ selectedId }: Props) {
  const content = dynamicRoutes.find((r) => r.id === selectedId)

  return (
    <section id="dynamic-route" className="py-20 px-4 sm:px-6 bg-brand-surface">
      <div className="max-w-6xl mx-auto min-h-[340px] flex items-center">
        <AnimatePresence mode="wait">
          {!content ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center py-16 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-brand-orange mb-5"
              />
              <p className="text-brand-dim text-base">
                Selecciona una opción arriba para ver tu ruta personalizada
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full grid md:grid-cols-2 gap-10 items-center"
            >
              {/* Left: content */}
              <div>
                <span className="text-xs font-semibold text-brand-orange uppercase tracking-widest mb-4 block">
                  Tu ruta personalizada
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text leading-snug mb-4 tracking-tight">
                  {content.headline}
                </h2>
                <p className="text-brand-muted text-sm leading-relaxed mb-6">
                  {content.description}
                </p>
                <ul className="space-y-2.5 mb-8">
                  {content.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-brand-orange flex-shrink-0 mt-0.5" />
                      <span className="text-brand-muted text-sm">{bullet}</span>
                    </li>
                  ))}
                </ul>
                <motion.a
                  href={content.ctaHref}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-light text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
                >
                  {content.ctaLabel}
                  <ArrowRight size={15} />
                </motion.a>
              </div>

              {/* Right: decorative card */}
              <div className="hidden md:flex justify-end">
                <div className="relative w-full max-w-sm bg-brand-card-elevated border border-brand-border rounded-3xl p-8 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand-orange/6 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                      <span className="text-xs text-brand-dim font-medium">Plan recomendado</span>
                    </div>
                    <GradientText className="text-4xl font-black block leading-none mb-1">
                      {['sell', 'clients'].includes(selectedId!) ? '+3x' : selectedId === 'web' ? '100%' : selectedId === 'automate' ? '80%' : 'Pro'}
                    </GradientText>
                    <p className="text-brand-muted text-sm mb-8">
                      {selectedId === 'sell' ? 'aumento en ventas' : selectedId === 'clients' ? 'más prospectos' : selectedId === 'web' ? 'mobile-first' : selectedId === 'automate' ? 'menos trabajo manual' : 'imagen renovada'}
                    </p>
                    <div className="space-y-3">
                      {content.bullets.slice(0, 3).map((b) => (
                        <div key={b} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-orange/60" />
                          <span className="text-brand-dim text-xs truncate">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
