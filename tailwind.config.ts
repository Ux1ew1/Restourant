import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vanilla: {
          50: "#F6F1EA",
          100: "#EFE6D9",
          200: "#E2D2BE",
          300: "#D4BF9E",
          400: "#C8A97E",
          500: "#B88D56",
          600: "#8E673F",
          700: "#5A2E2E",
          800: "#2F3A2F",
          900: "#1A1A1A",
        },
      },
    },
  },
  plugins: [],
};

export default config;
