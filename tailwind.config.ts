import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF9ED",
        orange: { 50: "#FFF4E8", 100: "#FFE6C7", 500: "#F97316", 600: "#EA580C", 700: "#C2410C" },
        sunshine: { 100: "#FEF3C7", 300: "#FCD34D", 400: "#FBBF24", 500: "#F59E0B" },
      },
      boxShadow: { soft: "0 12px 32px rgba(124, 77, 24, 0.09)" },
    },
  },
  plugins: [],
};

export default config;
