/**********************************************************
 * TailwindCSS configuration for Nomad AI Premium Frontend
 **********************************************************/

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				// Premium Brand Palette
				brand: {
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b',
					DEFAULT: '#10b981',
				},
				// Premium Blue Palette
				ocean: {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
					DEFAULT: '#3b82f6',
				},
				// Premium Warm Palette
				amber: {
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#f59e0b',
					600: '#d97706',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f',
					DEFAULT: '#f59e0b',
				},
				// Dark Theme Colors
				dark: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
					950: '#0c1729',
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				serif: ['Playfair Display', 'serif'],
				mono: ['JetBrains Mono', 'monospace'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }],
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
				'144': '36rem',
			},
			borderRadius: {
				'4xl': '2rem',
				'5xl': '2.5rem',
			},
			boxShadow: {
				'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
				'card': '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
				'button': '0 4px 15px rgba(16, 185, 129, 0.3)',
				'glow': '0 0 30px rgba(16, 185, 129, 0.5)',
				'inner-premium': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
			},
			backdropBlur: {
				'xs': '2px',
				'4xl': '72px',
			},
			animation: {
				'float': 'float 6s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'bounce-slow': 'bounce 2s infinite',
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				glow: {
					'0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
					'50%': { boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'premium-dark': 'linear-gradient(135deg, #0c1729 0%, #1a2332 25%, #2d3748 50%, #1a2332 75%, #0c1729 100%)',
				'premium-card': 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.08) 100%)',
			},
			screens: {
				'xs': '475px',
				'3xl': '1600px',
			},
		},
	},
	plugins: [
		function({ addUtilities }) {
			const newUtilities = {
				'.text-gradient': {
					background: 'linear-gradient(135deg, #f8fafc 0%, #10b981 100%)',
					'-webkit-background-clip': 'text',
					'-webkit-text-fill-color': 'transparent',
					'background-clip': 'text',
				},
				'.glass': {
					background: 'rgba(255, 255, 255, 0.05)',
					'backdrop-filter': 'blur(20px)',
					border: '1px solid rgba(255, 255, 255, 0.1)',
				},
				'.glass-strong': {
					background: 'rgba(255, 255, 255, 0.1)',
					'backdrop-filter': 'blur(30px)',
					border: '1px solid rgba(255, 255, 255, 0.2)',
				},
			}
			addUtilities(newUtilities)
		}
	],
};