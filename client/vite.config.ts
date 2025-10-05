import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@operations-transformations-core': path.resolve(__dirname, '../operation-transformations-core'),
    },
  },
});
