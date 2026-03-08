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
        "deep-navy": "#0F1B2D",
        "primary-blue": "#1A365D",
        "mid-blue": "#2B4A78",
        "branch-brown": "#8B5E3C",
        "dark-leather": "#6B4226",
        "ember-cta": "#D4854A",
        parchment: "#F5F0E8",
        ink: "#1A1A2E",
      },
      backgroundColor: {
        page: "var(--bg-page)",
        card: "var(--bg-card)",
        input: "var(--input-bg)",
        toggle: "var(--toggle-bg)",
        "error-banner": "var(--error-banner-bg)",
      },
      borderColor: {
        card: "var(--border-card)",
        input: "var(--input-border)",
        "input-focus": "var(--input-focus)",
        "error-banner": "var(--error-banner-border)",
      },
      textColor: {
        heading: "var(--text-heading)",
        muted: "var(--text-muted)",
        label: "var(--text-label)",
        placeholder: "var(--input-placeholder)",
        "handle-prefix": "var(--handle-prefix)",
        error: "var(--error-text)",
        "error-banner": "var(--error-banner-text)",
        "handle-available": "var(--handle-available)",
        "handle-taken": "var(--handle-taken)",
        toggle: "var(--toggle-fg)",
        link: "var(--link)",
      },
    },
  },
  plugins: [],
};

export default config;
