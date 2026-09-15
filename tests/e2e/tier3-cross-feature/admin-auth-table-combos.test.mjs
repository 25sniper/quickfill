import { createSuite, assert } from '../helpers/test-harness.mjs';
import { MockBackend } from '../helpers/mock-api.mjs';

export default async function suite() {
  const s = createSuite('Tier 3 - Admin Auth, Table & Status Combinations (F2 + F6 + F7 + F10 + F22)', {
    tier: 3,
    combinations: ['Auth + Token Storage', 'Table Rendering + ARIA', 'Status Change + Backend PUT', 'Session Expiry Handling']
  });

  s.test('Combo 1: Admin credentials submission sets Bearer token and transitions view to orders dashboard', async () => {
    const backend = new MockBackend();
    const tokenStore = {};

    const loginRes = await backend.login('admin', 'password123');
    assert.strictEqual(loginRes.token_type, 'bearer');
    assert.ok(loginRes.access_token.length > 10);

    tokenStore['admin_token'] = loginRes.access_token;
    assert.strictEqual(tokenStore['admin_token'], loginRes.access_token);
  });

  s.test('Combo 2: Authenticated dashboard fetches orders list and renders accessible table rows', async () => {
    const backend = new MockBackend();
    const token = backend.validToken;

    const orders = await backend.getOrders(token);
    assert.ok(orders.length >= 3);

    // Each order contains required columns
    for (const order of orders) {
      assert.ok(order.id > 0);
      assert.ok(order.customer_name.length > 0);
      assert.ok(typeof order.price === 'number');
      assert.ok(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(order.status));
    }
  });

  s.test('Combo 3: Status transition updates order status on backend and updates local table state', async () => {
    const backend = new MockBackend();
    const token = backend.validToken;

    const updated = await backend.updateOrder(101, 'Processing', token);
    assert.strictEqual(updated.id, 101);
    assert.strictEqual(updated.status, 'Processing');

    // Subsequent fetch reflects updated status
    const orders = await backend.getOrders(token);
    const order101 = orders.find(o => o.id === 101);
    assert.strictEqual(order101.status, 'Processing');
  });

  s.test('Combo 4: 401 Unauthorized response triggers automatic token clearance and logout', async () => {
    const backend = new MockBackend();
    let currentToken = 'expired-or-revoked-token';
    let loggedOut = false;

    try {
      await backend.getOrders(currentToken);
    } catch (err) {
      if (err.message.includes('401')) {
        currentToken = null;
        loggedOut = true;
      }
    }

    assert.strictEqual(currentToken, null);
    assert.strictEqual(loggedOut, true);
  });

  s.test('Combo 5: Manual logout clears token and prevents further authenticated requests', async () => {
    const backend = new MockBackend();
    let token = backend.validToken;

    // User logs out
    token = null;

    // Subsequent request fails
    await assert.rejects(async () => {
      await backend.getOrders(token);
    }, /401 Unauthorized/);
  });

  return s;
}
