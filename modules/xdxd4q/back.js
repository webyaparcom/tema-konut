/* hero-sahne — Sahne hero: 30 sn AI video yuvası (15 Kas 2026, G3 · mcp:webmaker/20261115-202336-i5p2 · D19).
   Yer tutucular (koşulsuz): shnsinif shnmedya shnust shnbaslik shnmetin shnctalar shnkontrol shnasagi shnsure.
   Medya sözleşmesi (D19): desing.video (≤30 sn döngü; uzunsa betik 30. sn'de başa sarar) + desing.poster ZORUNLU eş (yoksa img'e düşer;
   video ve poster ikisi de yoksa yuva — data-wm-ai-yuva — gradyan yer tutucuyla basılır, G5 / ComfyUI üretimi doldurur).
   video_mobil (≤768px kaynağı) · altyazi (dil sözlüğü .vtt) · autoplay (sessiz, playsinline; reduced-motion'da betik durdurur).
   Metin: baslik → setting.name · metin → setting.description · ust/cta*_ad yalnız doluysa (dil sözlüğü; dil listesi ezberi yok — D18). */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `/img/${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");

const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const stil = ["cerceve", "sinema"].includes(String(des.stil || "").trim()) ? String(des.stil).trim() : "cerceve";

let sure = parseInt(des.sure, 10);
if (!Number.isFinite(sure) || sure < 3) sure = 30;
sure = Math.min(30, sure);

const video = medyaUrl(des.video);
const videoMobil = medyaUrl(des.video_mobil);
const img = medyaUrl(des.img);
const poster = medyaUrl(des.poster) || img;
const alt = pick(des.alt).trim();
const otomatik = dogru(des.autoplay, true);
const altyazi = medyaUrl(pick(des.altyazi));

let shnMedya = "";
let videoVar = false;
if (video && poster) {
  videoVar = true;
  const kaynak = [
    videoMobil ? `<source src="${esc(videoMobil)}" media="(max-width: 768px)" />` : "",
    `<source src="${esc(video)}" />`,
  ].join("");
  const iz = altyazi ? `<track kind="captions" src="${esc(altyazi)}" srclang="{{lang}}" default />` : "";
  shnMedya = `<img class="modulex-shn-poster" src="${esc(poster)}" alt="" width="1920" height="1080" loading="eager" fetchpriority="high" decoding="async" />`
    + `<video class="modulex-shn-video" muted playsinline loop${otomatik ? " autoplay" : ""} preload="${otomatik ? "metadata" : "none"}" poster="${esc(poster)}" tabindex="-1" aria-hidden="true">${kaynak}${iz}</video>`;
} else if (img) {
  shnMedya = `<img class="modulex-shn-poster" src="${esc(img)}" alt="${esc(alt)}" width="1920" height="1080" loading="eager" fetchpriority="high" decoding="async" />`;
} else {
  shnMedya = '<div class="modulex-shn-yuva" aria-hidden="true"><span class="modulex-shn-yuva-isik"></span><span class="material-symbols-outlined">movie</span></div>';
}

const ust = pick(des.ust).trim();
const shnUst = ust ? `<p class="modulex-shn-ust">${esc(ust)}</p>` : "";
const baslik = pick(des.baslik).trim();
const shnBaslik = baslik ? esc(baslik) : "{{web-name}}";
const metin = pick(des.metin).trim() || pick(setting.description).trim();
const shnMetin = metin ? `<p class="modulex-shn-metin">${esc(metin)}</p>` : "";

const cta = (ad, url, sinif) => {
  const a = pick(ad).trim();
  const u = href(url);
  return a && u ? `<a class="modulex-shn-cta ${sinif}" href="${esc(u)}">${esc(a)}${sinif === "modulex-shn-cta--dolgu" ? '<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span>' : ""}</a>` : "";
};
const ctalar = cta(des.cta1_ad, des.cta1_url, "modulex-shn-cta--dolgu") + cta(des.cta2_ad, des.cta2_url, "modulex-shn-cta--cizgi");
const shnCtalar = ctalar ? `<div class="modulex-shn-ctalar">${ctalar}</div>` : "";

/* oynat/durdur + 30 sn halka (WCAG 2.2.2 — 5 sn'den uzun otomatik hareket durdurulabilir) */
const shnKontrol = videoVar
  ? `<button class="modulex-shn-kontrol" type="button" aria-pressed="${otomatik ? "true" : "false"}" aria-label="${otomatik ? "@video-pause@" : "@video-play@"}" data-oynat="@video-play@" data-durdur="@video-pause@">`
    + '<svg class="modulex-shn-halka" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="21" pathLength="100" /><circle class="modulex-shn-halka-dolu" cx="24" cy="24" r="21" pathLength="100" /></svg>'
    + `<span class="material-symbols-outlined modulex-shn-ikon-durdur" aria-hidden="true">pause</span><span class="material-symbols-outlined modulex-shn-ikon-oynat" aria-hidden="true">play_arrow</span></button>`
  : "";

const shnAsagi = dogru(des.asagi, true)
  ? '<a class="modulex-shn-asagi" href="#" aria-label="@scroll-down@"><span class="material-symbols-outlined" aria-hidden="true">south</span></a>'
  : "";

const shnSinif = [
  ` modulex-shn--${stil}`,
  videoVar ? " modulex-shn--video" : "",
  !video && !img ? " modulex-shn--yuva" : "",
  shnCtalar ? "" : " modulex-shn--ctasiz",
].join("");

html = html
  .replaceAll("{{shnsinif}}", () => shnSinif)
  .replaceAll("{{shnmedya}}", () => shnMedya)
  .replaceAll("{{shnust}}", () => shnUst)
  .replaceAll("{{shnbaslik}}", () => shnBaslik)
  .replaceAll("{{shnmetin}}", () => shnMetin)
  .replaceAll("{{shnctalar}}", () => shnCtalar)
  .replaceAll("{{shnkontrol}}", () => shnKontrol)
  .replaceAll("{{shnasagi}}", () => shnAsagi)
  .replaceAll("{{shnsure}}", () => String(sure));
