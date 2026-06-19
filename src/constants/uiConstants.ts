/**
 * UI Constants Configuration
 * Defines animation durations, z-index values, and breakpoints
 */

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 400,
  SLOW: 600
} as const;

export const Z_INDEX = {
  MODAL: 1000,
  TOAST: 2000,
  DROPDOWN: 100,
  TOOLTIP: 3000
} as const;

export const BREAKPOINTS = {
  XS: 480,
  SM: 768,
  MD: 1024,
  LG: 1280,
  XL: 1536
} as const;

export const BREAKPOINT_LABELS = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl'
} as const;
