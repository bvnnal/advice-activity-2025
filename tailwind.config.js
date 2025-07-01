@tailwind base;
@tailwind components;
@tailwind utilities;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        heading: 'var(--heading)',
        'subtle-text': 'var(--subtle-text)',
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        muted: 'var(--muted)',
        'card-bg': 'var(--card-bg)',
        'modal-bg': 'var(--modal-bg)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.05)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
        xl: '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
  darkMode: 'media',
};
