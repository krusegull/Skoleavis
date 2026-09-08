import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        headline: ["var(--font-headline)", "Georgia", "serif"],
        serif: ["var(--font-body)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        paper: "#f7f3ea",
        ink: "#1a1a1a",
        masthead: "#111111",
        accent: "#a3272c",
        rule: "#1a1a1a",
        muted: "#6b6558",
      },
    },
  },
  plugins: [],
};

export default config;
