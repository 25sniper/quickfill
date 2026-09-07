import React, { useState, useEffect } from 'react'
import { LogOut, Loader2, RefreshCw } from 'lucide-react'
import { login, getOrders, updateOrder, BASE_URL } from './api'

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
    try {
      await updateOrder(orderId, newStatus, token)
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      console.error('Failed to update status', err)
      alert('Failed to update status')
    }
  }

  if (!token) {
    return (
      <div className="bg-neutral-950 text-white min-h-screen flex items-center justify-center p-6">
        <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 max-w-sm w-full space-y-6">
          <h1 className="text-2xl font-bold text-center">Admin Login</h1>
          {loginError && <p className="text-red-400 text-sm text-center bg-red-500/20 p-2 rounded">{loginError}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Username</label>
              <input 
                required
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Password</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-white"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black px-4 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-950 text-white min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
          <div>
            <h1 className="text-2xl font-bold">Orders Dashboard</h1>
            <p className="text-neutral-400 text-sm">Manage your incoming orders</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchOrders}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/50">
                  <th className="p-4 font-semibold text-neutral-400">ID</th>
                  <th className="p-4 font-semibold text-neutral-400">Date</th>
                  <th className="p-4 font-semibold text-neutral-400">Customer</th>
                  <th className="p-4 font-semibold text-neutral-400">Phone</th>
                  <th className="p-4 font-semibold text-neutral-400">Price</th>
                  <th className="p-4 font-semibold text-neutral-400">Status</th>
                  <th className="p-4 font-semibold text-neutral-400">Photo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-neutral-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4">#{order.id}</td>
                      <td className="p-4 text-sm text-neutral-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium">{order.customer_name}</td>
                      <td className="p-4 text-neutral-400">{order.number}</td>
                      <td className="p-4">${order.price.toFixed(2)}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-white"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4">
                        {order.custom_photo ? (
                          <a 
                            href={`${BASE_URL}/${order.custom_photo.replace(/\\/g, '/')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-sm"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-neutral-600 text-sm">None</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
