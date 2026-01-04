/**
 * Centralized Theme Configuration
 *
 * This file contains all theme-related constants used throughout the application.
 * It provides a single source of truth for colors, spacing, typography, and other
 * design tokens.
 *
 * Usage:
 * - Import specific values: `import { COLORS } from '@/config/theme'`
 * - Use in components: `style={{ color: COLORS.brand.primary }}`
 * - Prefer Tailwind classes when possible: `className="bg-sbb-red"`
 */

/**
 * Brand Colors
 * SBB (Swiss Federal Railways) official brand colors
 */
export const COLORS = {
  brand: {
    /**
     * SBB Primary Red - Main brand color
     * Used for: Primary buttons, accents, focus states
     * Tailwind: bg-sbb-red, text-sbb-red, border-sbb-red
     */
    primary: '#A5061C',

    /**
     * SBB Primary Red (Hover) - Darker shade for hover states
     * Used for: Button hover states, active states
     */
    primaryHover: '#820415',

    /**
     * SBB Primary Red (Light) - Lighter tint for backgrounds
     * Used for: Selection backgrounds, highlights
     */
    primaryLight: '#FFF1F1',

    /**
     * SBB Primary Red (Dark) - Very dark shade
     * Used for: Text on light backgrounds, dark mode accents
     */
    primaryDark: '#5C000C',
  },

  /**
   * Semantic Colors
   * Standardized colors for common UI states
   */
  semantic: {
    success: '#00BD69',
    warning: '#FFC107',
    error: '#EB0000',
    info: '#627D98',
  },

  /**
   * Neutral Colors
   * Grayscale palette for backgrounds, text, and borders
   */
  neutral: {
    white: '#FFFFFF',
    milk: '#F6F6F6',
    cloud: '#E5E5E5',
    silver: '#DCDCDC',
    cement: '#BDBDBD',
    storm: '#A8A8A8',
    smoke: '#8D8D8D',
    metal: '#767676',
    granite: '#686868',
    anthracite: '#5A5A5A',
    iron: '#444444',
    charcoal: '#212121',
    midnight: '#151515',
    black: '#000000',
  },
} as const;

/**
 * Spacing Scale
 * Consistent spacing values for margins, padding, and gaps
 */
export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
} as const;

/**
 * Border Radius
 * Consistent border radius values for rounded corners
 */
export const RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px - SBB standard
  md: '0.25rem',    // 4px
  lg: '0.375rem',   // 6px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',   // Fully rounded
} as const;

/**
 * Typography
 * Font families and sizes
 */
export const TYPOGRAPHY = {
  fontFamily: {
    sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'].join(', '),
    mono: ['Courier', 'Consolas', 'Roboto Mono', 'DejaVu Sans Mono', 'monospace'].join(', '),
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/**
 * Shadows
 * Box shadow presets for depth and elevation
 */
export const SHADOWS = {
  sm: '0 2px 4px 0 rgba(0, 0, 0, 0.03)',
  md: '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
  lg: '0 12px 24px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 40px -8px rgba(0, 0, 0, 0.1), 0 12px 20px -8px rgba(0, 0, 0, 0.04)',
  '2xl': '0 32px 64px -12px rgba(0, 0, 0, 0.12), 0 16px 32px -12px rgba(0, 0, 0, 0.06)',
  red: '0 8px 24px -4px rgba(235, 0, 0, 0.2)',
  none: 'none',
} as const;

/**
 * Z-Index Scale
 * Consistent layering for modals, dropdowns, tooltips, etc.
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  notification: 80,
  max: 9999,
} as const;

/**
 * Breakpoints
 * Responsive design breakpoints (mobile-first)
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Transitions
 * Animation timing and duration presets
 */
export const TRANSITIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
  },
} as const;

/**
 * Layout Constants
 * Common layout values and constraints
 */
export const LAYOUT = {
  /**
   * Maximum content width for readable text
   */
  maxContentWidth: '1280px',

  /**
   * Navbar height
   */
  navbarHeight: '4rem', // 64px

  /**
   * Sidebar width (when expanded)
   */
  sidebarWidth: '16rem', // 256px

  /**
   * Container padding
   */
  containerPadding: '1rem', // 16px
} as const;

/**
 * App-Specific Constants
 * Application-specific magic numbers and configuration
 */
export const APP_CONSTANTS = {
  /**
   * Maximum number of favorite stations
   */
  maxFavoriteStations: 10,

  /**
   * Chat message character limit
   */
  maxMessageLength: 2000,

  /**
   * Feedback message character limit
   */
  maxFeedbackLength: 500,

  /**
   * Default animation duration (ms)
   */
  defaultAnimationDuration: 300,

  /**
   * Toast notification duration (ms)
   */
  toastDuration: 3000,

  /**
   * Debounce delay for search inputs (ms)
   */
  searchDebounceDelay: 300,
} as const;

/**
 * Export convenience type for colors
 */
export type ThemeColor = typeof COLORS;
export type BrandColor = typeof COLORS.brand;
export type SemanticColor = typeof COLORS.semantic;
export type NeutralColor = typeof COLORS.neutral;
