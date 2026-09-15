import { useState, useEffect } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Custom React hook that detects whether the user has requested the system
 * to minimize the amount of animation or motion it uses.
 *
 * Implements WCAG 2.3.3 (Animation from Interactions) and WCAG 2.2.2 (Pause, Stop, Hide).
 * Reactively listens to media query changes so changes take effect immediately
 * without requiring a full page reload.
 *
 * Defaults safely to `false` when window or window.matchMedia is undefined (SSR / test mocks).
 *
 * @returns boolean - true if the user prefers reduced motion, false otherwise.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    try {
      return window.matchMedia(REDUCED_MOTION_QUERY).matches
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    let mediaQueryList: MediaQueryList
    try {
      mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY)
    } catch {
      return
    }

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Modern MediaQueryList addEventListener
    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handleChange)
      return () => {
        mediaQueryList.removeEventListener('change', handleChange)
      }
    } 
    // Legacy MediaQueryList addListener fallback
    else if (typeof (mediaQueryList as any).addListener === 'function') {
      ;(mediaQueryList as any).addListener(handleChange)
      return () => {
        ;(mediaQueryList as any).removeListener(handleChange)
      }
    }
  }, [])

  return prefersReducedMotion
}

export default useReducedMotion
