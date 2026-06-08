/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        watah: {
          cream: '#F5F5F5',
          watermelon: '#C0394B',
          lime: '#A8C64F',
          forest: '#4A7C2A',
          onyx: '#1A1A1A',
        },
      },
      fontFamily: {
        brand: ['BrandFont', 'sans-serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      backdropBlur: {
        xl: '16px',
      },
    },
  },
  plugins: [],
};
