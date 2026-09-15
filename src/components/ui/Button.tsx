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
