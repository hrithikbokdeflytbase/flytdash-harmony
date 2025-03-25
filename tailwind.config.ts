
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          "50": "hsla(223,54%,72%,1)",
          "100": "#6D8AD3",
          "200": "#496DC8",
          "300": "#3A57A0",
          "400": "#2C4178"
        },
        "primary-states": {
          "hover": "#4262B4",
          "pressed": "#3A57A0",
          "focused": "#496DC8",
          "disabled": "#3D3D3D"
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          "50": "#4F5C7D",
          "100": "#485575",
          "200": "#414E6D",
          "300": "#394560",
          "400": "#323B55"
        },
        "secondary-states": {
          "hover": "#465576",
          "pressed": "#4D5A7A",
          "focused": "#465576",
          "disabled": "#3D3D3D"
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        "background": {
          "level-1": "#1E1E20",
          "level-2": "#262627",
          "level-3": "#2E2E30",
          "level-4": "#373739",
          "level-5": "#414143",
          "bg": "#111113"
        },
        "surface": {
          "surface": "#ececee"
        },
        "surface-states": {
          "hover": "rgba(236, 236, 238, 0.1)",
          "pressed": "rgba(236, 236, 238, 0.12)",
          "focused": "rgba(236, 236, 238, 0.1)",
          "selected": "rgba(49, 54, 73, 1)",
          "selected-n": "rgba(236, 236, 238, 0.08)",
          "disabled": "rgba(61, 61, 61, 1)"
        },
        "outline": {
          "primary": "rgba(255, 255, 255, 0.12)",
          "secondary": "rgba(255, 255, 255, 0.24)",
          "tertiary": "rgba(255, 255, 255, 0.24)",
          "disabled": "rgba(255, 255, 255, 0.24)"
        },
        "text-icon": {
          "01": "rgba(255, 255, 255, 0.84)",
          "02": "rgba(255, 255, 255, 0.54)",
          "disabled": "rgba(255, 255, 255, 0.24)"
        },
        "others": {
          "scrim": "rgba(0, 0, 0, 0.5)"
        },
        "success": {
          "50": "#78CEA7",
          "100": "#4BBE8A",
          "200": "#1EAE6D",
          "300": "#188B57",
          "400": "#126841"
        },
        "error": {
          "50": "#FB9189",
          "100": "#F96C61",
          "200": "#F8473A",
          "300": "#C6392E",
          "400": "#952B23"
        },
        "caution": {
          "50": "#FED35D",
          "100": "#FEC43E",
          "200": "#FDB022",
          "300": "#F79009",
          "400": "#DC6803"
        },
        "warning": {
          "50": "#F7A47A",
          "100": "#F4854E",
          "200": "#F16722",
          "300": "#C1521B",
          "400": "#913E14"
        },
        "info": {
          "50": "#99CCFF",
          "100": "#5D9FE2",
          "200": "#3399FF",
          "300": "#0080FF",
          "400": "#1F5285"
        },
        "container": {
          "success": "rgba(30, 174, 109, 0.2)",
          "error": "rgba(248, 71, 58, 0.2)",
          "caution": "rgba(253, 176, 34, 0.15)",
          "warning": "rgba(241, 103, 34, 0.2)",
          "info": "rgba(51, 153, 255, 0.2)"
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        "50": "2px",
        "100": "4px",
        "150": "6px",
        "200": "8px",
        "300": "12px",
      },
      spacing: {
        "50": "2px",
        "100": "4px",
        "200": "8px",
        "300": "12px",
        "400": "16px",
        "500": "20px",
        "600": "24px",
        "800": "32px",
        "1000": "40px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-down": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-in-up": "slide-in-up 0.3s ease-out",
        "slide-in-down": "slide-in-down 0.3s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities }) {
      const newUtilities = {
        '.fb-mega': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.25rem',
          fontWeight: '500',
          lineHeight: '1.5rem',
          letterSpacing: '-0.0125rem',
          fontStyle: 'normal',
        },
        '.fb-title1-semi': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '600',
          lineHeight: '1.75rem',
          fontStyle: 'normal',
        },
        '.fb-title2-medium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.125rem',
          fontWeight: '500',
          lineHeight: '1.75rem',
          fontStyle: 'normal',
        },
        '.fb-title1-medium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          fontWeight: '500',
          lineHeight: '1.75rem',
          fontStyle: 'normal',
        },
        '.fb-title2-regular': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.75rem',
          fontStyle: 'normal',
        },
        '.fb-body1-medium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem',
          fontWeight: '500',
          lineHeight: '1.75rem',
          fontStyle: 'normal',
        },
        '.fb-body2-regular': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem',
          fontWeight: '400',
          lineHeight: '1.75rem',
          fontStyle: 'normal',
        },
        '.fb-body3-mono': {
          fontFamily: 'Fira Code, monospace',
          fontSize: '0.875rem',
          fontWeight: '400',
          lineHeight: '1.25rem',
          letterSpacing: '0.00131rem',
          fontStyle: 'normal',
        },
        '.fb-body4-medium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          fontWeight: '500',
          lineHeight: '1.75rem',
          fontStyle: 'normal',
        },
        '.fb-body5-regular': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          fontWeight: '400',
          lineHeight: '1.75rem',
          fontStyle: 'normal',
        },
        '.fb-tiny1-medium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.6875rem',
          fontWeight: '500',
          lineHeight: '1.75rem',
          fontStyle: 'normal',
        },
        '.fb-tiny2-medium': {
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.625rem',
          fontWeight: '500',
          lineHeight: '1.75rem',
          fontStyle: 'normal',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
} satisfies Config;
