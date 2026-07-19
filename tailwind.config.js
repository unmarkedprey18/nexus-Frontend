// This file sets up Tailwind CSS for our React Native app
// Tailwind lets us style things using simple class names

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where our code files are
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],

  theme: {
    extend: {
      // Custom colors for the Nexus app
      colors: {
        primary: "#1F6FEB",        // Main blue for buttons
        accent: "#22C55E",         // Green for success
        danger: "#EF4444",         // Red for errors
        warning: "#F59E0B",        // Yellow for warnings
        surface: "#FFFFFF",        // White for cards
        background: "#F8FAFC",     // Light gray for screens
        "text-primary": "#0F172A", // Dark for main text
        "text-secondary": "#475569", // Gray for small text
      },
    },
  },
  plugins: [],
};