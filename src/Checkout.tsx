import React, { useState } from 'react'
import { ShoppingCart, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { uploadFile, createOrder } from './api'

export default function Checkout() {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let custom_photo_path = undefined
      if (photo) {
        const uploadRes = await uploadFile(photo)
        custom_photo_path = uploadRes.path
      }

      await createOrder({
        customer_name: name,
        number: number,
        price: 19.99,
        custom_photo: custom_photo_path
      })

      setSuccess(true)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-neutral-950 text-white min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-neutral-900 p-12 rounded-3xl border border-neutral-800 text-center space-y-6 max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-3xl font-bold">Order Confirmed!</h2>
          <p className="text-neutral-400">Thank you for your purchase. We'll be in touch soon.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-950 text-white min-h-screen flex flex-col p-6">
      <header className="py-6 flex items-center">
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 max-w-lg w-full">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingCart className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>

          <div className="mb-8 p-4 bg-neutral-800 rounded-xl flex justify-between items-center">
            <div>
              <p className="font-bold">The Perfect Pour Attachment</p>
              <p className="text-sm text-neutral-400">Early bird pricing</p>
            </div>
            <p className="font-bold text-xl">$19.99</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Full Name</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Phone Number</label>
              <input 
                required
                type="tel" 
                value={number}
                onChange={e => setNumber(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Custom Photo (Optional)</label>
              <input 
                type="file" 
                onChange={e => setPhoto(e.target.files?.[0] || null)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-neutral-200"
              />
              <p className="text-xs text-neutral-500 mt-2">Upload a photo of your tap if you want us to verify compatibility.</p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Purchase'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
