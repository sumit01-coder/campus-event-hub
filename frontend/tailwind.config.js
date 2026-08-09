/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA', // Warm, clean white/gray
        card: '#FFFFFF',       // Pure white for cards
        textPrimary: '#1A1A1A',
        textSecondary: '#666666',
        primary: {
          DEFAULT: '#2563EB',  // Professional Blue
          hover: '#1D4ED8',
        },
        accent: {
          DEFAULT: '#F97316',  // Warm orange accent
          hover: '#EA580C',
        },
        surface: '#F3F4F6'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'saas': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'saas-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem'
      }
    },
  },
  plugins: [],
}
