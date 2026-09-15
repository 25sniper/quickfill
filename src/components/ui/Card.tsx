import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'elevated' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  as?: 'div' | 'header' | 'section' | 'article' | 'aside' | React.ElementType
  children?: React.ReactNode
  className?: string
}

export const Card = React.forwardRef<HTMLElement, CardProps>(
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

    const Tag = Component as any

    return (
      <Tag ref={ref} className={combinedClasses} {...props}>
        {children}
      </Tag>
    )
  }
)

Card.displayName = 'Card'
