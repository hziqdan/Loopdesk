import type { Config } from 'tailwindcss'
const v = (n: string) => `var(--${n})`
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { bg: v('bg'), card: v('card'), ink: v('ink'), mute: v('mute'), line: v('line'), soft: v('soft'), navy: v('navy'), brand: '#4F46E5', ok: '#10B981' } } },
} satisfies Config
