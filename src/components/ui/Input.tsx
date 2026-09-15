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
