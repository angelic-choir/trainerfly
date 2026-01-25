import { useBreakpoints as useVueUseBreakpoints } from '@vueuse/core'

export function useScreenBreakpoints() {
  const breakpoints = useVueUseBreakpoints({
    mobile: 0,
    tablet: 768,
    desktop: 1024,
  })

  const isMobile = breakpoints.smaller('desktop')
  const isTablet = breakpoints.between('tablet', 'desktop')
  const isDesktop = breakpoints.greaterOrEqual('desktop')

  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  }
}
