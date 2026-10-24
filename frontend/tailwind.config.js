
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main brand palette
        background: "#FAF7F1",
        surface: "#FAF7F1",
        primary: "#A65D45",
        "primary-container": "#C47A5D",
        "on-primary": "#FFFFFF",

        // Natural accent colors
        secondary: "#55745B",
        "secondary-container": "#DCE7D8",
        tertiary: "#85745C",
        "tertiary-fixed": "#EDE1CE",
        "on-tertiary-fixed": "#332B21",

        // Text colors
        "on-background": "#332821",
        "on-surface": "#332821",
        "on-surface-variant": "#76675C",

        // Borders and surfaces
        "outline-variant": "#DED3C6",
        "surface-container": "#F0E9DF",
        "surface-container-low": "#F5F0E8",
        "surface-container-lowest": "#FFFFFF",
        "surface-tint": "#A65D45",

        // Additional design tokens
        espresso: "#332821",
        terracotta: "#A65D45",
        cream: "#FAF7F1",
        sand: "#E8DDD0",
        sage: "#DCE7D8",
      },

      fontFamily: {
        body: ["Be Vietnam Pro", "sans-serif"],
        headline: ["Manrope", "sans-serif"],
      },

      borderRadius: {
        "editorial": "1rem",
        "editorial-lg": "1.5rem",
      },

      boxShadow: {
        "soft": "0 8px 30px rgba(51, 40, 33, 0.06)",
      },
    },
  },
  plugins: [],
};
