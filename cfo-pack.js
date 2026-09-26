// Pachetul CFO din raportul de Cashflow: tab-urile „Sinteză CFO", „Finanțare & datorie" și „Capex".
// Toate cifrele și textele se calculează din CFO (cfo-data.js, generat de build_cfo_data.py din Excel-ul P&L) —
// nimic scris de mână. Regula de bază (ca la Sales): fiecare informație apare o singură dată pe tab.
// Scris cu htm (fără pas de build); React și Recharts vin din import map-ul paginii.
import { createElement, Fragment, useState, useEffect } from "react";
import htm from "https://esm.sh/htm@3.1.1";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, ReferenceArea } from "recharts";
const html = htm.bind(createElement);

const C = { primary: "#7B1C16", deep: "#5E140F", olive: "#7C8431", amber: "#C9A227", wheat: "#F2DAB7", cream: "#F5EDE3",
  text: "#222222", muted: "#6b5d52", border: "#E8DDD0", good: "#15803D", bad: "#B91C1C", warn: "#B45309", blue: "#4A7FA5" };
const FONT = "'Poppins', system-ui, -apple-system, sans-serif";
const MON = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MON_FULL = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"];

// ── formatare ──────────────────────────────────────────────────────────────
const fm = (v) => { if (v == null || isNaN(v)) return "—"; const a = Math.abs(v), s = v < 0 ? "−" : "";
  return a >= 1e6 ? s + (a / 1e6).toFixed(2) + "M" : a >= 1e3 ? s + Math.round(a / 1e3) + "K" : s + Math.round(a); };
const fs = (v) => (v >= 0 ? "+" : "−") + fm(Math.abs(v));
const pc = (v, d = 1) => (v == null || !isFinite(v)) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(d) + "%";
const gr = (a, b) => (b ? (a - b) / Math.abs(b) * 100 : null);
const ml = (ym) => `${MON[+ym.slice(5) - 1]} ${ym.slice(2, 4)}`;
const sum = (a) => (a || []).reduce((x, v) => x + (v || 0), 0);
const reduced = () => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

// ── derivate comune ───────────────────────────────────────────────────────
function derive(D) {
  const pl = D.pl, A = pl.actual, B = pl.budget;
  const last = pl.months[pl.months.length - 1], y = +last.slice(0, 4), n = +last.slice(5);
  const iY = pl.months.map((m, i) => (m.startsWith(String(y)) ? i : -1)).filter((i) => i >= 0);
  const iL = pl.months.map((m, i) => (m.startsWith(String(y - 1)) && +m.slice(5) <= n ? i : -1)).filter((i) => i >= 0);
  const ytd = (k) => sum(iY.map((i) => A[k][i])), ly = (k) => sum(iL.map((i) => A[k][i]));
  const bud = (k) => sum(B[k].slice(0, n)), fyB = (k) => sum(B[k]);
  const fin = (arr) => arr.map((_, i) => (A.finOpco[i] || 0) + (A.finPropco[i] || 0));
  const ltm = (k) => sum(A[k].slice(-12));
  // numerar: ultima lună efectiv realizată, restul = RF
  const cf = D.cf, cI = cf.months.map((m, i) => i);
  const cAct = cI.filter((i) => cf.type[i] === "Actual" && cf.months[i].startsWith(String(y)));
  const cAll = cI.filter((i) => cf.months[i].startsWith(String(y)));
  const lastDebtI = cI.filter((i) => cf.netDebt[i]).pop();
  return { pl, A, B, cf, last, y, n, iY, iL, ytd, ly, bud, fyB, fin, ltm, cAct, cAll, lastDebtI,
    finY: ytd("finOpco") + ytd("finPropco"), finL: ly("finOpco") + ly("finPropco"), finB: bud("finOpco") + bud("finPropco"), finFY: fyB("finOpco") + fyB("finPropco") };
}

// ── componente comune (aspect aliniat cu raportul de Cashflow existent) ────────────────
const Wrap = ({ children }) => html`<div style=${{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", fontFamily: FONT, color: C.text }}>${children}</div>`;
const Card = ({ children, style }) => html`<div style=${{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 14, ...style }}>${children}</div>`;
const Sec = ({ kicker, title, note }) => html`<div style=${{ marginBottom: 10 }}>
  ${kicker && html`<div style=${{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: C.amber }}>${kicker}</div>`}
  <div style=${{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: C.primary, marginTop: 2 }}>${title}</div>
  ${note && html`<div style=${{ fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 1.45 }}>${note}</div>`}</div>`;
const Tile = ({ label, value, color, caption, children }) => html`<div style=${{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 15px", display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
  <div style=${{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.9 }}>${label}</div>
  <div style=${{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
    <span style=${{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, lineHeight: 1, color: color || C.primary }}>${value}</span>
    ${caption && html`<span style=${{ fontSize: 10.5, color: C.muted }}>${caption}</span>`}</div>
  <div style=${{ fontSize: 11, color: "#4a3f38", lineHeight: 1.45, borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 3 }}>${children}</div></div>`;
const Grid = ({ cols = 4, children }) => html`<div className=${"cfoGrid cfoGrid" + cols} style=${{ display: "grid", gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`, gap: 12, marginBottom: 14 }}>${children}</div>`;
const Chip = ({ tone, children }) => html`<span style=${{ display: "inline-block", fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
  background: tone === "g" ? "#DCFCE7" : tone === "r" ? "#FEE2E2" : tone === "a" ? "#FEF3C7" : "#F1ECE6", color: tone === "g" ? C.good : tone === "r" ? C.bad : tone === "a" ? C.warn : C.muted }}>${children}</span>`;
const TT = ({ active, payload, label }) => !active || !payload?.length ? null : html`<div style=${{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 11px", fontSize: 11, fontFamily: FONT, boxShadow: "0 4px 14px rgba(0,0,0,.1)" }}>
  <div style=${{ fontWeight: 700, color: C.primary, marginBottom: 4 }}>${label}</div>
  ${payload.filter((p) => p.value != null && p.value !== 0).map((p) => html`<div key=${p.name} style=${{ display: "flex", justifyContent: "space-between", gap: 14 }}><span style=${{ color: p.color }}>${p.name}</span><b>${fm(p.value)}</b></div>`)}</div>`;
const Legend = ({ items }) => html`<div style=${{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 10.5, color: C.muted, marginTop: 6 }}>
  ${items.map(([c, l, dash]) => html`<span key=${l} style=${{ display: "flex", alignItems: "center", gap: 5 }}><span style=${{ width: 12, height: dash ? 0 : 9, borderTop: dash ? `2px dashed ${c}` : "none", background: dash ? "transparent" : c, borderRadius: 2, display: "inline-block" }}></span>${l}</span>`)}</div>`;
function Insight({ pos, watch }) {
  const Col = ({ title, color, bg, items }) => html`<div style=${{ flex: "1 1 300px", minWidth: 0 }}>
    <div style=${{ fontSize: 10.5, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>${title} (${items.length})</div>
    ${items.length ? items.map((x, i) => html`<div key=${i} style=${{ background: bg, borderLeft: `3px solid ${color}`, borderRadius: "0 8px 8px 0", padding: "8px 12px", marginBottom: 7 }}>
      <div style=${{ fontSize: 12, fontWeight: 700 }}>${x.t}</div><div style=${{ fontSize: 11.2, color: "#5a4a40", lineHeight: 1.5, marginTop: 1 }}>${x.d}</div></div>`)
      : html`<div style=${{ fontSize: 11.5, color: C.muted, fontStyle: "italic" }}>—</div>`}</div>`;
  return html`<div style=${{ display: "flex", gap: 18, flexWrap: "wrap" }}><${Col} title="Puncte forte" color=${C.good} bg="#F3FBF5" items=${pos}/><${Col} title="De urmărit" color=${C.warn} bg="#FFFAEB" items=${watch}/></div>`;
}
function useCount(target) {
  const [v, setV] = useState(reduced() ? target : 0);
  useEffect(() => { if (reduced()) { setV(target); return; } let r, t0; const st = (t) => { if (!t0) t0 = t; const k = Math.min(1, (t - t0) / 1100); setV(target * (1 - Math.pow(1 - k, 3))); if (k < 1) r = requestAnimationFrame(st); }; r = requestAnimationFrame(st); return () => cancelAnimationFrame(r); }, [target]);
  return v;
}
const CSS_TXT = `
  @keyframes cfoGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
  @keyframes cfoFade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
  .cfo-grow{transform-box:fill-box;transform-origin:bottom;animation:cfoGrow .7s cubic-bezier(.2,.7,.2,1) both}
  .cfo-fade{animation:cfoFade .5s ease both}
  @media(prefers-reduced-motion:reduce){.cfo-grow,.cfo-fade{animation:none!important}}
  @media(max-width:1000px){.cfoGrid4{grid-template-columns:repeat(2,minmax(0,1fr))!important}.cfoGrid3{grid-template-columns:minmax(0,1fr)!important}}
  @media(max-width:1000px){.cfoHero4{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
  @media(max-width:620px){.cfoGrid4,.cfoGrid2{grid-template-columns:minmax(0,1fr)!important}.cfoHero,.cfoHero4{grid-template-columns:minmax(0,1fr)!important}}
  .cfoTbl{width:100%;border-collapse:collapse;font-size:11.5px;min-width:760px}
  .cfoTbl th{font-size:9.5px;text-transform:uppercase;letter-spacing:.6px;color:#6b5d52;font-weight:700;text-align:right;padding:7px 8px;border-bottom:1px solid #E8DDD0;white-space:nowrap}
  .cfoTbl th:first-child,.cfoTbl td:first-child{text-align:left}
  .cfoTbl td{padding:8px;border-bottom:1px solid #F3ECE4;text-align:right;white-space:nowrap}
`;
const CSS = html`<style>${CSS_TXT}</style>`;

// ════════════════════════ SINTEZĂ CFO ════════════════════════
function Summary({ D, go }) {
  const X = derive(D), { ytd, ly, bud, n, y } = X;
  const net = ytd("net"), netL = ly("net"), netB = bud("net"), eb = ytd("ebitda"), sales = ytd("sales");
  const cnt = useCount(net);
  const steps = [
    ["EBITDA GROUP", eb, "tot"],
    ["VVA", -ytd("vva"), "neg"], ["One-off / reg.", -ytd("oneoff"), "neg"],
    ["Amortizare", -(ytd("depOpco") + ytd("depPropco")), "neg"],
    ["Finanțare", -X.finY, "fin"],
    ["Impozite", -(ytd("taxOpco") + ytd("taxPropco")), "neg"],
  ];
  const calc = steps.reduce((a, s) => a + s[1], 0), other = net - calc;
  if (Math.abs(other) > 1000) steps.push(["Altele", other, other < 0 ? "neg" : "pos"]);
  steps.push(["Profit net", net, "net"]);
  // punte EBITDA → profit net (SVG, animată)
  const W = 640, H = 230, pad = { l: 8, r: 8, t: 22, b: 30 }, bw = (W - pad.l - pad.r) / steps.length;
  let run = 0; const bars = steps.map(([l, v, k]) => { let y0, y1; if (k === "tot" || k === "net") { y0 = 0; y1 = v; run = v; } else { y0 = run; y1 = run + v; run = y1; } return { l, v, k, y0, y1 }; });
  const mx = Math.max(...bars.map((b) => Math.max(b.y0, b.y1))) * 1.08, Y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / mx);
  const col = { tot: C.primary, net: C.good, neg: "#C9B8AC", fin: C.bad, pos: C.olive };
  // cash + datorie
  const cf = X.cf, opY = sum(X.cAct.map((i) => cf.opCF[i])), cxY = sum(X.cAct.map((i) => cf.invCF[i]));
  const cashLast = cf.months[X.cAct[X.cAct.length - 1]];
  const nd = cf.netDebt[X.lastDebtI], ndM = cf.months[X.lastDebtI], ltmE = X.ltm("ebitda"), lev = nd / ltmE;
  const ndStart = cf.netDebt[cf.months.indexOf(`${y - 1}-12`)];
  const rr3 = sum(X.fin(X.A.finOpco).slice(-3)) / 3, finProj = X.finY + rr3 * (12 - n);
  // „Unde intervin" — calculat
  const pos = [], watch = [];
  (net >= netB ? pos : watch).push({ t: `Profit net ${fs(net - netB)} față de buget YTD`, d: `${fm(net)} vs buget ${fm(netB)} (${pc(gr(net, netB))}) · ${pc(gr(net, netL))} față de Ian–${MON[n - 1]} ${y - 1}.` });
  const convNow = net / eb * 100, convL = netL / ly("ebitda") * 100;
  (convNow >= convL - 1 ? pos : watch).push({ t: `Din fiecare 100 lei EBITDA rămân ${convNow.toFixed(0)} lei profit net`, d: `Ian–${MON[n - 1]} ${y - 1}: ${convL.toFixed(0)} lei. Diferența o fac amortizarea, finanțarea și impozitele care cresc odată cu investițiile.` });
  if (finProj > X.finFY * 1.2) watch.push({ t: `Costul de finanțare: proiecție ${fm(finProj)} vs buget an ${fm(X.finFY)}`, d: `YTD ${fm(X.finY)} (${pc(gr(X.finY, X.finL))} YoY) · ritmul ultimelor 3 luni ${fm(rr3)}/lună față de ${fm(X.finFY / 12)}/lună în buget. Detalii în „Finanțare & datorie".` });
  const tax = ytd("taxOpco") + ytd("taxPropco"), taxB = bud("taxOpco") + bud("taxPropco");
  if (tax > taxB * 1.2) watch.push({ t: `Impozite ${fs(tax - taxB)} peste buget YTD`, d: `${fm(tax)} vs ${fm(taxB)} (${pc(gr(tax, taxB))}) — de verificat dacă e decalaj de plată sau bază mai mare.` });
  if (lev > (ndStart / X.ltm("ebitda") || 0) + 0.15) watch.push({ t: `Datoria netă crește: ${fm(nd)} (${lev.toFixed(2)}x EBITDA LTM)`, d: `de la ${fm(ndStart)} în Dec ${String(y - 1).slice(2)} · finanțează programul de capex (vezi „Capex").` });
  else pos.push({ t: `Levier scăzut: ${lev.toFixed(2)}x datorie netă / EBITDA LTM`, d: `datorie netă ${fm(nd)} (${ml(ndM)}) · EBITDA LTM ${fm(ltmE)}.` });
  return html`<${Wrap}>
    <div className="cfoHero cfo-fade" style=${{ background: `linear-gradient(120deg,${C.primary} 0%,${C.deep} 60%,#3E0D0A 100%)`, borderRadius: 16, padding: "20px 24px", color: "#fff", display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr)", gap: 22, alignItems: "center", marginBottom: 14, boxShadow: "0 8px 30px rgba(94,20,15,.25)" }}>
      <div>
        <div style=${{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(242,218,183,.85)" }}>Sinteză CFO · YTD Ian–${MON[n - 1]} ${y}</div>
        <div style=${{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}><span style=${{ fontFamily: "'Playfair Display',serif", fontSize: 50, fontWeight: 900, lineHeight: 1 }}>${fm(cnt)}</span><span style=${{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>RON profit net</span></div>
        <div style=${{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
          <span style=${{ background: "rgba(255,255,255,.14)", borderRadius: 20, padding: "4px 10px", fontSize: 11.5, fontWeight: 600 }}>${pc(gr(net, netL))} YoY</span>
          <span style=${{ background: net >= netB ? "rgba(134,239,172,.22)" : "rgba(255,138,128,.3)", borderRadius: 20, padding: "4px 10px", fontSize: 11.5, fontWeight: 600 }}>${fs(net - netB)} vs buget (${pc(gr(net, netB))})</span>
          <span style=${{ background: "rgba(255,255,255,.14)", borderRadius: 20, padding: "4px 10px", fontSize: 11.5, fontWeight: 600 }}>marjă netă ${(net / sales * 100).toFixed(1)}%</span></div></div>
      <div>
        <div style=${{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: 1, color: "rgba(242,218,183,.8)", fontWeight: 700 }}>Numerar din operațiuni · Ian–${ml(cashLast)}</div>
        <div style=${{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700 }}>${fm(opY)}</div>
        <div style=${{ fontSize: 11, color: "rgba(255,255,255,.75)" }}>investit în aceeași perioadă ${fm(-cxY)} · acoperire ${(opY / -cxY * 100).toFixed(0)}%</div></div>
      <div>
        <div style=${{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: 1, color: "rgba(242,218,183,.8)", fontWeight: 700 }}>Datorie bancară netă · ${ml(ndM)}</div>
        <div style=${{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700 }}>${fm(nd)}</div>
        <div style=${{ fontSize: 11, color: "rgba(255,255,255,.75)" }}>${lev.toFixed(2)}x EBITDA LTM (${fm(ltmE)}) · de la ${fm(ndStart)} în Dec ${String(y - 1).slice(2)}</div></div>
    </div>
    <${Card}>
      <${Sec} kicker="De la EBITDA la profitul net" title=${`Unde se duc ${fm(eb)} EBITDA · YTD Ian–${MON[n - 1]} ${y}`} note="Singurul loc din pachet cu drumul complet EBITDA → profit net. Roșu = costul de finanțare, tema anului."/>
      <svg viewBox=${`0 0 ${W} ${H}`} style=${{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Punte de la EBITDA la profit net">
        <line x1=${pad.l} x2=${W - pad.r} y1=${Y(0)} y2=${Y(0)} stroke=${C.border}/>
        ${bars.map((b, i) => { const x = pad.l + i * bw + bw * 0.16, w = bw * 0.68, top = Y(Math.max(b.y0, b.y1)), h = Math.max(1.5, Math.abs(Y(b.y0) - Y(b.y1)));
          return html`<g key=${b.l}><rect className="cfo-grow" x=${x} y=${top} width=${w} height=${h} rx="3" fill=${col[b.k]} style=${{ animationDelay: `${i * 0.08}s` }}><title>${b.l}: ${fm(b.v)}</title></rect>
            ${i < bars.length - 1 && html`<line x1=${x + w} x2=${x + bw} y1=${Y(b.y1)} y2=${Y(b.y1)} stroke="#B8A89C" strokeDasharray="2 2"/>`}
            <text x=${x + w / 2} y=${top - 6} textAnchor="middle" style=${{ fontSize: 11, fontWeight: 700, fill: b.k === "fin" ? C.bad : C.text }}>${b.k === "tot" || b.k === "net" ? fm(b.v) : fs(b.v)}</text>
            <text x=${x + w / 2} y=${H - 10} textAnchor="middle" style=${{ fontSize: 10.5, fontWeight: 600, fill: C.muted }}>${b.l}</text></g>`; })}
      </svg>
    <//>
    <${Card}><${Sec} kicker="Calculat din date" title="Unde intervin"/><${Insight} pos=${pos} watch=${watch}/><//>
    <div style=${{ fontSize: 10, color: C.muted, margin: "0 2px 18px" }}>Sursă: ${D.meta.source} · P&L realizat până la ${ml(D.meta.plActualThrough)}, numerar până la ${ml(D.meta.cashActualThrough)} (restul = reforecast), capex până la ${ml(D.meta.capexActualThrough)}. Bugetul este cel din Excel (fără neutralizarea Brăila din raportul EBITDA).</div>
  <//>`;
}

// Credite trase (sus) vs rambursări (jos) — axă Y ÎNTRERUPTĂ: două zone cu scări proprii, unite la zero printr-un
// marcaj de întrerupere, ca rambursările mici (~zeci de K) să fie vizibile lângă tragerile de milioane.
const niceMax = (v) => { if (!v) return 1; const e = Math.pow(10, Math.floor(Math.log10(v))), f = v / e; return ([1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => f <= s) || 10) * e; };
function DebtFlows({ rows }) {
  const [hov, setHov] = useState(null);
  const W = 760, L = 50, R = 10, T = 18, topH = 150, gap = 16, botH = 70, B = 26, H = T + topH + gap + botH + B;
  const mD = niceMax(Math.max(...rows.map((r) => r.draw))), mR = niceMax(Math.max(...rows.map((r) => -r.repay)));
  const yTop0 = T + topH, yBot0 = T + topH + gap;               // zero-ul fiecărei zone
  const bw = (W - L - R) / rows.length, w = Math.max(3, bw * 0.62);
  const X = (i) => L + i * bw + (bw - w) / 2;
  const tick = (v) => fm(v).replace(".00M", "M");
  const zig = (x) => `M${x - 7},${yTop0 + 4} l3.5,-4 l3.5,4 l3.5,-4 l3.5,4 M${x - 7},${yBot0 - 4} l3.5,-4 l3.5,4 l3.5,-4 l3.5,4`;
  return html`<div style=${{ position: "relative" }}>
    <svg viewBox=${`0 0 ${W} ${H}`} style=${{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Credite trase și rambursări lunare, axă întreruptă">
      ${[0.5, 1].map((f) => html`<g key=${"t" + f}><line x1=${L} x2=${W - R} y1=${yTop0 - topH * f} y2=${yTop0 - topH * f} stroke="#F0E9E1"/><text x=${L - 6} y=${yTop0 - topH * f + 3.5} textAnchor="end" style=${{ fontSize: 10, fill: C.muted }}>${tick(mD * f)}</text></g>`)}
      ${[0.5, 1].map((f) => html`<g key=${"b" + f}><line x1=${L} x2=${W - R} y1=${yBot0 + botH * f} y2=${yBot0 + botH * f} stroke="#F0E9E1"/><text x=${L - 6} y=${yBot0 + botH * f + 3.5} textAnchor="end" style=${{ fontSize: 10, fill: C.muted }}>−${tick(mR * f)}</text></g>`)}
      <rect x=${L} y=${yTop0} width=${W - L - R} height=${gap} fill="#FBF7F2"/>
      <line x1=${L} x2=${W - R} y1=${yTop0} y2=${yTop0} stroke="#B8A89C"/><line x1=${L} x2=${W - R} y1=${yBot0} y2=${yBot0} stroke="#B8A89C"/>
      <text x=${L - 13} y=${yTop0 + 3.5} textAnchor="end" style=${{ fontSize: 10, fill: C.muted }}>0</text><text x=${L - 13} y=${yBot0 + 3.5} textAnchor="end" style=${{ fontSize: 10, fill: C.muted }}>0</text>
      <path d=${zig(L)} fill="none" stroke=${C.text} strokeWidth="1.3"/><path d=${zig(W - R)} fill="none" stroke=${C.text} strokeWidth="1.3"/>
      <text x=${L + 6} y=${T + 10} style=${{ fontSize: 9.5, fontWeight: 700, fill: C.blue, letterSpacing: 0.6 }}>CREDITE NOI · scară până la ${tick(mD)}</text>
      <text x=${L + 6} y=${yBot0 + botH - 4} style=${{ fontSize: 9.5, fontWeight: 700, fill: C.olive, letterSpacing: 0.6 }}>RAMBURSĂRI · scară până la ${tick(mR)}</text>
      ${rows.map((r, i) => { const hd = r.draw / mD * topH, hr = -r.repay / mR * botH, x = X(i), rf = r.rf;
        return html`<g key=${r.m} onMouseEnter=${() => setHov(i)} onMouseLeave=${() => setHov(null)}>
          <rect x=${L + i * bw} y=${T} width=${bw} height=${topH + gap + botH} fill=${hov === i ? "rgba(123,28,22,.05)" : "transparent"}/>
          ${hd > 0 && html`<rect className="cfo-grow" x=${x} y=${yTop0 - hd} width=${w} height=${hd} rx="2" fill=${C.blue} fillOpacity=${rf ? 0.45 : 1} stroke=${rf ? C.blue : "none"} strokeDasharray=${rf ? "3 2" : "none"} style=${{ animationDelay: `${i * 0.02}s` }}/>`}
          ${hd > 0 && r.draw >= mD * 0.12 && html`<text x=${x + w / 2} y=${yTop0 - hd - 4} textAnchor="middle" style=${{ fontSize: 9.5, fontWeight: 700, fill: C.blue }}>${fm(r.draw)}</text>`}
          ${hr > 0 && html`<rect x=${x} y=${yBot0} width=${w} height=${hr} rx="2" fill=${C.olive} fillOpacity=${rf ? 0.45 : 1} stroke=${rf ? C.olive : "none"} strokeDasharray=${rf ? "3 2" : "none"} style=${{ transformBox: "fill-box", transformOrigin: "top", animation: "cfoGrow .7s cubic-bezier(.2,.7,.2,1) both", animationDelay: `${i * 0.02}s` }}/>`}
          ${i % 2 === 0 && html`<text x=${x + w / 2} y=${H - 8} textAnchor="middle" style=${{ fontSize: 9.5, fill: C.muted }}>${r.m}</text>`}
        </g>`; })}
    </svg>
    ${hov != null && html`<div style=${{ position: "absolute", top: 4, right: 8, background: "rgba(43,20,16,.92)", color: "#fff", borderRadius: 8, padding: "6px 10px", fontSize: 11, pointerEvents: "none" }}>
      <b>${rows[hov].m}${rows[hov].rf ? " · reforecast" : ""}</b> · credite noi ${fm(rows[hov].draw)} · rambursări ${fm(-rows[hov].repay)}</div>`}
  </div>`;
}

// ════════════════════════ FINANȚARE & DATORIE ════════════════════════
function Finance({ D }) {
  const X = derive(D), { A, B, pl, n, y } = X;
  const finAll = X.fin(A.finOpco), rr3 = sum(finAll.slice(-3)) / 3, proj = X.finY + rr3 * (12 - n);
  const eb = X.ytd("ebitda"), ebL = X.ly("ebitda");
  const cov = eb / X.finY, covL = ebL / X.finL;
  // grafic lunar: anul trecut + anul curent (realizat) + restul anului (proiecție la ritmul ultimelor 3 luni) + buget
  const rows = [];
  const months = [...Array(24)].map((_, i) => `${i < 12 ? y - 1 : y}-${String((i % 12) + 1).padStart(2, "0")}`);
  months.forEach((ym) => { const i = pl.months.indexOf(ym), mm = +ym.slice(5), cur = ym.startsWith(String(y)), ci = X.cf.months.indexOf(ym);
    rows.push({ m: ml(ym), Opco: i >= 0 ? A.finOpco[i] : null, Propco: i >= 0 ? A.finPropco[i] : null,
      "Dobândă plătită (numerar)": ci >= 0 && X.cf.type[ci] === "Actual" ? -(X.cf.interest[ci] || 0) : null,
      "Proiecție": (cur && i < 0) ? rr3 : null, Buget: cur ? (B.finOpco[mm - 1] || 0) + (B.finPropco[mm - 1] || 0) : null }); });
  // trageri / rambursări / dobândă plătită (numerar)
  const cf = X.cf, cm = cf.months.map((m, i) => i).filter((i) => cf.months[i] >= `${y - 1}-01`);
  const draws = cm.map((i) => ({ m: ml(cf.months[i]), rf: cf.type[i] !== "Actual", draw: (cf.debtDev[i] || 0) + (cf.debtHold[i] || 0), repay: cf.repay[i] || 0 }));
  const drawY = sum(X.cAll.map((i) => (cf.debtDev[i] || 0) + (cf.debtHold[i] || 0))), repY = sum(X.cAll.map((i) => cf.repay[i] || 0));
  const drawRF = sum(X.cAll.filter((i) => cf.type[i] !== "Actual").map((i) => (cf.debtDev[i] || 0) + (cf.debtHold[i] || 0)));
  const repRF = sum(X.cAll.filter((i) => cf.type[i] !== "Actual").map((i) => cf.repay[i] || 0));
  const nd = cf.netDebt[X.lastDebtI], ndYE = nd + sum(X.cAll.filter((i) => i > X.lastDebtI).map((i) => (cf.debtDev[i] || 0) + (cf.debtHold[i] || 0) + (cf.repay[i] || 0)));
  const intCashY = -sum(X.cAct.map((i) => cf.interest[i])), intMonths = X.cAct.length;
  const opcoG = gr(X.ytd("finOpco"), X.ly("finOpco")), propG = gr(X.ytd("finPropco"), X.ly("finPropco"));
  return html`<${Wrap}>
    <${Grid} cols=${4}>
      <${Tile} label="Cost de finanțare YTD" value=${fm(X.finY)} color=${C.bad} caption=${`Ian–${MON[n - 1]} ${y}`}>
        ${pc(gr(X.finY, X.finL))} față de ${fm(X.finL)} anul trecut · ${pc(gr(X.finY, X.finB))} vs buget ${fm(X.finB)}
        <div style=${{ color: C.muted, marginTop: 3 }}>Opco ${fm(X.ytd("finOpco"))} (${pc(opcoG, 0)}) · Propco ${fm(X.ytd("finPropco"))} (${pc(propG, 0)})</div><//>
      <${Tile} label="Proiecție an" value=${fm(proj)} color=${proj > X.finFY ? C.bad : C.good} caption=${`vs buget ${fm(X.finFY)}`}>
        realizat YTD + ${12 - n} luni la ritmul ultimelor 3 luni (${fm(rr3)}/lună). Bugetul presupune ~${fm(X.finFY / 12)}/lună constant.<//>
      <${Tile} label="Acoperire dobânzi" value=${cov.toFixed(0) + "x"} color=${cov >= 10 ? C.primary : C.bad} caption="EBITDA / cost de finanțare">
        anul trecut ${covL.toFixed(0)}x · finanțarea consumă ${(X.finY / eb * 100).toFixed(1)}% din EBITDA (vs ${(X.finL / ebL * 100).toFixed(1)}%)<//>
      <${Tile} label="Datorie netă la final de an" value=${fm(ndYE)} caption="estimare">
        de la ${fm(nd)} (${ml(cf.months[X.lastDebtI])}) + credite noi planificate ${fm(drawRF)} − rambursări ${fm(-repRF)} (reforecast)<//>
    <//>
    <${Card}>
      <${Sec} kicker="Contul de profit și pierdere" title="Costul de finanțare lunar — Opco vs Propco" note=${`Barele pline = realizat; cele deschise = proiecție la ritmul ultimelor 3 luni; linia = bugetul ${y}. Propco finanțează imobilele (chiria intercompany e adăugată înapoi în EBITDAR), Opco operațiunea.`}/>
      <div style=${{ height: 250 }}><${ResponsiveContainer}><${ComposedChart} data=${rows} margin=${{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <${CartesianGrid} strokeDasharray="3 3" stroke="#F0E9E1" vertical=${false}/><${XAxis} dataKey="m" tick=${{ fontSize: 10 }} interval=${1}/><${YAxis} tickFormatter=${fm} tick=${{ fontSize: 10 }} width=${44}/><${Tooltip} content=${html`<${TT}/>`}/>
        <${Bar} dataKey="Opco" stackId="a" fill=${C.primary} radius=${[0, 0, 0, 0]}/><${Bar} dataKey="Propco" stackId="a" fill=${C.amber} radius=${[3, 3, 0, 0]}/>
        <${Bar} dataKey="Proiecție" stackId="a" fill="#F4C7C0" stroke=${C.bad} strokeDasharray="3 2" radius=${[3, 3, 0, 0]}/>
        <${Line} dataKey="Buget" stroke=${C.text} strokeWidth=${1.6} strokeDasharray="5 4" dot=${false} connectNulls/>
        <${Line} dataKey="Dobândă plătită (numerar)" stroke=${C.blue} strokeWidth=${2} dot=${{ r: 2.5, fill: C.blue }} connectNulls=${false}/>
      <//><//></div>
      <${Legend} items=${[[C.primary, "Opco"], [C.amber, "Propco"], ["#F4C7C0", "proiecție"], [C.text, `buget ${y}`, true], [C.blue, "dobândă plătită (numerar)"]]}/>
    <//>
    <${Card}>
      <${Sec} kicker="Numerar" title="Credite trase vs rambursări" note=${`Fluxuri lunare. ${y}: credite noi ${fm(drawY)} (din care planificate ${fm(drawRF)}), rambursări ${fm(-repY)} — rambursăm ~${fm(-repY / 12)}/lună, tragem în tranșe mari. Dobânda plătită YTD: ${fm(intCashY)} în ${intMonths} luni (numerar) vs ${fm(X.finY)} cost contabil. Structura și soldul datoriei rămân în tab-ul „Cashflow" (secțiunea 04).`}/>
      <${DebtFlows} rows=${draws}/>
      <${Legend} items=${[[C.blue, "credite noi (dezvoltare + holding)"], [C.olive, "rambursări"], ["#BFD3E3", "reforecast (luni neînchise)"]]}/>
      <div style=${{ fontSize: 10, color: C.muted, marginTop: 4 }}>Axă întreruptă: cele două zone au scări diferite (marcajul în zig-zag), ca rambursările lunare să fie lizibile lângă tragerile mari.</div>
    <//>
  <//>`;
}

// ════════════════════════ CAPEX ════════════════════════
function Capex({ D }) {
  const X = derive(D), cx = D.capex, y = X.y;
  const I = cx.months.map((m, i) => i), cur = I.filter((i) => cx.months[i].startsWith(String(y)));
  const isA = (i) => cx.type[i] && cx.type[i].toLowerCase().startsWith("act");
  const neg = (v) => -(v || 0);
  const parts = (i) => { const P = cx.projects;
    const re = sum(P.map((p) => neg(p.re[i]))) + neg(cx.operational.reOther[i]);
    const fit = sum(P.map((p) => neg(p.fit[i]))) + neg(cx.operational.fit[i]);
    const eq = sum(P.map((p) => neg(p.eq[i]))) + neg(cx.operational.eq[i]); return { re, fit, eq }; };
  const tot = (idx) => sum(idx.map((i) => neg(cx.total[i])));
  const plan = tot(cur), actI = cur.filter(isA), actY = tot(actI), budY = sum(actI.map((i) => neg(cx.budget2026[i]))), rest = tot(cur.filter((i) => !isA(i)));
  const maint = (idx) => sum(idx.map((i) => neg(cx.operational.fit[i]) + neg(cx.operational.eq[i])));
  const yrs = [y - 2, y - 1, y].map((yy) => { const idx = I.filter((i) => cx.months[i].startsWith(String(yy))); return { yy, tot: tot(idx), m: maint(idx) }; });
  const cf = X.cf, opFY = sum(X.cAll.map((i) => cf.opCF[i]));
  // grafic lunar
  const rows = I.filter((i) => cx.months[i] >= `${y - 1}-01`).map((i) => { const p = parts(i), a = isA(i);
    return { m: ml(cx.months[i]) + (a ? "" : "*"), "Imobile": a ? p.re : null, "Fit-out": a ? p.fit : null, "Echipamente": a ? p.eq : null,
      "Imobile (plan)": a ? null : p.re, "Fit-out (plan)": a ? null : p.fit, "Echipamente (plan)": a ? null : p.eq,
      Buget: cx.months[i].startsWith(String(y)) ? neg(cx.budget2026[i]) : null }; });
  // pipeline pe proiecte
  const ann = (code) => { const c = D.clinics[code]; if (!c) return null; const e = c.ebitdar.slice(-3), s = c.sales.slice(-3); if (!sum(s)) return null; return sum(e) / e.length * 12; };
  const since = (code, from) => { const c = D.clinics[code]; if (!c || !from) return null; return sum(c.months.map((m, i) => (m >= from ? c.ebitdar[i] : 0))); };
  const proj = cx.projects.map((p) => { const sp = (idx) => sum(idx.map((i) => neg(p.re[i]) + neg(p.fit[i]) + neg(p.eq[i])));
    const done = sp(I.filter(isA)), todo = sp(I.filter((i) => !isA(i))), total = done + todo, open = p.opened && p.opened <= X.last;
    const a = open ? ann(p.key) : null, rec = open ? since(p.key, p.opened) : null;
    return { ...p, done, todo, total, perUnit: p.units ? total / p.units : null, a, yld: a ? a / total * 100 : null, pb: a > 0 ? total / a : null, rec, recPct: rec != null ? rec / total * 100 : null }; });
  const maxT = Math.max(...proj.map((p) => p.total));
  // surse și utilizări (an curent, realizat + reforecast)
  const S = (k) => sum(X.cAll.map((i) => cf[k][i]));
  const uses = [["Capex", -S("invCF"), C.primary], ["Dividende + impozit", -(S("dividends") + S("divTax")), C.amber], ["Dobânzi + rambursări", -(S("interest") + S("repay")), C.bad]];
  const srcs = [["Numerar din operațiuni", S("opCF"), C.good], ["Credite bancare noi", S("debtDev") + S("debtHold"), C.blue], ["Grant UE", S("euGrant"), C.olive], ["Capital de lucru + altele", null, "#C9B8AC"]];
  const uT = sum(uses.map((u) => u[1])), sKnown = sum(srcs.slice(0, 3).map((s) => s[1] || 0)); srcs[3][1] = uT - sKnown;
  const Stack = ({ items, total }) => html`<div style=${{ display: "flex", height: 26, borderRadius: 6, overflow: "hidden", gap: 2 }}>
    ${items.filter((x) => x[1] > 0).map(([l, v, c]) => html`<div key=${l} title=${`${l}: ${fm(v)}`} style=${{ width: `${v / total * 100}%`, background: c, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", paddingLeft: 6, whiteSpace: "nowrap", overflow: "hidden" }}>${v / total > 0.12 ? fm(v) : ""}</div>`)}</div>`;
  return html`<${Wrap}>
    <${Grid} cols=${4}>
      <${Tile} label=${`Program capex ${y}`} value=${fm(plan)} caption="realizat + plan">
        imobile ${fm(sum(cur.map((i) => parts(i).re)))} · fit-out ${fm(sum(cur.map((i) => parts(i).fit)))} · echipamente ${fm(sum(cur.map((i) => parts(i).eq)))}<//>
      <${Tile} label=${`Realizat · Ian–${ml(D.meta.capexActualThrough)}`} value=${fm(actY)} color=${Math.abs(gr(actY, budY)) <= 10 ? C.primary : C.bad} caption=${`vs buget ${fm(budY)}`}>
        ${pc(gr(actY, budY))} față de bugetul lunilor închise · mai sunt ${fm(rest)} de investit până în Dec<//>
      <${Tile} label="Mentenanță clinici existente" value=${fm(yrs[2].m)} caption=${`${(yrs[2].m / yrs[2].tot * 100).toFixed(0)}% din ${y}`}>
        ${yrs.map((r) => `${r.yy}: ${fm(r.m)}`).join(" · ")} — crește odată cu rețeaua<//>
      <${Tile} label="Autofinanțare" value=${(opFY / plan * 100).toFixed(0) + "%"} caption="numerar operațional / capex">
        numerar din operațiuni ${y} ${fm(opFY)} (realizat + reforecast) față de capex ${fm(plan)}<//>
    <//>
    <${Card}>
      <${Sec} kicker="Ritm" title=${`Capex lunar ${y - 1}–${y}`} note=${`Plin = realizat, deschis = plan (* = lună neînchisă). Linia = bugetul de capex ${y}. Sursa corectă e rândul „Total Investments" — rândurile „Capex PROPCO/OPCO/Total" din Excel sunt cumulative în ${y}.`}/>
      <div style=${{ height: 260 }}><${ResponsiveContainer}><${ComposedChart} data=${rows} margin=${{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <${CartesianGrid} strokeDasharray="3 3" stroke="#F0E9E1" vertical=${false}/><${XAxis} dataKey="m" tick=${{ fontSize: 10 }} interval=${1}/><${YAxis} tickFormatter=${fm} tick=${{ fontSize: 10 }} width=${44}/><${Tooltip} content=${html`<${TT}/>`}/>
        <${Bar} dataKey="Imobile" stackId="a" fill=${C.primary}/><${Bar} dataKey="Fit-out" stackId="a" fill=${C.amber}/><${Bar} dataKey="Echipamente" stackId="a" fill=${C.olive} radius=${[3, 3, 0, 0]}/>
        <${Bar} dataKey="Imobile (plan)" stackId="a" fill="#D9B3AE"/><${Bar} dataKey="Fit-out (plan)" stackId="a" fill="#EFDFA9"/><${Bar} dataKey="Echipamente (plan)" stackId="a" fill="#D5D8A8" radius=${[3, 3, 0, 0]}/>
        <${Line} dataKey="Buget" stroke=${C.text} strokeWidth=${1.6} strokeDasharray="5 4" dot=${false} connectNulls/>
      <//><//></div>
      <${Legend} items=${[[C.primary, "imobile"], [C.amber, "fit-out"], [C.olive, "echipamente"], ["#E6D6CF", "plan (neînchis)"], [C.text, `buget ${y}`, true]]}/>
    <//>
    <${Card}>
      <${Sec} kicker="Portofoliul de expansiune" title="Proiecte: cât am investit și cât aduc" note="Capex cumulat pe proiect (imobil + fit-out + echipamente, toate anii). Pentru clinicile deschise: EBITDAR anualizat din ultimele 3 luni, randament = EBITDAR anualizat / capex, payback = capex / EBITDAR anualizat, recuperat = EBITDAR cumulat de la deschidere / capex."/>
      <div style=${{ overflowX: "auto" }}><table className="cfoTbl"><thead><tr>
        <th>Proiect</th><th>Stadiu</th><th>Unituri</th><th>Investit</th><th>De investit</th><th>Total</th><th style=${{ minWidth: 110 }}></th><th>Capex / unit</th><th>EBITDAR anualizat</th><th>Randament</th><th>Payback</th><th>Recuperat</th></tr></thead>
        <tbody>${proj.map((p) => html`<tr key=${p.key}>
          <td><b>${p.name}</b></td><td>${p.status}${p.opened ? ` · ${ml(p.opened)}` : ""}</td><td>${p.units ?? "—"}</td>
          <td>${fm(p.done)}</td><td style=${{ color: p.todo >= 1000 ? C.warn : C.muted }}>${p.todo >= 1000 ? fm(p.todo) : "—"}</td><td><b>${fm(p.total)}</b></td>
          <td><div style=${{ height: 8, background: "#F1ECE6", borderRadius: 4, display: "flex", overflow: "hidden" }}><div style=${{ width: `${p.done / maxT * 100}%`, background: C.primary }}></div><div style=${{ width: `${(p.todo >= 1000 ? p.todo : 0) / maxT * 100}%`, background: "#E8C9A0" }}></div></div></td>
          <td>${p.perUnit ? fm(p.perUnit) : "—"}</td><td>${p.a != null ? fm(p.a) : "—"}</td>
          <td>${p.yld != null ? html`<${Chip} tone=${p.yld >= 30 ? "g" : p.yld >= 15 ? "a" : "r"}>${p.yld.toFixed(0)}%<//>` : "—"}</td>
          <td>${p.pb != null ? p.pb.toFixed(1) + " ani" : "—"}</td><td>${p.recPct != null ? p.recPct.toFixed(0) + "%" : "—"}</td></tr>`)}</tbody></table></div>
      <div style=${{ fontSize: 10, color: C.muted, marginTop: 6 }}>Deschidere și unituri: din configurarea scriptului (nu sunt în Excel) — Slatina, Câmpina și Curtea de Argeș așteaptă confirmare. Bara: închis = investit, deschis = de investit.</div>
    <//>
    <${Card}>
      <${Sec} kicker="Finanțarea investițiilor" title=${`Cine plătește investițiile · ${y} (realizat + reforecast)`} note="Utilizări vs surse de numerar pe an. Diferența dintre utilizări și sursele identificate = capital de lucru, TVA, overdraft și alte mișcări."/>
      <div style=${{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 70px", gap: "8px 12px", alignItems: "center", fontSize: 11.5 }}>
        <b>Utilizări</b><${Stack} items=${uses} total=${uT}/><b style=${{ textAlign: "right" }}>${fm(uT)}</b>
        <b>Surse</b><${Stack} items=${srcs} total=${uT}/><b style=${{ textAlign: "right" }}>${fm(uT)}</b></div>
      <${Legend} items=${[...uses, ...srcs].map(([l, v, c]) => [c, `${l} ${fm(v)}`])}/>
    <//>
  <//>`;
}

// ════════════════════════ ACȚIONARI ════════════════════════
// Ieșiri către acționari = dividende brute − reinvestit în firmă (quasi-equity DP) + VVA (cheltuieli ale acționarilor
// puse pe firmă — nu țin de EBITDA clinicilor sau a sediului). Impozitul pe dividende se arată separat.
// Nu există buget → referința sunt mediana lunară, banda P25–P75, 12 luni rulante și comparația cu anul trecut.
const q = (arr, p) => { const a = arr.filter((v) => v != null).slice().sort((x, y) => x - y); if (!a.length) return null; const k = (a.length - 1) * p, f = Math.floor(k); return a[f] + (a[Math.min(f + 1, a.length - 1)] - a[f]) * (k - f); };
function Shareholders({ D }) {
  const X = derive(D), sh = D.sh, M = sh.months, last = M[M.length - 1], y = +last.slice(0, 4), n = +last.slice(5);
  const o = (k, i) => -(sh[k][i] || 0);                        // ieșire pozitivă
  const I = M.map((_, i) => i), iY = I.filter((i) => M[i].startsWith(String(y))), iL = I.filter((i) => M[i].startsWith(String(y - 1)) && +M[i].slice(5) <= n);
  const S = (k, idx) => sum(idx.map((i) => o(k, i)));
  const gross = S("divGross", iY), dp = -S("dp", iY), net = S("divNet", iY), vva = S("vva", iY), tot = S("total", iY), eur = S("totalEUR", iY), tax = S("divTax", iY);
  const totL = S("total", iL), grossL = S("divGross", iL), dpL = -S("dp", iL), vvaL = S("vva", iL);
  const monthly = I.map((i) => o("total", i)), last24 = monthly.slice(-24), med = q(last24, 0.5), p25 = q(last24, 0.25), p75 = q(last24, 0.75);
  const cur = monthly[monthly.length - 1];
  const netP = X.ytd("net"), netPL = X.ly("net"), eb = X.ytd("ebitda");
  const roll = I.map((i) => (i >= 11 ? sum(monthly.slice(i - 11, i + 1)) : null));
  // sustenabilitate (numerar, an curent realizat + reforecast): flux liber vs distribuții
  const cf = X.cf, C_ = (k, idx) => sum(idx.map((i) => cf[k][i] || 0));
  const fcfA = C_("opCF", X.cAct) + C_("invCF", X.cAct), distA = -(C_("dividends", X.cAct) + C_("divTax", X.cAct) + C_("vvaPaid", X.cAct));
  const fcfFY = C_("opCF", X.cAll) + C_("invCF", X.cAll), distFY = -(C_("dividends", X.cAll) + C_("divTax", X.cAll) + C_("vvaPaid", X.cAll)), debtFY = C_("debtDev", X.cAll) + C_("debtHold", X.cAll);
  const cashLast = cf.months[X.cAct[X.cAct.length - 1]];
  // grafic lunar
  const rows = I.map((i) => ({ m: ml(M[i]), "Dividende nete": o("divNet", i), VVA: o("vva", i), "Reinvestit (DP)": o("dp", i) || null }));   // DP e pozitiv în Excel → negativ aici, sub zero
  const rrows = I.map((i) => ({ m: ml(M[i]), "12 luni rulante": roll[i] }));
  // punte YTD
  const steps = [["Dividende brute", gross, "tot"], ["Reinvestit (DP)", -dp, "pos"], ["VVA", vva, "neg"], ["Ieșiri nete", tot, "sub"], ["Impozit dividende", tax, "neg"], ["Cost total", tot + tax, "end"]];
  const Wd = 640, Hd = 220, pd = { l: 8, r: 8, t: 22, b: 30 }, bw = (Wd - pd.l - pd.r) / steps.length;
  let run = 0; const bars = steps.map(([l, v, k]) => { let y0, y1; if (k === "tot" || k === "sub" || k === "end") { y0 = 0; y1 = v; run = v; } else { y0 = run; y1 = run + v; run = y1; } return { l, v, k, y0, y1 }; });
  const mx = Math.max(...bars.map((b) => Math.max(b.y0, b.y1))) * 1.1, Yd = (v) => pd.t + (Hd - pd.t - pd.b) * (1 - v / mx);
  const colB = { tot: "#C9B8AC", pos: C.good, neg: C.amber, sub: C.primary, end: C.deep };
  // tabel pe ani
  const years = [y - 2, y - 1, y].map((yy) => { const idx = I.filter((i) => M[i].startsWith(String(yy))), nm = idx.length;
    const pIdx = X.pl.months.map((m, i) => (m.startsWith(String(yy)) ? i : -1)).filter((i) => i >= 0);
    const np = sum(pIdx.map((i) => X.A.net[i]));
    return { yy, nm, gross: S("divGross", idx), dp: -S("dp", idx), net: S("divNet", idx), vva: S("vva", idx), tot: S("total", idx), eur: S("totalEUR", idx), tax: S("divTax", idx),
      med: q(idx.map((i) => monthly[i]), 0.5), payout: np ? S("total", idx) / np * 100 : null }; });
  const avg = years.map((r) => ({ yy: r.yy, nm: r.nm, ron: r.nm ? r.tot / r.nm : null, eur: r.nm ? r.eur / r.nm : null }));
  // analiză
  const pos = [], watch = [];
  const g = gr(tot, totL), gp = gr(netP, netPL);
  (g <= gp ? pos : watch).push({ t: `Ieșiri nete ${pc(g)} YoY vs profit net ${pc(gp)}`, d: `YTD ${fm(tot)} vs ${fm(totL)} în Ian–${MON[n - 1]} ${y - 1} · ${(tot / netP * 100).toFixed(0)}% din profitul net (${(totL / netPL * 100).toFixed(0)}% anul trecut).` });
  const rr = dp / gross * 100, rrL = dpL / grossL * 100;
  (rr >= rrL - 5 ? pos : watch).push({ t: `${rr.toFixed(0)}% din dividendele brute se întorc în firmă (DP)`, d: `${fm(dp)} din ${fm(gross)} · anul trecut ${rrL.toFixed(0)}%.` });
  if (cur > p75) watch.push({ t: `${MON_FULL[n - 1]}: ${fm(cur)} — peste banda obișnuită`, d: `mediana lunară (24 luni) ${fm(med)}, banda P25–P75 ${fm(p25)}–${fm(p75)}.` });
  else pos.push({ t: `${MON_FULL[n - 1]}: ${fm(cur)} — în banda obișnuită`, d: `mediana lunară (24 luni) ${fm(med)}, banda P25–P75 ${fm(p25)}–${fm(p75)}.` });
  const gv = gr(vva, vvaL); (gv != null && gv > 25 ? watch : pos).push({ t: `VVA ${fm(vva)} YTD (${pc(gv)} YoY)`, d: `cheltuieli ale acționarilor puse pe firmă · ${(vva / tot * 100).toFixed(0)}% din ieșirile nete.` });
  (distFY > fcfFY ? watch : pos).push({ t: distFY > fcfFY ? `Distribuțiile ${y} depășesc fluxul liber de numerar` : `Distribuțiile ${y} sunt acoperite de fluxul liber`, d: `flux liber (operațiuni − capex) ${fm(fcfFY)} vs distribuții + impozit + VVA ${fm(distFY)} (realizat + reforecast)${distFY > fcfFY ? ` — diferența de ${fm(distFY - fcfFY)} vine, practic, din creditele noi (${fm(debtFY)}).` : "."}` });
  return html`<${Wrap}>
    <div className="cfoHero cfoHero4 cfo-fade" style=${{ background: `linear-gradient(120deg,${C.primary} 0%,${C.deep} 60%,#3E0D0A 100%)`, borderRadius: 16, padding: "20px 24px", color: "#fff", display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,1.1fr)", gap: 20, alignItems: "center", marginBottom: 14 }}>
      <div>
        <div style=${{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(242,218,183,.85)" }}>Ieșiri nete către acționari · YTD Ian–${MON[n - 1]} ${y}</div>
        <div style=${{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}><span style=${{ fontFamily: "'Playfair Display',serif", fontSize: 46, fontWeight: 900, lineHeight: 1 }}>${fm(tot)}</span><span style=${{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>RON · €${fm(eur)}</span></div>
        <div style=${{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
          <span style=${{ background: "rgba(255,255,255,.14)", borderRadius: 20, padding: "4px 10px", fontSize: 11.5, fontWeight: 600 }}>${pc(g)} YoY</span>
          <span style=${{ background: "rgba(255,255,255,.14)", borderRadius: 20, padding: "4px 10px", fontSize: 11.5, fontWeight: 600 }}>${(tot / netP * 100).toFixed(0)}% din profitul net</span>
          <span style=${{ background: "rgba(255,255,255,.14)", borderRadius: 20, padding: "4px 10px", fontSize: 11.5, fontWeight: 600 }}>+ impozit dividende ${fm(tax)}</span></div></div>
      <div>
        <div style=${{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: 1, color: "rgba(242,218,183,.8)", fontWeight: 700 }}>Luna ${MON_FULL[n - 1]}</div>
        <div style=${{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700 }}>${fm(cur)}</div>
        <div style=${{ fontSize: 11, color: "rgba(255,255,255,.75)" }}>mediana lunară ${fm(med)} · bandă obișnuită ${fm(p25)}–${fm(p75)} (24 luni)</div></div>
      <div>
        <div style=${{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: 1, color: "rgba(242,218,183,.8)", fontWeight: 700 }}>Ultimele 12 luni</div>
        <div style=${{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700 }}>${fm(roll[roll.length - 1])}</div>
        <div style=${{ fontSize: 11, color: "rgba(255,255,255,.75)" }}>acum 12 luni: ${fm(roll[roll.length - 13])} (${pc(gr(roll[roll.length - 1], roll[roll.length - 13]))})</div></div>
      <div style=${{ background: "rgba(255,255,255,.08)", borderRadius: 12, padding: "10px 12px" }}>
        <div style=${{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: 1, color: "rgba(242,218,183,.8)", fontWeight: 700, marginBottom: 6 }}>Medie lunară · ieșiri nete</div>
        ${avg.map((a, k) => html`<div key=${a.yy} style=${{ display: "grid", gridTemplateColumns: "58px minmax(0,1fr) auto", alignItems: "baseline", gap: 6, padding: "3px 0", borderTop: k ? "1px solid rgba(255,255,255,.12)" : "none" }}>
          <span style=${{ fontSize: 11, fontWeight: 700, color: a.yy === y ? "#F2DAB7" : "rgba(255,255,255,.8)" }}>${a.yy}${a.yy === y ? "*" : ""}</span>
          <span style=${{ fontFamily: "'Playfair Display',serif", fontSize: a.yy === y ? 19 : 16, fontWeight: 700 }}>${fm(a.ron)}</span>
          <span style=${{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>€${fm(a.eur)}</span></div>`)}
        <div style=${{ fontSize: 9.5, color: "rgba(255,255,255,.6)", marginTop: 4 }}>* ${avg[2].nm} luni (Ian–${MON[n - 1]}) · ${pc(gr(avg[2].ron, avg[1].ron))} vs media ${y - 1}</div></div>
    </div>
    <${Card}>
      <${Sec} kicker="Componență" title=${`De la dividende brute la costul total · YTD Ian–${MON[n - 1]} ${y}`} note="Verde = partea reinvestită în firmă (quasi-equity DP). Impozitul pe dividende e separat de ieșirile nete."/>
      <svg viewBox=${`0 0 ${Wd} ${Hd}`} style=${{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Componența ieșirilor către acționari">
        <line x1=${pd.l} x2=${Wd - pd.r} y1=${Yd(0)} y2=${Yd(0)} stroke=${C.border}/>
        ${bars.map((b, i) => { const x = pd.l + i * bw + bw * 0.16, w = bw * 0.68, top = Yd(Math.max(b.y0, b.y1)), h = Math.max(1.5, Math.abs(Yd(b.y0) - Yd(b.y1)));
          return html`<g key=${b.l}><rect className="cfo-grow" x=${x} y=${top} width=${w} height=${h} rx="3" fill=${colB[b.k]} style=${{ animationDelay: `${i * 0.08}s` }}><title>${b.l}: ${fm(b.v)}</title></rect>
            ${i < bars.length - 1 && html`<line x1=${x + w} x2=${x + bw} y1=${Yd(b.y1)} y2=${Yd(b.y1)} stroke="#B8A89C" strokeDasharray="2 2"/>`}
            <text x=${x + w / 2} y=${top - 6} textAnchor="middle" style=${{ fontSize: 11, fontWeight: 700, fill: b.k === "pos" ? C.good : C.text }}>${b.k === "pos" ? fs(b.v) : b.k === "neg" ? "+" + fm(b.v) : fm(b.v)}</text>
            <text x=${x + w / 2} y=${Hd - 10} textAnchor="middle" style=${{ fontSize: 10.5, fontWeight: 600, fill: C.muted }}>${b.l}</text></g>`; })}
      </svg>
    <//>
    <${Card}>
      <${Sec} kicker="Ritm (fără buget)" title="Ieșiri lunare vs mediană" note=${`Bare deasupra zero = ieșiri nete (dividende nete + VVA); sub zero = sume reinvestite în firmă. Linia = mediana lunară pe 24 de luni (${fm(med)}), banda = P25–P75 (${fm(p25)}–${fm(p75)}), adică intervalul obișnuit.`}/>
      <div style=${{ height: 250 }}><${ResponsiveContainer}><${ComposedChart} data=${rows} stackOffset="sign" margin=${{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <${CartesianGrid} strokeDasharray="3 3" stroke="#F0E9E1" vertical=${false}/><${XAxis} dataKey="m" tick=${{ fontSize: 10 }} interval=${2}/><${YAxis} tickFormatter=${fm} tick=${{ fontSize: 10 }} width=${44}/><${Tooltip} content=${html`<${TT}/>`}/>
        <${ReferenceArea} y1=${p25} y2=${p75} fill=${C.amber} fillOpacity=${0.12} stroke="none"/>
        <${ReferenceLine} y=${0} stroke="#B8A89C"/><${ReferenceLine} y=${med} stroke=${C.amber} strokeDasharray="5 4" strokeWidth=${1.6}/>
        <${Bar} dataKey="Dividende nete" stackId="a" fill=${C.primary}/><${Bar} dataKey="VVA" stackId="a" fill=${C.amber} radius=${[3, 3, 0, 0]}/>
        <${Bar} dataKey="Reinvestit (DP)" stackId="a" fill=${C.good} fillOpacity=${0.75}/>
      <//><//></div>
      <${Legend} items=${[[C.primary, "dividende nete"], [C.amber, "VVA"], [C.good, "reinvestit în firmă (DP)"], [C.amber, "mediana 24 luni", true]]}/>
    <//>
    <div className="cfoGrid cfoGrid2" style=${{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>
      <${Card}>
        <${Sec} kicker="Trend" title="Ieșiri nete pe 12 luni rulante" note="Suma ultimelor 12 luni la fiecare lună — elimină sezonalitatea și plățile punctuale."/>
        <div style=${{ height: 200 }}><${ResponsiveContainer}><${ComposedChart} data=${rrows} margin=${{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <${CartesianGrid} strokeDasharray="3 3" stroke="#F0E9E1" vertical=${false}/><${XAxis} dataKey="m" tick=${{ fontSize: 10 }} interval=${3}/><${YAxis} tickFormatter=${fm} tick=${{ fontSize: 10 }} width=${44}/><${Tooltip} content=${html`<${TT}/>`}/>
          <${Line} dataKey="12 luni rulante" stroke=${C.primary} strokeWidth=${2.2} dot=${false} connectNulls/>
        <//><//></div>
      <//>
      <${Card}>
        <${Sec} kicker="Sustenabilitate" title=${`Din ce se plătesc distribuțiile · ${y}`} note=${`Numerar, realizat până la ${ml(cashLast)} + reforecast. Distribuții = dividende nete + impozit pe dividende + VVA plătit.`}/>
        <div style=${{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr) 70px", gap: "10px 12px", alignItems: "center", fontSize: 11.5, marginTop: 8 }}>
          ${[["Flux liber (op. − capex)", fcfFY, C.good], ["Distribuții", distFY, C.primary], ["Credite noi", debtFY, C.blue]].map(([l, v, c]) => html`<${Fragment} key=${l}>
            <b>${l}</b><div style=${{ height: 18, background: "#F1ECE6", borderRadius: 5, overflow: "hidden" }}><div className="cfo-fade" style=${{ width: `${Math.max(0, v) / Math.max(fcfFY, distFY, debtFY) * 100}%`, height: "100%", background: c }}></div></div><b style=${{ textAlign: "right" }}>${fm(v)}</b><//>`)}
        </div>
        <div style=${{ fontSize: 11, color: "#4a3f38", marginTop: 10, lineHeight: 1.5 }}>Realizat Ian–${ml(cashLast)}: flux liber ${fm(fcfA)} vs distribuții ${fm(distA)}.</div>
      <//>
    </div>
    <${Card}>
      <${Sec} kicker="Pe ani" title="Istoric și ritm" note=${`Anul ${y} = realizat Ian–${MON[n - 1]}. Rata de reinvestire = DP / dividende brute. Payout = ieșiri nete / profit net al anului.`}/>
      <div style=${{ overflowX: "auto" }}><table className="cfoTbl" style=${{ minWidth: 640 }}><thead><tr><th></th>${years.map((r) => html`<th key=${r.yy}>${r.yy}${r.yy === y ? ` (${r.nm} luni)` : ""}</th>`)}</tr></thead>
        <tbody>${[["Dividende brute", "gross"], ["Reinvestit în firmă (DP)", "dp"], ["Dividende nete", "net"], ["VVA", "vva"], ["Ieșiri nete", "tot", true], ["în EUR", "eur"], ["Impozit pe dividende", "tax"]].map(([l, k, b]) => html`<tr key=${k}><td style=${{ fontWeight: b ? 700 : 500 }}>${l}</td>${years.map((r) => html`<td key=${r.yy} style=${{ fontWeight: b ? 700 : 400 }}>${fm(r[k])}</td>`)}</tr>`)}
          <tr><td>Rata de reinvestire</td>${years.map((r) => html`<td key=${r.yy}>${r.gross ? (r.dp / r.gross * 100).toFixed(0) + "%" : "—"}</td>`)}</tr>
          <tr><td>Mediana lunară (ieșiri nete)</td>${years.map((r) => html`<td key=${r.yy}>${fm(r.med)}</td>`)}</tr>
          <tr><td>Payout (% din profit net)</td>${years.map((r) => html`<td key=${r.yy}>${r.payout != null ? r.payout.toFixed(0) + "%" : "—"}</td>`)}</tr></tbody></table></div>
    <//>
    <${Card}><${Sec} kicker="Calculat din date" title="Ce reiese"/><${Insight} pos=${pos} watch=${watch}/><//>
    <div style=${{ fontSize: 10, color: C.muted, margin: "0 2px 18px" }}>Sursă: foaia „Shareholders" din ${D.meta.source} (doar blocul de realizat — blocul de buget din Excel e stricat, cu #REF!). Nu există buget pentru distribuții: referința e mediana și trendul.</div>
  <//>`;
}

export function renderTab(t, D, go) {
  const body = t === "sum" ? html`<${Summary} D=${D} go=${go}/>` : t === "fin" ? html`<${Finance} D=${D}/>` : t === "capex" ? html`<${Capex} D=${D}/>` : t === "sh" ? html`<${Shareholders} D=${D}/>` : null;
  return html`<${Fragment}>${CSS}${body}<//>`;
}
