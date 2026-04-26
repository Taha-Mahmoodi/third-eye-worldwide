/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx,mdx}',
    './lib/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  // Existing reset lives in app/globals.css. Skip Tailwind's preflight so it
  // does not clobber the project's design-token system.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        foreground: 'var(--fg)',
        border: 'var(--border)',
        input: 'var(--border)',
        ring: 'var(--focus-ring)',
        primary: {
          DEFAULT: 'var(--brand)',
          foreground: 'var(--fg-inverse)',
        },
        secondary: {
          DEFAULT: 'var(--bg-subtle)',
          foreground: 'var(--fg)',
        },
        muted: {
          DEFAULT: 'var(--bg-subtle)',
          foreground: 'var(--fg-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--fg-inverse)',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
