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
        "muted-foreground": "rgb(var(--color-muted-foreground) / <alpha-value>)",
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
        error: "rgb(var(--color-error) / <alpha-value>)",
        link: {
          DEFAULT: "var(--color-link)",
          hover: "var(--color-link-hover)",
        },
        "confirmation-bg": "var(--color-confirmation-bg)",
        "confirmation-border": "var(--color-confirmation-border)",
        "ember-stroke": "var(--color-ember-stroke)",
        nav: {
          DEFAULT: "var(--color-nav-bg)",
          border: "var(--color-nav-border)",
        },
        "tab-active": "var(--color-tab-active)",
        "tab-inactive": "var(--color-tab-inactive)",
        "tag-header": "var(--color-tag-header-text)",
        "tag-accent": "var(--color-tag-accent-bar)",
        "tag-untagged": "var(--color-tag-untagged-bar)",
        "tag-count": {
          DEFAULT: "var(--color-tag-count-bg)",
          text: "var(--color-tag-count-text)",
        },
        chip: {
          DEFAULT: "var(--color-chip-bg)",
          text: "var(--color-chip-text)",
        },
        "skeleton-from": "var(--color-skeleton-from)",
        "skeleton-to": "var(--color-skeleton-to)",
        "nudge": "var(--color-nudge-text)",
        "nudge-link": "var(--color-nudge-link)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
      ringColor: {
        ember: "var(--color-input-focus)",
      },
    },
  },
  plugins: [],
};

export default config;
