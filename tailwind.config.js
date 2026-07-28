/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          yellow: '#FFE600',
          cyan: '#00F0FF',
          magenta: '#FF00A8',
          green: '#39FF14',
          red: '#FF2D2D',
          dark: '#0A0A0F',
          darker: '#050507',
          panel: '#11111A',
          steel: '#1A1A24',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Rajdhani"', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'flicker': 'flicker 3s linear infinite',
        'scan': 'scan 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glitch': 'glitch 2.5s infinite',
        'glitch-skew': 'glitch-skew 2.5s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'grid-move': 'grid-move 20s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'ticker': 'ticker 30s linear infinite',
        'rise': 'rise 0.8s ease-out forwards',
        'flicker-in': 'flicker-in 0.6s steps(8) forwards',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'glitch-in': 'glitch-in 0.7s steps(6) forwards',
        'slide-left': 'slide-left 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slide-right 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out infinite',
        'rgb-split': 'rgb-split 3s ease-in-out infinite',
        'scan-sweep': 'scan-sweep 4s linear infinite',
        'blink': 'blink 1.2s steps(2) infinite',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '1' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.4' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'glitch-skew': {
          '0%, 100%': { transform: 'skewX(0deg)' },
          '48%, 52%': { transform: 'skewX(10deg)' },
          '49%, 51%': { transform: 'skewX(-10deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', filter: 'blur(8px)' },
          '50%': { opacity: '1', filter: 'blur(12px)' },
        },
        'grid-move': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 50px' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'flicker-in': {
          '0%': { opacity: '0' },
          '10%': { opacity: '0.8' },
          '15%': { opacity: '0.1' },
          '20%': { opacity: '0.9' },
          '25%': { opacity: '0.2' },
          '30%': { opacity: '1' },
          '35%': { opacity: '0.3' },
          '40%': { opacity: '1' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.7) translateY(20px)' },
          '60%': { opacity: '1', transform: 'scale(1.05) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'glitch-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px) skewX(15deg)', filter: 'hue-rotate(90deg)' },
          '20%': { opacity: '0.6', transform: 'translateX(10px) skewX(-10deg)', filter: 'hue-rotate(180deg)' },
          '40%': { opacity: '0.3', transform: 'translateX(-5px) skewX(5deg)' },
          '60%': { opacity: '0.8', transform: 'translateX(3px) skewX(-2deg)', filter: 'hue-rotate(0deg)' },
          '100%': { opacity: '1', transform: 'translateX(0) skewX(0)', filter: 'none' },
        },
        'slide-left': {
          '0%': { opacity: '0', transform: 'translateX(-60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-right': {
          '0%': { opacity: '0', transform: 'translateX(60px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'neon-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,240,255,0.3), inset 0 0 8px rgba(0,240,255,0.05)' },
          '50%': { boxShadow: '0 0 24px rgba(0,240,255,0.6), inset 0 0 16px rgba(0,240,255,0.1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '50%': { transform: 'translateX(2px)' },
          '75%': { transform: 'translateX(-1px)' },
        },
        'rgb-split': {
          '0%, 100%': { textShadow: '0 0 0 transparent' },
          '25%': { textShadow: '-2px 0 #FF00A8, 2px 0 #00F0FF' },
          '50%': { textShadow: '0 0 0 transparent' },
          '75%': { textShadow: '2px 0 #FF00A8, -2px 0 #00F0FF' },
        },
        'scan-sweep': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '0.8' },
          '90%': { opacity: '0.8' },
          '100%': { transform: 'translateY(2000%)', opacity: '0' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
