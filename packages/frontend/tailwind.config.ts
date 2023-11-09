import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/common/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D3E47',
        white: '#FFFFFF',
        light: '#EEF2F3',
        lightHover: '#E6EBED',
        medium: '#C5CDD1',
        mediumHover: '#B2BCC2',
        accent: '#4F14EE',
        accentHover: '#451AB8',
        success: '#2BD18F',
        attention: '#FFA800',
        error: '#FC367D',
      },
    },
  },
  plugins: [require('daisyui')],
}
export default config
