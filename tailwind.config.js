/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ── Stitch Design System Color Tokens ──────────────────────────────
      colors: {
        // Core
        primary: "#000000",
        "on-primary": "#ffffff",
        "primary-container": "#1c1b1b",
        "on-primary-container": "#858383",
        "primary-fixed": "#e5e2e1",
        "primary-fixed-dim": "#c8c6c5",
        "on-primary-fixed": "#1c1b1b",
        "on-primary-fixed-variant": "#474746",
        "inverse-primary": "#c8c6c5",

        secondary: "#0047AB",
        "on-secondary": "#ffffff",
        "secondary-container": "#6c98ff",
        "on-secondary-container": "#002f76",
        "secondary-fixed": "#dae2ff",
        "secondary-fixed-dim": "#b1c5ff",
        "on-secondary-fixed": "#001946",
        "on-secondary-fixed-variant": "#00419e",

        tertiary: "#000000",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#1a1c1c",
        "on-tertiary-container": "#838484",
        "tertiary-fixed": "#e2e2e2",
        "tertiary-fixed-dim": "#c6c6c7",
        "on-tertiary-fixed": "#1a1c1c",
        "on-tertiary-fixed-variant": "#454747",

        // Surface
        background: "#fbf9f9",
        "on-background": "#1b1c1c",
        surface: "#fbf9f9",
        "on-surface": "#1b1c1c",
        "surface-dim": "#dbdad9",
        "surface-bright": "#fbf9f9",
        "surface-container": "#efeded",
        "surface-container-low": "#f5f3f3",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#e9e8e7",
        "surface-container-highest": "#e3e2e2",
        "surface-variant": "#e3e2e2",
        "on-surface-variant": "#444748",
        "surface-tint": "#5f5e5e",
        "inverse-surface": "#303031",
        "inverse-on-surface": "#f2f0f0",

        // Outline
        outline: "#747878",
        "outline-variant": "#c4c7c7",

        // Error
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        // Brand accent (Electric Orange for dark mode Stitch pages)
        accent: "#ff4d00",
        "accent-dim": "#ff7a3d",
      },

      // ── Stitch Typography System ────────────────────────────────────────
      fontFamily: {
        sans: ["Hanken Grotesk", "system-ui", "sans-serif"],
        display: ["Hanken Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "title-lg": ["20px", { lineHeight: "28px", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "label-sm": ["11px", { lineHeight: "14px", fontWeight: "500" }],
      },

      // ── Stitch Spacing System ────────────────────────────────────────────
      spacing: {
        xs: "4px",
        sm: "12px",
        base: "8px",
        md: "24px",
        gutter: "24px",
        lg: "48px",
        xl: "80px",
        "margin-mobile": "16px",
        "margin-desktop": "64px",
      },

      // ── Stitch Border Radius ─────────────────────────────────────────────
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        "2xl": "1rem",
        full: "0.75rem",
      },

      // ── Animations ─────────────────────────────────────────────────────
      keyframes: {
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.1)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        scrollText: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        kenburns: "kenburns 20s ease infinite alternate",
        "fade-in-up": "fadeInUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        "slide-in-right": "slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-left": "slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "scroll-text": "scrollText 20s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },

      // ── Max Widths ────────────────────────────────────────────────────────
      maxWidth: {
        "8xl": "1440px",
      },

      // ── Backdrop blur ────────────────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
}
