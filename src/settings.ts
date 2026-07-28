import { GM_getValue, GM_setValue, GM_registerMenuCommand } from '$';

export interface FeatureFlags {
  ad: boolean;
  addFriend: boolean;
  follow: boolean;
  join: boolean;
}

const DEFAULTS: FeatureFlags = { ad: true, addFriend: true, follow: true, join: true };
const STORAGE_PREFIX = 'hide.';

export function loadFlags(): FeatureFlags {
  const flags = {} as FeatureFlags;
  (Object.keys(DEFAULTS) as (keyof FeatureFlags)[]).forEach((key) => {
    flags[key] = GM_getValue(STORAGE_PREFIX + key, DEFAULTS[key]);
  });
  return flags;
}

const LABELS: Record<keyof FeatureFlags, string> = {
  ad: '広告 / Ad',
  addFriend: '友達になる / Add friend',
  follow: 'フォローする / Follow',
  join: '参加する / Join',
};

// Menu command labels only reflect the state at script load (most userscript
// managers don't support updating a registered command's caption in place),
// so toggling reloads the page rather than trying to re-render the menu —
// simpler and more broadly compatible across Tampermonkey/Violentmonkey/
// Greasemonkey than juggling GM_unregisterMenuCommand return-value quirks.
export function registerToggleMenu(flags: FeatureFlags): void {
  (Object.keys(flags) as (keyof FeatureFlags)[]).forEach((key) => {
    const mark = flags[key] ? '✅' : '⬜';
    GM_registerMenuCommand(`${mark} ${LABELS[key]}を隠す`, () => {
      GM_setValue(STORAGE_PREFIX + key, !flags[key]);
      location.reload();
    });
  });
}

// Lets a speaker of a language we don't have good words for fix that
// themselves, on the spot, in their own Facebook UI language — no source
// edit / rebuild / PR needed. Overrides are scoped to the current
// `langKey` (from i18n.ts's resolveLangKey) and only cover the same four
// fields as the toggle menu above; the fuller Dict (suggestedGroups,
// createStory, reels, feedStories) still requires a source-level PR.
export type CustomWords = Partial<Record<keyof FeatureFlags, string>>;

const CUSTOM_WORDS_PREFIX = 'customWords.';

export function loadCustomWords(langKey: string): CustomWords {
  return GM_getValue(CUSTOM_WORDS_PREFIX + langKey, {});
}

function saveCustomWords(langKey: string, words: CustomWords): void {
  GM_setValue(CUSTOM_WORDS_PREFIX + langKey, words);
}

function openCustomWordsDialog(langKey: string, placeholders: Record<keyof FeatureFlags, string>): void {
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
  title.textContent = 'あなたの言語の単語を設定 / Set your language’s words';
  title.style.cssText = 'font-size:16px;margin:0 0 8px;';
  panel.appendChild(title);

  const hint = document.createElement('p');
  hint.textContent = `Facebookの現在の表示言語コード: "${langKey}"。空欄のままなら下のプレースホルダー(現在使われている単語)がそのまま使われます。`;
  hint.style.cssText = 'font-size:12px;color:#666;margin:0 0 16px;';
  panel.appendChild(hint);

  const inputs = {} as Record<keyof FeatureFlags, HTMLInputElement>;
  (Object.keys(LABELS) as (keyof FeatureFlags)[]).forEach((key) => {
    const label = document.createElement('label');
    label.style.cssText = 'display:block;font-size:13px;margin-bottom:12px;';
    label.textContent = LABELS[key];
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
  cancelBtn.textContent = 'キャンセル';
  cancelBtn.style.cssText = 'padding:8px 14px;border:1px solid #ccc;border-radius:4px;background:#f5f5f5;cursor:pointer;';
  cancelBtn.addEventListener('click', () => backdrop.remove());

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.textContent = '保存して再読み込み';
  saveBtn.style.cssText = 'padding:8px 14px;border:none;border-radius:4px;background:#1877f2;color:#fff;cursor:pointer;';

  buttonRow.append(cancelBtn, saveBtn);
  panel.appendChild(buttonRow);

  panel.addEventListener('submit', (e) => {
    e.preventDefault();
    const words: CustomWords = {};
    (Object.keys(inputs) as (keyof FeatureFlags)[]).forEach((key) => {
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

export function registerCustomWordsMenu(langKey: string, placeholders: Record<keyof FeatureFlags, string>): void {
  GM_registerMenuCommand('⚙️ あなたの言語の単語を設定 / Set your language’s words', () => {
    openCustomWordsDialog(langKey, placeholders);
  });
}
