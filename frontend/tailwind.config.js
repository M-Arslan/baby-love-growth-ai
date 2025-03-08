/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./lib/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          orange: "#FA5C12",
          dark: "#000000",
          gray: "#F3F3F3",
        },
        fontFamily: {
          raleway: ["Raleway", "sans-serif"],
          inter: ["Inter", "sans-serif"],
        },
      },
    },
    plugins: [],
  };
  