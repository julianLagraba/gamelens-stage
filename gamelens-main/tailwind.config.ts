import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 'font-sans' usará Geist (por defecto en toda la web)
        sans: ["var(--font-geist-sans)", "sans-serif"],
        // 'font-mono' usará Geist Mono
        mono: ["var(--font-geist-mono)", "monospace"],
        // 'font-display' usará Poppins (para tus títulos h1, h2, etc.)
        display: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;