import type { UiStrings } from './ui-i18n';
import { fmt } from './ui-i18n';

export interface HideLog {
  record(label: string, el: HTMLElement): void;
}

const MAX_ENTRIES = 10;

// A post wrapper's own textContent tends to start with UI chrome ("Like",
// "Share", a relative timestamp) rather than anything identifying, so try an
// aria-label or heading-ish element first and only fall back to the whole
// wrapper's text.
function snippet(el: HTMLElement, max = 40): string {
  const src =
    el.getAttribute('aria-label') ?? el.querySelector('h2, h3, strong, [role="heading"]')?.textContent ?? el.textContent ?? '';
  const t = src.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max) + '…' : t;
}

export function createHideLog(ui: UiStrings): HideLog {
  const entries: { label: string; text: string }[] = [];
  // `entries` is a ring buffer capped at MAX_ENTRIES for the expanded detail
  // list — the displayed count must NOT be entries.length, or it would stop
  // climbing past 10 even after hundreds of posts were hidden. Tracked
  // separately so it can grow unbounded for the life of the page.
  let total = 0;
  // main.ts already gates its record() calls on "does this wrapper lack our
  // hide-marker attribute", which covers the common case cheaply without
  // ever calling record() for something already hidden. This WeakSet is a
  // second, element-identity-based layer specifically for when that
  // attribute-based check has a false negative — e.g. Facebook's own React
  // re-render strips our custom attribute from a wrapper it doesn't
  // recognize as its own state, while the DOM node itself (and its object
  // identity) survives. A count users are meant to trust is worth the extra
  // WeakSet lookup; a wrapper actually being torn down and rebuilt as a new
  // element is indistinguishable from a genuinely new post either way, so
  // this can't (and doesn't try to) catch that case.
  const seen = new WeakSet<HTMLElement>();
  let badge: HTMLElement | null = null;
  let expanded = false;

  function ensureBadge(): HTMLElement {
    if (badge) return badge;
    badge = document.createElement('div');
    badge.style.cssText =
      'position:fixed;left:8px;bottom:8px;z-index:2147483646;background:#1c1e21;color:#fff;' +
      'font-family:sans-serif;font-size:12px;border-radius:16px;padding:6px 12px;cursor:pointer;' +
      'user-select:none;box-shadow:0 1px 6px rgba(0,0,0,.4);';
    badge.addEventListener('click', () => {
      expanded = !expanded;
      render();
    });
    // Appended to <html>, not <body> — the scan's TreeWalker roots at
    // document.body, so keeping the badge outside it means the badge's own
    // text can never be picked up as a CTA match and re-trigger itself.
    document.documentElement.appendChild(badge);
    return badge;
  }

  function render(): void {
    const el = ensureBadge();
    if (!expanded) {
      el.textContent = `🧹 ${total}`;
      return;
    }
    el.textContent = '';
    const header = document.createElement('div');
    header.style.cssText = 'font-weight:bold;margin-bottom:4px;';
    header.textContent = fmt(ui.logCount, { n: total });
    const rows = document.createElement('div');
    rows.style.cssText = 'white-space:pre-wrap;max-width:60vw;max-height:40vh;overflow:auto;';
    rows.textContent = entries
      .slice()
      .reverse()
      .map((e) => `${e.label} · ${e.text}`)
      .join('\n');
    el.append(header, rows);
  }

  return {
    record(label, el) {
      if (seen.has(el)) return;
      seen.add(el);
      total++;
      entries.push({ label, text: snippet(el) });
      if (entries.length > MAX_ENTRIES) entries.shift();
      render();
    },
  };
}
