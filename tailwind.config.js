/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme.js';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		 screens: {
            '2xl&down': { max: '1535px' },
            'xl&down': { max: '1279px' },
            'lg&down': { max: '1023px' },
            'md&down': { max: '767px' },
            'sm&down': { max: '639px' },
            'xl&up': { min: '1280px' },
            'lg&up': { min: '1024px' },
            'md&up': { min: '768px' },
            'sm&up': { min: '640px' },

            ...defaultTheme.screens,
        },
		extend: {}
	},
	plugins: []
};
