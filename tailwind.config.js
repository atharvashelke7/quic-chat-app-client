/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        spinner: "spinner 1.2s infinite",
      },
      keyframes: {
        spinner: {
          "0%": {
            transform: "rotate(0)",
            "animation-timing-function":
              "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
          },
          "50%": {
            transform: "rotate(900deg)",
            "animation-timing-function": "cubic-bezier(0.215, 0.61, 0.355, 1)",
          },
          "100%": {
            transform: "rotate(1800deg)",
          },
        },
      },
    },
  },
  plugins: [],
};
