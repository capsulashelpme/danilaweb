import type { DynamicRouteContent } from '@/types'

export const dynamicRoutes: DynamicRouteContent[] = [
  {
    id: 'sell',
    headline: 'Tu negocio necesita un sistema para vender, no solo publicar.',
    description:
      'Construimos una estrategia comercial completa: desde cómo te presentas hasta cómo cierras ventas. Cada pieza digital trabaja para convertir visitas en ingresos reales.',
    bullets: [
      'Embudo de ventas diseñado para tu negocio',
      'Copy comercial que convence y convierte',
      'Seguimiento automatizado de prospectos',
      'Métricas claras de qué está funcionando',
    ],
    ctaLabel: 'Quiero vender más',
    ctaHref: '#contacto',
  },
  {
    id: 'clients',
    headline: 'Más clientes no es suerte. Es estrategia y consistencia.',
    description:
      'Diseñamos campañas y sistemas de captación para que lleguen los clientes correctos a tu negocio, de forma continua y predecible.',
    bullets: [
      'Publicidad en Meta Ads y redes sociales',
      'Landing pages diseñadas para captar contactos',
      'Integración directa con WhatsApp',
      'Automatización del primer contacto',
    ],
    ctaLabel: 'Quiero más clientes',
    ctaHref: '#contacto',
  },
  {
    id: 'web',
    headline: 'Tu negocio necesita una web enfocada en conversión.',
    description:
      'Creamos páginas diseñadas para explicar tu oferta, generar confianza y llevar al usuario hacia una acción clara: comprar, reservar o escribir por WhatsApp.',
    bullets: [
      'Diseño mobile-first y velocidad óptima',
      'Copy comercial que explica y convence',
      'Integración con WhatsApp y redes',
      'Optimizada para aparecer en Google',
    ],
    ctaLabel: 'Quiero mi página web',
    ctaHref: '#contacto',
  },
  {
    id: 'brand',
    headline: 'Una imagen profesional genera confianza antes de que hables.',
    description:
      'Diseñamos la identidad visual y comunicación de tu marca para que proyecte autoridad, coherencia y profesionalismo en todos los canales.',
    bullets: [
      'Identidad visual y paleta de marca',
      'Creativos para redes sociales',
      'Dirección visual y estética consistente',
      'Manual de marca básico',
    ],
    ctaLabel: 'Quiero mejorar mi imagen',
    ctaHref: '#contacto',
  },
  {
    id: 'automate',
    headline: 'Automatiza lo repetitivo. Enfócate en lo que importa.',
    description:
      'Implementamos flujos automáticos para respuestas, seguimientos, reportes y procesos internos. Tu negocio trabaja aunque tú no estés.',
    bullets: [
      'Respuestas automáticas por WhatsApp',
      'Flujos de seguimiento a prospectos',
      'Reportes automáticos de resultados',
      'Integraciones entre herramientas',
    ],
    ctaLabel: 'Quiero automatizar',
    ctaHref: '#contacto',
  },
]
