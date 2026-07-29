// ==UserScript==
// @name         Feed Cleaner for Facebook
// @namespace    https://github.com/cuzic/feed-cleaner-for-facebook
// @version      2.2.4
// @author       cuzic
// @description  Unofficial, not affiliated with or endorsed by Meta/Facebook. Built for the niche most similar scripts miss: works on m.facebook.com (mobile) in ANY Facebook UI language (7 fully verified incl. its own menu/dialog text, 57 more with ad-label coverage), actively maintained, and runs in any userscript manager (verified in Violentmonkey on Microsoft Edge for Android, since Chrome for Android doesn't support extensions at all). Hides suggested/ad posts (Ad/Add friend/Follow/Join CTAs), the suggested-groups carousel, the stories bar (mobile), and the Follow/Join/Reels/Stories units (desktop). Each CTA category, and a hidden-posts log with a fade-out/badge-pop/milestone-celebration polish, is independently toggleable from the menu. Don't see your language? Fix it yourself from that same menu, on the spot, no code needed. See README for details and full language list.
// @license      MIT
// @supportURL   https://github.com/cuzic/feed-cleaner-for-facebook/issues
// @downloadURL  https://raw.githubusercontent.com/cuzic/feed-cleaner-for-facebook/main/dist/facebook-feed-cleaner.user.js
// @updateURL    https://raw.githubusercontent.com/cuzic/feed-cleaner-for-facebook/main/dist/facebook-feed-cleaner.user.js
// @match        https://m.facebook.com/*
// @match        https://www.facebook.com/*
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(function() {
	"use strict";
	var I18N = {
		ja: {
			ad: "広告",
			addFriend: "友達になる",
			follow: "フォローする",
			join: "参加する",
			suggestedGroups: "おすすめ",
			createStory: "ストーリーズを作成",
			reels: "リール",
			feedStories: "フィードのストーリーズ"
		},
		en: {
			ad: "Ad",
			addFriend: "Add friend",
			follow: "Follow",
			join: "Join",
			suggestedGroups: "Suggested for you",
			createStory: "Create story",
			reels: "Reels",
			feedStories: "Feed Stories"
		},
		es: {
			ad: "Publicidad",
			addFriend: "Añadir como amigo(a)",
			follow: "Seguir",
			join: "Unirte",
			suggestedGroups: "Sugerencias para ti",
			createStory: "Crear historia",
			reels: "Reels",
			feedStories: "Historias"
		},
		pt: {
			ad: "Patrocinado",
			addFriend: "Adicionar à lista de amigos",
			follow: "Seguir",
			join: "Aderir",
			suggestedGroups: "Sugestões para ti",
			createStory: "Criar história",
			reels: "Reels",
			feedStories: "Stories"
		},
		fr: {
			ad: "Sponsorisé",
			addFriend: "Ajouter ami(e)",
			follow: "Suivre",
			join: "Rejoindre",
			suggestedGroups: "Suggestions",
			createStory: "Créer une story",
			reels: "Reels",
			feedStories: "Stories"
		},
		de: {
			ad: "Gesponsert",
			addFriend: "Freund/in hinzufügen",
			follow: "Folgen",
			join: "Beitreten",
			suggestedGroups: "Für dich vorgeschlagen",
			createStory: "Story erstellen",
			reels: "Reels",
			feedStories: "Stories"
		},
		ko: {
			ad: "광고",
			addFriend: "친구 추가",
			follow: "팔로우",
			join: "가입",
			suggestedGroups: "회원님을 위한 추천",
			createStory: "스토리 만들기",
			reels: "릴스",
			feedStories: "스토리"
		},
		"zh-hans": {
			ad: "赞助内容",
			addFriend: "加为好友",
			follow: "关注",
			join: "加入",
			suggestedGroups: "推荐",
			createStory: "创建快拍",
			reels: "Reels",
			feedStories: "快拍"
		},
		"zh-hant": {
			ad: "贊助",
			addFriend: "加朋友",
			follow: "追蹤",
			join: "加入",
			suggestedGroups: "推薦",
			createStory: "建立限時動態",
			reels: "Reels",
			feedStories: "限時動態"
		}
	};
	var AD_WORDS_BY_LANG = {
		af: "Geborg",
		am: "የተከፈለበት ማስታወቂያ",
		ar: "إعلان مُموَّل",
		as: "পৃষ্ঠপোষকতা কৰা",
		ay: "Yatiyanaka",
		az: "Sponsor dəstəkli",
		be: "Рэклама",
		bg: "Спонсорирано",
		br: "Paeroniet",
		bs: "Sponzorirano",
		bn: "সৌজন্যে",
		ca: "Patrocinat",
		co: "Spunsurizatu",
		cs: "Sponzorováno",
		cy: "Noddwyd",
		da: "Sponsoreret",
		de: "Gesponsert",
		el: "Χορηγούμενη",
		eo: "Reklamo",
		es: "Publicidad",
		et: "Sponsitud",
		eu: "Babestua",
		fa: "دارای پشتیبانی مالی",
		fi: "Sponsoroitu",
		fo: "Stuðlað",
		fr: "Sponsorisé",
		fy: "Sponsore",
		ga: "Urraithe",
		gl: "Patrocinado",
		gn: "Oñepatrosinapyre",
		hi: "प्रायोजित",
		hu: "Hirdetés",
		id: "Bersponsor",
		it: "Sponsorizzata",
		ja: "広告",
		jv: "Disponsori",
		kk: "Демеушілік көрсеткен",
		km: "បានឧបត្ថម្ភ",
		lo: "ໄດ້ຮັບການສະໜັບສະໜູນ",
		mk: "Спонзорирано",
		ml: "സ്പോൺസർ ചെയ്തത്",
		mn: "Ивээн тэтгэсэн",
		mr: "प्रायोजित",
		ms: "Ditaja",
		ne: "प्रायोजित",
		nl: "Gesponsord",
		or: "ପ୍ରଯୋଜିତ",
		pa: "ਸਰਪ੍ਰਸਤੀ ਪ੍ਰਾਪਤ",
		pl: "Sponsorowane",
		ps: "تمويل شوي",
		pt: "Patrocinado",
		ru: "Реклама",
		si: "අනුග්‍රහය දක්වන ලද",
		so: "La maalgeliyey",
		sv: "Sponsrad",
		te: "స్పాన్సర్ చేసినవి",
		th: "ได้รับการสนับสนุน",
		tl: "May Sponsor",
		tr: "Sponsorlu",
		uk: "Реклама",
		ur: "تعاون کردہ",
		vi: "Được tài trợ",
		"zh-hans": "赞助内容",
		"zh-hant": "贊助"
	};
	function resolveLangKey() {
		const raw = (document.documentElement.lang || navigator.language || "en").toLowerCase();
		if (raw.startsWith("zh-hant") || raw === "zh-tw" || raw === "zh-hk") return "zh-hant";
		if (raw.startsWith("zh")) return "zh-hans";
		return raw.split("-")[0] ?? raw;
	}
	function buildDict() {
		const langKey = resolveLangKey();
		const primary = I18N[langKey] ?? I18N.en;
		const merged = primary === I18N.en ? { ...primary } : {
			...I18N.en,
			...primary
		};
		const adFallback = AD_WORDS_BY_LANG[langKey];
		if (adFallback && !(langKey in I18N)) merged.ad = adFallback;
		return merged;
	}
	var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
	var _GM_registerMenuCommand = (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
	var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
	var UI$1 = {
		ja: {
			menu: {
				ad: "広告を隠す",
				addFriend: "「友達になる」を隠す",
				follow: "「フォローする」を隠す",
				join: "「参加する」を隠す",
				showLog: "非表示ログを表示する",
				fadeAnimation: "非表示演出をなめらかにする",
				badgePop: "バッジをポップさせる",
				milestoneCelebration: "節目でお祝い演出をする"
			},
			menuCustomWords: "あなたの言語の単語を設定",
			category: {
				ad: "広告",
				addFriend: "友達になる",
				follow: "フォローする",
				join: "参加する"
			},
			dialogTitle: "あなたの言語の単語を設定",
			dialogHint: "Facebookの現在の表示言語コード: \"{lang}\"。空欄のままなら下のプレースホルダー(現在使われている単語)がそのまま使われます。",
			dialogCancel: "キャンセル",
			dialogSave: "保存して再読み込み",
			logCount: "{n}件を非表示にしました"
		},
		en: {
			menu: {
				ad: "Hide ads",
				addFriend: "Hide \"Add friend\"",
				follow: "Hide \"Follow\"",
				join: "Hide \"Join\"",
				showLog: "Show hidden-posts log",
				fadeAnimation: "Fade out hidden posts smoothly",
				badgePop: "Pop the badge on each hide",
				milestoneCelebration: "Celebrate hidden-post milestones"
			},
			menuCustomWords: "Set your language's words",
			category: {
				ad: "Ad",
				addFriend: "Add friend",
				follow: "Follow",
				join: "Join"
			},
			dialogTitle: "Set your language's words",
			dialogHint: "Facebook’s current display language code: \"{lang}\". Leave a field blank to keep using the placeholder shown below (the word currently in use).",
			dialogCancel: "Cancel",
			dialogSave: "Save & reload",
			logCount: "{n} posts hidden"
		},
		es: {
			menu: {
				ad: "Ocultar anuncios",
				addFriend: "Ocultar \"Añadir amigo\"",
				follow: "Ocultar \"Seguir\"",
				join: "Ocultar \"Unirse\"",
				showLog: "Mostrar registro de publicaciones ocultas",
				fadeAnimation: "Desvanecer las publicaciones ocultas suavemente",
				badgePop: "Animar la insignia al ocultar",
				milestoneCelebration: "Celebrar los hitos de publicaciones ocultas"
			},
			menuCustomWords: "Configura las palabras de tu idioma",
			category: {
				ad: "Publicidad",
				addFriend: "Añadir amigo",
				follow: "Seguir",
				join: "Unirse"
			},
			dialogTitle: "Configura las palabras de tu idioma",
			dialogHint: "Código de idioma actual de Facebook: \"{lang}\". Si dejas un campo vacío, se seguirá usando el marcador de posición (la palabra usada actualmente).",
			dialogCancel: "Cancelar",
			dialogSave: "Guardar y recargar",
			logCount: "{n} publicaciones ocultas"
		},
		fr: {
			menu: {
				ad: "Masquer les publicités",
				addFriend: "Masquer « Ajouter »",
				follow: "Masquer « Suivre »",
				join: "Masquer « Rejoindre »",
				showLog: "Afficher le journal des publications masquées",
				fadeAnimation: "Estomper les publications masquées en douceur",
				badgePop: "Faire rebondir le badge à chaque masquage",
				milestoneCelebration: "Célébrer les jalons de publications masquées"
			},
			menuCustomWords: "Configurez les mots de votre langue",
			category: {
				ad: "Publicité",
				addFriend: "Ajouter",
				follow: "Suivre",
				join: "Rejoindre"
			},
			dialogTitle: "Configurez les mots de votre langue",
			dialogHint: "Code de langue actuel de Facebook\xA0: «\xA0{lang}\xA0». Laissez un champ vide pour continuer à utiliser le texte indicatif ci-dessous (le mot actuellement utilisé).",
			dialogCancel: "Annuler",
			dialogSave: "Enregistrer et recharger",
			logCount: "{n} publications masquées"
		},
		pt: {
			menu: {
				ad: "Ocultar anúncios",
				addFriend: "Ocultar \"Adicionar amigo\"",
				follow: "Ocultar \"Seguir\"",
				join: "Ocultar \"Aderir\"",
				showLog: "Mostrar registo de publicações ocultas",
				fadeAnimation: "Esmaecer as publicações ocultas suavemente",
				badgePop: "Animar o emblema a cada ocultação",
				milestoneCelebration: "Celebrar marcos de publicações ocultas"
			},
			menuCustomWords: "Defina as palavras do seu idioma",
			category: {
				ad: "Anúncio",
				addFriend: "Adicionar amigo",
				follow: "Seguir",
				join: "Aderir"
			},
			dialogTitle: "Defina as palavras do seu idioma",
			dialogHint: "Código de idioma atual do Facebook: \"{lang}\". Deixe um campo em branco para continuar a usar o texto de exemplo abaixo (a palavra atualmente utilizada).",
			dialogCancel: "Cancelar",
			dialogSave: "Guardar e recarregar",
			logCount: "{n} publicações ocultas"
		},
		de: {
			menu: {
				ad: "Werbung ausblenden",
				addFriend: "„Freund hinzufügen“ ausblenden",
				follow: "„Folgen“ ausblenden",
				join: "„Beitreten“ ausblenden",
				showLog: "Protokoll ausgeblendeter Beiträge anzeigen",
				fadeAnimation: "Ausgeblendete Beiträge sanft ausblenden",
				badgePop: "Abzeichen bei jedem Ausblenden hüpfen lassen",
				milestoneCelebration: "Meilensteine ausgeblendeter Beiträge feiern"
			},
			menuCustomWords: "Wörter für deine Sprache festlegen",
			category: {
				ad: "Werbung",
				addFriend: "Freund hinzufügen",
				follow: "Folgen",
				join: "Beitreten"
			},
			dialogTitle: "Wörter für deine Sprache festlegen",
			dialogHint: "Aktueller Sprachcode von Facebook: „{lang}“. Lässt du ein Feld leer, wird weiterhin der unten angezeigte Platzhalter (das aktuell verwendete Wort) genutzt.",
			dialogCancel: "Abbrechen",
			dialogSave: "Speichern & neu laden",
			logCount: "{n} Beiträge ausgeblendet"
		},
		ko: {
			menu: {
				ad: "광고 숨기기",
				addFriend: "\"친구 추가\" 숨기기",
				follow: "\"팔로우\" 숨기기",
				join: "\"참여\" 숨기기",
				showLog: "숨긴 게시물 기록 보기",
				fadeAnimation: "숨긴 게시물 부드럽게 사라지기",
				badgePop: "숨길 때마다 배지 팝 효과",
				milestoneCelebration: "숨김 마일스톤 축하 효과"
			},
			menuCustomWords: "내 언어 단어 설정",
			category: {
				ad: "광고",
				addFriend: "친구 추가",
				follow: "팔로우",
				join: "참여"
			},
			dialogTitle: "내 언어 단어 설정",
			dialogHint: "현재 Facebook 표시 언어 코드: \"{lang}\". 비워두면 아래에 표시된 자리표시자(현재 사용 중인 단어)가 그대로 사용됩니다.",
			dialogCancel: "취소",
			dialogSave: "저장 후 새로고침",
			logCount: "{n}개 게시물 숨김"
		}
	};
	function buildUiStrings(langKey) {
		return UI$1[langKey] ?? UI$1.en;
	}
	var fmt = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
	var HIDE_CATEGORIES = [
		"ad",
		"addFriend",
		"follow",
		"join"
	];
	var DEFAULTS = {
		ad: true,
		addFriend: true,
		follow: true,
		join: true,
		showLog: false,
		fadeAnimation: true,
		badgePop: true,
		milestoneCelebration: true
	};
	var STORAGE_PREFIX = "hide.";
	function loadFlags() {
		const flags = {};
		Object.keys(DEFAULTS).forEach((key) => {
			flags[key] = _GM_getValue(STORAGE_PREFIX + key, DEFAULTS[key]);
		});
		return flags;
	}
	function registerToggleMenu(flags, ui) {
		Object.keys(flags).forEach((key) => {
			_GM_registerMenuCommand(`${flags[key] ? "✅" : "⬜"} ${ui.menu[key]}`, () => {
				_GM_setValue(STORAGE_PREFIX + key, !flags[key]);
				location.reload();
			});
		});
	}
	var CUSTOM_WORDS_PREFIX = "customWords.";
	function loadCustomWords(langKey) {
		return _GM_getValue(CUSTOM_WORDS_PREFIX + langKey, {});
	}
	function saveCustomWords(langKey, words) {
		_GM_setValue(CUSTOM_WORDS_PREFIX + langKey, words);
	}
	function openCustomWordsDialog(langKey, ui, placeholders) {
		if (document.getElementById("cleansns-custom-words")) return;
		const current = loadCustomWords(langKey);
		const backdrop = document.createElement("div");
		backdrop.id = "cleansns-custom-words";
		backdrop.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-family:sans-serif;";
		const panel = document.createElement("form");
		panel.style.cssText = "background:#fff;color:#111;border-radius:8px;padding:20px;width:min(90vw,420px);max-height:85vh;overflow:auto;box-shadow:0 4px 24px rgba(0,0,0,.3);";
		const title = document.createElement("h2");
		title.textContent = ui.dialogTitle;
		title.style.cssText = "font-size:16px;margin:0 0 8px;";
		panel.appendChild(title);
		const hint = document.createElement("p");
		hint.textContent = fmt(ui.dialogHint, { lang: langKey });
		hint.style.cssText = "font-size:12px;color:#666;margin:0 0 16px;";
		panel.appendChild(hint);
		const inputs = {};
		HIDE_CATEGORIES.forEach((key) => {
			const label = document.createElement("label");
			label.style.cssText = "display:block;font-size:13px;margin-bottom:12px;";
			label.textContent = ui.category[key];
			const input = document.createElement("input");
			input.type = "text";
			input.value = current[key] ?? "";
			input.placeholder = placeholders[key];
			input.style.cssText = "display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:14px;";
			label.appendChild(input);
			panel.appendChild(label);
			inputs[key] = input;
		});
		const buttonRow = document.createElement("div");
		buttonRow.style.cssText = "display:flex;gap:8px;justify-content:flex-end;margin-top:8px;";
		const cancelBtn = document.createElement("button");
		cancelBtn.type = "button";
		cancelBtn.textContent = ui.dialogCancel;
		cancelBtn.style.cssText = "padding:8px 14px;border:1px solid #ccc;border-radius:4px;background:#f5f5f5;cursor:pointer;";
		cancelBtn.addEventListener("click", () => backdrop.remove());
		const saveBtn = document.createElement("button");
		saveBtn.type = "submit";
		saveBtn.textContent = ui.dialogSave;
		saveBtn.style.cssText = "padding:8px 14px;border:none;border-radius:4px;background:#1877f2;color:#fff;cursor:pointer;";
		buttonRow.append(cancelBtn, saveBtn);
		panel.appendChild(buttonRow);
		panel.addEventListener("submit", (e) => {
			e.preventDefault();
			const words = {};
			HIDE_CATEGORIES.forEach((key) => {
				const v = inputs[key].value.trim();
				if (v) words[key] = v;
			});
			saveCustomWords(langKey, words);
			location.reload();
		});
		backdrop.addEventListener("click", (e) => {
			if (e.target === backdrop) backdrop.remove();
		});
		backdrop.appendChild(panel);
		document.body.appendChild(backdrop);
	}
	function registerCustomWordsMenu(langKey, ui, placeholders) {
		_GM_registerMenuCommand(`⚙️ ${ui.menuCustomWords}`, () => {
			openCustomWordsDialog(langKey, ui, placeholders);
		});
	}
	var MAX_ENTRIES = 10;
	function snippet(el, max = 40) {
		const t = (el.getAttribute("aria-label") ?? el.querySelector("h2, h3, strong, [role=\"heading\"]")?.textContent ?? el.textContent ?? "").replace(/\s+/g, " ").trim();
		return t.length > max ? t.slice(0, max) + "…" : t;
	}
	var MILESTONES = [
		10,
		25,
		50,
		100,
		250,
		500,
		1e3,
		2500,
		5e3
	];
	var LAST_MILESTONE = 5e3;
	var isMilestone = (n) => MILESTONES.includes(n) || n > LAST_MILESTONE && n % LAST_MILESTONE === 0;
	function createHideLog(ui, opts) {
		const entries = [];
		let total = 0;
		const seen = new WeakSet();
		let badge = null;
		let expanded = false;
		function ensureBadge() {
			if (badge) return badge;
			badge = document.createElement("div");
			badge.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:2147483646;background:#1c1e21;color:#fff;font-family:sans-serif;font-size:12px;border-radius:16px;padding:6px 12px;cursor:pointer;user-select:none;box-shadow:0 1px 6px rgba(0,0,0,.4);";
			badge.addEventListener("click", () => {
				expanded = !expanded;
				render();
			});
			document.documentElement.appendChild(badge);
			return badge;
		}
		function render() {
			const el = ensureBadge();
			if (!expanded) {
				el.textContent = `🧹 ${total}`;
				return;
			}
			el.textContent = "";
			const header = document.createElement("div");
			header.style.cssText = "font-weight:bold;margin-bottom:4px;";
			header.textContent = fmt(ui.logCount, { n: total });
			const rows = document.createElement("div");
			rows.style.cssText = "white-space:pre-wrap;max-width:60vw;max-height:40vh;overflow:auto;";
			rows.textContent = entries.slice().reverse().map((e) => `${e.label} · ${e.text}`).join("\n");
			el.append(header, rows);
		}
		return { record(label, el) {
			if (seen.has(el)) return;
			seen.add(el);
			total++;
			entries.push({
				label,
				text: snippet(el)
			});
			if (entries.length > MAX_ENTRIES) entries.shift();
			render();
			const badgeEl = ensureBadge();
			if (opts.milestoneCelebration && isMilestone(total)) badgeEl.animate([
				{
					transform: "scale(1)",
					backgroundColor: "#1c1e21"
				},
				{
					transform: "scale(1.6)",
					backgroundColor: "#f5a623"
				},
				{
					transform: "scale(1)",
					backgroundColor: "#1c1e21"
				}
			], {
				duration: 700,
				easing: "ease-out"
			});
			else if (opts.badgePop) badgeEl.animate([
				{ transform: "scale(1)" },
				{ transform: "scale(1.35)" },
				{ transform: "scale(1)" }
			], {
				duration: 300,
				easing: "ease-out"
			});
		} };
	}
	var HIDE_MARK = "data-cleansns-hidden";
	var DICT = buildDict();
	var LANG_KEY = resolveLangKey();
	var UI = buildUiStrings(LANG_KEY);
	var CUSTOM_WORDS = loadCustomWords(LANG_KEY);
	HIDE_CATEGORIES.forEach((key) => {
		const custom = CUSTOM_WORDS[key];
		if (custom) DICT[key] = custom;
	});
	var FLAGS = loadFlags();
	registerToggleMenu(FLAGS, UI);
	registerCustomWordsMenu(LANG_KEY, UI, {
		ad: DICT.ad,
		addFriend: DICT.addFriend,
		follow: DICT.follow,
		join: DICT.join
	});
	var log = FLAGS.showLog ? createHideLog(UI, {
		badgePop: FLAGS.badgePop,
		milestoneCelebration: FLAGS.milestoneCelebration
	}) : null;
	var CATEGORY_LABELS = {
		ad: UI.category.ad,
		addFriend: UI.category.addFriend,
		follow: UI.category.follow,
		join: UI.category.join,
		suggestedGroups: DICT.suggestedGroups,
		createStory: DICT.createStory,
		reels: DICT.reels,
		feedStories: DICT.feedStories
	};
	var CTA_CATEGORY = new Map();
	var addWord = (word, cat) => {
		if (word) CTA_CATEGORY.set(word, cat);
	};
	if (FLAGS.addFriend) addWord(DICT.addFriend, "addFriend");
	if (FLAGS.follow) addWord(DICT.follow, "follow");
	if (FLAGS.join) addWord(DICT.join, "join");
	if (FLAGS.ad) {
		Object.values(AD_WORDS_BY_LANG).forEach((w) => addWord(w, "ad"));
		addWord(DICT.ad, "ad");
	}
	var CTA_WORDS = [...CTA_CATEGORY.keys()];
	var CTA_MAX_LEN = CTA_WORDS.length ? Math.max(...CTA_WORDS.map((w) => w.length)) + 2 : 0;
	var NOISE = /[\s​‌‍‎‏⁠﻿+＋・]/g;
	function matchCtaPrefix(text) {
		const t = (text ?? "").replace(NOISE, "");
		if (t.length > CTA_MAX_LEN) return null;
		for (const w of CTA_WORDS) if (t.startsWith(w)) return CTA_CATEGORY.get(w) ?? null;
		return null;
	}
	var MAX_WRAPPER_VIEWPORTS = 3;
	var warned = new WeakSet();
	function warnOnce(el, reason) {
		if (warned.has(el)) return;
		warned.add(el);
		console.warn(`[feed-cleaner] ${reason}:`, el);
	}
	function isSafeWrapper(el) {
		if (el.hasAttribute(HIDE_MARK)) return true;
		return el.getBoundingClientRect().height <= window.innerHeight * MAX_WRAPPER_VIEWPORTS;
	}
	function isVscrollerChild(el) {
		const p = el.parentElement;
		return !!(p && p.getAttribute && p.getAttribute("data-type") === "vscroller");
	}
	var MAX_HOPS = 100;
	function walkUpTo(el, isTarget) {
		let hops = 0;
		for (let cur = el; cur && cur !== document.body && hops < MAX_HOPS; cur = cur.parentElement, hops++) if (isTarget(cur)) return cur;
		return null;
	}
	var FADE_MS = 250;
	var FADE_STARTED_MARK = "data-cleansns-fading";
	var fadePending = new Map();
	var fadeObserver = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (!entry.isIntersecting) continue;
			const el = entry.target;
			fadeObserver.unobserve(el);
			const pending = fadePending.get(el);
			fadePending.delete(el);
			if (pending) startFade(el, pending.prop, pending.value);
		}
	});
	function startFade(el, prop, value) {
		if (el.hasAttribute(FADE_STARTED_MARK)) return;
		el.setAttribute(FADE_STARTED_MARK, "1");
		el.style.setProperty("transition", `opacity ${FADE_MS}ms ease-out`, "important");
		el.style.setProperty("pointer-events", "none", "important");
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				el.style.setProperty("opacity", "0", "important");
			});
		});
		window.setTimeout(() => el.style.setProperty(prop, value, "important"), 310);
	}
	function hide(el, prop, value, animate) {
		if (el.style.getPropertyValue(prop) === value) {
			el.setAttribute(HIDE_MARK, "1");
			return;
		}
		if (animate) {
			if (!el.hasAttribute(FADE_STARTED_MARK) && !fadePending.has(el)) {
				fadePending.set(el, {
					prop,
					value
				});
				fadeObserver.observe(el);
			}
		} else {
			el.style.setProperty(prop, value, "important");
			if (prop === "visibility") el.style.setProperty("pointer-events", "none", "important");
		}
		el.setAttribute(HIDE_MARK, "1");
	}
	function unhide(el, prop) {
		fadeObserver.unobserve(el);
		fadePending.delete(el);
		el.style.removeProperty(prop);
		el.style.removeProperty("opacity");
		el.style.removeProperty("transition");
		el.style.removeProperty("pointer-events");
		el.removeAttribute(HIDE_MARK);
		el.removeAttribute(FADE_STARTED_MARK);
	}
	function scanMobile() {
		const want = new Map();
		const add = (el, cat) => {
			const wrapper = walkUpTo(el, isVscrollerChild);
			if (!wrapper) return;
			if (!isSafeWrapper(wrapper)) {
				warnOnce(wrapper, "skipped an oversized wrapper (possible over-match)");
				return;
			}
			if (!want.has(wrapper)) want.set(wrapper, cat);
		};
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const cat = matchCtaPrefix(node.nodeValue);
			if (cat && node.parentElement) add(node.parentElement, cat);
		}
		document.querySelectorAll(`h2[aria-label="${DICT.suggestedGroups}"]`).forEach((el) => add(el, "suggestedGroups"));
		document.querySelectorAll(`[aria-label="${DICT.createStory}"]`).forEach((el) => add(el, "createStory"));
		document.querySelectorAll(`[${HIDE_MARK}]`).forEach((wrapper) => {
			if (!want.has(wrapper)) unhide(wrapper, "visibility");
		});
		want.forEach((cat, wrapper) => {
			if (!wrapper.hasAttribute(HIDE_MARK)) log?.record(CATEGORY_LABELS[cat], wrapper);
			hide(wrapper, "visibility", "hidden", FLAGS.fadeAnimation);
		});
	}
	function hasPagelet(el) {
		return !!(el.hasAttribute && el.hasAttribute("data-pagelet"));
	}
	function scanDesktop() {
		const want = new Map();
		const add = (el, cat) => {
			const wrapper = walkUpTo(el, hasPagelet);
			if (!wrapper) return;
			if (!isSafeWrapper(wrapper)) {
				warnOnce(wrapper, "skipped an oversized wrapper (possible over-match)");
				return;
			}
			if (!want.has(wrapper)) want.set(wrapper, cat);
		};
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const t = (node.nodeValue ?? "").replace(NOISE, "");
			const cat = CTA_CATEGORY.get(t);
			if (cat && node.parentElement) add(node.parentElement, cat);
		}
		document.querySelectorAll("h3").forEach((h3) => {
			if ((h3.textContent ?? "").trim() === DICT.reels) add(h3, "reels");
		});
		document.querySelectorAll(`div[aria-label="${DICT.feedStories}"]`).forEach((el) => add(el, "feedStories"));
		document.querySelectorAll(`[${HIDE_MARK}]`).forEach((wrapper) => {
			if (!want.has(wrapper)) unhide(wrapper, "display");
		});
		want.forEach((cat, wrapper) => {
			if (!wrapper.hasAttribute(HIDE_MARK)) log?.record(CATEGORY_LABELS[cat], wrapper);
			hide(wrapper, "display", "none", FLAGS.fadeAnimation);
		});
	}
	var scan = location.hostname === "m.facebook.com" ? scanMobile : scanDesktop;
	var scheduled = false;
	function scheduleScan() {
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
		characterData: true
	});
	setInterval(scan, 1500);
	scan();
})();
