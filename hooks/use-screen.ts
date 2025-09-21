// hooks/use-screen.ts

import * as React from "react"

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const

type ScreenType = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop'

// Utility function for media query management
function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => {
      setMatches(mql.matches)
      setIsLoading(false)
    }
    
    mql.addEventListener("change", onChange)
    // Initial check
    onChange()
    
    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return { matches: !!matches, isLoading }
}

export function useIsMobile() {
  const { matches, isLoading } = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE - 1}px)`)
  return { isMobile: matches, isLoading }
}

export function useIsTablet() {
  const { matches, isLoading } = useMediaQuery(
    `(min-width: ${BREAKPOINTS.MOBILE}px) and (max-width: ${BREAKPOINTS.TABLET - 1}px)`
  )
  return { isTablet: matches, isLoading }
}

export function useIsDesktop() {
  const { matches, isLoading } = useMediaQuery(
    `(min-width: ${BREAKPOINTS.TABLET}px) and (max-width: ${BREAKPOINTS.DESKTOP - 1}px)`
  )
  return { isDesktop: matches, isLoading }
}

export function useIsLargeDesktop() {
  const { matches, isLoading } = useMediaQuery(`(min-width: ${BREAKPOINTS.DESKTOP}px)`)
  return { isLargeDesktop: matches, isLoading }
}

// Composite hook that returns all screen sizes
export function useScreen() {
  const { isMobile, isLoading: mobileLoading } = useIsMobile()
  const { isTablet, isLoading: tabletLoading } = useIsTablet()
  const { isDesktop, isLoading: desktopLoading } = useIsDesktop()
  const { isLargeDesktop, isLoading: largeDesktopLoading } = useIsLargeDesktop()

  const isLoading = mobileLoading || tabletLoading || desktopLoading || largeDesktopLoading

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isLoading,
    // Helper function to get current screen type
    current: React.useMemo((): ScreenType => {
      if (isLoading) return 'desktop' // Safe default
      if (isMobile) return 'mobile'
      if (isTablet) return 'tablet'
      if (isDesktop) return 'desktop'
      return 'largeDesktop'
    }, [isLoading, isMobile, isTablet, isDesktop])
  }
}