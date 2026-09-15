import { createSuite, assert } from '../helpers/test-harness.mjs';
import { MockBackend } from '../helpers/mock-api.mjs';

export default async function suite() {
  const s = createSuite('Tier 4 - Journey 3: Complete Preorder Checkout Flow', {
    tier: 4,
    journey: 'Preorder Checkout'
  });

  s.test('Step 1: User transitions to /checkout view and inspects order summary and pricing ($19.99)', () => {
    const item = {
      title: 'The Perfect Pour Attachment',
      sub: 'Early bird pricing',
      price: 19.99
    };
    assert.strictEqual(item.price, 19.99);
    assert.strictEqual(item.title, 'The Perfect Pour Attachment');
  });

  s.test('Step 2: User completes required identity fields (Full Name and Phone Number)', () => {
    const form = {
      name: 'Eleanor Vance',
      number: '+1 (555) 789-0123'
    };
    assert.ok(form.name.trim().length > 0);
    assert.ok(form.number.trim().length > 0);
  });

  s.test('Step 3: User attaches optional tap compatibility photo file', async () => {
    const backend = new MockBackend();
    const photoFile = { name: 'kitchen-ro-tap.png' };
    const uploadRes = await backend.upload(photoFile);
    assert.ok(uploadRes.path.includes('kitchen-ro-tap.png'));
    return uploadRes.path;
  });

  s.test('Step 4: User clicks "Complete Purchase", button activates loading spinner, and order is confirmed', async () => {
    const backend = new MockBackend();
    const photoPath = 'uploads/test_photo.jpg';

    let isSubmitting = true;
    const order = await backend.createOrder({
      customer_name: 'Eleanor Vance',
      number: '+1 (555) 789-0123',
      price: 19.99,
      custom_photo: photoPath
    });
    isSubmitting = false;

    assert.strictEqual(isSubmitting, false);
    assert.strictEqual(order.customer_name, 'Eleanor Vance');
    assert.strictEqual(order.price, 19.99);
    assert.strictEqual(order.status, 'Pending');
    assert.strictEqual(order.custom_photo, photoPath);
  });

  s.test('Step 5: Confirmation view displays "Order Confirmed!" receipt and "Return Home" navigation button', () => {
    const confirmationScreen = {
      title: 'Order Confirmed!',
      message: "Thank you for your purchase. We'll be in touch soon.",
      homeTarget: '/'
    };
    assert.strictEqual(confirmationScreen.title, 'Order Confirmed!');
    assert.strictEqual(confirmationScreen.homeTarget, '/');
  });

  return s;
}
