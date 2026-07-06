import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: unknown) {
          const idStr = id as string
          if (idStr.includes('three') || idStr.includes('@react-three')) return 'three'
          if (idStr.includes('gsap') || idStr.includes('framer-motion')) return 'animation'
          if (idStr.includes('canvas-confetti') || idStr.includes('fireworks-js')) return 'confetti'
        },
      },
    },
  },
})
