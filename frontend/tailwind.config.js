/**********************************************************
 * TailwindCSS configuration for NomadAI - Minimal Luxury
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
				// Pure Black
				black: {
					DEFAULT: '#000000',
					soft: '#0a0a0a',
				},
				// Luxury Gold
				gold: {
					50: '#fefdf8',
					100: '#fdf6e3',
					200: '#faecc1',
					300: '#f6dd95',
					400: '#f1c668',
					500: '#d4af37',
					600: '#c19b26',
					700: '#996f0a',
					800: '#7a5708',
					900: '#5c4206',
					DEFAULT: '#d4af37',
				},
				// Sophisticated Silver
				silver: {
					50: '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#9ca3af',
					500: '#c0c0c0',
					600: '#a8a8a8',
					700: '#808080',
					800: '#696969',
					900: '#4a4a4a',
					DEFAULT: '#c0c0c0',
				},
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
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
			},
			borderRadius: {
				'4xl': '2rem',
			},
			boxShadow: {
				'card': '0 4px 16px rgba(0, 0, 0, 0.6)',
				'gold': '0 2px 12px rgba(212, 175, 55, 0.2)',
				'subtle': '0 2px 8px rgba(0, 0, 0, 0.4)',
			},
			backdropBlur: {
				'xs': '2px',
			},
			animation: {
				'shimmer': 'shimmer 1.5s infinite',
			},
			keyframes: {
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
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
				'.glass-minimal': {
					background: 'rgba(0, 0, 0, 0.4)',
					'backdrop-filter': 'blur(20px)',
					border: '1px solid rgba(255, 255, 255, 0.06)',
				},
				'.glass-strong-minimal': {
					background: 'rgba(0, 0, 0, 0.7)',
					'backdrop-filter': 'blur(30px)',
					border: '1px solid rgba(255, 255, 255, 0.08)',
				},
				'.glass-luxury-minimal': {
					background: 'rgba(0, 0, 0, 0.8)',
					'backdrop-filter': 'blur(40px)',
					border: '1px solid rgba(212, 175, 55, 0.15)',
				},
			}
			addUtilities(newUtilities)
		}
	],
};