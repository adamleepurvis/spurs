export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          bg: '#0a0f1e',
          surface: '#121a2e',
          surface2: '#182137',
          border: '#232e47',
        },
        ink: {
          DEFAULT: '#eef1f8',
          dim: '#8d99b8',
        },
        accent: {
          DEFAULT: '#4f6df0',
          dim: '#324a9e',
        },
        gold: '#f2b544',
        positive: '#33d17a',
        danger: '#fb4562',
        sky2: '#4fb0e0',
      },
      fontFamily: {
        display: ['Oswald', 'Arial Narrow', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
