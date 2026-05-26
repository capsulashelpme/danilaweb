import type { Service } from '@/types'

export const services: Service[] = [
  {
    id: 'strategy',
    icon: 'Target',
    category: 'Estrategia',
    title: 'Estrategia Digital',
    description:
      'Analizamos tu negocio y construimos un plan claro de crecimiento digital con pasos concretos y métricas definidas.',
    tags: ['Diagnóstico', 'Roadmap', 'KPIs'],
  },
  {
    id: 'web',
    icon: 'Globe',
    category: 'Desarrollo',
    title: 'Páginas Web',
    description:
      'Páginas diseñadas para convertir, rápidas, mobile-first y con copy que explica tu propuesta de valor con claridad.',
    tags: ['Landing Page', 'Mobile-First', 'WhatsApp'],
  },
  {
    id: 'ads',
    icon: 'Megaphone',
    category: 'Publicidad',
    title: 'Meta Ads & Publicidad',
    description:
      'Campañas en Facebook e Instagram diseñadas para traer los clientes correctos, con presupuesto optimizado y resultados medibles.',
    tags: ['Meta Ads', 'Remarketing', 'Conversiones'],
  },
  {
    id: 'creatives',
    icon: 'PenTool',
    category: 'Diseño',
    title: 'Creativos Publicitarios',
    description:
      'Imágenes y videos pensados para capturar atención y comunicar tu oferta en segundos dentro del feed de redes sociales.',
    tags: ['Diseño', 'Video', 'Reels'],
  },
  {
    id: 'automation',
    icon: 'Zap',
    category: 'Automatización',
    title: 'Automatizaciones',
    description:
      'Sistemas automáticos para responder prospectos, hacer seguimiento y entregar información sin intervención manual.',
    tags: ['WhatsApp', 'Flujos', 'CRM'],
  },
  {
    id: 'dashboard',
    icon: 'BarChart3',
    category: 'Panel de Cliente',
    title: 'Dashboard de Resultados',
    description:
      'Panel privado donde cada cliente visualiza su avance, métricas, entregables y próximos pasos en tiempo real.',
    tags: ['Métricas', 'Seguimiento', 'Reportes'],
  },
]
