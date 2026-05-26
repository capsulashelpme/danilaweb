import { motion } from 'framer-motion'
import type { Project } from '@/types'

interface Props {
  project: Project
}

export function ProjectCard({ project }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden group cursor-pointer"
    >
      <div className={`relative h-44 bg-gradient-to-br ${project.gradient} flex items-end p-4`}>
        <span className="text-xs font-semibold text-white/70 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
          {project.category}
        </span>
        <div className="absolute top-4 right-4 bg-brand-orange text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {project.metric}
        </div>
      </div>
      <div className="p-5">
        <p className="text-brand-dim text-xs mb-1">{project.client}</p>
        <h3 className="text-brand-text font-bold text-base leading-snug mb-2">{project.title}</h3>
        <p className="text-brand-muted text-xs">{project.metricLabel}</p>
      </div>
    </motion.div>
  )
}
