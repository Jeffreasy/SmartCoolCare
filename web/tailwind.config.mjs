/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#6366f1', // Indigo 500
					hover: '#4f46e5',   // Indigo 600
				},
				secondary: '#a855f7', // Purple 500
				success: '#10b981',   // Emerald 500
				warning: '#f59e0b',   // Amber 500
				danger: '#ef4444',    // Red 500
				info: '#3b82f6',      // Blue 500
				surface: {
					DEFAULT: '#f8fafc', // Slate 50
					dark: '#020617',    // Slate 950 (matching index.astro)
				},
				// Semantic aliases for Layout
				bg: '#020617', // Maps to surface.dark / slate-950
				text: '#e2e8f0', // Maps to slate-200 for good contrast
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			boxShadow: {
				'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
				'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
			},
			animation: {
				'pulse-slow': 'pulse-slow 8s infinite ease-in-out',
				'gradient': 'gradient 8s linear infinite',
			},
			// Add custom Perspective for 3D transforms
			backgroundImage: {
				'glass-gradient': 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
			},

			keyframes: {
				'pulse-slow': {
					'0%, 100%': { opacity: '0.7', transform: 'translate(50%, -50%) scale(1)' },
					'50%': { opacity: '0.5', transform: 'translate(50%, -50%) scale(1.1)' },
				},
				'gradient': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' },
				},
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}
