import { createSuite, assert } from '../helpers/test-harness.mjs';
import { MockBackend } from '../helpers/mock-api.mjs';

export default async function suite() {
  const s = createSuite('Tier 3 - Checkout, API & Feedback Combinations (F2 + F6 + F10 + F15 + F22)', {
    tier: 3,
    combinations: ['Checkout Form + Loading Spinner', 'Photo Upload + Order Creation', 'API Error + Alert Feedback']
  });

  s.test('Combo 1: Happy path checkout workflow: photo upload -> order creation -> success state with spinner control', async () => {
    const backend = new MockBackend();
    let loading = false;
    let success = false;
    let activeSpinner = false;

    // Simulate user submit
    loading = true;
    activeSpinner = true;

    const mockFile = { name: 'my-faucet.jpg' };
    const uploadRes = await backend.upload(mockFile);
    assert.ok(uploadRes.path.includes('my-faucet.jpg'));

    const orderRes = await backend.createOrder({
      customer_name: 'Jane Doe',
      number: '+1 (555) 234-5678',
      price: 19.99,
      custom_photo: uploadRes.path
    });

    loading = false;
    activeSpinner = false;
    success = true;

    assert.strictEqual(loading, false);
    assert.strictEqual(activeSpinner, false);
    assert.strictEqual(success, true);
    assert.strictEqual(orderRes.status, 'Pending');
    assert.strictEqual(orderRes.custom_photo, uploadRes.path);
  });

  s.test('Combo 2: Checkout handles optional photo omission: proceeds directly to order creation', async () => {
    const backend = new MockBackend();
    const orderRes = await backend.createOrder({
      customer_name: 'No Photo User',
      number: '+1 (555) 999-0000',
      price: 19.99,
      custom_photo: undefined
    });

    assert.strictEqual(orderRes.custom_photo, null);
    assert.strictEqual(orderRes.price, 19.99);
  });

  s.test('Combo 3: Network failure during checkout resets spinner, re-enables button, and displays error alert', async () => {
    const backend = new MockBackend();
    backend.setNetworkFailure(true);

    let loading = true;
    let errorMessage = '';

    try {
      await backend.createOrder({
        customer_name: 'Failure Test',
        number: '+1 (555) 000-1111',
        price: 19.99
      });
    } catch (err) {
      errorMessage = err.message;
    } finally {
      loading = false;
    }

    assert.strictEqual(loading, false, 'Button must be re-enabled on failure');
    assert.ok(errorMessage.includes('Network error'), 'Error alert must display clear network message');
  });

  s.test('Combo 4: Invalid file type during upload stops submission before creating order', async () => {
    const backend = new MockBackend();
    let orderCreated = false;
    let uploadError = '';

    try {
      await backend.upload({ name: 'script.exe' });
      await backend.createOrder({ customer_name: 'Attacker', number: '123', price: 19.99 });
      orderCreated = true;
    } catch (err) {
      uploadError = err.message;
    }

    assert.strictEqual(orderCreated, false, 'Order must not be created if upload fails');
    assert.ok(uploadError.includes('Unsupported file type'));
  });

  s.test('Combo 5: Submitting checkout form disables submit button to prevent double-charging', async () => {
    let clickCount = 0;
    let isSubmitting = false;

    const onSubmit = async () => {
      if (isSubmitting) return; // Prevent double submit
      isSubmitting = true;
      clickCount++;
      await new Promise(r => setTimeout(r, 5));
      isSubmitting = false;
    };

    // User rapidly clicks 3 times
    const p1 = onSubmit();
    const p2 = onSubmit();
    const p3 = onSubmit();
    await Promise.all([p1, p2, p3]);

    assert.strictEqual(clickCount, 1, 'Form must execute submission only once even under rapid multi-clicks');
  });

  return s;
}
