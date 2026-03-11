import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-sora)", "system-ui", "sans-serif"],
        wordmark: ["var(--font-bricolage)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        "muted-foreground": "var(--color-muted-foreground)",
        card: {
          DEFAULT: "var(--color-card)",
          border: "var(--color-card-border)",
          foreground: "var(--color-card-foreground)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          foreground: "var(--color-primary-foreground)",
        },
        input: {
          DEFAULT: "var(--color-input)",
          border: "var(--color-input-border)",
          focus: "var(--color-input-focus)",
        },
        error: "var(--color-error)",
        link: {
          DEFAULT: "var(--color-link)",
          hover: "var(--color-link-hover)",
        },
        "confirmation-bg": "var(--color-confirmation-bg)",
        "confirmation-border": "var(--color-confirmation-border)",
        "ember-stroke": "var(--color-ember-stroke)",
      },
      ringColor: {
        ember: "var(--color-input-focus)",
      },
    },
  },
  plugins: [],
};

export default config;
