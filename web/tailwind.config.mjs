/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// primary removed (duplicate), see below
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

				// --- SEMANTIC TOKENS ---
				brand: {
					primary: '#6366f1', // Indigo 500
					secondary: '#a855f7', // Purple 500
				},
				sensor: {
					wired: '#818cf8',   // Indigo 400
					wireless: '#34d399', // Emerald 400
					humidity: '#38bdf8', // Sky 400
				},
				status: {
					online: '#10b981',  // Emerald 500
					success: '#10b981', // Emerald 500
					warning: '#fbbf24', // Amber 400
					error: '#f87171',   // Red 400
					offline: '#f87171', // Red 400
					info: '#60a5fa',    // Blue 400
				},
				glass: {
					border: 'rgba(255, 255, 255, 0.05)',
				},

				// Standard Semantic Tokens (Shadcn-like)
				background: '#020617', // slate-950
				foreground: '#e2e8f0', // slate-200

				card: {
					DEFAULT: 'rgba(2, 6, 23, 0.5)', // slate-950/50
					foreground: '#e2e8f0',
				},
				popover: {
					DEFAULT: '#020617',
					foreground: '#e2e8f0',
				},
				primary: {
					DEFAULT: '#6366f1', // Indigo 500
					foreground: '#ffffff',
					hover: '#4f46e5',
				},
				secondary: {
					DEFAULT: 'rgba(255, 255, 255, 0.1)',
					foreground: '#ffffff',
				},
				muted: {
					DEFAULT: '#1e293b', // slate-800
					foreground: '#94a3b8', // slate-400
				},
				accent: {
					DEFAULT: 'rgba(255, 255, 255, 0.1)',
					foreground: '#f8fafc',
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#f8fafc',
				},
				border: 'rgba(255, 255, 255, 0.1)',
				input: 'rgba(255, 255, 255, 0.1)',
				ring: '#6366f1',
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
				'shimmer': 'shimmer 3s linear infinite',
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
				'shimmer': {
					'0%': { backgroundPosition: '200% center' },
					'100%': { backgroundPosition: '-200% center' },
				},
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}
