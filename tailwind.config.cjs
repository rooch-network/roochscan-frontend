/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    spacing: Array.from({ length: 300 }, (_, index) => ({ [index + 1]: (index + 1) + 'px' }))
        .reduce((result, current) => Object.assign(result, current), {}),
    screens: {
      ssm:"240px",
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      'blue': '#1fb6ff',
      "dark-blue":"#005f90",
      "dark-gray":"#616a71",
      'purple': '#7e5bef',
      'pink': '#ff49db',
      'orange': '#ff7849',
      'green': '#13ce66',
      'yellow': '#ffc82c',
      'gray-dark': '#273444',
      'gray': '#8492a6',
      'gray-light': '#d3dce6',
      'white': '#ffffff',
      'midnight': '#121063',
      'metal': '#565584',
      'tahiti': '#3ab7bf',
      'silver': '#ecebff',
      'bubble-gum': '#ff77e9',
      'bermuda': '#78dcca',
      "steel-blue":"#1986c1",
      "light-gray":"#e6e9ec",
      "light-gray-300":"#e1e3e8",
      "off-white":"#f7f8f9",
      "black":"#000",
      
    },
    extend: {},
  },
  plugins: [],
}

