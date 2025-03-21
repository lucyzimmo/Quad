/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "cardinal-red": "#c25353",
        "cardinal-red-hover": "#a83e3e",
        "palo-alto-green": "#006a52",
      },
      fontFamily: {
        sans: ["RobotoSlab", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-out": "fadeOut 2s ease-in-out",
        shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        bounce: "bounce 1s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 3s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        glow: "glow 1s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        shake: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6" },
          "100%": {
            boxShadow: "0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0073e6",
          },
        },
      },
      scale: {
        102: "1.02",
      },
      boxShadow: {
        neon: "0 0 5px theme(colors.cardinal-red), 0 0 20px theme(colors.cardinal-red)",
        "neon-green":
          "0 0 5px theme(colors.palo-alto-green), 0 0 20px theme(colors.palo-alto-green)",
      },
    },
  },
  plugins: [],
};
