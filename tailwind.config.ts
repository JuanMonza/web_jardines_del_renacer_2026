import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        display: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: "#3C60A2",
          hover: "#2f4d82",
          light: "#5a7ec0",
          dark: "#2a3f70",
        },
        background: "#f6f7fb",
        text: "#2b2b2b",
        textLight: "#666666",
        border: "rgba(60,96,162,0.15)",
      },
      backdropBlur: {
        glass: "12px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.05)",
        "glass-lg": "0 12px 48px rgba(0,0,0,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
        "marquee": "marquee 30s linear infinite",
        "payment-heartbeat": "paymentHeartbeat 2.8s ease-in-out infinite",
        "whatsapp-heartbeat": "whatsappHeartbeat 3.2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        paymentHeartbeat: {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 10px 24px rgba(60,96,162,0.16)" },
          "12%": { transform: "scale(1.075)", boxShadow: "0 12px 30px rgba(60,96,162,0.36)" },
          "24%": { transform: "scale(1)", boxShadow: "0 10px 24px rgba(60,96,162,0.16)" },
          "36%": { transform: "scale(1.04)", boxShadow: "0 11px 28px rgba(60,96,162,0.28)" },
          "48%": { transform: "scale(1)", boxShadow: "0 10px 24px rgba(60,96,162,0.16)" },
        },
        whatsappHeartbeat: {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 10px 24px rgba(37,211,102,0.28)" },
          "12%": { transform: "scale(1.075)", boxShadow: "0 12px 32px rgba(37,211,102,0.48)" },
          "24%": { transform: "scale(1)", boxShadow: "0 10px 24px rgba(37,211,102,0.28)" },
          "36%": { transform: "scale(1.04)", boxShadow: "0 11px 29px rgba(37,211,102,0.4)" },
          "48%": { transform: "scale(1)", boxShadow: "0 10px 24px rgba(37,211,102,0.28)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
