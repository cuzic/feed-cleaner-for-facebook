// ==UserScript==
// @name         Facebook Feed Cleaner DEBUG
// @namespace    https://github.com/cuzic/feed-cleaner-for-facebook-debug
// @version      2.2.0
// @author       cuzic
// @description  Debug overlay: outlines matched CTA spans/wrappers instead of hiding them
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/cuzic/feed-cleaner-for-facebook/main/dist/facebook-feed-cleaner-debug.user.js
// @updateURL    https://raw.githubusercontent.com/cuzic/feed-cleaner-for-facebook/main/dist/facebook-feed-cleaner-debug.user.js
// @match        https://m.facebook.com/*
// @match        https://mbasic.facebook.com/*
// @grant        none
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
	function escapeRegExp(s) {
		return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
	var CTA_PATTERNS = Array.from(new Set(Object.values(I18N).flatMap((d) => [
		d.ad,
		d.addFriend,
		d.follow,
		d.join
	]))).map((w) => new RegExp("^" + escapeRegExp(w)));
	function matchesCta(text) {
		const t = (text ?? "").trim();
		return CTA_PATTERNS.some((re) => re.test(t));
	}
	function isVscrollerChild(el) {
		const p = el.parentElement;
		return !!(p && p.getAttribute && p.getAttribute("data-type") === "vscroller");
	}
	function walkUpTo(el, isTarget, maxHops) {
		let cur = el;
		for (let hops = 0; cur && hops < maxHops; hops++) {
			if (isTarget(cur)) return {
				found: cur,
				hops
			};
			cur = cur.parentElement;
		}
		return {
			found: null,
			hops: maxHops
		};
	}
	var overlay = document.getElementById("cleansns-debug-overlay");
	if (!overlay) {
		overlay = document.createElement("div");
		overlay.id = "cleansns-debug-overlay";
		overlay.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2147483647;background:rgba(0,0,0,0.85);color:#0f0;font-size:12px;font-family:monospace;padding:6px;max-height:40vh;overflow:auto;white-space:pre-wrap;";
		document.documentElement.appendChild(overlay);
	}
	var overlayEl = overlay;
	function scan() {
		const spans = Array.from(document.querySelectorAll("span")).filter((span) => span.children.length === 0 && matchesCta(span.textContent));
		const lines = [];
		lines.push("CTA leaf spans found: " + spans.length);
		spans.forEach((span, i) => {
			const text = (span.textContent ?? "").trim();
			span.style.setProperty("outline", "3px solid red", "important");
			const { found, hops } = walkUpTo(span, isVscrollerChild, 25);
			if (found) found.style.setProperty("outline", "4px solid blue", "important");
			const ancestorTags = [];
			let cur = span;
			for (let h = 0; h < 8 && cur; h++) {
				const attrs = [];
				if (cur.getAttribute && cur.getAttribute("data-type")) attrs.push("data-type=" + cur.getAttribute("data-type"));
				if (cur.className && typeof cur.className === "string") attrs.push("class=" + cur.className.slice(0, 20));
				ancestorTags.push(cur.tagName + (attrs.length ? "[" + attrs.join(",") + "]" : ""));
				cur = cur.parentElement;
			}
			lines.push(`#${i} "${text}" wrapperFound=${!!found} hops=${hops}\n  chain: ${ancestorTags.join(" > ")}`);
		});
		overlayEl.textContent = lines.join("\n");
	}
	new MutationObserver(() => setTimeout(scan, 200)).observe(document.documentElement, {
		childList: true,
		subtree: true,
		characterData: true
	});
	setInterval(scan, 1500);
	scan();
})();
