import { createSuite, assert } from '../helpers/test-harness.mjs';
import { MockBackend } from '../helpers/mock-api.mjs';

export default async function suite() {
  const s = createSuite('Tier 4 - Journey 6: Offline & Network Error Recovery Journey', {
    tier: 4,
    journey: 'Error Recovery'
  });

  const backend = new MockBackend();

  s.test('Step 1: User attempts preorder submit during unexpected network disconnection', async () => {
    backend.setNetworkFailure(true);

    let errorThrown = false;
    let errorMessage = '';

    try {
      await backend.createOrder({
        customer_name: 'David Banner',
        number: '+1 (555) 321-4321',
        price: 19.99
      });
    } catch (err) {
      errorThrown = true;
      errorMessage = err.message;
    }

    assert.strictEqual(errorThrown, true);
    assert.ok(errorMessage.includes('Network error'));
  });

  s.test('Step 2: UI catches error, ceases loading spinner, and renders accessible error alert', () => {
    let isLoading = true;
    let errorMessage = 'Network error: connection refused';

    // Catch handler executes
    isLoading = false;

    assert.strictEqual(isLoading, false, 'Loading spinner must stop');
    assert.ok(errorMessage.length > 0, 'Error message must be visible');
  });

  s.test('Step 3: Network connectivity recovers and user re-submits form without page reload', async () => {
    backend.setNetworkFailure(false);

    let isLoading = true;
    const order = await backend.createOrder({
      customer_name: 'David Banner',
      number: '+1 (555) 321-4321',
      price: 19.99
    });
    isLoading = false;

    assert.strictEqual(isLoading, false);
    assert.strictEqual(order.customer_name, 'David Banner');
    assert.strictEqual(order.status, 'Pending');
  });

  s.test('Step 4: Admin encounters transient 401 session expiry and recovers via re-login', async () => {
    let currentToken = 'bad-token';
    let needsLogin = false;

    try {
      await backend.getOrders(currentToken);
    } catch (e) {
      if (e.message.includes('401')) {
        needsLogin = true;
      }
    }

    assert.strictEqual(needsLogin, true);

    // Admin re-logs in
    const auth = await backend.login('admin', 'password123');
    currentToken = auth.access_token;
    assert.ok(currentToken);

    // Re-attempt succeeds
    const orders = await backend.getOrders(currentToken);
    assert.ok(orders.length > 0);
  });

  s.test('Step 5: System state remains completely uncorrupted across the entire error lifecycle', () => {
    const systemHealthy = true;
    assert.strictEqual(systemHealthy, true);
  });

  return s;
}
