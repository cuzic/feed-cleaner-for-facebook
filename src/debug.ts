import { I18N } from './i18n';

// Debug overlay: outlines matched CTA spans/wrappers instead of hiding them.
// Matches against every known language's CTA words (not just the page's own
// language) so a contributor testing on a non-ja/en Facebook UI can see
// exactly what text this tool would need to recognize for their language.

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const CTA_WORDS = Array.from(
  new Set(Object.values(I18N).flatMap((d) => [d.ad, d.addFriend, d.follow, d.join]))
);
const CTA_PATTERNS = CTA_WORDS.map((w) => new RegExp('^' + escapeRegExp(w)));

function matchesCta(text: string | null): boolean {
  const t = (text ?? '').trim();
  return CTA_PATTERNS.some((re) => re.test(t));
}

function isVscrollerChild(el: Element): boolean {
  const p = el.parentElement;
  return !!(p && p.getAttribute && p.getAttribute('data-type') === 'vscroller');
}

function walkUpTo(
  el: Element,
  isTarget: (el: Element) => boolean,
  maxHops: number
): { found: Element | null; hops: number } {
  let cur: Element | null = el;
  for (let hops = 0; cur && hops < maxHops; hops++) {
    if (isTarget(cur)) return { found: cur, hops };
    cur = cur.parentElement;
  }
  return { found: null, hops: maxHops };
}

let overlay = document.getElementById('cleansns-debug-overlay') as HTMLDivElement | null;
if (!overlay) {
  overlay = document.createElement('div');
  overlay.id = 'cleansns-debug-overlay';
  overlay.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:2147483647;background:rgba(0,0,0,0.85);color:#0f0;' +
    'font-size:12px;font-family:monospace;padding:6px;max-height:40vh;overflow:auto;white-space:pre-wrap;';
  document.documentElement.appendChild(overlay);
}
const overlayEl = overlay;

function scan(): void {
  const spans = Array.from(document.querySelectorAll('span')).filter(
    (span) => span.children.length === 0 && matchesCta(span.textContent)
  );

  const lines: string[] = [];
  lines.push('CTA leaf spans found: ' + spans.length);

  spans.forEach((span, i) => {
    const text = (span.textContent ?? '').trim();
    span.style.setProperty('outline', '3px solid red', 'important');
    const { found, hops } = walkUpTo(span, isVscrollerChild, 25);
    if (found) {
      (found as HTMLElement).style.setProperty('outline', '4px solid blue', 'important');
    }
    const ancestorTags: string[] = [];
    let cur: Element | null = span;
    for (let h = 0; h < 8 && cur; h++) {
      const attrs: string[] = [];
      if (cur.getAttribute && cur.getAttribute('data-type')) attrs.push('data-type=' + cur.getAttribute('data-type'));
      if (cur.className && typeof cur.className === 'string') attrs.push('class=' + cur.className.slice(0, 20));
      ancestorTags.push(cur.tagName + (attrs.length ? '[' + attrs.join(',') + ']' : ''));
      cur = cur.parentElement;
    }
    lines.push(`#${i} "${text}" wrapperFound=${!!found} hops=${hops}\n  chain: ${ancestorTags.join(' > ')}`);
  });

  overlayEl.textContent = lines.join('\n');
}

new MutationObserver(() => setTimeout(scan, 200)).observe(document.documentElement, {
  childList: true,
  subtree: true,
  characterData: true,
});
setInterval(scan, 1500);
scan();
