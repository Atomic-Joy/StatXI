/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#050505", // Deep space background
          800: "#0a0a0a", // Card backgrounds
          700: "#121212", // Lighter card/border
          600: "#27272a", // Borders
        },
        cyan: {
          400: "#22d3ee",
          500: "#00F0FF", // Accent Cyan
          600: "#0891b2",
        },
        lime: {
          400: "#bef264",
          500: "#CCFF00", // Accent Lime
          600: "#84cc16",
        }
      },
      fontFamily: {
        display: ["Outfit", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"]
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" }
        }
      },
      animation: {
        rise: "rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.8s ease-out both",
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      }
    }
  },
  plugins: [],
};