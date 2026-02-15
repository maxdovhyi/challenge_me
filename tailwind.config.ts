import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        done: '#16A34A',
        pending: '#CA8A04',
        missed: '#DC2626',
        joker: '#7C3AED',
      },
    },
  },
  plugins: [],
}
export default config
