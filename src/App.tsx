import { useState, useRef, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, ShoppingCart, Star } from 'lucide-react'
import { ProductScene } from './components/ProductScene'
import { Button, Card } from './components/ui'
import { ProductSceneFallback } from './components/scene/ProductSceneFallback'
import { TutorialModal } from './components/TutorialModal'
import { AudioPlayer } from './components/AudioPlayer'
import { useReducedMotion } from './hooks/useReducedMotion'

function App() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const tutorialTriggerRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-blue-500/30 relative">
      <AudioPlayer />
      
      {/* Premium Background Layer */}
      <div className="fixed inset-0 z-0 bg-neutral-950 pointer-events-none">
        {/* Soft studio radial spotlight from the top */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/40 via-neutral-950 to-black"></div>
        {/* Subtle matte noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        ></div>
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-end pointer-events-none">
        <Button 
          variant="primary"
          size="md"
          onClick={() => navigate('/checkout')}
          className="pointer-events-auto shadow-lg"
          leftIcon={<ShoppingCart className="w-4 h-4" aria-hidden="true" />}
        >
          Preorder
        </Button>
      </header>

      {/* Foreground 3D Scene */}
      <div className="fixed inset-0 z-40 pointer-events-none" aria-hidden="true">
        <Suspense fallback={<ProductSceneFallback />}>
          <ProductScene reducedMotion={prefersReducedMotion} />
        </Suspense>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col">
        
        {/* 1. Hero Section (Model is CENTER) */}
        <section className="min-h-screen flex flex-col items-center justify-between px-6 pt-20 pb-32">
          <div className="w-full text-center mt-12">
            <motion.h1 
              initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
              className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent"
            >
              The Perfect Pour.
            </motion.h1>
          </div>
          <div className="w-full text-center mb-12">
            <motion.p 
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 0.2 }}
              className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto"
            >
              The ultimate pressing attachment for your RO water dispenser. Effortlessly hold the water tap open and free your hands.
            </motion.p>
          </div>
        </section>



        {/* 3. Testimonials (Model sweeps LEFT) -> Text goes RIGHT */}
        <section className="min-h-screen flex flex-col items-end justify-center px-6 py-24 max-w-7xl mx-auto w-full">
          <div className="w-full md:w-1/2 space-y-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">Loved by thousands</h2>
            <div className="grid grid-cols-1 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} variant="glass" padding="lg" className="space-y-4">
                  <div className="flex gap-1 text-yellow-500" role="img" aria-label="5 out of 5 stars">
                    <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                    <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                    <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                    <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                    <Star className="w-5 h-5 fill-current" aria-hidden="true" />
                  </div>
                  <p className="text-base sm:text-lg text-neutral-200">"This simple attachment changed my morning routine. No more standing and holding the tap for 2 minutes straight while my pitcher fills!"</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Tutorial Section — 400vh tall so animation has 4× scroll room */}
        <section style={{ minHeight: '400vh' }} className="relative flex flex-col items-start px-6 max-w-7xl mx-auto w-full">
          {/* Sticky text panel — stays visible the whole time the user scrolls through */}
          <div className="sticky top-0 pt-24 pb-16 w-full md:w-1/2 space-y-12" style={{ height: '100vh', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">How it works</h2>
            <div className="grid grid-cols-1 gap-8">
              {[
                { step: '01', title: 'Attach', desc: 'Slide the attachment over your RO water tap.' },
                { step: '02', title: 'Lock', desc: 'Snap it into place to hold the push-button in.' },
                { step: '03', title: 'Fill', desc: 'Walk away while your pitcher or glass fills effortlessly.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="text-2xl font-bold text-neutral-400">{item.step}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{item.title}</h3>
                    <p className="text-neutral-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              ref={tutorialTriggerRef}
              variant="ghost"
              onClick={() => setIsTutorialOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isTutorialOpen}
              className="p-0 hover:bg-transparent group inline-flex justify-start w-fit"
              leftIcon={
                <div className="w-12 h-12 rounded-full border border-neutral-400 flex items-center justify-center group-hover:border-white transition-colors">
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                </div>
              }
            >
              Watch the tutorial
            </Button>
          </div>
        </section>


        {/* 5. Preorder Section (Model is CENTER, zoomed in) -> Text goes TOP and BOTTOM */}
        <section className="min-h-screen flex flex-col items-center justify-between px-6 pt-12 pb-32 max-w-4xl mx-auto w-full relative">
          <div className="text-center w-full mt-24 space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight relative z-50">Ready to upgrade?</h2>
            <p className="text-xl text-neutral-400 relative z-50">
              Secure your pressing attachment today and get early bird pricing.
            </p>
          </div>
          
          <div className="flex-grow min-h-[400px]"></div>

          <div className="text-center space-y-6 relative z-50">
            <Button 
              variant="primary"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="mx-auto pointer-events-auto"
              leftIcon={<ShoppingCart className="w-6 h-6" aria-hidden="true" />}
            >
              {/* Preorder Now - $19.99 */}
              Preorder Now - ₹19.99
            </Button>
            <p className="text-sm text-neutral-400">Ships worldwide starting next month.</p>
          </div>
        </section>

      </main>

      {/* Tutorial Walkthrough Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        triggerRef={tutorialTriggerRef}
      />
    </div>
  )
}

export default App
