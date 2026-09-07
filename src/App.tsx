import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Play, ShoppingCart, Star } from 'lucide-react'
import { ProductScene } from './components/ProductScene'

function App() {
  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-blue-500/30 relative">
      
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
        <button 
          onClick={() => window.location.href = '/checkout'}
          className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2 pointer-events-auto shadow-lg"
        >
          <ShoppingCart className="w-4 h-4" />
          Preorder
        </button>
      </header>

      {/* Foreground 3D Scene */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <Suspense fallback={null}>
          <ProductScene />
        </Suspense>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col">
        
        {/* 1. Hero Section (Model is CENTER) */}
        <section className="min-h-screen flex flex-col items-center justify-between px-6 pt-20 pb-32">
          <div className="w-full text-center mt-12">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent"
            >
              The Perfect Pour.
            </motion.h1>
          </div>
          <div className="w-full text-center mb-12">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto"
            >
              The ultimate pressing attachment for your RO water dispenser. Effortlessly hold the water tap open and free your hands.
            </motion.p>
          </div>
        </section>



        {/* 3. Testimonials (Model sweeps LEFT) -> Text goes RIGHT */}
        <section className="min-h-screen flex flex-col items-end justify-center px-6 py-24 max-w-7xl mx-auto w-full">
          <div className="w-full md:w-1/2 space-y-12">
            <h2 className="text-4xl md:text-5xl font-bold">Loved by thousands</h2>
            <div className="grid grid-cols-1 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-neutral-900/80 backdrop-blur p-8 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex gap-1 text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-lg">"This simple attachment changed my morning routine. No more standing and holding the tap for 2 minutes straight while my pitcher fills!"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Tutorial Section — 400vh tall so animation has 4× scroll room */}
        <section style={{ minHeight: '400vh' }} className="relative flex flex-col items-start px-6 max-w-7xl mx-auto w-full">
          {/* Sticky text panel — stays visible the whole time the user scrolls through */}
          <div className="sticky top-0 pt-24 pb-16 w-full md:w-1/2 space-y-12" style={{ height: '100vh', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <h2 className="text-4xl md:text-5xl font-bold">How it works</h2>
            <div className="grid grid-cols-1 gap-8">
              {[
                { step: '01', title: 'Attach', desc: 'Slide the attachment over your RO water tap.' },
                { step: '02', title: 'Lock', desc: 'Snap it into place to hold the push-button in.' },
                { step: '03', title: 'Fill', desc: 'Walk away while your pitcher or glass fills effortlessly.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="text-2xl font-bold text-neutral-600">{item.step}</span>
                  <div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-neutral-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
              <div className="w-12 h-12 rounded-full border border-neutral-600 flex items-center justify-center group-hover:border-white transition-colors">
                <Play className="w-4 h-4 fill-current" />
              </div>
              Watch the tutorial
            </button>
          </div>
        </section>


        {/* 5. Preorder Section (Model is CENTER, zoomed in) -> Text goes TOP and BOTTOM */}
        <section className="min-h-screen flex flex-col items-center justify-between px-6 pt-12 pb-32 max-w-4xl mx-auto w-full relative">
          <div className="text-center w-full mt-24 space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold relative z-50">Ready to upgrade?</h2>
            <p className="text-xl text-neutral-400 relative z-50">
              Secure your pressing attachment today and get early bird pricing.
            </p>
          </div>
          
          <div className="flex-grow min-h-[400px]"></div>

          <div className="text-center space-y-6 relative z-50">
            <button 
              onClick={() => window.location.href = '/checkout'}
              className="bg-white text-black px-12 py-4 rounded-full text-xl font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 mx-auto pointer-events-auto"
            >
              <ShoppingCart className="w-6 h-6" />
              Preorder Now - $19.99
            </button>
            <p className="text-sm text-neutral-500">Ships worldwide starting next month.</p>
          </div>
        </section>

      </main>
    </div>
  )
}

export default App
