export type SelectorId = 'sell' | 'clients' | 'web' | 'brand' | 'automate'

export interface SelectorOption {
  id: SelectorId
  icon: string
  label: string
  tagline: string
}

export interface DynamicRouteContent {
  id: SelectorId
  headline: string
  description: string
  bullets: string[]
  ctaLabel: string
  ctaHref: string
}

export interface Service {
  id: string
  icon: string
  category: string
  title: string
  description: string
  tags: string[]
}

export interface Project {
  id: string
  title: string
  client: string
  category: string
  metric: string
  metricLabel: string
  gradient: string
}

export interface ProcessStep {
  number: string
  title: string
  description: string
}
