import { buildDict, AD_WORDS_BY_LANG } from './i18n';

const HIDE_MARK = 'data-cleansns-hidden';

const DICT = buildDict();
const uniq = (arr: (string | undefined)[]): string[] =>
  Array.from(new Set(arr.filter((v): v is string => !!v)));
// Every known "Sponsored"/"Ad" word across ~60 languages is merged into both
// mobile and desktop matching unconditionally (not just the detected language's)
// — a post's text legitimately starting with e.g. the Finnish word for
// "Sponsored" on a Japanese-language feed is effectively impossible, so this
// only adds coverage, including against html-lang mismatches, with no
// realistic over-matching risk.
const ALL_AD_WORDS = Object.values(AD_WORDS_BY_LANG);
const MOBILE_CTA_WORDS = uniq([DICT.ad, DICT.addFriend, DICT.follow, DICT.join, ...ALL_AD_WORDS]);
// Desktop ad/add-friend hiding is unverified against the current DOM (see
// README) — it reuses the same generic "short exact-match text node inside a
// data-pagelet wrapper" technique already proven for Follow/Join, on the
// assumption those labels are still their own standalone text nodes like
// Follow/Join are.
const DESKTOP_CTA_WORDS = uniq([DICT.follow, DICT.join, DICT.ad, DICT.addFriend, ...ALL_AD_WORDS]);

// The length cap exists to stop a CTA word from matching as the mere prefix of an
// unrelated sentence (e.g. a post starting with "Follow the money..."), not to
// bound CTA labels themselves — those vary a lot by language (observed as short
// as 2 chars for ja "広告" and as long as 27 for pt-PT "Adicionar à lista de
// amigos"), so the cap must scale with the longest configured word rather than be
// a fixed constant.
const maxCtaLen = (words: string[]): number => Math.max(...words.map((w) => w.length)) + 2;
const MOBILE_CTA_MAX_LEN = maxCtaLen(MOBILE_CTA_WORDS);
const DESKTOP_CTA_MAX_LEN = maxCtaLen(DESKTOP_CTA_WORDS);

// Strip whitespace, zero-width/bidi marks, and leading icon glyphs (+/＋/・) that
// Facebook sometimes prepends to CTA labels, so the anchor match doesn't miss them.
const NOISE = /[\s​‌‍‎‏⁠﻿+＋・]/g;

function isCtaLabel(text: string | null, words: string[], maxLen: number): boolean {
  const t = (text ?? '').replace(NOISE, '');
  return t.length <= maxLen && words.some((w) => t.startsWith(w));
}

// --- m.facebook.com: top-level post wrappers are direct children of [data-type="vscroller"] ---
function isVscrollerChild(el: Element): boolean {
  const p = el.parentElement;
  return !!(p && p.getAttribute && p.getAttribute('data-type') === 'vscroller');
}

function walkUpTo(el: Element, isTarget: (el: Element) => boolean): Element | null {
  for (let cur: Element | null = el; cur && cur !== document.body; cur = cur.parentElement) {
    if (isTarget(cur)) return cur;
  }
  return null;
}

function hide(el: HTMLElement, prop: string, value: string): void {
  if (el.style.getPropertyValue(prop) !== value) {
    el.style.setProperty(prop, value, 'important');
    if (prop === 'visibility') el.style.setProperty('pointer-events', 'none', 'important');
  }
  el.setAttribute(HIDE_MARK, '1');
}

function unhide(el: HTMLElement, prop: string): void {
  el.style.removeProperty(prop);
  if (prop === 'visibility') el.style.removeProperty('pointer-events');
  el.removeAttribute(HIDE_MARK);
}

// Recompute the full set of wrappers that should be hidden from scratch each pass,
// then diff against the currently-hidden set. Re-validating a hide with a WEAKER
// rule than the one that produced it (e.g. checking the whole wrapper's text
// instead of the matched CTA node) causes exactly-once-then-unhidden flicker for
// any CTA whose label isn't the first text in the wrapper (e.g. a "Follow" CTA
// appearing after the author name in a normal post's byline).
function scanMobile(): void {
  const want = new Set<HTMLElement>();
  const add = (el: Element) => {
    const wrapper = walkUpTo(el, isVscrollerChild);
    if (wrapper) want.add(wrapper as HTMLElement);
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (isCtaLabel(node.nodeValue, MOBILE_CTA_WORDS, MOBILE_CTA_MAX_LEN) && node.parentElement) add(node.parentElement);
  }

  document
    .querySelectorAll(`h2[aria-label="${DICT.suggestedGroups}"], [aria-label="${DICT.createStory}"]`)
    .forEach(add);

  document.querySelectorAll<HTMLElement>(`[${HIDE_MARK}]`).forEach((wrapper) => {
    if (!want.has(wrapper)) unhide(wrapper, 'visibility');
  });
  want.forEach((wrapper) => hide(wrapper, 'visibility', 'hidden'));
}

// --- www.facebook.com: top-level post wrappers carry data-pagelet ---
function hasPagelet(el: Element): boolean {
  return !!(el.hasAttribute && el.hasAttribute('data-pagelet'));
}

function scanDesktop(): void {
  const want = new Set<HTMLElement>();
  const add = (el: Element) => {
    const wrapper = walkUpTo(el, hasPagelet);
    if (wrapper) want.add(wrapper as HTMLElement);
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const t = (node.nodeValue ?? '').replace(NOISE, '');
    if (t.length <= DESKTOP_CTA_MAX_LEN && DESKTOP_CTA_WORDS.includes(t) && node.parentElement) add(node.parentElement);
  }

  document.querySelectorAll('h3').forEach((h3) => {
    if ((h3.textContent ?? '').trim() === DICT.reels) add(h3);
  });
  document.querySelectorAll(`div[aria-label="${DICT.feedStories}"]`).forEach(add);

  document.querySelectorAll<HTMLElement>(`[${HIDE_MARK}]`).forEach((wrapper) => {
    if (!want.has(wrapper)) unhide(wrapper, 'display');
  });
  want.forEach((wrapper) => hide(wrapper, 'display', 'none'));
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
