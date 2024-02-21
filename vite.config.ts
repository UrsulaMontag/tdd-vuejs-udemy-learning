import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig( {
  plugins: [ vue() ],
  resolve: {
    alias: {
      '@': fileURLToPath( new URL( './src', import.meta.url ) ),
      test: fileURLToPath( new URL( './test', import.meta.url ) )
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/images': 'http://localhost:8080'

    }
  }
} );
