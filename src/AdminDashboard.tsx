import React, { useState, useEffect } from 'react'
import { LogOut, RefreshCw } from 'lucide-react'
import { login, getOrders, updateOrder, BASE_URL } from './api'
import { Button, Input, Card, Spinner } from './components/ui'

interface Order {
  id: number
  customer_name: string
  number: string
  price: number
  status: string
  custom_photo: string | null
  created_at: string
}

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'))
  const [orders, setOrders] = useState<Order[]>([])
  
  // Login state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)

  // Fetch orders
  const fetchOrders = async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await getOrders(token)
      setOrders(data)
    } catch (err) {
      console.error(err)
      if (err instanceof Error && err.message.includes('401')) {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders()
    }
  }, [token])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('')
    try {
      const data = await login(username, password)
      setToken(data.access_token)
      localStorage.setItem('admin_token', data.access_token)
    } catch (err: any) {
      setLoginError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('admin_token')
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!token) return
    setUpdatingOrderId(orderId)
    try {
      await updateOrder(orderId, newStatus, token)
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      console.error('Failed to update status', err)
      alert('Failed to update status')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (!token) {
    return (
      <div className="bg-neutral-950 text-white min-h-screen flex items-center justify-center p-6">
        <Card variant="default" padding="lg" className="max-w-sm w-full space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-white text-center">Admin Login</h1>
          {loginError && <p role="alert" aria-live="assertive" className="text-red-400 text-sm text-center bg-red-500/20 p-2 rounded-xl">{loginError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              id="admin-username"
              label="Username"
              required
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <Input 
              id="admin-password"
              label="Password"
              required
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="primary"
              size="md"
              disabled={loading}
              isLoading={loading}
              fullWidth
              className="rounded-xl mt-2"
            >
              Login
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-neutral-950 text-white min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card as="header" variant="default" padding="md" className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Orders Dashboard</h1>
            <p className="text-neutral-400 text-sm mt-0.5">Manage your incoming orders</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost"
              size="sm"
              onClick={fetchOrders}
              aria-label="Refresh orders"
              className="p-2 hover:bg-neutral-800/60"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </Button>
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" aria-hidden="true" />}
            >
              Logout
            </Button>
          </div>
        </Card>

        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">Customer orders and fulfillment tracking</caption>
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/50">
                  <th scope="col" className="p-4 font-semibold text-neutral-400">ID</th>
                  <th scope="col" className="p-4 font-semibold text-neutral-400">Date</th>
                  <th scope="col" className="p-4 font-semibold text-neutral-400">Customer</th>
                  <th scope="col" className="p-4 font-semibold text-neutral-400">Phone</th>
                  <th scope="col" className="p-4 font-semibold text-neutral-400">Price</th>
                  <th scope="col" className="p-4 font-semibold text-neutral-400">Status</th>
                  <th scope="col" className="p-4 font-semibold text-neutral-400">Photo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {loading && orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-16 text-center">
                      <div 
                        className="flex flex-col items-center justify-center gap-3"
                        role="status"
                        aria-live="polite"
                      >
                        <Spinner size="lg" label="Loading orders..." className="text-white" />
                        <p className="text-sm font-medium text-neutral-300">Loading orders...</p>
                        <span className="sr-only">Loading orders from server, please wait</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-400">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4 text-neutral-200">#{order.id}</td>
                      <td className="p-4 text-sm text-neutral-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium text-white">{order.customer_name}</td>
                      <td className="p-4 text-neutral-400">{order.number}</td>
                      <td className="p-4 font-medium text-white">₹{order.price.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            disabled={updatingOrderId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            aria-label={`Change status for order #${order.id}`}
                            className="bg-neutral-950 border border-neutral-600 rounded-lg px-2.5 py-1.5 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          {updatingOrderId === order.id && (
                            <span role="status" aria-live="polite" aria-label="Updating status" className="inline-flex items-center">
                              <Spinner size="sm" className="text-neutral-300" label={`Updating order #${order.id} status`} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {order.custom_photo ? (
                          <a 
                            href={`${BASE_URL}/${order.custom_photo.replace(/\\/g, '/')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label={`View custom photo for order #${order.id}`}
                            className="text-blue-400 hover:underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-neutral-400 text-sm">None</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
