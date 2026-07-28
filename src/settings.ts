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
