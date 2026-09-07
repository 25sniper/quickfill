export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${BASE_URL}/upload/`, {
    method: 'POST',
    body: formData
  })
  if (!res.ok) throw new Error('File upload failed')
  return res.json()
}

export async function createOrder(data: { customer_name: string, number: string, price: number, custom_photo?: string }) {
  const res = await fetch(`${BASE_URL}/orders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create order')
  return res.json()
}

export async function login(username: string, password: string) {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const res = await fetch(`${BASE_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json() // { access_token, token_type }
}

export async function getOrders(token: string) {
  const res = await fetch(`${BASE_URL}/orders/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

export async function updateOrder(id: number, status: string, token: string) {
  const res = await fetch(`${BASE_URL}/orders/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  })
  if (!res.ok) throw new Error('Failed to update order')
  return res.json()
}
