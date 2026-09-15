import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { uploadFile, createOrder } from './api'
import { Button, Input, Card } from './components/ui'

export default function Checkout() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<'idle' | 'uploading' | 'submitting'>('idle')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let custom_photo_path = undefined
      if (photo) {
        setLoadingPhase('uploading')
        const uploadRes = await uploadFile(photo)
        custom_photo_path = uploadRes.path
      }

      setLoadingPhase('submitting')
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
      setLoadingPhase('idle')
    }
  }

  if (success) {
    return (
      <main className="bg-neutral-950 text-white min-h-screen flex flex-col items-center justify-center p-6" role="main">
        <Card variant="default" padding="xl" className="text-center space-y-6 max-w-md w-full" role="status" aria-live="polite">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">Order Confirmed!</h1>
          <p className="text-neutral-300">Thank you for your purchase. We'll be in touch soon.</p>
          <Button 
            variant="primary"
            size="md"
            onClick={() => navigate('/')}
            className="mt-6"
          >
            Return Home
          </Button>
        </Card>
      </main>
    )
  }

  return (
    <div className="bg-neutral-950 text-white min-h-screen flex flex-col p-6">
      <header className="py-6 flex items-center">
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft className="w-5 h-5" aria-hidden="true" />}
        >
          Back
        </Button>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <Card variant="default" padding="lg" className="max-w-lg w-full">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingCart className="w-6 h-6" aria-hidden="true" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">Checkout</h1>
          </div>

          <Card variant="elevated" padding="sm" className="mb-8 flex justify-between items-center rounded-xl">
            <div>
              <h3 className="font-bold text-white text-base">The Perfect Pour Attachment</h3>
              <p className="text-sm text-neutral-400">Early bird pricing</p>
            </div>
            <p className="font-bold text-xl text-white">₹19.99</p>
          </Card>

          {error && (
            <div role="alert" aria-live="assertive" className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="checkout-name" className="block text-sm font-medium text-neutral-300 mb-2">
                Full Name <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <Input 
                id="checkout-name"
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="focus-visible:ring-2 focus-visible:ring-white"
              />
            </div>
            
            <div>
              <label htmlFor="checkout-phone" className="block text-sm font-medium text-neutral-300 mb-2">
                Phone Number <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <Input 
                id="checkout-phone"
                required
                type="tel" 
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="focus-visible:ring-2 focus-visible:ring-white"
              />
            </div>

            <div>
              <label htmlFor="checkout-photo" className="block text-sm font-medium text-neutral-300 mb-2">
                Custom Photo (Optional)
              </label>
              <Input 
                id="checkout-photo"
                type="file" 
                onChange={e => setPhoto(e.target.files?.[0] || null)}
                aria-describedby="checkout-photo-helper"
                className="focus-visible:ring-2 focus-visible:ring-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-neutral-200"
              />
              {loadingPhase === 'uploading' && (
                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-300" role="status" aria-live="polite">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" aria-hidden="true" />
                  <span>Uploading photo attachment...</span>
                </div>
              )}
              <p id="checkout-photo-helper" className="text-xs text-neutral-400 mt-2">Upload a photo of your tap if you want us to verify compatibility.</p>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              disabled={loading}
              isLoading={loading}
              fullWidth
              className="mt-4"
            >
              {loading ? (loadingPhase === 'uploading' ? 'Uploading Photo...' : 'Completing Purchase...') : 'Complete Purchase'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  )
}
