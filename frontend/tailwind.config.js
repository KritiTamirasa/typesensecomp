/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          deep: "#12372A",
          DEFAULT: "#1F5D42",
          medium: "#4F8A62",
          fresh: "#6FAE72",
          sage: "#B7D7A8",
        },
        mint: "#F3F8F1",
        cream: "#FAFCF7",
        ink: "#17231C",
        muted: "#66756B",
        amber: {
          bg: "#FBEFDD",
          text: "#92600C",
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #12372A 0%, #1F5D42 45%, #6FAE72 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, #1F5D42 0%, #6FAE72 100%)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        hero: ["clamp(2.25rem, 5vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        section: ["clamp(1.5rem, 2.6vw, 2.25rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        soft: "0 2px 10px rgba(18, 55, 42, 0.06)",
        card: "0 4px 20px rgba(18, 55, 42, 0.08)",
        "card-hover": "0 12px 32px rgba(18, 55, 42, 0.14)",
        glow: "0 0 0 4px rgba(111, 174, 114, 0.18)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scan: {
          "0%": { transform: "translateY(-10%)" },
          "100%": { transform: "translateY(110%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "float-delayed": "float 5s ease-in-out infinite 1.2s",
        scan: "scan 1.8s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-ring": "pulse-ring 1.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};
