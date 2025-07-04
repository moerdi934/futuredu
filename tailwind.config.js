/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'tw-',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',         // halaman Next.js
    './components/**/*.{js,ts,jsx,tsx}',    // komponen umum
    './layout/**/*.{js,ts,jsx,tsx}',        // jika kamu pakai folder layout
    './context/**/*.{js,ts,jsx,tsx}',       // context providers
    './styles/**/*.{css,scss}',             // kalau ada CSS/SCSS dengan @apply
  ],
  theme: { extend: {} },
  plugins: [],
}
