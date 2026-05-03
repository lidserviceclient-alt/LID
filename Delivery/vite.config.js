import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/ 
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: '0.0.0.0',
    port: 3005,
    https: true,
    proxy: {
      '/api': {
        target: 'https://api.lidshopping.com/lid',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
