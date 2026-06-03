import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        bg: { value: '#0f0f13' },
        surface: { value: '#1a1a23' },
        border: { value: '#2a2a3a' },
        neon: { value: '#00f5d4' },
        neonPink: { value: '#ff2d95' },
        accent: { value: '#7c3aed' },
        textPrimary: { value: '#e2e8f0' },
        textSecondary: { value: '#94a3b8' },
      },
      fonts: {
        heading: { value: "'Press Start 2P', monospace" },
        body: { value: "'Space Mono', monospace" },
      },
    },
    semanticTokens: {
      colors: {
        _bg: { value: '{colors.bg}' },
        _surface: { value: '{colors.surface}' },
        _border: { value: '{colors.border}' },
        _neon: { value: '{colors.neon}' },
      },
    },
    recipes: {
      gameContainer: {
        className: 'game-container',
        base: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bg: 'bg',
          color: 'textPrimary',
          fontFamily: 'body',
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
