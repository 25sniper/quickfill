# Handoff Report: WCAG AA Color Contrast (F4), Typography Hierarchy (F5), and Loading Spinners (F6)

**Agent**: `explorer_m1_3` (Explorer M1-3)  
**Date**: 2026-09-10T15:12:00Z  
**Milestone**: Milestone 1 (Design System, Theme Tokens & Accessibility Primitives)  
**Project Root**: `a:\downloads\presser`  
**Working Directory**: `a:\downloads\presser\.agents\explorer_m1_3`  
**Reference Plan**: `a:\downloads\presser\PROJECT.md`  

---

## 1. Observation

### 1.1 WCAG AA Color Contrast Failures (Text & UI Boundaries)
Direct code analysis of `App.tsx`, `Checkout.tsx`, and `AdminDashboard.tsx` reveals multiple text and UI boundary elements failing WCAG 2.1 Level AA contrast standards:

1. **`App.tsx:101`**:
   ```tsx
   <span className="text-2xl font-bold text-neutral-600">{item.step}</span>
   ```
   - Surrounding Background: `bg-neutral-950` (`#0a0a0a`) / `bg-black` (`#000000`).
   - Current Foreground: `text-neutral-600` (`#525252`).
   - Contrast Ratio: **2.54:1** on `#0a0a0a` (2.70:1 on `#000000`).
   - WCAG Threshold: Requires >= 4.5:1 (or >= 3.0:1 for large text). **Fails both**.

2. **`App.tsx:110`**:
   ```tsx
   <div className="w-12 h-12 rounded-full border border-neutral-600 flex items-center justify-center group-hover:border-white transition-colors">
   ```
   - Surrounding Background: `bg-neutral-950` (`#0a0a0a`).
   - Current Border: `border-neutral-600` (`#525252`).
   - Contrast Ratio: **2.54:1**.
   - WCAG Threshold: Requires >= 3.0:1 (SC 1.4.11 Non-text Contrast). **Fails**.

3. **`App.tsx:138`**:
   ```tsx
   <p className="text-sm text-neutral-500">Ships worldwide starting next month.</p>
   ```
   - Surrounding Background: `bg-neutral-950` (`#0a0a0a`).
   - Current Foreground: `text-neutral-500` (`#737373`).
   - Contrast Ratio: **4.28:1**.
   - WCAG Threshold: Requires >= 4.5:1 for normal body text (SC 1.4.3). **Fails**.

4. **`Checkout.tsx:125`**:
   ```tsx
   <p className="text-xs text-neutral-500 mt-2">Upload a photo of your tap if you want us to verify compatibility.</p>
   ```
   - Surrounding Background: Card container `bg-neutral-900` (`#171717`).
   - Current Foreground: `text-neutral-500` (`#737373`).
   - Contrast Ratio: **3.89:1**.
   - WCAG Threshold: Requires >= 4.5:1 for small text (SC 1.4.3). **Fails**.

5. **`AdminDashboard.tsx:162`**:
   ```tsx
   <td colSpan={7} className="p-8 text-center text-neutral-500">
     No orders found.
   </td>
   ```
   - Surrounding Background: Table container `bg-neutral-900` (`#171717`).
   - Current Foreground: `text-neutral-500` (`#737373`).
   - Contrast Ratio: **3.89:1**.
   - WCAG Threshold: Requires >= 4.5:1 (SC 1.4.3). **Fails**.

6. **`AdminDashboard.tsx:200`**:
   ```tsx
   <span className="text-neutral-600 text-sm">None</span>
   ```
   - Surrounding Background: Table row `bg-neutral-900` (`#171717`), hover `hover:bg-neutral-800/50` (~`#1f1f1f`).
   - Current Foreground: `text-neutral-600` (`#525252`).
   - Contrast Ratio: **2.31:1** on `#171717` (**1.98:1** on hover).
   - WCAG Threshold: Requires >= 4.5:1 (SC 1.4.3). **Fails**.

7. **Form Input Borders (`#262626`)**:
   - `Checkout.tsx:101`: Name input `border-neutral-800` (`#262626`)
   - `Checkout.tsx:113`: Phone input `border-neutral-800` (`#262626`)
   - `Checkout.tsx:123`: Photo file input `border-neutral-800` (`#262626`)
   - `AdminDashboard.tsx:93`: Username input `border-neutral-800` (`#262626`)
   - `AdminDashboard.tsx:103`: Password input `border-neutral-800` (`#262626`)
   - `AdminDashboard.tsx:180`: Status select `border-neutral-700` (`#404040`)
   - Surrounding Backgrounds: Container `bg-neutral-900` (`#171717`), input fill `bg-neutral-950` (`#0a0a0a`).
   - Current Contrast Ratios for `#262626`:
     - Against `#171717`: **1.18:1**
     - Against `#0a0a0a`: **1.30:1**
   - Current Contrast Ratio for `#404040` (`border-neutral-700` on `<select>`):
     - Against `#171717`: **1.63:1**
   - WCAG Threshold: Requires >= 3.0:1 (SC 1.4.11 Non-text Contrast). **Fails**.

---

### 1.2 Typography Hierarchy Inconsistencies
Current heading scales across the three primary views exhibit fragmentation and semantic hierarchy violations:

1. **`App.tsx`**:
   - Line 49: `<motion.h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-br from-white to-neutral-500 ...">` (Hero H1)
   - Line 71: `<h2 className="text-4xl md:text-5xl font-bold">Loved by thousands</h2>` (Section 2 H2)
   - Line 93: `<h2 className="text-4xl md:text-5xl font-bold">How it works</h2>` (Section 3 H2)
   - Line 103: `<h3 className="text-xl font-bold">{item.title}</h3>` (Section 3 Subhead H3)
   - Line 122: `<h2 className="text-5xl md:text-7xl font-bold relative z-50">Ready to upgrade?</h2>` (Section 4 H2)
   - **Inconsistency**: Section 4 H2 jumps to `text-5xl md:text-7xl`, 50% larger than preceding Section 2 & 3 H2s (`text-4xl md:text-5xl`), breaking structural visual rhythm.

2. **`Checkout.tsx`**:
   - Line 47: `<h2 className="text-3xl font-bold">Order Confirmed!</h2>`
     - **Violation**: Rendered as an `<h2>` when there is **no `<h1>`** on the confirmation view. Violates WCAG 1.3.1 (headings must start at `<h1>`).
   - Line 76: `<h1 className="text-2xl font-bold">Checkout</h1>`
     - **Inconsistency**: Form title is styled at `text-2xl` (24px), which is smaller than the confirmation `<h2>` (`text-3xl`) and disproportionately small compared to the app's overall scale.
   - Line 81: `<p className="font-bold">The Perfect Pour Attachment</p>`
     - Unsemantic line item subhead.

3. **`AdminDashboard.tsx`**:
   - Line 83: `<h1 className="text-2xl font-bold text-center">Admin Login</h1>` (H1 at `text-2xl`)
   - Line 124: `<h1 className="text-2xl font-bold">Orders Dashboard</h1>` (H1 at `text-2xl`)
   - Missing semantic section subhead or table caption.

---

### 1.3 Loading Spinner Deficiencies
Four critical user journeys lack visual and accessible loading indicators:

1. **`App.tsx:34` (3D Scene Suspense Fallback)**:
   ```tsx
   <Suspense fallback={null}>
     <ProductScene />
   </Suspense>
   ```
   - Zero feedback while 3D WebGL assets (`pwh.glb`, `tab-v1.glb`, Three.js shaders) download and compile. The screen appears blank or unpopulated.

2. **`AdminDashboard.tsx:160` (Orders Table Initial Fetch)**:
   ```tsx
   <tbody className="divide-y divide-neutral-800">
     {orders.length === 0 ? (
       <tr>
         <td colSpan={7} className="p-8 text-center text-neutral-500">
           No orders found.
         </td>
       </tr>
     ) : ...
   ```
   - `orders` is initialized as `[]`. While `fetchOrders()` is in flight (`loading === true`), the table flashes `"No orders found."`, creating a false-negative empty state.

3. **`AdminDashboard.tsx:68` (Order Status Update)**:
   ```tsx
   const handleStatusChange = async (orderId: number, newStatus: string) => {
     if (!token) return
     try {
       await updateOrder(orderId, newStatus, token)
       setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
     ...
   ```
   - No row-level `loading` or updating indicator exists. The `<select>` dropdown remains interactive; multiple rapid clicks can trigger race conditions; zero spinner feedback is displayed.

4. **`Checkout.tsx:131` (Preorder Submission & Photo Upload)**:
   ```tsx
   <button 
     type="submit" 
     disabled={loading}
     className="w-full bg-white text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
   >
     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Purchase'}
   </button>
   ```
   - When `loading === true`, the text disappears leaving only the bare icon `<Loader2>`. Assistive tech encounters an unlabeled button.
   - The submission does two discrete async tasks (`uploadFile` followed by `createOrder`). Large camera photos (5-15MB) upload with no progress feedback.

---

## 2. Logic Chain

```
Observation 1.1: Relative luminance formulas under WCAG 2.1:
  L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
  Contrast ratio = (L_lighter + 0.05) / (L_darker + 0.05)
  - Surface luminance: #000000 = 0.000, #0a0a0a = 0.0030, #171717 = 0.0084, #262626 = 0.0191
  - Foreground luminance: #525252 (neutral-600) = 0.0848, #737373 (neutral-500) = 0.1772
  ├─> #525252 on #0a0a0a = 0.1348 / 0.0530 = 2.54:1 (FAILS >= 4.5:1)
  ├─> #737373 on #171717 = 0.2272 / 0.0584 = 3.89:1 (FAILS >= 4.5:1)
  ├─> Border #262626 on #171717 = 0.0691 / 0.0584 = 1.18:1 (FAILS >= 3.0:1)
  └─> Implication:
      1. Minimum luminance for 4.5:1 on #171717 is L >= 0.2130 (Hex >= #808080).
         `neutral-400` (#a3a3a3, L = 0.3667) provides 7.13:1 on #171717 and 7.86:1 on #0a0a0a (PASSES AA & AAA).
      2. Minimum luminance for 3.0:1 on #171717 is L >= 0.1253 (Hex >= #646464).
         `neutral-500` (#737373, L = 0.1772) provides 3.89:1 on #171717 and 4.28:1 on #0a0a0a (PASSES AA non-text 3:1).

Observation 1.2: Heading scale disparities (App H2 jumps to 7xl; Checkout H1 is 2xl; Confirmed is H2 without H1).
  ├─> Implication: Breaches visual hierarchy and WCAG 1.3.1 (Info and Relationships).
  └─> Remedy: Standardize across 3 explicit tiers:
      - Display Hero H1: text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight
      - View / Standalone H1: text-3xl sm:text-4xl font-bold tracking-tight
      - Section H2: text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight
      - Subhead H3: text-xl font-semibold/bold tracking-tight

Observation 1.3: Four missing/deficient loading state injection points.
  ├─> App.tsx:34: Suspense fallback={null} causes blank 3D canvas pop-in.
  │   └─> Inject accessible <ProductSceneFallback /> with role="status" and sr-only live announcement.
  ├─> AdminDashboard.tsx:160: Initial fetch renders "No orders found." while loading is true.
  │   └─> Condition on `loading && orders.length === 0` to render dedicated table skeleton/spinner.
  ├─> AdminDashboard.tsx:68: Status change is unmonitored and dropdown is unlocked.
  │   └─> Add `updatingOrderId` state; disable select; show inline Loader2 spinner next to select.
  └─> Checkout.tsx:131: Button drops label on loading; photo upload has zero contextual progress.
      └─> Add `loadingPhase` ('uploading' | 'submitting'); retain button text with aria-busy="true"; show inline file upload spinner.
```

---

## 3. Caveats

1. **Design System Token Coordination**: This report provides direct Tailwind utility classes (`text-neutral-400`, `border-neutral-500`, etc.) that are 100% compliant immediately. As Explorer M1-1 defines CSS variables in `src/index.css` (e.g. `--color-text-muted`, `--color-border-input`), those semantic variables map directly onto these verified hex thresholds.
2. **Reusable UI Primitives (M1-2)**: When `Button`, `Input`, `Spinner`, and `Card` primitives are created, the input borders and button loading states specified below will be encapsulated directly inside those components.
3. **Async Network Latency**: In production or tests with mock delays, loaders will render cleanly without layout shift. Skeletons and spinners must preserve container dimensions.

---

## 4. Conclusion & Implementation Blueprints

### 4.1 WCAG AA Color Contrast Remediation Matrix

| File & Line | Element Description | Current Class / Hex | Current Contrast | Replacement Class / Hex | New Contrast Ratio | Standard Met |
|---|---|---|---|---|---|---|
| `App.tsx:101` | Tutorial step number ("01", "02", "03") | `text-neutral-600` (`#525252`) | 2.54:1 (on `#0a0a0a`) | `text-neutral-400` (`#a3a3a3`) | **7.86:1** | WCAG AA & AAA |
| `App.tsx:110` | Tutorial button icon circular border | `border-neutral-600` (`#525252`) | 2.54:1 (on `#0a0a0a`) | `border-neutral-400` (`#a3a3a3`) | **7.86:1** | WCAG AA (Non-text) |
| `App.tsx:138` | Preorder shipping notice text | `text-neutral-500` (`#737373`) | 4.28:1 (on `#0a0a0a`) | `text-neutral-400` (`#a3a3a3`) | **7.86:1** | WCAG AA & AAA |
| `Checkout.tsx:125` | Tap photo upload helper text | `text-neutral-500` (`#737373`) | 3.89:1 (on `#171717`) | `text-neutral-400` (`#a3a3a3`) | **7.13:1** | WCAG AA & AAA |
| `AdminDashboard.tsx:162` | Table empty state ("No orders found.") | `text-neutral-500` (`#737373`) | 3.89:1 (on `#171717`) | `text-neutral-400` (`#a3a3a3`) | **7.13:1** | WCAG AA & AAA |
| `AdminDashboard.tsx:200` | Custom photo column fallback ("None") | `text-neutral-600` (`#525252`) | 2.31:1 (on `#171717`) | `text-neutral-400` (`#a3a3a3`) | **7.13:1** | WCAG AA & AAA |
| `Checkout.tsx:101,113,123` | Form text and file input borders | `border-neutral-800` (`#262626`) | 1.18:1 (on `#171717`) | `border-neutral-500` (`#737373`) | **3.89:1** | WCAG AA (Non-text >=3:1) |
| `AdminDashboard.tsx:93,103` | Admin login form input borders | `border-neutral-800` (`#262626`) | 1.18:1 (on `#171717`) | `border-neutral-500` (`#737373`) | **3.89:1** | WCAG AA (Non-text >=3:1) |
| `AdminDashboard.tsx:180` | Status dropdown `<select>` border | `border-neutral-700` (`#404040`) | 1.63:1 (on `#171717`) | `border-neutral-500` (`#737373`) | **3.89:1** | WCAG AA (Non-text >=3:1) |

---

### 4.2 Standardized Typography Scale Specification

| Hierarchy Tier | Target Semantic Tag | Standardized Tailwind Classes | Usages in Codebase |
|---|---|---|---|
| **Display Hero H1** | `<h1>` / `<motion.h1>` | `text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none` | `App.tsx:49` ("The Perfect Pour.") |
| **View Page H1** | `<h1>` | `text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight` | `Checkout.tsx:76` ("Checkout")<br>`Checkout.tsx:47` (Converted from `h2` -> `h1`)<br>`AdminDashboard.tsx:83` ("Admin Login")<br>`AdminDashboard.tsx:124` ("Orders Dashboard") |
| **Section H2** | `<h2>` | `text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight` | `App.tsx:71` ("Loved by thousands")<br>`App.tsx:93` ("How it works")<br>`App.tsx:122` (Standardized from `7xl` -> `4xl md:text-5xl`) |
| **Subhead H3** | `<h3>` | `text-xl font-semibold sm:font-bold text-white tracking-tight leading-snug` | `App.tsx:103` (Steps: "Attach", "Lock", "Fill")<br>`Checkout.tsx:81` (Promoted `<p>` -> `<h3>`) |
| **Body Large** | `<p>` / `<motion.p>` | `text-lg sm:text-xl text-neutral-300 md:text-2xl leading-relaxed` | `App.tsx:59` (Hero subtitle)<br>`App.tsx:123` (Preorder subtitle) |
| **Body Regular** | `<p>` | `text-base text-neutral-300 leading-normal` | `App.tsx:82` (Testimonials)<br>`App.tsx:104` (Step descriptions)<br>`Checkout.tsx:48` (Confirmation message) |
| **Caption / Fine** | `<p>` / `<span>` | `text-sm text-neutral-400 leading-normal` | `App.tsx:138` (Shipping note)<br>`Checkout.tsx:125` (Photo helper)<br>`AdminDashboard.tsx:125` (Subtitle) |

---

### 4.3 Loading Spinner Injection Blueprints

#### Injection Point 1: 3D Scene Suspense Fallback (`App.tsx:34`)
- **Target File**: `src/App.tsx:34` and `src/components/scene/ProductSceneFallback.tsx`
- **Before (`App.tsx:34`)**:
  ```tsx
  <Suspense fallback={null}>
    <ProductScene />
  </Suspense>
  ```
- **After (`App.tsx:34`)**:
  ```tsx
  <Suspense fallback={<ProductSceneFallback />}>
    <ProductScene />
  </Suspense>
  ```
- **Component Blueprint (`src/components/scene/ProductSceneFallback.tsx`)**:
  ```tsx
  import React from 'react'
  import { Loader2 } from 'lucide-react'

  export const ProductSceneFallback: React.FC = () => {
    return (
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40"
        role="status"
        aria-live="polite"
      >
        <div className="bg-neutral-900/90 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-neutral-700/80 shadow-2xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-white animate-spin" aria-hidden="true" />
          <span className="text-sm font-medium text-neutral-200">
            Loading 3D experience...
          </span>
        </div>
        <span className="sr-only">Interactive 3D model is loading, please wait</span>
      </div>
    )
  }
  ```

#### Injection Point 2: Admin Orders Table Initial Fetch Loader (`AdminDashboard.tsx:160`)
- **Target File**: `src/AdminDashboard.tsx:160`
- **Before (`AdminDashboard.tsx:160-165`)**:
  ```tsx
  <tbody className="divide-y divide-neutral-800">
    {orders.length === 0 ? (
      <tr>
        <td colSpan={7} className="p-8 text-center text-neutral-500">
          No orders found.
        </td>
      </tr>
    ) : (
  ```
- **After (`AdminDashboard.tsx:160-176`)**:
  ```tsx
  <tbody className="divide-y divide-neutral-800">
    {loading && orders.length === 0 ? (
      <tr>
        <td colSpan={7} className="p-16 text-center">
          <div 
            className="flex flex-col items-center justify-center gap-3"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="w-8 h-8 animate-spin text-white" aria-hidden="true" />
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
  ```

#### Injection Point 3: Admin Order Status Update Loader (`AdminDashboard.tsx:68`)
- **Target File**: `src/AdminDashboard.tsx:18, 68-77, 176-189`
- **State Addition**:
  ```tsx
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  ```
- **Handler Replacement (`AdminDashboard.tsx:68-77`)**:
  ```tsx
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
  ```
- **Table Cell Replacement (`AdminDashboard.tsx:176-189`)**:
  ```tsx
  <td className="p-4">
    <div className="flex items-center gap-2">
      <select
        value={order.status}
        disabled={updatingOrderId === order.id}
        onChange={(e) => handleStatusChange(order.id, e.target.value)}
        aria-label={`Change status for order #${order.id}`}
        className="bg-neutral-950 border border-neutral-500 rounded px-2 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="Pending">Pending</option>
        <option value="Processing">Processing</option>
        <option value="Shipped">Shipped</option>
        <option value="Delivered">Delivered</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      {updatingOrderId === order.id && (
        <span role="status" aria-label="Updating status" className="inline-flex items-center">
          <Loader2 className="w-4 h-4 animate-spin text-neutral-300" aria-hidden="true" />
          <span className="sr-only">Updating order #{order.id} status...</span>
        </span>
      )}
    </div>
  </td>
  ```

#### Injection Point 4: Checkout Preorder Submission & Photo Upload Loader (`Checkout.tsx:131`)
- **Target File**: `src/Checkout.tsx:10, 14-40, 118-135`
- **State Addition**:
  ```tsx
  const [loadingPhase, setLoadingPhase] = useState<'idle' | 'uploading' | 'submitting'>('idle')
  ```
- **Handler Replacement (`Checkout.tsx:14-40`)**:
  ```tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let custom_photo_path = undefined
      if (photo) {
        setLoadingPhase('uploading')
        const uploadRes = await uploadFile(photo)
        custom_photo_path = uploadRes.path
      }

      setLoadingPhase('submitting')
      await createOrder({
        customer_name: name,
        number: number,
        price: 19.99,
        custom_photo: custom_photo_path
      })

      setSuccess(true)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setLoadingPhase('idle')
    }
  }
  ```
- **Submit Button Replacement (`Checkout.tsx:128-135`)**:
  ```tsx
  <button 
    type="submit" 
    disabled={loading}
    aria-busy={loading}
    className="w-full bg-white text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
  >
    {loading ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
        <span>
          {loadingPhase === 'uploading' ? 'Uploading Photo...' : 'Completing Purchase...'}
        </span>
        <span className="sr-only">
          {loadingPhase === 'uploading' ? 'Uploading tap photo, please wait' : 'Submitting order, please wait'}
        </span>
      </>
    ) : (
      'Complete Purchase'
    )}
  </button>
  ```
- **Photo Upload Context Indicator (`Checkout.tsx:124-126`)**:
  ```tsx
  {loadingPhase === 'uploading' && (
    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-300" role="status">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" aria-hidden="true" />
      <span>Uploading photo attachment...</span>
    </div>
  )}
  <p className="text-xs text-neutral-400 mt-2">
    Upload a photo of your tap if you want us to verify compatibility.
  </p>
  ```

---

## 5. Verification Method

To independently verify all findings and validate worker implementations:

1. **Verify WCAG Contrast Ratios**:
   - Calculate relative luminance:
     $$L = 0.2126 R_{lin} + 0.7152 G_{lin} + 0.0722 B_{lin}$$
   - Contrast calculation:
     $$\text{Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05}$$
   - Verify `#a3a3a3` on `#0a0a0a` = **7.86:1** (exceeds 4.5:1).
   - Verify `#a3a3a3` on `#171717` = **7.13:1** (exceeds 4.5:1).
   - Verify `#737373` on `#171717` = **3.89:1** (exceeds 3.0:1 UI boundary).
   - Verify `#737373` on `#0a0a0a` = **4.28:1** (exceeds 3.0:1 UI boundary).

2. **Verify Typography Consistency**:
   - Inspect `src/App.tsx`: Confirm Section 4 H2 (`Ready to upgrade?`) matches Section 2 & 3 H2 styling (`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight`).
   - Inspect `src/Checkout.tsx:47`: Confirm Order Confirmed heading uses `<h1>` with `text-3xl sm:text-4xl font-bold`.
   - Inspect `src/Checkout.tsx:76`: Confirm Checkout heading uses `text-3xl sm:text-4xl font-bold`.
   - Inspect `src/AdminDashboard.tsx:83,124`: Confirm Login and Dashboard headings use `text-3xl font-bold`.

3. **Verify Loading Spinners**:
   - Inspect `src/App.tsx:34`: Confirm `fallback={<ProductSceneFallback />}` replaces `fallback={null}`.
   - Inspect `src/AdminDashboard.tsx:160`: Confirm `loading && orders.length === 0` renders `<Loader2>` spinner with `role="status"` and does NOT render "No orders found." during fetch.
   - Inspect `src/AdminDashboard.tsx:176`: Confirm `updatingOrderId === order.id` disables `<select>` and renders inline `<Loader2>` spinner.
   - Inspect `src/Checkout.tsx:128`: Confirm submit button maintains visible text and `aria-busy={loading}` with phased upload status.

4. **Invalidation Conditions**:
   - Any foreground text color darker than `#797979` on `#0a0a0a` or darker than `#808080` on `#171717` invalidates the WCAG AA 4.5:1 requirement.
   - Any form input border darker than `#646464` on `#171717` invalidates the WCAG AA 3.0:1 non-text contrast requirement.
   - Any route missing an `<h1>` element invalidates the semantic document outline requirement.
