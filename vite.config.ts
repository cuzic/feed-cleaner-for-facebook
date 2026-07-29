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
        version: '2.2.1',
        description:
          "Unofficial, not affiliated with or endorsed by Meta/Facebook. Built for the niche most similar scripts miss: works on m.facebook.com (mobile) in ANY Facebook UI language (7 fully verified incl. its own menu/dialog text, 57 more with ad-label coverage), actively maintained, and runs in any userscript manager (verified in Violentmonkey on Microsoft Edge for Android, since Chrome for Android doesn't support extensions at all). Hides suggested/ad posts (Ad/Add friend/Follow/Join CTAs), the suggested-groups carousel, the stories bar (mobile), and the Follow/Join/Reels/Stories units (desktop). Each CTA category, and a hidden-posts log with a fade-out/badge-pop/milestone-celebration polish, is independently toggleable from the menu. Don't see your language? Fix it yourself from that same menu, on the spot, no code needed. See README for details and full language list.",
        match: ['https://m.facebook.com/*', 'https://www.facebook.com/*'],
        'run-at': 'document-idle',
        license: 'MIT',
        grant: ['GM_getValue', 'GM_setValue', 'GM_registerMenuCommand'],
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
