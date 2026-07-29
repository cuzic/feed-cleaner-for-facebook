# Feed Cleaner for Facebook

An unofficial userscript that hides the noisy, non-chronological parts of the
Facebook feed: sponsored/ad posts, "Add Friend"/"Follow"/"Join" suggestion
posts (all on both mobile and desktop), the suggested-groups carousel, Reels,
and the Stories bar/tray.

Each of the four CTA categories (Ad / Add friend / Follow / Join) can be
turned on or off independently from your userscript manager's menu (e.g.
right-click the Tampermonkey icon → the script's menu items). Toggling
reloads the page to apply. The suggested-groups carousel, Reels, and Stories
bar aren't independently toggleable yet. The menu itself (and the dialogs
below) are localized in ja/en/es/fr/pt/de/ko, matching Facebook's own
effective UI language; other languages fall back to English.

That same menu also has "⚙️ Set your language's words" — a small on-page
form for the same four categories, prefilled with whatever word this script
is currently using as a placeholder. If you speak a language this script
doesn't handle well yet, you can type in the correct word yourself, right on
your own Facebook feed, and save — no source edit, rebuild, or PR required.
(It's still worth sending a PR to add it to `src/i18n.ts` so everyone else
gets it too, but it's no longer required just to fix things for yourself.)

There's also a "Show hidden-posts log" toggle (off by default). When on, a
small `🧹 N` badge sits in the bottom-left corner; tapping it expands to show
the last 10 hidden items as `category · short snippet`, so you can sanity-check
what's actually being hidden rather than taking it on faith. `N` is a running
total for the page, not just what's in that list. It only ever shows content
already visible to you in your own feed, and it's gone as soon as you turn
the toggle back off.

**Safety guard against over-matching:** if a CTA match's ancestor wrapper
turns out to be larger than a few screens' worth of height, it's skipped
(with a one-time `console.warn`) instead of hidden — a single post is never
that tall, so anything that size is almost certainly a much bigger container
(e.g. the whole feed) that a looser-than-intended match should not be allowed
to hide entirely.

Not affiliated with or endorsed by Meta/Facebook.

## Install

- **Greasy Fork**: _(link goes here once published — see [Publishing](#publishing))_
- **Directly from GitHub** (always the latest `main`): install
  [`dist/facebook-feed-cleaner.user.js`](./dist/facebook-feed-cleaner.user.js)
  with [Tampermonkey](https://www.tampermonkey.net/) / Greasemonkey / Violentmonkey.
  The script's `@updateURL`/`@downloadURL` point back at this raw GitHub file,
  so once installed it auto-updates whenever `main` changes.

A [debug build](./dist/facebook-feed-cleaner-debug.user.js) is also available —
instead of hiding anything, it draws a red outline around every text node it
recognizes as a CTA and a blue outline around the post wrapper it would hide.
Useful when a post isn't being hidden and you want to see what it's matching.

## Works in any Facebook UI language

Facebook's CTA text ("Sponsored", "Follow", "参加する", …) is
UI-language-dependent, so matching is driven by a small per-language
dictionary (`src/i18n.ts`) keyed by `<html lang>` / `navigator.language`,
with English as a fallback for anything the current language's dictionary is
missing.

`ja`/`en`/`es`/`fr`/`pt`/`de`/`ko` were checked live (Facebook's own
"Language and Region" account setting switched per language, on Chrome for
Android against `m.facebook.com` — not the browser's language, which Facebook
mostly ignores once you're logged in). That live testing only covered
`m.facebook.com` (mobile); ad/add-friend-hiding on `www.facebook.com`
(desktop) reuses the same matching technique but is unverified against the
current desktop DOM — if it stops working after a Facebook redesign, that's
the first thing to check (see [Development](#development) for how to test a
change locally). Beyond those, `src/i18n.ts` also
exports `AD_WORDS_BY_LANG`, an `ad`("Sponsored"/"Ad" label)-only word list
covering ~60 more languages, cross-referenced from the
["Facebook Unsponsored"](https://greasyfork.org/en/scripts/371822-facebook-unsponsored)
userscript (source at [nmtrung/greasemonkey-scripts](https://github.com/nmtrung/greasemonkey-scripts)) —
those entries are Facebook's own UI microcopy as that project observed it,
not that project's original expression, so the words are reused here even
though that project's own code carries no declared license; see the comment
above `AD_WORDS_BY_LANG` for the full reasoning. It's collected from
Facebook's older desktop UI, so treat it as a good starting point rather than
verified truth — cross-checks against the current mobile UI landed exactly
right for `ja`/`zh-hans`/`zh-hant` but wrong for `en` ("Sponsored" there vs.
"Ad" on mobile today). Every one of those ~60 languages' ad-words is merged
in unconditionally at runtime (not just the detected language's), since a
post legitimately starting with, say, the Finnish word for "Sponsored" on a
Japanese feed is effectively impossible — so this only adds coverage, with
no realistic false-positive risk. Everything else (`addFriend`, `follow`,
`join`, `suggestedGroups`, `createStory`, `reels`, `feedStories` for
languages without a full `I18N` entry) is a best-effort guess or falls back
to English. A wrong or missing entry just means nothing gets hidden in that
language (a safe failure), never that the wrong thing gets hidden.

**Just want it working in your own language, right now?** Set your Facebook
account's display language (Settings → Language and Region — not just your
browser/device language, which Facebook ignores once you're logged in), then
open the "⚙️ Set your language's words" menu described above and fill in the
four words. Done — no repo checkout needed.

**To contribute the fix back for everyone else:**

1. Set your Facebook account's display language as above.
2. Install the [debug build](./dist/facebook-feed-cleaner-debug.user.js) and
   open your feed — the overlay lists every CTA text it found.
3. Add or correct the entry for your language code in `src/i18n.ts`'s
   `I18N` (see the `Dict` interface for the fields to fill in: `ad`,
   `addFriend`, `follow`, `join`, `suggestedGroups`, `createStory`, `reels`,
   `feedStories`) — or, if you only have the `ad`/"Sponsored" word for now,
   add or correct just that language's entry in `AD_WORDS_BY_LANG` instead.
4. `pnpm build` and confirm the generated `dist/*.user.js` hides the right
   posts, then open a PR.

Adding a new language to `src/ui-i18n.ts` (the menu/dialog text this script
shows *about itself*, as opposed to `src/i18n.ts`'s Facebook-observed CTA
text) is a separate, independent contribution — see the `UiStrings`
interface there for the full list of strings to translate.

## Development

```sh
pnpm install
pnpm dev          # vite dev server with live reload (see vite-plugin-monkey docs)
pnpm build        # builds both dist/facebook-feed-cleaner.user.js and the debug build
pnpm typecheck
```

Built with [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey).
Source lives in `src/`; `dist/*.user.js` are the built, installable
userscripts and are committed to the repo so the GitHub raw links above
always work without requiring a build step.

## Publishing

- **GitHub**: push to `main`; the raw-file install link above just works.
  Tag releases (`vX.Y.Z`) matching `package.json`'s version when you want a
  citable snapshot.
- **Greasy Fork**: create a new script from
  `dist/facebook-feed-cleaner.user.js`, or import it by URL from the raw
  GitHub link above. Bump `version` in `vite.config.ts` (and `package.json`)
  and rebuild before each Greasy Fork update.

## License

MIT — see [LICENSE](./LICENSE). Note this covers the code only; it does not
apply to Facebook's trademarks or UI text quoted in `src/i18n.ts`.
