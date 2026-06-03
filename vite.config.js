import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : mode === 'production' ? '/Busca-minas/' : '/',
}))
