import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // (Keep your existing plugins)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ADD THIS SECTION:
  server: {
    host: '0.0.0.0', // This allows the app to be accessed externally
    allowedHosts: ['nursingbackend-ooc7.onrender.com'], // This fixes the "Blocked request" error
  }
})