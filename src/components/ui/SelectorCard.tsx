import { motion } from 'framer-motion'
import type { SelectorOption } from '@/types'
import { DynamicIcon } from './DynamicIcon'

interface Props {
  option: SelectorOption
  isSelected: boolean
  onSelect: () => void
}

export function SelectorCard({ option, isSelected, onSelect }: Props) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
      className={`relative w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-brand-orange bg-brand-orange/10 glow-orange'
          : 'border-brand-border bg-brand-card hover:border-brand-orange/40'
      }`}
    >
      {isSelected && (
        <motion.div
          layoutId="selector-indicator"
          className="absolute inset-0 rounded-2xl border border-brand-orange/60 pointer-events-none"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
          isSelected ? 'bg-brand-orange text-white' : 'bg-brand-surface text-brand-orange'
        }`}
      >
        <DynamicIcon name={option.icon} size={18} />
      </div>
      <p className="font-semibold text-brand-text text-sm leading-tight mb-1">{option.label}</p>
      <p className="text-brand-dim text-xs leading-snug">{option.tagline}</p>
    </motion.button>
  )
}
