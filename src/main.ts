import { buildDict, AD_WORDS_BY_LANG, resolveLangKey } from './i18n';
import type { Dict } from './i18n';
import { loadFlags, registerToggleMenu, loadCustomWords, registerCustomWordsMenu, HIDE_CATEGORIES } from './settings';
import { buildUiStrings } from './ui-i18n';
import { createHideLog } from './hidelog';
import type { HideLog } from './hidelog';

const HIDE_MARK = 'data-cleansns-hidden';

const DICT = buildDict();
const LANG_KEY = resolveLangKey();
const UI = buildUiStrings(LANG_KEY);

// User-supplied overrides (see settings.ts) win over both the built-in dict
// and the bulk-sourced AD_WORDS_BY_LANG fallback — someone who bothered to
// type in their own language's word knows it better than either of those.
const CUSTOM_WORDS = loadCustomWords(LANG_KEY);
HIDE_CATEGORIES.forEach((key) => {
  const custom = CUSTOM_WORDS[key];
  if (custom) DICT[key] = custom;
});

const FLAGS = loadFlags();
registerToggleMenu(FLAGS, UI);
registerCustomWordsMenu(LANG_KEY, UI, {
  ad: DICT.ad,
  addFriend: DICT.addFriend,
  follow: DICT.follow,
  join: DICT.join,
});

const log: HideLog | null = FLAGS.showLog
  ? createHideLog(UI, { badgePop: FLAGS.badgePop, milestoneCelebration: FLAGS.milestoneCelebration })
  : null;

type Category = keyof Dict;

const CATEGORY_LABELS: Record<Category, string> = {
  ad: UI.category.ad,
  addFriend: UI.category.addFriend,
  follow: UI.category.follow,
  join: UI.category.join,
  suggestedGroups: DICT.suggestedGroups,
  createStory: DICT.createStory,
  reels: DICT.reels,
  feedStories: DICT.feedStories,
};

// Word -> category lookup, so a match can be labeled (for the hide log) and
// not just detected. Serves mobile and desktop matching alike — both look
// for the same four CTA categories, so one shared map replaces what used to
// be two separately-built (but identical) word lists.
//
// For an exact word collision across categories, Map.set means whichever
// call happens LAST wins (no such collision exists in current data, so this
// is purely a "know the rule before you rely on it" note, not a live
// concern). Insertion order matters for a different reason: it's also the
// scan order matchCtaPrefix() below walks to find which word a given text
// node starts with, so putting the four CTA categories before the ~60-word
// ad-word bulk list makes a specific category win over 'ad' on any
// prefix-overlap between them.
const CTA_CATEGORY = new Map<string, Category>();
const addWord = (word: string | undefined, cat: Category): void => {
  if (word) CTA_CATEGORY.set(word, cat);
};
if (FLAGS.addFriend) addWord(DICT.addFriend, 'addFriend');
if (FLAGS.follow) addWord(DICT.follow, 'follow');
if (FLAGS.join) addWord(DICT.join, 'join');
// Every known "Sponsored"/"Ad" word across ~60 languages is merged in
// unconditionally (not just the detected language's) — a post's text
// legitimately starting with e.g. the Finnish word for "Sponsored" on a
// Japanese-language feed is effectively impossible, so this only adds
// coverage, including against html-lang mismatches, with no realistic
// over-matching risk.
if (FLAGS.ad) {
  Object.values(AD_WORDS_BY_LANG).forEach((w) => addWord(w, 'ad'));
  addWord(DICT.ad, 'ad');
}

const CTA_WORDS = [...CTA_CATEGORY.keys()];

// The length cap exists to stop a CTA word from matching as the mere prefix of an
// unrelated sentence (e.g. a post starting with "Follow the money..."), not to
// bound CTA labels themselves — those vary a lot by language (observed as short
// as 2 chars for ja "広告" and as long as 27 for pt-PT "Adicionar à lista de
// amigos"), so the cap must scale with the longest configured word rather than be
// a fixed constant. Only mobile matching (prefix search over free-form text
// nodes) needs this; desktop does an exact-string Map lookup below, which
// doesn't have a false-positive-on-long-text failure mode to guard against.
const CTA_MAX_LEN = CTA_WORDS.length ? Math.max(...CTA_WORDS.map((w) => w.length)) + 2 : 0;

// Strip whitespace, zero-width/bidi marks, and leading icon glyphs (+/＋/・) that
// Facebook sometimes prepends to CTA labels, so the anchor match doesn't miss them.
const NOISE = /[\s​‌‍‎‏⁠﻿+＋・]/g;

function matchCtaPrefix(text: string | null): Category | null {
  const t = (text ?? '').replace(NOISE, '');
  if (t.length > CTA_MAX_LEN) return null;
  for (const w of CTA_WORDS) {
    if (t.startsWith(w)) return CTA_CATEGORY.get(w) ?? null;
  }
  return null;
}

// A single post — even a long one with images — fits comfortably within a
// few screens' worth of height. Anything larger is almost certainly not a
// single post but some much bigger container (e.g. the whole feed), which a
// looser-than-intended CTA match could otherwise cause us to hide entirely.
const MAX_WRAPPER_VIEWPORTS = 3;
const warned = new WeakSet<Element>();

function warnOnce(el: Element, reason: string): void {
  if (warned.has(el)) return;
  warned.add(el);
  console.warn(`[feed-cleaner] ${reason}:`, el);
}

function isSafeWrapper(el: HTMLElement): boolean {
  // Already hidden -> already passed this check the first time it was
  // hidden, and re-measuring on every scan is wasted work (a forced reflow)
  // for a result that can't change without an unhide first.
  if (el.hasAttribute(HIDE_MARK)) return true;
  return el.getBoundingClientRect().height <= window.innerHeight * MAX_WRAPPER_VIEWPORTS;
}

// --- m.facebook.com: top-level post wrappers are direct children of [data-type="vscroller"] ---
function isVscrollerChild(el: Element): boolean {
  const p = el.parentElement;
  return !!(p && p.getAttribute && p.getAttribute('data-type') === 'vscroller');
}

// The walk already terminates safely on its own once it reaches document.body
// (guaranteed finite for any real DOM), so this hop cap isn't load-bearing for
// correctness — it's defense-in-depth against some future change removing
// that terminator by accident. Set high enough (unlike debug.ts's 25, which
// was measured against mobile's isVscrollerChild specifically) that it should
// never fire on a legitimate match even on desktop's deeper data-pagelet
// nesting; if it ever does, treat that as a real bug report, not tune this
// number up further.
const MAX_HOPS = 100;

function walkUpTo(el: Element, isTarget: (el: Element) => boolean): Element | null {
  let hops = 0;
  for (let cur: Element | null = el; cur && cur !== document.body && hops < MAX_HOPS; cur = cur.parentElement, hops++) {
    if (isTarget(cur)) return cur;
  }
  return null;
}

const FADE_MS = 250;
const FADE_STARTED_MARK = 'data-cleansns-fading';

// Facebook's mobile feed is virtualized: it inserts a post's DOM well before
// it's scrolled into view (prefetching, to avoid blank flashes on fast
// scroll). Our MutationObserver reacts to that insertion immediately, so
// starting the fade right then finishes it long before the post is ever
// scrolled into view — nothing to see, just blank space once the user gets
// there. So instead of fading immediately, a wrapper that should fade is
// registered with this observer and only actually starts fading once it
// reports the wrapper as intersecting the viewport — i.e. the moment it
// would otherwise have appeared on screen. Elements already on screen when
// observed fire an intersecting callback immediately (standard
// IntersectionObserver behavior), so this also covers the "already visible
// when detected" case without special-casing it.
const fadePending = new Map<HTMLElement, { prop: string; value: string }>();
const fadeObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const el = entry.target as HTMLElement;
    fadeObserver.unobserve(el);
    const pending = fadePending.get(el);
    fadePending.delete(el);
    if (pending) startFade(el, pending.prop, pending.value);
  }
});

// The opacity change is deferred by two rAFs rather than set in the same
// tick as `transition`. Reason: even once a wrapper is confirmed on-screen,
// it may still be the very task that inserted or revealed it — i.e. before
// the browser has ever painted it at its natural opacity. Setting
// `transition` and `opacity:0` together in that case gives the browser
// nothing to visibly animate from, so it just appears already gone (looks
// identical to no animation at all). Two rAFs guarantee a real paint at the
// starting opacity before the transition's target value lands (one rAF is
// sometimes still the same paint the triggering change lands in).
function startFade(el: HTMLElement, prop: string, value: string): void {
  if (el.hasAttribute(FADE_STARTED_MARK)) return;
  el.setAttribute(FADE_STARTED_MARK, '1');
  el.style.setProperty('transition', `opacity ${FADE_MS}ms ease-out`, 'important');
  el.style.setProperty('pointer-events', 'none', 'important');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.setProperty('opacity', '0', 'important');
    });
  });
  window.setTimeout(() => el.style.setProperty(prop, value, 'important'), FADE_MS + 60);
}

// Without animation, `prop`/`value` (visibility:hidden or display:none) is
// applied immediately, same as before. HIDE_MARK is set either way — even
// while a wrapper is only pending (not yet visually changed at all) — since
// it reflects the *decision* to hide it, which is what scanMobile/
// scanDesktop's re-scan diffing and the hide log both key off of.
function hide(el: HTMLElement, prop: string, value: string, animate: boolean): void {
  if (el.style.getPropertyValue(prop) === value) {
    el.setAttribute(HIDE_MARK, '1');
    return;
  }
  if (animate) {
    if (!el.hasAttribute(FADE_STARTED_MARK) && !fadePending.has(el)) {
      fadePending.set(el, { prop, value });
      fadeObserver.observe(el);
    }
  } else {
    el.style.setProperty(prop, value, 'important');
    if (prop === 'visibility') el.style.setProperty('pointer-events', 'none', 'important');
  }
  el.setAttribute(HIDE_MARK, '1');
}

function unhide(el: HTMLElement, prop: string): void {
  // A wrapper can be unhidden while still only pending (registered with
  // fadeObserver, never actually styled) — e.g. Facebook removed it from the
  // DOM's matched set before it ever scrolled into view. Cancel that
  // registration too, or a later intersection would fade an element nothing
  // marked for hiding anymore.
  fadeObserver.unobserve(el);
  fadePending.delete(el);
  el.style.removeProperty(prop);
  el.style.removeProperty('opacity');
  el.style.removeProperty('transition');
  el.style.removeProperty('pointer-events');
  el.removeAttribute(HIDE_MARK);
  el.removeAttribute(FADE_STARTED_MARK);
}

// "Newly hidden, so log it" is decided by HIDE_MARK's absence, reusing the
// same attribute hide()/unhide() already maintain rather than tracking a
// second parallel set of "already logged" elements. Known edge case: if
// Facebook ever remounts a wrapper we'd already hidden (losing its
// attributes) mid-session, it gets logged again as if newly hidden — a
// cosmetic over-count in the log, not a change in what's actually hidden.

// Recompute the full set of wrappers that should be hidden from scratch each pass,
// then diff against the currently-hidden set. Re-validating a hide with a WEAKER
// rule than the one that produced it (e.g. checking the whole wrapper's text
// instead of the matched CTA node) causes exactly-once-then-unhidden flicker for
// any CTA whose label isn't the first text in the wrapper (e.g. a "Follow" CTA
// appearing after the author name in a normal post's byline).
function scanMobile(): void {
  const want = new Map<HTMLElement, Category>();
  const add = (el: Element, cat: Category) => {
    const wrapper = walkUpTo(el, isVscrollerChild) as HTMLElement | null;
    // Not finding a wrapper here is routine, not a warning sign — CTA-word
    // text legitimately appears outside the feed too (nav, our own settings
    // dialog, profile hover cards, ...), so it's silently skipped rather
    // than logged.
    if (!wrapper) return;
    if (!isSafeWrapper(wrapper)) {
      warnOnce(wrapper, 'skipped an oversized wrapper (possible over-match)');
      return;
    }
    if (!want.has(wrapper)) want.set(wrapper, cat);
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const cat = matchCtaPrefix(node.nodeValue);
    if (cat && node.parentElement) add(node.parentElement, cat);
  }

  document.querySelectorAll(`h2[aria-label="${DICT.suggestedGroups}"]`).forEach((el) => add(el, 'suggestedGroups'));
  document.querySelectorAll(`[aria-label="${DICT.createStory}"]`).forEach((el) => add(el, 'createStory'));

  document.querySelectorAll<HTMLElement>(`[${HIDE_MARK}]`).forEach((wrapper) => {
    if (!want.has(wrapper)) unhide(wrapper, 'visibility');
  });
  want.forEach((cat, wrapper) => {
    if (!wrapper.hasAttribute(HIDE_MARK)) log?.record(CATEGORY_LABELS[cat], wrapper);
    hide(wrapper, 'visibility', 'hidden', FLAGS.fadeAnimation);
  });
}

// --- www.facebook.com: top-level post wrappers carry data-pagelet ---
function hasPagelet(el: Element): boolean {
  return !!(el.hasAttribute && el.hasAttribute('data-pagelet'));
}

// Desktop ad/add-friend hiding is unverified against the current DOM (see
// README) — it reuses the same generic "short exact-match text node inside a
// data-pagelet wrapper" technique already proven for Follow/Join, on the
// assumption those labels are still their own standalone text nodes like
// Follow/Join are.
function scanDesktop(): void {
  const want = new Map<HTMLElement, Category>();
  const add = (el: Element, cat: Category) => {
    const wrapper = walkUpTo(el, hasPagelet) as HTMLElement | null;
    // Not finding a wrapper here is routine, not a warning sign — see the
    // matching comment in scanMobile.
    if (!wrapper) return;
    if (!isSafeWrapper(wrapper)) {
      warnOnce(wrapper, 'skipped an oversized wrapper (possible over-match)');
      return;
    }
    if (!want.has(wrapper)) want.set(wrapper, cat);
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const t = (node.nodeValue ?? '').replace(NOISE, '');
    const cat = CTA_CATEGORY.get(t);
    if (cat && node.parentElement) add(node.parentElement, cat);
  }

  document.querySelectorAll('h3').forEach((h3) => {
    if ((h3.textContent ?? '').trim() === DICT.reels) add(h3, 'reels');
  });
  document.querySelectorAll(`div[aria-label="${DICT.feedStories}"]`).forEach((el) => add(el, 'feedStories'));

  document.querySelectorAll<HTMLElement>(`[${HIDE_MARK}]`).forEach((wrapper) => {
    if (!want.has(wrapper)) unhide(wrapper, 'display');
  });
  want.forEach((cat, wrapper) => {
    if (!wrapper.hasAttribute(HIDE_MARK)) log?.record(CATEGORY_LABELS[cat], wrapper);
    hide(wrapper, 'display', 'none', FLAGS.fadeAnimation);
  });
}

const scan = location.hostname === 'm.facebook.com' ? scanMobile : scanDesktop;

let scheduled = false;
function scheduleScan(): void {
  if (scheduled) return;
  scheduled = true;
  setTimeout(() => {
    scheduled = false;
    scan();
  }, 200);
}

new MutationObserver(scheduleScan).observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});

// Safety net in case a mutation batch is ever missed entirely.
setInterval(scan, 1500);

scan();
