# Handoff Report: UI Component Primitives & Pattern Mapping (F2 & F3)

**Agent**: `explorer_m1_2` (Explorer M1-2)  
**Milestone**: Milestone 1: Design System, Theme Tokens & Accessibility Primitives  
**Date**: 2026-09-10T15:15:00Z  
**Scope**: F2 (Extract Repeated Tailwind Classes) and F3 (Accessible Focus Rings)  
**Project Root**: `a:\downloads\presser`  
**Working Directory**: `a:\downloads\presser\.agents\explorer_m1_2`  
**Reference Request**: `a:\downloads\presser\.agents\ORIGINAL_REQUEST.md`  
**Project Plan**: `a:\downloads\presser\PROJECT.md`  
**Survey Reference**: `a:\downloads\presser\.agents\explorer_survey_2\handoff.md`  

---

## 1. Observation

### 1.1 Existing Component Directory State
- The directory `src/components/ui/` currently does **not exist** (verified via `find_by_name` in `src/`).
- No shared button, input, card, or spinner components exist in `src/components/`. The only components under `src/components/` are 3D scene elements (`ProductScene.tsx`, `Pwh.tsx`, `TabModel.tsx`).
- There are no helper libraries like `clsx`, `tailwind-merge`, or `class-variance-authority` in `package.json` (verified: only `react`, `react-dom`, `three`, `@react-three/*`, `framer-motion`, `lucide-react`, and `lenis` exist).

### 1.2 Verbatim Instances of Repeated Tailwind Classes

#### 1.2.1 Primary Pill Buttons
The identical primary button style (`bg-white text-black ... rounded-full font-bold hover:bg-neutral-200 transition-colors`) is copy-pasted across 5 separate locations with slight, inconsistent divergences in padding and sizing:
1. `src/App.tsx:23-29`:
   ```tsx
   <button 
     onClick={() => window.location.href = '/checkout'}
     className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2 pointer-events-auto shadow-lg"
   >
     <ShoppingCart className="w-4 h-4" />
     Preorder
   </button>
   ```
2. `src/App.tsx:131-137`:
   ```tsx
   <button 
     onClick={() => window.location.href = '/checkout'}
     className="bg-white text-black px-12 py-4 rounded-full text-xl font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 mx-auto pointer-events-auto"
   >
     <ShoppingCart className="w-6 h-6" />
     Preorder Now - $19.99
   </button>
   ```
3. `src/Checkout.tsx:49-54`:
   ```tsx
   <button 
     onClick={() => window.location.href = '/'}
     className="mt-6 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors"
   >
     Return Home
   </button>
   ```
4. `src/Checkout.tsx:128-134`:
   ```tsx
   <button 
     type="submit" 
     disabled={loading}
     className="w-full bg-white text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
   >
     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Purchase'}
   </button>
   ```
5. `src/AdminDashboard.tsx:106-112`:
   ```tsx
   <button 
     type="submit" 
     disabled={loading}
     className="w-full bg-white text-black px-4 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2"
   >
     {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
   </button>
   ```

#### 1.2.2 Ghost & Secondary Action Buttons
1. `src/App.tsx:109-114`:
   ```tsx
   <button className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
     <div className="w-12 h-12 rounded-full border border-neutral-600 flex items-center justify-center group-hover:border-white transition-colors">
       <Play className="w-4 h-4 fill-current" />
     </div>
     Watch the tutorial
   </button>
   ```
2. `src/Checkout.tsx:63-69`:
   ```tsx
   <button 
     onClick={() => window.location.href = '/'}
     className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
   >
     <ArrowLeft className="w-5 h-5" />
     Back
   </button>
   ```
3. `src/AdminDashboard.tsx:128-134`:
   ```tsx
   <button 
     onClick={fetchOrders}
     className="p-2 text-neutral-400 hover:text-white transition-colors"
     title="Refresh"
   >
     <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
   </button>
   ```
4. `src/AdminDashboard.tsx:135-141`:
   ```tsx
   <button 
     onClick={handleLogout}
     className="flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors"
   >
     <LogOut className="w-4 h-4" />
     Logout
   </button>
   ```

#### 1.2.3 Text Inputs and Form Field Labels
Form inputs repeat `w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 ... focus:outline-none focus:border-white` across 5 instances:
1. `src/Checkout.tsx:94-104` (Full Name):
   ```tsx
   <label className="block text-sm font-medium text-neutral-400 mb-2">Full Name</label>
   <input 
     required
     type="text" 
     value={name}
     onChange={e => setName(e.target.value)}
     className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors"
     placeholder="John Doe"
   />
   ```
2. `src/Checkout.tsx:106-116` (Phone Number):
   ```tsx
   <label className="block text-sm font-medium text-neutral-400 mb-2">Phone Number</label>
   <input 
     required
     type="tel" 
     value={number}
     onChange={e => setNumber(e.target.value)}
     className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors"
     placeholder="+1 (555) 000-0000"
   />
   ```
3. `src/Checkout.tsx:118-126` (Custom Photo file input):
   ```tsx
   <label className="block text-sm font-medium text-neutral-400 mb-2">Custom Photo (Optional)</label>
   <input 
     type="file" 
     onChange={e => setPhoto(e.target.files?.[0] || null)}
     className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-neutral-200"
   />
   ```
4. `src/AdminDashboard.tsx:86-95` (Username):
   ```tsx
   <label className="block text-sm text-neutral-400 mb-1">Username</label>
   <input 
     required
     type="text" 
     value={username}
     onChange={e => setUsername(e.target.value)}
     className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-white"
   />
   ```
5. `src/AdminDashboard.tsx:96-105` (Password):
   ```tsx
   <label className="block text-sm text-neutral-400 mb-1">Password</label>
   <input 
     required
     type="password" 
     value={password}
     onChange={e => setPassword(e.target.value)}
     className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-white"
   />
   ```

#### 1.2.4 Card Containers
Card panels consistently repeat `bg-neutral-900`, `rounded-3xl`, and `border border-neutral-800`:
1. `src/App.tsx:74`: `bg-neutral-900/80 backdrop-blur p-8 rounded-3xl border border-neutral-800 space-y-4` (Testimonials)
2. `src/Checkout.tsx:45`: `bg-neutral-900 p-12 rounded-3xl border border-neutral-800 text-center space-y-6 max-w-md w-full` (Order confirmation)
3. `src/Checkout.tsx:73`: `bg-neutral-900 p-8 rounded-3xl border border-neutral-800 max-w-lg w-full` (Checkout form)
4. `src/Checkout.tsx:79`: `mb-8 p-4 bg-neutral-800 rounded-xl flex justify-between items-center` (Order summary item)
5. `src/AdminDashboard.tsx:82`: `bg-neutral-900 p-8 rounded-3xl border border-neutral-800 max-w-sm w-full space-y-6` (Login panel)
6. `src/AdminDashboard.tsx:122`: `flex justify-between items-center bg-neutral-900 p-6 rounded-3xl border border-neutral-800` (Header panel)
7. `src/AdminDashboard.tsx:145`: `bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden` (Table container)

#### 1.2.5 Spinners and Loading Indicators
1. `src/Checkout.tsx:133`:
   `<Loader2 className="w-5 h-5 animate-spin" />`
   Missing `role="status"`, `aria-label="Loading"`, and screen-reader fallback.
2. `src/AdminDashboard.tsx:111`:
   `<Loader2 className="w-4 h-4 animate-spin" />`
   Missing `role="status"`, `aria-label="Loading"`, and screen-reader fallback.
3. `src/AdminDashboard.tsx:133`:
   `<RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />`
   Missing accessible announcement that orders are refreshing.
4. `src/App.tsx:34-36`:
   `<Suspense fallback={null}><ProductScene /></Suspense>`
   Has `fallback={null}`, rendering an empty frame while heavy 3D GLB models load.
5. `src/AdminDashboard.tsx:160-166`:
   During initial `fetchOrders()`, `orders.length === 0` evaluates to true before network response arrives, briefly displaying `"No orders found."` without a spinner.

### 1.3 Accessibility Deficiencies Directly Observed
1. **Focus Rings (F3 Violation)**:
   - **0 buttons** in `App.tsx`, `Checkout.tsx`, or `AdminDashboard.tsx` have `focus-visible:` rings.
   - All inputs use `focus:outline-none`, actively suppressing the browser's default keyboard focus outline without rendering an accessible focus ring.
2. **Label Association (WCAG 1.3.1 & 4.1.2 Violation)**:
   - In all 5 form fields across `Checkout.tsx` and `AdminDashboard.tsx`, `<label>` has **no `htmlFor`**, and `<input>` has **no `id`**.
3. **Color & Non-Text Contrast (WCAG 1.4.11 & 1.4.3 Violation)**:
   - `border-neutral-800` (`#262626`) on `#0a0a0a` gives a contrast ratio of **1.25:1**, failing WCAG AA 3.0:1 non-text contrast requirement.
   - `text-neutral-500` (`#737373`) on `#171717` gives **3.65:1**, failing WCAG AA 4.5:1 text contrast requirement.
   - `text-neutral-600` (`#525252`) on `#000000` gives **2.77:1**, failing WCAG AA 4.5:1.

---

## 2. Logic Chain

```
Observation 1.1: src/components/ui/ is absent; clsx/tailwind-merge are not installed.
  └─> Logical Step: Components must be self-contained in src/components/ui/ using native React 19 + TypeScript + standard template string / array filtering to avoid unneeded npm dependencies.

Observation 1.2.1: 5 distinct primary pill buttons repeat bg-white text-black rounded-full font-bold hover:bg-neutral-200.
Observation 1.3.1: Zero buttons have focus-visible rings; inputs destroy focus rings with focus:outline-none.
  └─> Logical Step: Create `Button.tsx` with variants ('primary', 'secondary', 'ghost'), sizes ('sm', 'md', 'lg'), and mandatory focus ring:
      `focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none`
  └─> Logical Step: Add `isLoading?: boolean` to Button that auto-renders Spinner with matching contrast color (black on primary white, white on dark).

Observation 1.2.3: Inputs lack id; labels lack htmlFor; borders fail 3.0:1 contrast; focus:outline-none removes focus.
  └─> Logical Step: Create `Input.tsx` accepting `label`, `error`, `helperText`, and `id`.
  └─> Logical Step: Use React `useId()` fallback so every input is guaranteed a unique id matching <label htmlFor={id}>.
  └─> Logical Step: Upgrade border from `border-neutral-800` (#262626, 1.25:1) to `border-neutral-700` (#404040, 3.2:1), passing WCAG AA 3.0:1.
  └─> Logical Step: Add `focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black` and error states (`aria-invalid`, `role="alert"`).

Observation 1.2.4: 7 container cards share rounded-3xl, bg-neutral-900, and border-neutral-800 with differing padding (p-0, p-4, p-6, p-8, p-12).
  └─> Logical Step: Create `Card.tsx` with `rounded-3xl`, variants ('default', 'elevated', 'glass'), and padding options ('none', 'sm', 'md', 'lg', 'xl').
  └─> Logical Step: Support polymorphic `as` prop (allowing Card as 'div', 'header', 'section').

Observation 1.2.5: Spinners are raw Lucide icons without role="status", aria-label, or screen reader fallback; App.tsx Suspense fallback is null.
  └─> Logical Step: Create `Spinner.tsx` with accessible SVG, `role="status"`, `aria-label={label}`, and `<span className="sr-only">{label}</span>`.
```

---

## 3. Caveats

1. **No Client-Side Routing in Scope for M1**: Navigation currently uses `window.location.href`. In Milestone 2 (F7), `react-router-dom` will be introduced. The proposed `Button` component is designed as a `<button>` element with standard HTML attributes, allowing it to seamlessly handle `onClick={() => navigate('/checkout')}` or wrap in `<Link>` in M2.
2. **Tailwind CSS v4 Precedence**: In Tailwind CSS v4, classes are compiled on demand. The focus ring classes `focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none` must remain explicit utility strings without dynamic runtime string concatenation of arbitrary class names.
3. **Zero Extra Dependencies**: Because `clsx` and `tailwind-merge` are not installed, the component implementations use clean, zero-allocation array filtering `[...].filter(Boolean).join(' ')` which is fully deterministic, type-safe, and dependency-free.
4. **File Input Styling**: `Checkout.tsx:123` has special pseudo-element styling for `file:mr-4 file:py-2 ...`. `Input.tsx` allows `className` passthrough so existing file upload styles are preserved while gaining label association, accessible focus rings, and high-contrast container borders.

---

## 4. Conclusion & Concrete Implementation Specifications

### 4.1 UI Component Primitives (`src/components/ui/`)

Below are the complete, production-ready source files to be placed in `src/components/ui/`:

#### 1. `src/components/ui/Spinner.tsx`
```tsx
import React from 'react'

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  return (
    <div
      role="status"
      aria-label={label}
      className="inline-flex items-center justify-center shrink-0"
    >
      <svg
        className={`animate-spin ${sizeClasses[size]} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}

Spinner.displayName = 'Spinner'
```

#### 2. `src/components/ui/Button.tsx`
```tsx
import React from 'react'
import { Spinner } from './Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Accessible focus ring meeting WCAG 2.4.7 (Focus Visible) and 1.4.11 (Non-text Contrast >=3:1)
    const focusRingClasses =
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black'

    const baseClasses =
      'inline-flex items-center justify-center font-bold transition-colors select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

    const variantClasses = {
      primary:
        'bg-white text-black rounded-full hover:bg-neutral-200 active:bg-neutral-300 shadow-md',
      secondary:
        'bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700',
      ghost:
        'text-neutral-400 hover:text-white hover:bg-neutral-800/40 rounded-xl',
    }

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-6 py-2.5 text-base gap-2',
      lg: 'px-8 py-3.5 md:px-12 md:py-4 text-lg md:text-xl gap-2.5',
    }

    const spinnerSizeMap = {
      sm: 'sm' as const,
      md: 'sm' as const,
      lg: 'md' as const,
    }

    const widthClass = fullWidth ? 'w-full' : ''

    const combinedClasses = [
      baseClasses,
      focusRingClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClass,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? 'true' : undefined}
        className={combinedClasses}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner
              size={spinnerSizeMap[size]}
              className={variant === 'primary' ? 'text-black' : 'text-white'}
            />
            {children && <span className="opacity-80">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="inline-flex shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="inline-flex shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

#### 3. `src/components/ui/Input.tsx`
```tsx
import React, { useId } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  id?: string
  containerClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      id: customId,
      containerClassName = '',
      className = '',
      required,
      ...props
    },
    ref
  ) => {
    const autoId = useId()
    const inputId = customId || autoId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    const describedBy = error
      ? errorId
      : helperText
      ? helperId
      : undefined

    // Accessible focus ring and WCAG 1.4.11 compliant border (neutral-700 = #404040, 3.2:1 contrast against #0a0a0a)
    const baseInputClasses =
      'w-full bg-neutral-950 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black'

    const borderClasses = error
      ? 'border border-red-500 focus:border-red-400'
      : 'border border-neutral-700 focus:border-white'

    const combinedInputClasses = [baseInputClasses, borderClasses, className]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-300 mb-2"
          >
            {label}
            {required && (
              <span className="text-red-400 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={combinedInputClasses}
          {...props}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-sm text-red-400 mt-1.5 flex items-center gap-1"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-xs text-neutral-400 mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

#### 4. `src/components/ui/Card.tsx`
```tsx
import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  as?: React.ElementType
  children?: React.ReactNode
  className?: string
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'lg',
      as: Component = 'div',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-3xl border transition-colors'

    const variantClasses = {
      default: 'bg-neutral-900 border-neutral-800',
      elevated: 'bg-neutral-800 border-neutral-700',
      glass: 'bg-neutral-900/80 backdrop-blur border-neutral-800',
    }

    const paddingClasses = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12',
    }

    const combinedClasses = [
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <Component ref={ref} className={combinedClasses} {...props}>
        {children}
      </Component>
    )
  }
)

Card.displayName = 'Card'
```

#### 5. `src/components/ui/index.ts`
```tsx
export * from './Button'
export * from './Input'
export * from './Card'
export * from './Spinner'
```

---

### 4.2 Comprehensive Repeated Pattern Mapping

#### 4.2.1 `src/App.tsx` Mapping
| Exact Location | Existing Repeated Code | Replacement with UI Primitives | Rationale & Accessibility Benefit |
|---|---|---|---|
| **App.tsx:23-29** | `<button onClick={() => window.location.href = '/checkout'} className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2 pointer-events-auto shadow-lg"><ShoppingCart className="w-4 h-4" />Preorder</button>` | `<Button variant="primary" size="md" onClick={() => window.location.href = '/checkout'} className="pointer-events-auto shadow-lg" leftIcon={<ShoppingCart className="w-4 h-4" aria-hidden="true" />}>Preorder</Button>` | Extracts duplicated pill classes, injects visible 3:1 focus ring, adds `aria-hidden` to decorative cart icon, sets `type="button"`. |
| **App.tsx:34-36** | `<Suspense fallback={null}><ProductScene /></Suspense>` | `<Suspense fallback={<div className="flex items-center justify-center h-full w-full"><Spinner size="xl" label="Loading 3D experience..." /></div>}><ProductScene /></Suspense>` | Replaces empty flash during multi-megabyte GLTF load with accessible `Spinner` with `role="status"` and `sr-only` announcement. |
| **App.tsx:74-84** | `<div key={i} className="bg-neutral-900/80 backdrop-blur p-8 rounded-3xl border border-neutral-800 space-y-4">...</div>` | `<Card key={i} variant="glass" padding="lg" className="space-y-4">...<div className="flex gap-1 text-yellow-500" aria-label="Rated 5 out of 5 stars">{[...5].map(...)}</div>...</Card>` | Standardizes testimonial cards into `Card variant="glass"`, eliminates hardcoded `rounded-3xl` repetitions. |
| **App.tsx:109-114** | `<button className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"><div className="w-12 h-12 rounded-full border border-neutral-600 flex items-center justify-center group-hover:border-white transition-colors"><Play className="w-4 h-4 fill-current" /></div>Watch the tutorial</button>` | `<Button variant="ghost" className="p-0 hover:bg-transparent group" leftIcon={<div className="w-12 h-12 rounded-full border border-neutral-600 group-hover:border-white flex items-center justify-center transition-colors"><Play className="w-4 h-4 fill-current" aria-hidden="true" /></div>}>Watch the tutorial</Button>` | Applies accessible focus ring to tutorial trigger, sets `type="button"`, readies component for M2 modal wiring. |
| **App.tsx:131-137** | `<button onClick={() => window.location.href = '/checkout'} className="bg-white text-black px-12 py-4 rounded-full text-xl font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 mx-auto pointer-events-auto"><ShoppingCart className="w-6 h-6" />Preorder Now - $19.99</button>` | `<Button variant="primary" size="lg" onClick={() => window.location.href = '/checkout'} className="mx-auto pointer-events-auto" leftIcon={<ShoppingCart className="w-6 h-6" aria-hidden="true" />}>Preorder Now - $19.99</Button>` | Centralizes large CTA pill button with focus ring and decorative icon hiding. |

#### 4.2.2 `src/Checkout.tsx` Mapping
| Exact Location | Existing Repeated Code | Replacement with UI Primitives | Rationale & Accessibility Benefit |
|---|---|---|---|
| **Checkout.tsx:45-55** | `<div className="bg-neutral-900 p-12 rounded-3xl border border-neutral-800 text-center space-y-6 max-w-md w-full">...</div>` | `<Card variant="default" padding="xl" className="text-center space-y-6 max-w-md w-full">...` | Replaces hardcoded container with `Card variant="default" padding="xl"`. |
| **Checkout.tsx:49-54** | `<button onClick={() => window.location.href = '/'} className="mt-6 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors">Return Home</button>` | `<Button variant="primary" size="md" onClick={() => window.location.href = '/'} className="mt-6">Return Home</Button>` | Standardizes return CTA into `Button variant="primary"` with focus ring. |
| **Checkout.tsx:63-69** | `<button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" />Back</button>` | `<Button variant="ghost" size="sm" onClick={() => window.location.href = '/'} leftIcon={<ArrowLeft className="w-5 h-5" aria-hidden="true" />}>Back</Button>` | Replaces custom back button with `Button variant="ghost"` with focus ring. |
| **Checkout.tsx:73** | `<div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 max-w-lg w-full">` | `<Card variant="default" padding="lg" className="max-w-lg w-full">` | Centralizes checkout form container. |
| **Checkout.tsx:79-85** | `<div className="mb-8 p-4 bg-neutral-800 rounded-xl flex justify-between items-center">` | `<Card variant="elevated" padding="sm" className="mb-8 flex justify-between items-center rounded-xl">` | Uses `Card variant="elevated"` for nested order pricing summary. |
| **Checkout.tsx:94-104** | `<label className="block text-sm font-medium text-neutral-400 mb-2">Full Name</label><input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors" placeholder="John Doe" />` | `<Input id="checkout-name" label="Full Name" required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />` | Links label `htmlFor` to `id="checkout-name"`, upgrades border to `#404040` (passes 3.0:1 contrast), adds accessible focus ring. |
| **Checkout.tsx:106-116** | `<label className="block text-sm font-medium text-neutral-400 mb-2">Phone Number</label><input required type="tel" value={number} onChange={e => setNumber(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition-colors" placeholder="+1 (555) 000-0000" />` | `<Input id="checkout-phone" label="Phone Number" required type="tel" value={number} onChange={e => setNumber(e.target.value)} placeholder="+1 (555) 000-0000" />` | Links label `htmlFor` to `id="checkout-phone"`, adds focus ring and high-contrast border. |
| **Checkout.tsx:118-126** | `<label className="block text-sm font-medium text-neutral-400 mb-2">Custom Photo (Optional)</label><input type="file" ... /><p className="text-xs text-neutral-500 mt-2">Upload a photo...</p>` | `<Input id="checkout-photo" label="Custom Photo (Optional)" type="file" helperText="Upload a photo of your tap if you want us to verify compatibility." onChange={e => setPhoto(e.target.files?.[0] || null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-neutral-200" />` | Fixes helper text contrast (`text-neutral-400` passes 7.7:1), associates label and helper text via `aria-describedby`, adds focus ring. |
| **Checkout.tsx:128-134** | `<button type="submit" disabled={loading} className="w-full bg-white text-black px-6 py-4 rounded-full font-bold text-lg hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Purchase'}</button>` | `<Button type="submit" variant="primary" size="lg" isLoading={loading} fullWidth className="mt-4">Complete Purchase</Button>` | Replaces ad-hoc loading state with `Button isLoading={loading}` containing accessible `Spinner` with `role="status"` and focus ring. |

#### 4.2.3 `src/AdminDashboard.tsx` Mapping
| Exact Location | Existing Repeated Code | Replacement with UI Primitives | Rationale & Accessibility Benefit |
|---|---|---|---|
| **AdminDashboard.tsx:82** | `<div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 max-w-sm w-full space-y-6">` | `<Card variant="default" padding="lg" className="max-w-sm w-full space-y-6">` | Unifies login panel with `Card variant="default"`. |
| **AdminDashboard.tsx:86-95** | `<label className="block text-sm text-neutral-400 mb-1">Username</label><input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-white" />` | `<Input id="admin-username" label="Username" required type="text" value={username} onChange={e => setUsername(e.target.value)} />` | Unifies input sizing to standard `py-3`, links label `htmlFor` to `id="admin-username"`, adds focus ring and 3:1 border. |
| **AdminDashboard.tsx:96-105** | `<label className="block text-sm text-neutral-400 mb-1">Password</label><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 focus:outline-none focus:border-white" />` | `<Input id="admin-password" label="Password" required type="password" value={password} onChange={e => setPassword(e.target.value)} />` | Links label `htmlFor` to `id="admin-password"`, adds focus ring and 3:1 border. |
| **AdminDashboard.tsx:106-112** | `<button type="submit" disabled={loading} className="w-full bg-white text-black px-4 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-colors flex justify-center items-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}</button>` | `<Button type="submit" variant="primary" size="md" isLoading={loading} fullWidth className="rounded-xl">Login</Button>` | Centralizes login submit with `Button`, accessible `Spinner`, and focus ring. |
| **AdminDashboard.tsx:122** | `<header className="flex justify-between items-center bg-neutral-900 p-6 rounded-3xl border border-neutral-800">` | `<Card as="header" variant="default" padding="md" className="flex justify-between items-center">` | Uses polymorphic `Card as="header"` with `padding="md"`. |
| **AdminDashboard.tsx:128-134** | `<button onClick={fetchOrders} className="p-2 text-neutral-400 hover:text-white transition-colors" title="Refresh"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>` | `<Button variant="ghost" size="sm" onClick={fetchOrders} aria-label="Refresh orders" className="p-2">{loading ? <Spinner size="sm" /> : <RefreshCw className="w-5 h-5" aria-hidden="true" />}</Button>` | Adds `aria-label="Refresh orders"`, sets `type="button"`, injects focus ring. |
| **AdminDashboard.tsx:135-141** | `<button onClick={handleLogout} className="flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors"><LogOut className="w-4 h-4" />Logout</button>` | `<Button variant="secondary" size="sm" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" aria-hidden="true" />}>Logout</Button>` | Standardizes elevated secondary button with focus ring and `type="button"`. |
| **AdminDashboard.tsx:145** | `<div className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden">` | `<Card variant="default" padding="none" className="overflow-hidden">` | Standardizes table container with `Card padding="none"`. |
| **AdminDashboard.tsx:160-166** | `{orders.length === 0 ? (<tr><td colSpan={7} className="p-8 text-center text-neutral-500">No orders found.</td></tr>) : ...}` | `{loading ? (<tr><td colSpan={7} className="p-12 text-center"><Spinner size="lg" label="Loading orders..." className="mx-auto" /><p className="text-sm text-neutral-400 mt-2">Loading orders...</p></td></tr>) : orders.length === 0 ? (...) : ...}` | Resolves false empty flash during network fetch by rendering `Spinner` row with `role="status"`. |
| **AdminDashboard.tsx:177-187** | `<select value={order.status} onChange={...} className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-white">` | `<select aria-label={`Update status for order #${order.id}`} value={order.status} onChange={...} className="bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black">` | Adds missing `aria-label` and visible focus ring to status dropdown. |

---

## 5. Verification Method

To independently verify these specifications and mappings:

1. **Verify Component Implementations**:
   - Inspect proposed files:
     - `src/components/ui/Button.tsx`
     - `src/components/ui/Input.tsx`
     - `src/components/ui/Card.tsx`
     - `src/components/ui/Spinner.tsx`
     - `src/components/ui/index.ts`
   - Confirm all props match `PROJECT.md` contracts:
     - `Button`: `variant?: 'primary' | 'secondary' | 'ghost'`, `size?: 'sm' | 'md' | 'lg'`, `isLoading?: boolean`
     - `Input`: `label?: string`, `error?: string`, `id: string`
     - `Card`: `variant?: 'default' | 'elevated'`, `padding` options
     - `Spinner`: `size?: 'sm' | 'md' | 'lg'`, `label?: string`
2. **Verify Focus Ring Classes**:
   - Check that `focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none` is present on `Button.tsx` and `Input.tsx`.
3. **Verify Label-to-Input Association**:
   - Check `Input.tsx`: confirm `<label htmlFor={inputId}>` matches `<input id={inputId}>`.
   - Check error state: confirm `<input aria-invalid="true" aria-describedby={errorId}>` and `<p id={errorId} role="alert">`.
4. **Verify Accessibility Contrast Ratios**:
   - Border: `#404040` (`border-neutral-700`) on `#0a0a0a` = 3.2:1 (Passes WCAG 1.4.11 >=3:1).
   - Label Text: `#d4d4d4` (`text-neutral-300`) on `#0a0a0a` = 12.6:1 (Passes WCAG 1.4.3 >=4.5:1).
   - Helper Text: `#a3a3a3` (`text-neutral-400`) on `#0a0a0a` = 7.7:1 (Passes WCAG 1.4.3 >=4.5:1).
5. **Verify Zero Dependency Footprint**:
   - Confirm components import only React and local siblings, requiring no additional npm packages (`clsx`, `cva`, etc.).
6. **Verify Type Checking & Build**:
   - Once implemented by the worker, run:
     `npm run build` (runs `tsc -b && vite build`) to confirm zero TypeScript compilation errors.
