import { lazy, Suspense, useState } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { Topbar } from '@/components/layout/Topbar'
import { HeroCard } from '@/components/sections/HeroCard'
import { TrustStrip } from '@/components/sections/TrustStrip'
import { LegalFooter } from '@/components/layout/LegalFooter'

// Secciones below-the-fold — se cargan en un chunk separado, no bloquean el hero
const SobreMe           = lazy(() => import('@/components/sections/SobreMe').then(m => ({ default: m.SobreMe })))
const RouteSelector     = lazy(() => import('@/components/sections/RouteSelector').then(m => ({ default: m.RouteSelector })))
const CasesSlider       = lazy(() => import('@/components/sections/CasesSlider').then(m => ({ default: m.CasesSlider })))
const TestimonialsSlider = lazy(() => import('@/components/sections/TestimonialsSlider').then(m => ({ default: m.TestimonialsSlider })))
const VideoSlider       = lazy(() => import('@/components/sections/VideoSlider').then(m => ({ default: m.VideoSlider })))
const WebSlider         = lazy(() => import('@/components/sections/WebSlider').then(m => ({ default: m.WebSlider })))
const ServicesGrid      = lazy(() => import('@/components/sections/ServicesGrid').then(m => ({ default: m.ServicesGrid })))
const ProcessSteps      = lazy(() => import('@/components/sections/ProcessSteps').then(m => ({ default: m.ProcessSteps })))
const FinalCTA          = lazy(() => import('@/components/sections/FinalCTA').then(m => ({ default: m.FinalCTA })))

// Placeholder invisible — mantiene el layout mientras carga la sección
const SectionShell = ({ minHeight = 400 }: { minHeight?: number }) => (
  <div style={{ minHeight, background: 'transparent' }} />
)

function App() {
  const [drawerId, setDrawerId] = useState<string | null>(null)
  useReveal()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', color: 'var(--fg-0)', paddingBottom: 0 }}>
      <Topbar />
      <main>
        {/* Above-the-fold: carga inmediata */}
        <HeroCard />
        <TrustStrip />

        {/* Below-the-fold: lazy chunks */}
        <Suspense fallback={<SectionShell minHeight={200} />}>
          <SobreMe />
        </Suspense>
        <Suspense fallback={<SectionShell minHeight={500} />}>
          <RouteSelector drawerId={drawerId} setDrawerId={setDrawerId} />
        </Suspense>
        <Suspense fallback={<SectionShell minHeight={360} />}>
          <CasesSlider />
        </Suspense>
        <Suspense fallback={<SectionShell minHeight={200} />}>
          <TestimonialsSlider />
        </Suspense>
        <Suspense fallback={<SectionShell minHeight={360} />}>
          <VideoSlider />
        </Suspense>
        <Suspense fallback={<SectionShell minHeight={360} />}>
          <WebSlider />
        </Suspense>
        <Suspense fallback={<SectionShell minHeight={400} />}>
          <ServicesGrid />
        </Suspense>
        <Suspense fallback={<SectionShell minHeight={300} />}>
          <ProcessSteps />
        </Suspense>
        <Suspense fallback={<SectionShell minHeight={200} />}>
          <FinalCTA />
        </Suspense>
      </main>
      <LegalFooter />
    </div>
  )
}

export default App
