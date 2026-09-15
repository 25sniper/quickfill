/**
 * Mock API Server & Fixture Engine for Presser E2E Testing
 * Implements endpoints specified in src/api.ts:
 * - POST /upload/
 * - POST /orders/
 * - POST /token
 * - GET  /orders/
 * - PUT  /orders/:id
 */

export class MockBackend {
  constructor(initialOrders = []) {
    this.orders = initialOrders.length ? [...initialOrders] : [
      {
        id: 101,
        customer_name: 'Alice Springs',
        number: '+1-555-0100',
        price: 19.99,
        status: 'Pending',
        custom_photo: 'uploads/tap-alice.jpg',
        created_at: new Date('2026-09-01T10:00:00Z').toISOString()
      },
      {
        id: 102,
        customer_name: 'Bob Waters',
        number: '+1-555-0200',
        price: 19.99,
        status: 'Shipped',
        custom_photo: null,
        created_at: new Date('2026-09-02T14:30:00Z').toISOString()
      },
      {
        id: 103,
        customer_name: 'Charlie Lake',
        number: '+1-555-0300',
        price: 19.99,
        status: 'Delivered',
        custom_photo: 'uploads/tap-charlie.png',
        created_at: new Date('2026-09-03T09:15:00Z').toISOString()
      }
    ];
    this.nextId = 104;
    this.validToken = 'test-mock-admin-token-xyz789';
    this.credentials = { username: 'admin', password: 'password123' };
    this.networkFailure = false;
  }

  setNetworkFailure(enabled) {
    this.networkFailure = !!enabled;
  }

  async upload(file) {
    if (this.networkFailure) throw new Error('Network error: connection refused');
    if (!file || !file.name) {
      throw new Error('File upload failed: No file provided');
    }
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const hasAllowedExt = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasAllowedExt) {
      throw new Error('File upload failed: Unsupported file type');
    }
    return { path: `uploads/${Date.now()}_${file.name}` };
  }

  async createOrder(data) {
    if (this.networkFailure) throw new Error('Network error: connection refused');
    if (!data.customer_name || data.customer_name.trim() === '') {
      throw new Error('Failed to create order: customer_name is required');
    }
    if (!data.number || data.number.trim() === '') {
      throw new Error('Failed to create order: number is required');
    }
    if (typeof data.price !== 'number' || data.price <= 0) {
      throw new Error('Failed to create order: price must be a positive number');
    }

    const newOrder = {
      id: this.nextId++,
      customer_name: data.customer_name.trim(),
      number: data.number.trim(),
      price: data.price,
      status: 'Pending',
      custom_photo: data.custom_photo || null,
      created_at: new Date().toISOString()
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  async login(username, password) {
    if (this.networkFailure) throw new Error('Network error: connection refused');
    if (username === this.credentials.username && password === this.credentials.password) {
      return {
        access_token: this.validToken,
        token_type: 'bearer'
      };
    }
    throw new Error('Login failed: Invalid credentials');
  }

  async getOrders(token) {
    if (this.networkFailure) throw new Error('Network error: connection refused');
    if (token !== this.validToken) {
      throw new Error('401 Unauthorized: Invalid or missing token');
    }
    return [...this.orders];
  }

  async updateOrder(id, status, token) {
    if (this.networkFailure) throw new Error('Network error: connection refused');
    if (token !== this.validToken) {
      throw new Error('401 Unauthorized: Invalid or missing token');
    }
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}`);
    }

    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new Error(`Order #${id} not found`);
    }
    order.status = status;
    return { ...order };
  }
}
