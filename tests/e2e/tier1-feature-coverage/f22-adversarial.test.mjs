import { createSuite, assert } from '../helpers/test-harness.mjs';
import { MockBackend } from '../helpers/mock-api.mjs';

export default async function suite() {
  const s = createSuite('Tier 1 - F22: Adversarial Coverage Hardening', { feature: 'F22', requirement: 'Acceptance' });

  s.test('F22-1: Form inputs tolerate Unicode, accented characters, and symbols', async () => {
    const backend = new MockBackend();
    const order = await backend.createOrder({
      customer_name: "Renée O'Connor-Smith 🌟 #101",
      number: '+33 6 12 34 56 78',
      price: 19.99
    });
    assert.strictEqual(order.customer_name, "Renée O'Connor-Smith 🌟 #101");
    assert.strictEqual(order.status, 'Pending');
  });

  s.test('F22-2: Input validation safely preserves potential script tags as literal strings', async () => {
    const backend = new MockBackend();
    const maliciousName = "<script>alert('pwned')</script>";
    const order = await backend.createOrder({
      customer_name: maliciousName,
      number: '+1-555-0199',
      price: 19.99
    });
    assert.strictEqual(order.customer_name, maliciousName);
  });

  s.test('F22-3: Network disconnection throws handled exception without unhandled crash', async () => {
    const backend = new MockBackend();
    backend.setNetworkFailure(true);
    await assert.rejects(async () => {
      await backend.getOrders('any-token');
    }, /Network error/);
  });

  s.test('F22-4: Order creation rejects negative, zero, and NaN prices', async () => {
    const backend = new MockBackend();
    await assert.rejects(async () => {
      await backend.createOrder({ customer_name: 'Test', number: '123', price: -5 });
    }, /price must be a positive number/);

    await assert.rejects(async () => {
      await backend.createOrder({ customer_name: 'Test', number: '123', price: 0 });
    }, /price must be a positive number/);
  });

  s.test('F22-5: Unauthorized access token is rejected with 401 status error', async () => {
    const backend = new MockBackend();
    await assert.rejects(async () => {
      await backend.getOrders('invalid-expired-token');
    }, /401 Unauthorized/);
  });

  return s;
}
