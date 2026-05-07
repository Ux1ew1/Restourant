import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vanilla: {
          50: "#FDFAF4",
          100: "#FAF7F0",
          200: "#F5EFE6",
          300: "#E8DCC8",
          400: "#D4C4A0",
          500: "#C4A882",
          600: "#A8895E",
          700: "#8B6B3D",
          800: "#5C4427",
          900: "#3A2A17",
        },
      },
    },
  },
  plugins: [],
};

export default config;

