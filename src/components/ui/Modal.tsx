import React, { useEffect, useRef, useCallback, useId } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  triggerRef?: React.RefObject<HTMLElement | null>
  initialFocusRef?: React.RefObject<HTMLElement | null>
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  showCloseButton?: boolean
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  triggerRef,
  initialFocusRef,
  className = '',
  maxWidth = '2xl',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descId = useId()
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }

  // Idempotent close handler (F8-B2)
  const handleClose = useCallback(() => {
    if (!isOpen) return
    onClose()
  }, [isOpen, onClose])

  // Focus management: capture previous focus, set initial focus, restore on unmount/close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement

      const targetFocus = initialFocusRef?.current || closeButtonRef.current
      if (targetFocus) {
        requestAnimationFrame(() => {
          targetFocus.focus()
        })
      }
    } else if (previousActiveElement.current) {
      const returnTarget = triggerRef?.current || previousActiveElement.current
      if (returnTarget && typeof returnTarget.focus === 'function') {
        returnTarget.focus()
      }
    }
  }, [isOpen, triggerRef, initialFocusRef])

  // Background scroll lock (Journey 2 Step 5)
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isOpen])

  // Escape listener and focus trap (F8-3, F8-4, F8-B3, F8-B4, F8-B5, Combo 4)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        handleClose()
        return
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return

        const focusableElements = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0)

        if (focusableElements.length === 0) {
          e.preventDefault()
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  // Backdrop click dismissal without bleeding clicks (F8-5, Combo 5, Journey 2 Step 4)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation()
      handleClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={handleBackdropClick}
      data-testid="modal-backdrop"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto ${className}`}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-800">
            {title ? (
              <h2
                id={titleId}
                className="text-xl sm:text-2xl font-bold text-white tracking-tight"
              >
                {title}
              </h2>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                aria-label="Close dialog"
                className="modal-close-btn modal-close-button p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 cursor-pointer"
                data-testid="modal-close-button"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {description && (
          <p id={descId} className="sr-only">
            {description}
          </p>
        )}

        {/* Content Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
