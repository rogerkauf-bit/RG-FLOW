/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: {
    rg: { blue: "#204B8F", navy: "#264677", ice: "#EEF9FD", mist: "#A1B6D5", steel: "#5171A5" }
  }, boxShadow: { soft: "0 8px 30px rgba(32,75,143,.07)" } } },
  plugins: []
};