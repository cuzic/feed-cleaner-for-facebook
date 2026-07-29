import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
  },
  plugins: [
    monkey({
      entry: 'src/debug.ts',
      userscript: {
        name: 'Facebook Feed Cleaner DEBUG',
        namespace: 'https://github.com/cuzic/feed-cleaner-for-facebook-debug',
        version: '2.2.0',
        description: 'Debug overlay: outlines matched CTA spans/wrappers instead of hiding them',
        match: ['https://m.facebook.com/*', 'https://mbasic.facebook.com/*'],
        grant: 'none',
        updateURL:
          'https://raw.githubusercontent.com/cuzic/feed-cleaner-for-facebook/main/dist/facebook-feed-cleaner-debug.user.js',
        downloadURL:
          'https://raw.githubusercontent.com/cuzic/feed-cleaner-for-facebook/main/dist/facebook-feed-cleaner-debug.user.js',
      },
      build: {
        fileName: 'facebook-feed-cleaner-debug.user.js',
      },
    }),
  ],
});
