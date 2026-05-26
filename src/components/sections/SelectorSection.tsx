import type { SelectorId } from '@/types'
import { selectorOptions } from '@/data/selectorOptions'
import { SelectorCard } from '@/components/ui/SelectorCard'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

interface Props {
  selectedId: SelectorId | null
  onSelect: (id: SelectorId) => void
}

export function SelectorSection({ selectedId, onSelect }: Props) {
  const handleSelect = (id: SelectorId) => {
    onSelect(id)
    setTimeout(() => {
      document.getElementById('dynamic-route')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <section id="selector" className="py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <span className="text-xs font-semibold text-brand-orange uppercase tracking-widest">
            Diagnóstico rápido
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-text mt-3 mb-4 tracking-tight">
            ¿Qué quieres mejorar primero?
          </h2>
          <p className="text-brand-muted text-base max-w-lg mx-auto">
            Elige una opción y te mostramos una ruta recomendada para tu negocio.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {selectorOptions.map((option, i) => (
            <AnimatedSection key={option.id} delay={i * 0.08}>
              <SelectorCard
                option={option}
                isSelected={selectedId === option.id}
                onSelect={() => handleSelect(option.id)}
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
