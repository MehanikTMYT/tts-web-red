import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем __dirname в ES-модуле
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  resolve: {
    alias: {
      // Настройка псевдонима @ на папку src
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.vue', '.json', '.css'] // Расширения для автоматического разрешения
  }
});