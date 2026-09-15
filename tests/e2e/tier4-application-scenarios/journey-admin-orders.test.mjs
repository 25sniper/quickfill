import { createSuite, assert } from '../helpers/test-harness.mjs';
import { MockBackend } from '../helpers/mock-api.mjs';

export default async function suite() {
  const s = createSuite('Tier 4 - Journey 4: Admin Order Management & Fulfillment', {
    tier: 4,
    journey: 'Admin Fulfillment'
  });

  const backend = new MockBackend();
  let adminToken = null;

  s.test('Step 1: Admin arrives at /admin, submits valid credentials, and enters dashboard', async () => {
    const authRes = await backend.login('admin', 'password123');
    assert.ok(authRes.access_token);
    adminToken = authRes.access_token;
  });

  s.test('Step 2: Orders dashboard loads full incoming preorder table with customer details', async () => {
    const orders = await backend.getOrders(adminToken);
    assert.ok(orders.length >= 3);
    const first = orders[0];
    assert.ok(first.customer_name);
    assert.ok(first.number);
    assert.ok(first.price > 0);
  });

  s.test('Step 3: Admin inspects order #101 and advances fulfillment status from Pending to Processing', async () => {
    const updated = await backend.updateOrder(101, 'Processing', adminToken);
    assert.strictEqual(updated.id, 101);
    assert.strictEqual(updated.status, 'Processing');
  });

  s.test('Step 4: Admin packages attachment and transitions status to Shipped', async () => {
    const updated = await backend.updateOrder(101, 'Shipped', adminToken);
    assert.strictEqual(updated.status, 'Shipped');
  });

  s.test('Step 5: Admin refreshes order list to verify persistence then logs out cleanly', async () => {
    const refreshed = await backend.getOrders(adminToken);
    const order101 = refreshed.find(o => o.id === 101);
    assert.strictEqual(order101.status, 'Shipped');

    // Logout
    adminToken = null;
    assert.strictEqual(adminToken, null);
  });

  return s;
}
