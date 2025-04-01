import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: "Roobert, serif",
        serif: "Roobert, serif",
      },
      backgroundImage: {
        progress: "var(--tgt-bg-progress)",
        "button-active": "var(--tgt-bg-button-active)",
        danger: "var(--tgt-bg-danger)",
        "select-input": "var(--tgt-bg-select-input)",
        tonic: "var(--tgt-bg-tonic)",
        "list-row-hover": "var(--tgt-list-row-hover)",
        "panel-title-gradient": "var(--tgt-panel-title-gradient)",
        "button-gradient": "var(--tgt-button)",
        page: "url('/medias/background.svg')",
      },
      colors: {
        "row-tonic": "var(--tgt-row-tonic)",
        "overlay-panel": "var(--tgt-bg-overlay-panel)",
        tonic: "var(--tgt-tonic)",
        "light-tonic": "var(--tgt-light-tonic)",
        subtitle: "var(--tgt-subtitle)",
        danger: "var(--tgt-danger)",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
}
export default config
