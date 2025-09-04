/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cdp-blue': '#0066cc',
        'cdp-dark': '#003366',
        'cdp-light': '#e6f2ff',
        'cdp-green': '#00b894',
        'cdp-orange': '#fd79a8',
        'cdp-purple': '#6c5ce7',
        'retail-primary': '#1a202c',
        'retail-secondary': '#2d3748',
        'retail-accent': '#4299e1',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'flow': 'flow 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        flow: {
          '0%, 100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
          '50%': { transform: 'translateX(50px) scale(1.1)', opacity: '0.7' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' },
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}