import { GM_getValue, GM_setValue, GM_registerMenuCommand } from '$';
import type { UiStrings } from './ui-i18n';
import { fmt } from './ui-i18n';

// The four CTA categories that have both a matching word (src/i18n.ts) and a
// user-overridable word (loadCustomWords below). `showLog` is a toggle too
// but has no associated word, so it lives in FeatureFlags without being a
// HideCategory.
export type HideCategory = 'ad' | 'addFriend' | 'follow' | 'join';
export const HIDE_CATEGORIES: readonly HideCategory[] = ['ad', 'addFriend', 'follow', 'join'];
export type FeatureFlagKey = HideCategory | 'showLog' | 'fadeAnimation' | 'badgePop' | 'milestoneCelebration';
export type FeatureFlags = Record<HideCategory, boolean> & {
  showLog: boolean;
  // Purely cosmetic; each is a no-op without its prerequisite (badgePop and
  // milestoneCelebration have nothing to animate unless showLog is also on).
  fadeAnimation: boolean;
  badgePop: boolean;
  milestoneCelebration: boolean;
};

const DEFAULTS: FeatureFlags = {
  ad: true,
  addFriend: true,
  follow: true,
  join: true,
  showLog: false,
  fadeAnimation: true,
  badgePop: true,
  milestoneCelebration: true,
};
// Kept as "hide." even though showLog isn't a hide toggle — changing the
// prefix would silently reset every existing user's saved settings back to
// these defaults, which is worse than the slightly-off name.
const STORAGE_PREFIX = 'hide.';

export function loadFlags(): FeatureFlags {
  const flags = {} as FeatureFlags;
  (Object.keys(DEFAULTS) as FeatureFlagKey[]).forEach((key) => {
    flags[key] = GM_getValue(STORAGE_PREFIX + key, DEFAULTS[key]);
  });
  return flags;
}

// Menu command labels only reflect the state at script load (most userscript
// managers don't support updating a registered command's caption in place),
// so toggling reloads the page rather than trying to re-render the menu —
// simpler and more broadly compatible across Tampermonkey/Violentmonkey/
// Greasemonkey than juggling GM_unregisterMenuCommand return-value quirks.
export function registerToggleMenu(flags: FeatureFlags, ui: UiStrings): void {
  (Object.keys(flags) as FeatureFlagKey[]).forEach((key) => {
    const mark = flags[key] ? '✅' : '⬜';
    GM_registerMenuCommand(`${mark} ${ui.menu[key]}`, () => {
      GM_setValue(STORAGE_PREFIX + key, !flags[key]);
      location.reload();
    });
  });
}

// Lets a speaker of a language we don't have good words for fix that
// themselves, on the spot, in their own Facebook UI language — no source
// edit / rebuild / PR needed. Overrides are scoped to the current
// `langKey` (from i18n.ts's resolveLangKey) and only cover the four
// HideCategory fields; the fuller Dict (suggestedGroups, createStory, reels,
// feedStories) still requires a source-level PR.
export type CustomWords = Partial<Record<HideCategory, string>>;

const CUSTOM_WORDS_PREFIX = 'customWords.';

export function loadCustomWords(langKey: string): CustomWords {
  return GM_getValue(CUSTOM_WORDS_PREFIX + langKey, {});
}

function saveCustomWords(langKey: string, words: CustomWords): void {
  GM_setValue(CUSTOM_WORDS_PREFIX + langKey, words);
}

function openCustomWordsDialog(langKey: string, ui: UiStrings, placeholders: Record<HideCategory, string>): void {
  if (document.getElementById('cleansns-custom-words')) return;
  const current = loadCustomWords(langKey);

  const backdrop = document.createElement('div');
  backdrop.id = 'cleansns-custom-words';
  backdrop.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.5);' +
    'display:flex;align-items:center;justify-content:center;font-family:sans-serif;';

  const panel = document.createElement('form');
  panel.style.cssText =
    'background:#fff;color:#111;border-radius:8px;padding:20px;width:min(90vw,420px);' +
    'max-height:85vh;overflow:auto;box-shadow:0 4px 24px rgba(0,0,0,.3);';

  const title = document.createElement('h2');
  title.textContent = ui.dialogTitle;
  title.style.cssText = 'font-size:16px;margin:0 0 8px;';
  panel.appendChild(title);

  const hint = document.createElement('p');
  hint.textContent = fmt(ui.dialogHint, { lang: langKey });
  hint.style.cssText = 'font-size:12px;color:#666;margin:0 0 16px;';
  panel.appendChild(hint);

  const inputs = {} as Record<HideCategory, HTMLInputElement>;
  HIDE_CATEGORIES.forEach((key) => {
    const label = document.createElement('label');
    label.style.cssText = 'display:block;font-size:13px;margin-bottom:12px;';
    label.textContent = ui.category[key];
    const input = document.createElement('input');
    input.type = 'text';
    input.value = current[key] ?? '';
    input.placeholder = placeholders[key];
    input.style.cssText =
      'display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:6px 8px;' +
      'border:1px solid #ccc;border-radius:4px;font-size:14px;';
    label.appendChild(input);
    panel.appendChild(label);
    inputs[key] = input;
  });

  const buttonRow = document.createElement('div');
  buttonRow.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:8px;';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = ui.dialogCancel;
  cancelBtn.style.cssText = 'padding:8px 14px;border:1px solid #ccc;border-radius:4px;background:#f5f5f5;cursor:pointer;';
  cancelBtn.addEventListener('click', () => backdrop.remove());

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.textContent = ui.dialogSave;
  saveBtn.style.cssText = 'padding:8px 14px;border:none;border-radius:4px;background:#1877f2;color:#fff;cursor:pointer;';

  buttonRow.append(cancelBtn, saveBtn);
  panel.appendChild(buttonRow);

  panel.addEventListener('submit', (e) => {
    e.preventDefault();
    const words: CustomWords = {};
    HIDE_CATEGORIES.forEach((key) => {
      const v = inputs[key].value.trim();
      if (v) words[key] = v;
    });
    saveCustomWords(langKey, words);
    location.reload();
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove();
  });

  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);
}

export function registerCustomWordsMenu(langKey: string, ui: UiStrings, placeholders: Record<HideCategory, string>): void {
  GM_registerMenuCommand(`⚙️ ${ui.menuCustomWords}`, () => {
    openCustomWordsDialog(langKey, ui, placeholders);
  });
}
