/**********************************************************
 * TailwindCSS configuration for NomadAI Sophisticated Dark Theme
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
				// Sophisticated Gold Palette
				gold: {
					50: '#fefdf8',
					100: '#fdf6e3',
					200: '#faecc1',
					300: '#f6dd95',
					400: '#f1c668',
					500: '#daa520',
					600: '#b8860b',
					700: '#996f0a',
					800: '#7a5708',
					900: '#5c4206',
					DEFAULT: '#daa520',
				},
				// Royal Magenta Palette
				magenta: {
					50: '#fdf4ff',
					100: '#fae8ff',
					200: '#f5d0fe',
					300: '#f0abfc',
					400: '#e879f9',
					500: '#d946ef',
					600: '#c026d3',
					700: '#a21caf',
					800: '#86198f',
					900: '#701a75',
					950: '#4b0082',
					royal: '#8b008b',
					DEFAULT: '#8b008b',
				},
				// Sophisticated Silver/Gray Palette
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
				// Deep Brown Palette
				brown: {
					50: '#fdf8f6',
					100: '#f2e8e5',
					200: '#eaddd7',
					300: '#e0cec7',
					400: '#d2bab0',
					500: '#bfa094',
					600: '#a18072',
					700: '#8b4513',
					800: '#a0522d',
					900: '#654321',
					950: '#3e2723',
					DEFAULT: '#8b4513',
				},
				// Sophisticated Dark Grays
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
					950: '#0a0a0a',
					DEFAULT: '#1a1a1a',
				},
				// Pure Black variations
				black: {
					50: '#f7f7f7',
					100: '#e3e3e3',
					200: '#c8c8c8',
					300: '#a4a4a4',
					400: '#818181',
					500: '#666666',
					600: '#515151',
					700: '#434343',
					800: '#383838',
					900: '#000000',
					pure: '#000000',
					DEFAULT: '#000000',
				}
			},
			fontFamily: {
				sans: ['Montserrat', 'system-ui', 'sans-serif'],
				serif: ['Crimson Text', 'serif'],
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
				'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
				'card': '0 15px 35px -5px rgba(0, 0, 0, 0.6)',
				'gold': '0 8px 25px rgba(218, 165, 32, 0.3)',
				'magenta': '0 8px 25px rgba(139, 0, 139, 0.3)',
				'silver': '0 8px 25px rgba(192, 192, 192, 0.2)',
				'brown': '0 8px 25px rgba(139, 69, 19, 0.3)',
				'inner-luxury': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
				'glow-gold': '0 0 40px rgba(218, 165, 32, 0.6)',
				'glow-magenta': '0 0 40px rgba(139, 0, 139, 0.6)',
			},
			backdropBlur: {
				'xs': '2px',
				'4xl': '72px',
			},
			animation: {
				'luxury-float': 'luxuryFloat 8s ease-in-out infinite',
				'gold-glow': 'goldGlow 3s ease-in-out infinite',
				'magenta-glow': 'magentaGlow 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'bounce-slow': 'bounce 2s infinite',
			},
			keyframes: {
				luxuryFloat: {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-8px) rotate(1deg)' },
				},
				goldGlow: {
					'0%, 100%': { boxShadow: '0 0 20px rgba(218, 165, 32, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(218, 165, 32, 0.6)' },
				},
				magentaGlow: {
					'0%, 100%': { boxShadow: '0 0 20px rgba(139, 0, 139, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(139, 0, 139, 0.6)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'sophisticated-dark': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%, #0a0a0a 100%)',
				'luxury-card': 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%)',
				'gold-gradient': 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)',
				'magenta-gradient': 'linear-gradient(135deg, #8b008b 0%, #4b0082 100%)',
				'silver-gradient': 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)',
				'brown-gradient': 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
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
				'.text-gradient-gold': {
					background: 'linear-gradient(135deg, #f5f5f5 0%, #daa520 50%, #8b008b 100%)',
					'-webkit-background-clip': 'text',
					'-webkit-text-fill-color': 'transparent',
					'background-clip': 'text',
				},
				'.text-gradient-luxury': {
					background: 'linear-gradient(135deg, #f5f5f5 0%, #daa520 100%)',
					'-webkit-background-clip': 'text',
					'-webkit-text-fill-color': 'transparent',
					'background-clip': 'text',
				},
				'.glass-dark': {
					background: 'rgba(0, 0, 0, 0.3)',
					'backdrop-filter': 'blur(25px)',
					border: '1px solid rgba(192, 192, 192, 0.1)',
				},
				'.glass-strong-dark': {
					background: 'rgba(0, 0, 0, 0.5)',
					'backdrop-filter': 'blur(35px)',
					border: '1px solid rgba(192, 192, 192, 0.2)',
				},
				'.glass-luxury': {
					background: 'rgba(0, 0, 0, 0.7)',
					'backdrop-filter': 'blur(40px)',
					border: '1px solid rgba(218, 165, 32, 0.2)',
				},
				'.btn-gold': {
					background: 'linear-gradient(135deg, #daa520 0%, #b8860b 100%)',
					color: '#000',
					'font-weight': '600',
					padding: '1rem 2.5rem',
					'border-radius': '8px',
					border: 'none',
					cursor: 'pointer',
					transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					'box-shadow': '0 8px 25px rgba(218, 165, 32, 0.3)',
					'text-transform': 'uppercase',
					'letter-spacing': '0.5px',
					'font-size': '0.9rem',
					'min-height': '44px',
				},
				'.btn-magenta': {
					background: 'linear-gradient(135deg, #8b008b 0%, #4b0082 100%)',
					color: 'white',
					'font-weight': '600',
					padding: '1rem 2.5rem',
					'border-radius': '8px',
					border: 'none',
					cursor: 'pointer',
					transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					'box-shadow': '0 8px 25px rgba(139, 0, 139, 0.3)',
					'text-transform': 'uppercase',
					'letter-spacing': '0.5px',
					'font-size': '0.9rem',
					'min-height': '44px',
				},
			}
			addUtilities(newUtilities)
		}
	],
};