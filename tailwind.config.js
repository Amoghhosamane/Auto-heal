/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#060B18', // deepest void background
          900: '#0A1226', // base page background
          850: '#0E1935', // card / panel background
          800: '#14234B', // border / elevated card
          750: '#1A2E62', // hover borders & dividers
          700: '#223C7E', // prominent borders
        },
        healblue: {
          50: '#F2F7FF',
          100: '#E5EEFE',
          200: '#C7DCFE',
          300: '#96BFFC',
          400: '#609BFA',
          500: '#3B82F6', // core brand electric blue
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
