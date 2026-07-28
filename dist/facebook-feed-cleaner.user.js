// ==UserScript==
// @name         Feed Cleaner for Facebook
// @namespace    https://github.com/cuzic/feed-cleaner-for-facebook
// @version      2.0.0
// @author       cuzic
// @description  Unofficial, not affiliated with or endorsed by Meta/Facebook. Hides suggested/ad posts (Ad/Add friend/Follow/Join CTAs), the suggested-groups carousel, the stories bar (mobile), and the Follow/Join/Reels/Stories units (desktop) on Facebook. Works in any Facebook UI language; each CTA category can be toggled from the userscript manager's menu. See README to add or fix a language.
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
	var DEFAULTS = {
		ad: true,
		addFriend: true,
		follow: true,
		join: true
	};
	var STORAGE_PREFIX = "hide.";
	function loadFlags() {
		const flags = {};
		Object.keys(DEFAULTS).forEach((key) => {
			flags[key] = _GM_getValue(STORAGE_PREFIX + key, DEFAULTS[key]);
		});
		return flags;
	}
	var LABELS = {
		ad: "広告 / Ad",
		addFriend: "友達になる / Add friend",
		follow: "フォローする / Follow",
		join: "参加する / Join"
	};
	function registerToggleMenu(flags) {
		Object.keys(flags).forEach((key) => {
			_GM_registerMenuCommand(`${flags[key] ? "✅" : "⬜"} ${LABELS[key]}を隠す`, () => {
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
	function openCustomWordsDialog(langKey, placeholders) {
		if (document.getElementById("cleansns-custom-words")) return;
		const current = loadCustomWords(langKey);
		const backdrop = document.createElement("div");
		backdrop.id = "cleansns-custom-words";
		backdrop.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-family:sans-serif;";
		const panel = document.createElement("form");
		panel.style.cssText = "background:#fff;color:#111;border-radius:8px;padding:20px;width:min(90vw,420px);max-height:85vh;overflow:auto;box-shadow:0 4px 24px rgba(0,0,0,.3);";
		const title = document.createElement("h2");
		title.textContent = "あなたの言語の単語を設定 / Set your language’s words";
		title.style.cssText = "font-size:16px;margin:0 0 8px;";
		panel.appendChild(title);
		const hint = document.createElement("p");
		hint.textContent = `Facebookの現在の表示言語コード: "${langKey}"。空欄のままなら下のプレースホルダー(現在使われている単語)がそのまま使われます。`;
		hint.style.cssText = "font-size:12px;color:#666;margin:0 0 16px;";
		panel.appendChild(hint);
		const inputs = {};
		Object.keys(LABELS).forEach((key) => {
			const label = document.createElement("label");
			label.style.cssText = "display:block;font-size:13px;margin-bottom:12px;";
			label.textContent = LABELS[key];
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
		cancelBtn.textContent = "キャンセル";
		cancelBtn.style.cssText = "padding:8px 14px;border:1px solid #ccc;border-radius:4px;background:#f5f5f5;cursor:pointer;";
		cancelBtn.addEventListener("click", () => backdrop.remove());
		const saveBtn = document.createElement("button");
		saveBtn.type = "submit";
		saveBtn.textContent = "保存して再読み込み";
		saveBtn.style.cssText = "padding:8px 14px;border:none;border-radius:4px;background:#1877f2;color:#fff;cursor:pointer;";
		buttonRow.append(cancelBtn, saveBtn);
		panel.appendChild(buttonRow);
		panel.addEventListener("submit", (e) => {
			e.preventDefault();
			const words = {};
			Object.keys(inputs).forEach((key) => {
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
	function registerCustomWordsMenu(langKey, placeholders) {
		_GM_registerMenuCommand("⚙️ あなたの言語の単語を設定 / Set your language’s words", () => {
			openCustomWordsDialog(langKey, placeholders);
		});
	}
	var HIDE_MARK = "data-cleansns-hidden";
	var DICT = buildDict();
	var LANG_KEY = resolveLangKey();
	var CUSTOM_WORDS = loadCustomWords(LANG_KEY);
	if (CUSTOM_WORDS.ad) DICT.ad = CUSTOM_WORDS.ad;
	if (CUSTOM_WORDS.addFriend) DICT.addFriend = CUSTOM_WORDS.addFriend;
	if (CUSTOM_WORDS.follow) DICT.follow = CUSTOM_WORDS.follow;
	if (CUSTOM_WORDS.join) DICT.join = CUSTOM_WORDS.join;
	var FLAGS = loadFlags();
	registerToggleMenu(FLAGS);
	registerCustomWordsMenu(LANG_KEY, {
		ad: DICT.ad,
		addFriend: DICT.addFriend,
		follow: DICT.follow,
		join: DICT.join
	});
	var uniq = (arr) => Array.from(new Set(arr.filter((v) => !!v)));
	var ALL_AD_WORDS = FLAGS.ad ? Object.values(AD_WORDS_BY_LANG) : [];
	var MOBILE_CTA_WORDS = uniq([
		FLAGS.ad ? DICT.ad : void 0,
		FLAGS.addFriend ? DICT.addFriend : void 0,
		FLAGS.follow ? DICT.follow : void 0,
		FLAGS.join ? DICT.join : void 0,
		...ALL_AD_WORDS
	]);
	var DESKTOP_CTA_WORDS = uniq([
		FLAGS.follow ? DICT.follow : void 0,
		FLAGS.join ? DICT.join : void 0,
		FLAGS.ad ? DICT.ad : void 0,
		FLAGS.addFriend ? DICT.addFriend : void 0,
		...ALL_AD_WORDS
	]);
	var maxCtaLen = (words) => Math.max(...words.map((w) => w.length)) + 2;
	var MOBILE_CTA_MAX_LEN = maxCtaLen(MOBILE_CTA_WORDS);
	var DESKTOP_CTA_MAX_LEN = maxCtaLen(DESKTOP_CTA_WORDS);
	var NOISE = /[\s​‌‍‎‏⁠﻿+＋・]/g;
	function isCtaLabel(text, words, maxLen) {
		const t = (text ?? "").replace(NOISE, "");
		return t.length <= maxLen && words.some((w) => t.startsWith(w));
	}
	function isVscrollerChild(el) {
		const p = el.parentElement;
		return !!(p && p.getAttribute && p.getAttribute("data-type") === "vscroller");
	}
	function walkUpTo(el, isTarget) {
		for (let cur = el; cur && cur !== document.body; cur = cur.parentElement) if (isTarget(cur)) return cur;
		return null;
	}
	function hide(el, prop, value) {
		if (el.style.getPropertyValue(prop) !== value) {
			el.style.setProperty(prop, value, "important");
			if (prop === "visibility") el.style.setProperty("pointer-events", "none", "important");
		}
		el.setAttribute(HIDE_MARK, "1");
	}
	function unhide(el, prop) {
		el.style.removeProperty(prop);
		if (prop === "visibility") el.style.removeProperty("pointer-events");
		el.removeAttribute(HIDE_MARK);
	}
	function scanMobile() {
		const want = new Set();
		const add = (el) => {
			const wrapper = walkUpTo(el, isVscrollerChild);
			if (wrapper) want.add(wrapper);
		};
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) if (isCtaLabel(node.nodeValue, MOBILE_CTA_WORDS, MOBILE_CTA_MAX_LEN) && node.parentElement) add(node.parentElement);
		document.querySelectorAll(`h2[aria-label="${DICT.suggestedGroups}"], [aria-label="${DICT.createStory}"]`).forEach(add);
		document.querySelectorAll(`[${HIDE_MARK}]`).forEach((wrapper) => {
			if (!want.has(wrapper)) unhide(wrapper, "visibility");
		});
		want.forEach((wrapper) => hide(wrapper, "visibility", "hidden"));
	}
	function hasPagelet(el) {
		return !!(el.hasAttribute && el.hasAttribute("data-pagelet"));
	}
	function scanDesktop() {
		const want = new Set();
		const add = (el) => {
			const wrapper = walkUpTo(el, hasPagelet);
			if (wrapper) want.add(wrapper);
		};
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const t = (node.nodeValue ?? "").replace(NOISE, "");
			if (t.length <= DESKTOP_CTA_MAX_LEN && DESKTOP_CTA_WORDS.includes(t) && node.parentElement) add(node.parentElement);
		}
		document.querySelectorAll("h3").forEach((h3) => {
			if ((h3.textContent ?? "").trim() === DICT.reels) add(h3);
		});
		document.querySelectorAll(`div[aria-label="${DICT.feedStories}"]`).forEach(add);
		document.querySelectorAll(`[${HIDE_MARK}]`).forEach((wrapper) => {
			if (!want.has(wrapper)) unhide(wrapper, "display");
		});
		want.forEach((wrapper) => hide(wrapper, "display", "none"));
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
