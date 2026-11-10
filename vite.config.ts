import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Membuka akses ke semua interface jaringan (Localhost, WiFi, dan LAN)
    port: 5173,
    strictPort: false,
    cors: true,
  },
})
