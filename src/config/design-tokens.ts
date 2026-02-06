/**
 * Design Tokens - Jardines del Renacer
 * Sistema de diseño unificado para toda la plataforma
 */

export const colors = {
  primary: "#3C60A2",
  primaryHover: "#2f4d82",
  primaryLight: "#5a7ec0",
  primaryDark: "#2a3f70",
  background: "#f6f4f2",
  backgroundLight: "#ffffff",
  text: "#2b2b2b",
  textLight: "#6b6b6b",
  borderSoft: "rgba(60,96,162,0.15)",
  borderMedium: "rgba(60,96,162,0.3)",
} as const;

export const glass = {
  background: "rgba(255,255,255,0.65)",
  blur: "blur(12px)",
  border: "1px solid rgba(60,96,162,0.2)",
  shadow: "0 8px 32px rgba(0,0,0,0.05)",
  shadowLg: "0 12px 48px rgba(0,0,0,0.08)",
} as const;

export const spacing = {
  xs: "0.5rem",    // 8px
  sm: "1rem",      // 16px
  md: "1.5rem",    // 24px
  lg: "2rem",      // 32px
  xl: "3rem",      // 48px
  "2xl": "4rem",   // 64px
  "3xl": "6rem",   // 96px
} as const;

export const borderRadius = {
  sm: "0.5rem",    // 8px
  md: "0.75rem",   // 12px
  lg: "1rem",      // 16px
  xl: "1.5rem",    // 24px
  "2xl": "2rem",   // 32px
  full: "9999px",
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "'Playfair Display', Georgia, serif",
  },
  fontSize: {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
    "6xl": "3.75rem",  // 60px
  },
} as const;

export const transitions = {
  fast: "150ms ease-in-out",
  base: "300ms ease-in-out",
  slow: "500ms ease-in-out",
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;
