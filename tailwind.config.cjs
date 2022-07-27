const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			white: '#ffffff',
			error: '#f58989',
			warning: '#f5ca89',
			success: '#79c472',
			active: '#5081a6',
			semiactive: '#89b8dd',
			inactive: '#cfe3f0',
			color: '#999',
			danger: '#FF478F',
			info: '#BEA6FF',
			'royal-blue': {
				50: '#f1f4fd',
				100: '#dfe7fa',
				200: '#c6d5f7',
				300: '#9fbbf1',
				400: '#7297e8',
				500: '#4f72e0',
				600: '#3c57d4',
				700: '#3344c2',
				800: '#2f3a9e',
				900: '#2b357d'
			},
			'pickled-bluewood': {
				50: '#F8FAFC',
				100: '#F1F5F9',
				200: '#E2E8F0',
				300: '#CBD5E1',
				400: '#94A3B8',
				500: '#64748B',
				600: '#475569',
				700: '#334156',
				800: '#1E293B',
				900: '#0F172A'
			}
		},
		extend: {}
	},

	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
};

module.exports = config;
