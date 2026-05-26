import { motion } from 'framer-motion'
import type { Service } from '@/types'
import { DynamicIcon } from './DynamicIcon'

interface Props {
  service: Service
}

export function ServiceCard({ service }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: '#FF5A1F' }}
      transition={{ duration: 0.2 }}
      className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-4"
    >
      <div className="w-11 h-11 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
        <DynamicIcon name={service.icon} size={20} />
      </div>
      <div>
        <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider">
          {service.category}
        </span>
        <h3 className="text-brand-text font-bold text-lg mt-1 mb-2">{service.title}</h3>
        <p className="text-brand-muted text-sm leading-relaxed">{service.description}</p>
      </div>
      <div className="flex flex-wrap gap-2 mt-auto">
        {service.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-1 rounded-full bg-brand-surface text-brand-dim border border-brand-border"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
