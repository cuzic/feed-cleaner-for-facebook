// Facebook's CTA/heading strings are UI-language-dependent, so we keep a small
// per-language dictionary instead of hardcoding one language.
//
// ja/en/es/fr/pt/de/ko were checked live (Chrome on Android, m.facebook.com,
// account language switched per-language) on 2026-07-28; see git history for
// which individual fields that covered. zh-hans/zh-hant `ad` are cross-checked
// against a third-party project (see below) but otherwise unverified. Anything
// else is a best-effort guess and may be stale or wrong for the current UI.
// A wrong/missing entry only means "nothing gets hidden in that language" (a safe
// failure), never "the wrong thing gets hidden" — so partial/uncertain entries are
// still worth having. To add or fix a language, see the README and send a PR.
//
// `AD_WORDS_BY_LANG` below bootstraps `ad`-word coverage the same way — see
// its own comment for provenance.
export interface Dict {
  ad: string;
  addFriend: string;
  follow: string;
  join: string;
  suggestedGroups: string;
  createStory: string;
  reels: string;
  feedStories: string;
}

// `satisfies` (not `: Record<string, Dict>`) keeps the literal key types, so
// `I18N.en` below is a known property access (always `Dict`) rather than an
// index-signature access (which `noUncheckedIndexedAccess` would widen to
// `Dict | undefined`). Dynamic lookups still go through the explicit cast in
// `buildDict` to get that `| undefined` back where it's actually needed.
export const I18N = {
  ja: {
    ad: '広告',
    addFriend: '友達になる',
    follow: 'フォローする',
    join: '参加する',
    suggestedGroups: 'おすすめ',
    createStory: 'ストーリーズを作成',
    reels: 'リール',
    feedStories: 'フィードのストーリーズ',
  },
  en: {
    ad: 'Ad',
    addFriend: 'Add friend',
    follow: 'Follow',
    join: 'Join',
    suggestedGroups: 'Suggested for you',
    createStory: 'Create story',
    reels: 'Reels',
    feedStories: 'Feed Stories',
  },
  es: {
    ad: 'Publicidad',
    addFriend: 'Añadir como amigo(a)',
    follow: 'Seguir',
    join: 'Unirte',
    suggestedGroups: 'Sugerencias para ti',
    createStory: 'Crear historia',
    reels: 'Reels',
    feedStories: 'Historias',
  },
  pt: {
    ad: 'Patrocinado',
    addFriend: 'Adicionar à lista de amigos',
    follow: 'Seguir',
    join: 'Aderir',
    suggestedGroups: 'Sugestões para ti',
    createStory: 'Criar história',
    reels: 'Reels',
    feedStories: 'Stories',
  },
  fr: {
    ad: 'Sponsorisé',
    addFriend: 'Ajouter ami(e)',
    follow: 'Suivre',
    join: 'Rejoindre',
    // Observed on the Groups > Discover page heading, not the feed carousel
    // itself — may not be the exact aria-label our scan matches against.
    suggestedGroups: 'Suggestions',
    createStory: 'Créer une story',
    reels: 'Reels',
    feedStories: 'Stories',
  },
  de: {
    ad: 'Gesponsert',
    addFriend: 'Freund/in hinzufügen',
    follow: 'Folgen',
    join: 'Beitreten',
    suggestedGroups: 'Für dich vorgeschlagen',
    createStory: 'Story erstellen',
    reels: 'Reels',
    feedStories: 'Stories',
  },
  ko: {
    ad: '광고',
    addFriend: '친구 추가',
    follow: '팔로우',
    join: '가입',
    suggestedGroups: '회원님을 위한 추천',
    createStory: '스토리 만들기',
    reels: '릴스',
    feedStories: '스토리',
  },
  'zh-hans': {
    ad: '赞助内容',
    addFriend: '加为好友',
    follow: '关注',
    join: '加入',
    suggestedGroups: '推荐',
    createStory: '创建快拍',
    reels: 'Reels',
    feedStories: '快拍',
  },
  'zh-hant': {
    ad: '贊助',
    addFriend: '加朋友',
    follow: '追蹤',
    join: '加入',
    suggestedGroups: '推薦',
    createStory: '建立限時動態',
    reels: 'Reels',
    feedStories: '限時動態',
  },
} satisfies Record<string, Dict>;

// "Sponsored"/"Ad" label across ~60 languages, cross-referenced against the
// "Facebook Unsponsored" userscript (https://greasyfork.org/en/scripts/371822-facebook-unsponsored,
// source at https://github.com/nmtrung/greasemonkey-scripts). That project
// itself carries no declared license (code is effectively all-rights-reserved
// as published), but these entries are Facebook's own UI microcopy as that
// project observed it, not original expression of its author — short
// UI strings/labels aren't independently copyrightable — so the words
// themselves are reused here; none of that project's code (selectors,
// matching logic) is. Collected from Facebook's older desktop UI; cross-checks
// against the current mobile UI landed exactly on ja/zh-hans/zh-hant (see
// I18N above) but diverged for en ("Sponsored" there vs. "Ad" on mobile
// today), so treat unverified entries as a starting point, not gospel.
export const AD_WORDS_BY_LANG: Record<string, string> = {
  af: 'Geborg',
  am: 'የተከፈለበት ማስታወቂያ',
  ar: 'إعلان مُموَّل',
  as: 'পৃষ্ঠপোষকতা কৰা',
  ay: 'Yatiyanaka',
  az: 'Sponsor dəstəkli',
  be: 'Рэклама',
  bg: 'Спонсорирано',
  br: 'Paeroniet',
  bs: 'Sponzorirano',
  bn: 'সৌজন্যে',
  ca: 'Patrocinat',
  co: 'Spunsurizatu',
  cs: 'Sponzorováno',
  cy: 'Noddwyd',
  da: 'Sponsoreret',
  de: 'Gesponsert',
  el: 'Χορηγούμενη',
  eo: 'Reklamo',
  es: 'Publicidad',
  et: 'Sponsitud',
  eu: 'Babestua',
  fa: 'دارای پشتیبانی مالی',
  fi: 'Sponsoroitu',
  fo: 'Stuðlað',
  fr: 'Sponsorisé',
  fy: 'Sponsore',
  ga: 'Urraithe',
  gl: 'Patrocinado',
  gn: 'Oñepatrosinapyre',
  hi: 'प्रायोजित',
  hu: 'Hirdetés',
  id: 'Bersponsor',
  it: 'Sponsorizzata',
  ja: '広告',
  jv: 'Disponsori',
  kk: 'Демеушілік көрсеткен',
  km: 'បានឧបត្ថម្ភ',
  lo: 'ໄດ້ຮັບການສະໜັບສະໜູນ',
  mk: 'Спонзорирано',
  ml: 'സ്പോൺസർ ചെയ്തത്',
  mn: 'Ивээн тэтгэсэн',
  mr: 'प्रायोजित',
  ms: 'Ditaja',
  ne: 'प्रायोजित',
  nl: 'Gesponsord',
  or: 'ପ୍ରଯୋଜିତ',
  pa: 'ਸਰਪ੍ਰਸਤੀ ਪ੍ਰਾਪਤ',
  pl: 'Sponsorowane',
  ps: 'تمويل شوي',
  pt: 'Patrocinado',
  ru: 'Реклама',
  si: 'අනුග්‍රහය දක්වන ලද',
  so: 'La maalgeliyey',
  sv: 'Sponsrad',
  te: 'స్పాన్సర్ చేసినవి',
  th: 'ได้รับการสนับสนุน',
  tl: 'May Sponsor',
  tr: 'Sponsorlu',
  uk: 'Реклама',
  ur: 'تعاون کردہ',
  vi: 'Được tài trợ',
  'zh-hans': '赞助内容',
  'zh-hant': '贊助',
};

function resolveLangKey(): string {
  const raw = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
  if (raw.startsWith('zh-hant') || raw === 'zh-tw' || raw === 'zh-hk') return 'zh-hant';
  if (raw.startsWith('zh')) return 'zh-hans';
  return raw.split('-')[0] ?? raw;
}

// Merge with English as a fallback for any field the primary dict lacks, and
// because Facebook sometimes leaves newer UI strings untranslated. For `ad`
// specifically, prefer AD_WORDS_BY_LANG over the English fallback when the
// current language has no full Dict entry of its own — a correct `ad` word
// is far more valuable than falling back to English for that one field.
export function buildDict(): Dict {
  const langKey = resolveLangKey();
  const primary = (I18N as Record<string, Dict>)[langKey] ?? I18N.en;
  const merged = primary === I18N.en ? { ...primary } : { ...I18N.en, ...primary };
  const adFallback = AD_WORDS_BY_LANG[langKey];
  if (adFallback && !(langKey in I18N)) merged.ad = adFallback;
  return merged;
}
