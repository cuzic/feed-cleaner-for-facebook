import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
  },
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Feed Cleaner for Facebook',
        namespace: 'https://github.com/cuzic/feed-cleaner-for-facebook',
        version: '2.0.0',
        description:
          'Unofficial, not affiliated with or endorsed by Meta/Facebook. Hides suggested/ad posts (Ad/Add friend/Follow/Join CTAs), the suggested-groups carousel, the stories bar (mobile), and the Follow/Join/Reels/Stories units (desktop) on Facebook. Works in any Facebook UI language; see README to add or fix a language.',
        match: ['https://m.facebook.com/*', 'https://www.facebook.com/*'],
        'run-at': 'document-idle',
        license: 'MIT',
        grant: 'none',
        updateURL:
          'https://raw.githubusercontent.com/cuzic/feed-cleaner-for-facebook/main/dist/facebook-feed-cleaner.user.js',
        downloadURL:
          'https://raw.githubusercontent.com/cuzic/feed-cleaner-for-facebook/main/dist/facebook-feed-cleaner.user.js',
        supportURL: 'https://github.com/cuzic/feed-cleaner-for-facebook/issues',
      },
      build: {
        fileName: 'facebook-feed-cleaner.user.js',
      },
    }),
  ],
});
