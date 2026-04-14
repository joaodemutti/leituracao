/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1F3A",
        "navy-mid": "#122845",
        "navy-light": "#1C3A5E",
        blue: "#1A5FA8",
        "blue-soft": "#EBF2FB",
        cream: "#F9F6F1",
        "cream-dark": "#EDE9E2",
        gold: "#B8832A",
        "gold-light": "#F7EDD8",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "18px",
        xl: "24px",
      },
      boxShadow: {
        xs: "0 1px 3px rgba(11,31,58,.06), 0 1px 2px rgba(11,31,58,.04)",
        sm: "0 2px 8px rgba(11,31,58,.08), 0 1px 3px rgba(11,31,58,.05)",
        md: "0 6px 20px rgba(11,31,58,.11), 0 2px 6px rgba(11,31,58,.06)",
        lg: "0 16px 48px rgba(11,31,58,.16), 0 4px 12px rgba(11,31,58,.08)",
        xl: "0 28px 72px rgba(11,31,58,.22)",
      },
    },
  },
  plugins: [],
};
