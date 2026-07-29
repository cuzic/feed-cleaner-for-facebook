import type { FeatureFlagKey, HideCategory } from './settings';

// This script's OWN UI text (menu items, dialog copy) — distinct from
// src/i18n.ts, which is Facebook's own microcopy as observed live. These
// strings are our original wording (MIT), not something a contributor can
// "get wrong" by mis-transcribing Facebook's UI, so unlike i18n.ts there's
// no partial-fallback merging: each language is a complete UiStrings object
// (enforced by `satisfies`), or the whole thing falls back to English.
export interface UiStrings {
  menu: Record<FeatureFlagKey, string>;
  menuCustomWords: string;
  category: Record<HideCategory, string>;
  dialogTitle: string;
  dialogHint: string; // contains a "{lang}" placeholder
  dialogCancel: string;
  dialogSave: string;
  logCount: string; // contains a "{n}" placeholder
}

const UI = {
  ja: {
    menu: {
      ad: '広告を隠す',
      addFriend: '「友達になる」を隠す',
      follow: '「フォローする」を隠す',
      join: '「参加する」を隠す',
      showLog: '非表示ログを表示する',
      fadeAnimation: '非表示演出をなめらかにする',
      badgePop: 'バッジをポップさせる',
      milestoneCelebration: '節目でお祝い演出をする',
    },
    menuCustomWords: 'あなたの言語の単語を設定',
    category: { ad: '広告', addFriend: '友達になる', follow: 'フォローする', join: '参加する' },
    dialogTitle: 'あなたの言語の単語を設定',
    dialogHint:
      'Facebookの現在の表示言語コード: "{lang}"。空欄のままなら下のプレースホルダー(現在使われている単語)がそのまま使われます。',
    dialogCancel: 'キャンセル',
    dialogSave: '保存して再読み込み',
    logCount: '{n}件を非表示にしました',
  },
  en: {
    menu: {
      ad: 'Hide ads',
      addFriend: 'Hide "Add friend"',
      follow: 'Hide "Follow"',
      join: 'Hide "Join"',
      showLog: 'Show hidden-posts log',
      fadeAnimation: 'Fade out hidden posts smoothly',
      badgePop: 'Pop the badge on each hide',
      milestoneCelebration: 'Celebrate hidden-post milestones',
    },
    menuCustomWords: "Set your language's words",
    category: { ad: 'Ad', addFriend: 'Add friend', follow: 'Follow', join: 'Join' },
    dialogTitle: "Set your language's words",
    dialogHint:
      'Facebook’s current display language code: "{lang}". Leave a field blank to keep using the placeholder shown below (the word currently in use).',
    dialogCancel: 'Cancel',
    dialogSave: 'Save & reload',
    logCount: '{n} posts hidden',
  },
  es: {
    menu: {
      ad: 'Ocultar anuncios',
      addFriend: 'Ocultar "Añadir amigo"',
      follow: 'Ocultar "Seguir"',
      join: 'Ocultar "Unirse"',
      showLog: 'Mostrar registro de publicaciones ocultas',
      fadeAnimation: 'Desvanecer las publicaciones ocultas suavemente',
      badgePop: 'Animar la insignia al ocultar',
      milestoneCelebration: 'Celebrar los hitos de publicaciones ocultas',
    },
    menuCustomWords: 'Configura las palabras de tu idioma',
    category: { ad: 'Publicidad', addFriend: 'Añadir amigo', follow: 'Seguir', join: 'Unirse' },
    dialogTitle: 'Configura las palabras de tu idioma',
    dialogHint:
      'Código de idioma actual de Facebook: "{lang}". Si dejas un campo vacío, se seguirá usando el marcador de posición (la palabra usada actualmente).',
    dialogCancel: 'Cancelar',
    dialogSave: 'Guardar y recargar',
    logCount: '{n} publicaciones ocultas',
  },
  fr: {
    menu: {
      ad: 'Masquer les publicités',
      addFriend: 'Masquer « Ajouter »',
      follow: 'Masquer « Suivre »',
      join: 'Masquer « Rejoindre »',
      showLog: 'Afficher le journal des publications masquées',
      fadeAnimation: 'Estomper les publications masquées en douceur',
      badgePop: 'Faire rebondir le badge à chaque masquage',
      milestoneCelebration: 'Célébrer les jalons de publications masquées',
    },
    menuCustomWords: 'Configurez les mots de votre langue',
    category: { ad: 'Publicité', addFriend: 'Ajouter', follow: 'Suivre', join: 'Rejoindre' },
    dialogTitle: 'Configurez les mots de votre langue',
    dialogHint:
      'Code de langue actuel de Facebook : « {lang} ». Laissez un champ vide pour continuer à utiliser le texte indicatif ci-dessous (le mot actuellement utilisé).',
    dialogCancel: 'Annuler',
    dialogSave: 'Enregistrer et recharger',
    logCount: '{n} publications masquées',
  },
  pt: {
    menu: {
      ad: 'Ocultar anúncios',
      addFriend: 'Ocultar "Adicionar amigo"',
      follow: 'Ocultar "Seguir"',
      join: 'Ocultar "Aderir"',
      showLog: 'Mostrar registo de publicações ocultas',
      fadeAnimation: 'Esmaecer as publicações ocultas suavemente',
      badgePop: 'Animar o emblema a cada ocultação',
      milestoneCelebration: 'Celebrar marcos de publicações ocultas',
    },
    menuCustomWords: 'Defina as palavras do seu idioma',
    category: { ad: 'Anúncio', addFriend: 'Adicionar amigo', follow: 'Seguir', join: 'Aderir' },
    dialogTitle: 'Defina as palavras do seu idioma',
    dialogHint:
      'Código de idioma atual do Facebook: "{lang}". Deixe um campo em branco para continuar a usar o texto de exemplo abaixo (a palavra atualmente utilizada).',
    dialogCancel: 'Cancelar',
    dialogSave: 'Guardar e recarregar',
    logCount: '{n} publicações ocultas',
  },
  de: {
    menu: {
      ad: 'Werbung ausblenden',
      addFriend: '„Freund hinzufügen“ ausblenden',
      follow: '„Folgen“ ausblenden',
      join: '„Beitreten“ ausblenden',
      showLog: 'Protokoll ausgeblendeter Beiträge anzeigen',
      fadeAnimation: 'Ausgeblendete Beiträge sanft ausblenden',
      badgePop: 'Abzeichen bei jedem Ausblenden hüpfen lassen',
      milestoneCelebration: 'Meilensteine ausgeblendeter Beiträge feiern',
    },
    menuCustomWords: 'Wörter für deine Sprache festlegen',
    category: { ad: 'Werbung', addFriend: 'Freund hinzufügen', follow: 'Folgen', join: 'Beitreten' },
    dialogTitle: 'Wörter für deine Sprache festlegen',
    dialogHint:
      'Aktueller Sprachcode von Facebook: „{lang}“. Lässt du ein Feld leer, wird weiterhin der unten angezeigte Platzhalter (das aktuell verwendete Wort) genutzt.',
    dialogCancel: 'Abbrechen',
    dialogSave: 'Speichern & neu laden',
    logCount: '{n} Beiträge ausgeblendet',
  },
  ko: {
    menu: {
      ad: '광고 숨기기',
      addFriend: '"친구 추가" 숨기기',
      follow: '"팔로우" 숨기기',
      join: '"참여" 숨기기',
      showLog: '숨긴 게시물 기록 보기',
      fadeAnimation: '숨긴 게시물 부드럽게 사라지기',
      badgePop: '숨길 때마다 배지 팝 효과',
      milestoneCelebration: '숨김 마일스톤 축하 효과',
    },
    menuCustomWords: '내 언어 단어 설정',
    category: { ad: '광고', addFriend: '친구 추가', follow: '팔로우', join: '참여' },
    dialogTitle: '내 언어 단어 설정',
    dialogHint:
      '현재 Facebook 표시 언어 코드: "{lang}". 비워두면 아래에 표시된 자리표시자(현재 사용 중인 단어)가 그대로 사용됩니다.',
    dialogCancel: '취소',
    dialogSave: '저장 후 새로고침',
    logCount: '{n}개 게시물 숨김',
  },
} satisfies Record<string, UiStrings>;

export function buildUiStrings(langKey: string): UiStrings {
  return (UI as Record<string, UiStrings>)[langKey] ?? UI.en;
}

export const fmt = (tpl: string, vars: Record<string, string | number>): string =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
