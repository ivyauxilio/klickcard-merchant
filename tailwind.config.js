/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1B1B1F",
        paper: "#FAFAF7",
        brand: {
          50: "#EEF4FF",
          100: "#DCE8FF",
          300: "#8FB4FF",
          500: "#3D6BFF",
          600: "#2C52DB",
          700: "#213EAA",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
