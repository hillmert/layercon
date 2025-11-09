/** @type {import('tailwindcss').Config} */
export default {
darkMode: ['class'],
content: [
'./index.a',
'./src/**/*.{ts,tsx}'
],
theme: {
extend: {
fontFamily: {
sans: ['Inter', 'system-ui', 'sans-serif'],
mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
},
borderRadius: { '2xl': '16px' },
boxShadow: { soft: '0 6px 24px rgba(0,0,0,0.08)' },
colors: {
// Tachyus schema via CSS variables (light/dark swap)
primary: 'rgb(var(--t-primary) / <alpha-value>)',
secondary: 'rgb(var(--t-secondary) / <alpha-value>)',
success: 'rgb(var(--t-success) / <alpha-value>)',
warning: 'rgb(var(--t-warning) / <alpha-value>)',
danger: 'rgb(var(--t-danger) / <alpha-value>)',
surface: 'rgb(var(--t-surface) / <alpha-value>)',
on: 'rgb(var(--t-on) / <alpha-value>)',
muted: 'rgb(var(--t-muted) / <alpha-value>)'
}
}
},
plugins: []
}