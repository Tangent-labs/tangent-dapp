import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin" // ← correct import

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "md-lg": "930px",
      },
      fontFamily: {
        gilroy: ["var(--font-gilroy)", "sans-serif"],
      },
      borderWidth: {
        tangent: "1.5px",
      },
      backgroundImage: {
        header: "var(--tgt-bg-header)",
        progress: "var(--tgt-bg-progress)",
        "button-inactive": "var(--tgt-bg-button-inactive)",
        "top-performing-lps": "var(--tgt-bg-top-performing-lps)",
        "earn-action": "var(--tgt-bg-earn-action)",
        danger: "var(--tgt-bg-danger)",
        pink: "var(--tgt-bg-pink)",
        tab: "var(--tgt-bg-tab)",
        "select-input": "var(--tgt-bg-select-input)",
        tonic: "var(--tgt-bg-tonic)",
        "light-tonic": "var(--tgt-bg-light-tonic)",
        "list-row-hover": "var(--tgt-list-row-hover)",
        "panel-title-gradient": "var(--tgt-panel-title-gradient)",
        "button-gradient": "var(--tgt-button)",
        lec: "var(--tgt-bg-lec)",
      },
      colors: {
        "button-active-hover": "var(--tgt-button-active-hover)",
        "button-active": "var(--tgt-button-active)",
        "button-active-dark": "var(--tgt-button-active-dark)",
        "row-tonic": "var(--tgt-row-tonic)",
        "row-success": "var(--tgt-row-success)",
        "row-danger": "var(--tgt-row-danger)",
        "row-warning": "var(--tgt-row-warning)",

        "dash-keepers": "var(--tgt-dash-keepers)",
        "dash-wts": "var(--tgt-dash-wts)",
        "dash-susg": "var(--tgt-dash-susg)",

        "panel-hover": "var(--tgt-bg-panel-hover)",
        "overlay-panel": "var(--tgt-bg-overlay-panel)",
        "panel-disabled": "var(--tgt-bg-panel-disabled)",
        tonic: "var(--tgt-tonic)",
        success: "var(--tgt-success)",
        "light-tonic": "var(--tgt-light-tonic)",
        subtitle: "var(--tgt-subtitle)",
        danger: "var(--tgt-danger)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        dark: "var(--tgt-dark)",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        breathe: {
          "0%, 70%": { outlineOffset: "3px" },
          "35%": { outlineOffset: "6px" },
          "71%, 100%": { outlineOffset: "3px" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.6" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        ripple: "ripple 1500ms cubic-bezier(0.16, 0.8, 0.32, 1.6) forwards",
        breathe: "breathe 3s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  plugins: [
    require("tailwindcss-animate"),

    plugin(({ addUtilities }) => {
      addUtilities({
        ".hover-lift-row": {
          position: "relative",
          "@apply transition-all duration-150 ease-out": {},
          "&::before": {
            content: '""',
            "@apply absolute inset-0 -z-10 opacity-0 transition-opacity duration-150": {},
            background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 100%)",
            borderRadius: "inherit",
          },
          "&:hover": {
            "@apply cursor-pointer shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]": {},
            "&::before": {
              "@apply opacity-100": {},
            },
          },
          "&:active": {
            "@apply scale-[0.997] duration-75": {},
            "&::before": {
              background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.08) 100%)",
              "@apply opacity-100": {},
            },
          },
        },
      })
    }),
  ],
}

export default config
