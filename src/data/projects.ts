import type { Project } from '@/types'

export const projects: Project[] = [
  {
    id: 'rest',
    title: 'Landing para Restaurante',
    client: 'Restaurante Local',
    category: 'Página Web',
    metric: '+180%',
    metricLabel: 'más reservas por WhatsApp',
    gradient: 'from-orange-900/60 via-red-950/40 to-brand-card',
  },
  {
    id: 'campaign',
    title: 'Campaña de Captación',
    client: 'Negocio de Servicios',
    category: 'Meta Ads',
    metric: '3.2x',
    metricLabel: 'retorno sobre inversión',
    gradient: 'from-amber-900/50 via-orange-950/40 to-brand-card',
  },
  {
    id: 'brand',
    title: 'Identidad de Marca',
    client: 'Tienda Online',
    category: 'Dirección Visual',
    metric: '+240%',
    metricLabel: 'engagement en redes',
    gradient: 'from-red-900/50 via-rose-950/40 to-brand-card',
  },
  {
    id: 'auto',
    title: 'Sistema de Automatización',
    client: 'Academia Online',
    category: 'Automatización',
    metric: '90%',
    metricLabel: 'menos respuestas manuales',
    gradient: 'from-orange-950/60 via-amber-950/30 to-brand-card',
  },
]
