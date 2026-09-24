import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from "recharts";
const C = {
  primary: "#7B1C16",
  olive: "#B5BD5C",
  terracotta: "#dd7e6b",
  amberGold: "#C9A227",
  yellow: "#FBE483",
  wheat: "#F2DAB7",
  cream: "#F5EDE3",
  alert: "#FF0300",
  text: "#222222",
  muted: "#6b5d52",
  white: "#FFFFFF",
  border: "#E8DDD0"
};
const FONT = "'Poppins', system-ui, -apple-system, sans-serif";
const LOGO_SRC = "data:image/png;base64,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";
const OVERDRAFT_LIMIT = 1e6;
const DATA = [
  { m: "Apr 25", cashOpen: 1638828, ebitda: 647326, opCF: 456404, invCF: -205275, finCF: -175332, wcCF: 26371, totalGen: 102168, cashEnd: 1740996, capexRE: 0, capexFitout: -74969, capexEQ: -130306, payTotal: 2529865, payCurrent: 2481654, payPropco: 48211, daysTotal: 45, daysCurrent: 31, daysPropco: 14, netBankDebt: 1356031, fiscalDebt: 790636, totalDebt: 2146667, totalDebtEUR: 429333, odMov: 0, odBal: 0, ilBal: 5e5, ilBalEUR: 1e5, shSpend: 237729, shSpendEUR: 47546 },
  { m: "Mai 25", cashOpen: 1740996, ebitda: 803691, opCF: 694151, invCF: -878136, finCF: -153743, wcCF: 683599, totalGen: 345871, cashEnd: 2086867, capexRE: -721534, capexFitout: -125674, capexEQ: -30928, payTotal: 3092156, payCurrent: 2319798, payPropco: 772358, daysTotal: 37, daysCurrent: 25, daysPropco: 11, netBankDebt: 1413746, fiscalDebt: 717949, totalDebt: 2131695, totalDebtEUR: 426339, odMov: 0, odBal: 0, ilBal: 5e5, ilBalEUR: 1e5, shSpend: 207173, shSpendEUR: 41435 },
  { m: "Iun 25", cashOpen: 2086867, ebitda: 722539, opCF: 588450, invCF: -1173810, finCF: -415130, wcCF: 956682, totalGen: -43808, cashEnd: 2043059, capexRE: 0, capexFitout: -496720, capexEQ: -677090, payTotal: 2009616, payCurrent: 1985259, payPropco: 24357, daysTotal: 33, daysCurrent: 22, daysPropco: 11, netBankDebt: 1822410, fiscalDebt: 668089, totalDebt: 2490499, totalDebtEUR: 498100, odMov: 0, odBal: 0, ilBal: 5e5, ilBalEUR: 1e5, shSpend: 364237, shSpendEUR: 72847 },
  { m: "Iul 25", cashOpen: 2043059, ebitda: 780095, opCF: 560416, invCF: -1847977, finCF: -801392, wcCF: 2199039, totalGen: 110086, cashEnd: 2153145, capexRE: 0, capexFitout: -1577119, capexEQ: -270858, payTotal: 2893429, payCurrent: 2247579, payPropco: 645850, daysTotal: 56, daysCurrent: 24, daysPropco: 32, netBankDebt: 1850250, fiscalDebt: 618229, totalDebt: 2468479, totalDebtEUR: 493696, odMov: 0, odBal: 0, ilBal: 875e3, ilBalEUR: 175e3, shSpend: 236999, shSpendEUR: 47400 },
  { m: "Aug 25", cashOpen: 2153145, ebitda: 661163, opCF: 568196, invCF: -109790, finCF: 103716, wcCF: -1293185, totalGen: -731063, cashEnd: 1422082, capexRE: 0, capexFitout: -9228, capexEQ: -100562, payTotal: 2311554, payCurrent: 2297310, payPropco: 14244, daysTotal: 35, daysCurrent: 26, daysPropco: 9, netBankDebt: 2631716, fiscalDebt: 451446, totalDebt: 3083162, totalDebtEUR: 616632, odMov: 0, odBal: 0, ilBal: 875e3, ilBalEUR: 175e3, shSpend: 682862, shSpendEUR: 136572 },
  { m: "Sep 25", cashOpen: 1422082, ebitda: 868799, opCF: 746060, invCF: -724097, finCF: -223642, wcCF: 268016, totalGen: 66337, cashEnd: 1488419, capexRE: -289928, capexFitout: -155252, capexEQ: -278917, payTotal: 2537441, payCurrent: 2408281, payPropco: 129160, daysTotal: 32, daysCurrent: 23, daysPropco: 9, netBankDebt: 2626541, fiscalDebt: 397446, totalDebt: 3023987, totalDebtEUR: 604797, odMov: 0, odBal: 0, ilBal: 875e3, ilBalEUR: 175e3, shSpend: 222806, shSpendEUR: 44561 },
  { m: "Oct 25", cashOpen: 1488419, ebitda: 1049106, opCF: 746886, invCF: -820352, finCF: 16268, wcCF: 507032, totalGen: 449834, cashEnd: 1938253, capexRE: 0, capexFitout: -797535, capexEQ: -22817, payTotal: 2686611, payCurrent: 2497297, payPropco: 189314, daysTotal: 58, daysCurrent: 23, daysPropco: 36, netBankDebt: 3171171, fiscalDebt: 342203, totalDebt: 3513374, totalDebtEUR: 702675, odMov: 0, odBal: 0, ilBal: 2595e3, ilBalEUR: 519e3, shSpend: 254330, shSpendEUR: 50866 },
  { m: "Noi 25", cashOpen: 1938253, ebitda: 729920, opCF: 568358, invCF: -825505, finCF: 245395, wcCF: -5640, totalGen: -17392, cashEnd: 1920861, capexRE: 0, capexFitout: -690054, capexEQ: -135451, payTotal: 3057819, payCurrent: 2769355, payPropco: 288464, daysTotal: 37, daysCurrent: 27, daysPropco: 10, netBankDebt: 5965699, fiscalDebt: 286960, totalDebt: 6252659, totalDebtEUR: 1250532, odMov: 0, odBal: 0, ilBal: 3224681, ilBalEUR: 644936, shSpend: 233474, shSpendEUR: 46695 },
  { m: "Dec 25", cashOpen: 1920861, ebitda: 110222, opCF: -44945, invCF: -890361, finCF: 452615, wcCF: -1116265, totalGen: -1598956, cashEnd: 321905, capexRE: -337825, capexFitout: -554736, capexEQ: 2200, payTotal: 2581668, payCurrent: 2455959, payPropco: 125709, daysTotal: 40, daysCurrent: 34, daysPropco: 6, netBankDebt: 6941687, fiscalDebt: 225186, totalDebt: 7166873, totalDebtEUR: 1433375, odMov: 652139, odBal: 652139, ilBal: 4040841, ilBalEUR: 808168, shSpend: 200646, shSpendEUR: 40129 },
  { m: "Ian 26", cashOpen: 321905, ebitda: 950058, opCF: 873786, invCF: -350217, finCF: -704179, wcCF: 552245, totalGen: 371635, cashEnd: 693540, capexRE: 0, capexFitout: -50614, capexEQ: -299603, payTotal: 2979101, payCurrent: 2852740, payEuroFunds: 0, payPropco: 126361, daysTotal: 27, daysCurrent: 26, daysEuroFunds: 0, daysPropco: 0, netBankDebt: 6988705, fiscalDebt: 188352, totalDebt: 7177057, totalDebtEUR: 1435411, odMov: 37081, odBal: 689220, ilBal: 4219841, ilBalEUR: 843968, shSpend: 68651, shSpendEUR: 13730 },
  { m: "Feb 26", cashOpen: 693540, ebitda: 834657, opCF: 777382, invCF: -973836, finCF: -152325, wcCF: 673661, totalGen: 324882, cashEnd: 1018422, capexRE: 0, capexFitout: -717020, capexEQ: -256816, payTotal: 3856445, payCurrent: 2530309, payEuroFunds: 783833, payPropco: 542303, daysTotal: 34, daysCurrent: 23, daysEuroFunds: 7, daysPropco: 0, netBankDebt: 8507552, fiscalDebt: 162187, totalDebt: 8669739, totalDebtEUR: 1733948, odMov: 93171, odBal: 782391, ilBal: 4503841, ilBalEUR: 900768, shSpend: 216405, shSpendEUR: 43281 },
  { m: "Mar 26", cashOpen: 1018422, ebitda: 1128656, opCF: 1055378, invCF: -546616, finCF: -579969, wcCF: 190051, totalGen: 118844, cashEnd: 1137266, capexRE: 0, capexFitout: -463586, capexEQ: -83030, payTotal: 3563375, payCurrent: 2329597, payEuroFunds: 783833, payPropco: 449945, daysTotal: 26, daysCurrent: 17, daysEuroFunds: 6, daysPropco: 0, netBankDebt: 8475692, fiscalDebt: 136022, totalDebt: 8611714, totalDebtEUR: 1722343, odMov: -331472, odBal: 450919, ilBal: 4683841, ilBalEUR: 936768, shSpend: 10647, shSpendEUR: 2129 },
  { m: "Apr 26", cashOpen: 1137266, ebitda: 771543, opCF: 638653, invCF: -1185329, finCF: 745569, wcCF: -147311, totalGen: 51582, cashEnd: 1188848, capexRE: -25464, capexFitout: -88124, capexEQ: -1071741, payTotal: 3470222, payCurrent: 2341991, payEuroFunds: 783833, payPropco: 344398, daysTotal: 29, daysCurrent: 20, daysEuroFunds: 7, daysPropco: 1, netBankDebt: 8418320, fiscalDebt: 360279, totalDebt: 8778599, totalDebtEUR: 1755720, odMov: 201317, odBal: 652236, ilBal: 4758841, ilBalEUR: 951768, shSpend: 245505, shSpendEUR: 49101 },
  { m: "Mai 26", cashOpen: 1188848, ebitda: 1078707, opCF: 1001967, invCF: -883859, finCF: -1002668, wcCF: 193406, totalGen: -691154, cashEnd: 497694, capexRE: -488462, capexFitout: -390719, capexEQ: -4678, payTotal: 2988572, payCurrent: 1993503, payEuroFunds: 783833, payPropco: 211236, daysTotal: 23, daysCurrent: 15, daysEuroFunds: 6, daysPropco: 0, netBankDebt: 8365652, fiscalDebt: 330256, totalDebt: 8695908, totalDebtEUR: 1739182, odMov: -343489, odBal: 308747, ilBal: 4987841, ilBalEUR: 997568, shSpend: 290319, shSpendEUR: 58064 },
  { m: "Iun 26", cashOpen: 497694, ebitda: 1096721, opCF: 915766, invCF: -374873, finCF: -91755, wcCF: -443531, totalGen: 5607, cashEnd: 503301, capexRE: -290004, capexFitout: -84869, capexEQ: 0, payTotal: 2681068, payCurrent: 1788179, payEuroFunds: 783833, payPropco: 109056, daysTotal: 19, daysCurrent: 13, daysEuroFunds: 6, daysPropco: 1, netBankDebt: 8313491, fiscalDebt: 300233, totalDebt: 8613724, totalDebtEUR: 1722745, odMov: 226269, odBal: 535016, ilBal: 4987841, ilBalEUR: 997568, shSpend: 220647, shSpendEUR: 44129 }
];
const fmtRON = (v, opts = {}) => {
  if (v == null || isNaN(v)) return "\u2014";
  const abs = Math.abs(v);
  let str;
  if (abs >= 1e6) str = (v / 1e6).toFixed(opts.dp ?? 2) + "M";
  else if (abs >= 1e3) str = (v / 1e3).toFixed(0) + "k";
  else str = v.toFixed(0);
  return str;
};
const fmtRONfull = (v) => {
  if (v == null || isNaN(v)) return "\u2014";
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  return sign + abs.toLocaleString("ro-RO", { maximumFractionDigits: 0 });
};
const fmtPct = (v, dp = 1) => v == null ? "\u2014" : (v >= 0 ? "+" : "") + v.toFixed(dp) + "%";
function KPI({ label, value, sub, accent = C.primary, trend, trendType = "positive" }) {
  const trendColor = trend == null ? C.muted : trendType === "positive" ? trend >= 0 ? "#3a7d2e" : C.alert : trend >= 0 ? C.alert : "#3a7d2e";
  return /* @__PURE__ */ jsxs("div", { style: {
    flex: "1 1 175px",
    minWidth: 175,
    background: C.white,
    border: `1px solid ${C.border}`,
    borderTop: `3px solid ${accent}`,
    borderRadius: 4,
    padding: "20px 22px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    gap: 6
  }, children: [
    /* @__PURE__ */ jsx("div", { style: {
      fontFamily: FONT,
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: C.muted
    }, children: label }),
    /* @__PURE__ */ jsx("div", { style: { fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1.1 }, children: value }),
    sub && /* @__PURE__ */ jsx("div", { style: { fontFamily: FONT, fontSize: 12, fontWeight: 400, color: C.muted, marginTop: 2 }, children: sub }),
    trend != null && /* @__PURE__ */ jsxs("div", { style: { fontFamily: FONT, fontSize: 11, fontWeight: 600, color: trendColor, marginTop: 4 }, children: [
      trend >= 0 ? "\u25B2" : "\u25BC",
      " ",
      fmtPct(trend),
      " ",
      /* @__PURE__ */ jsx("span", { style: { color: C.muted, fontWeight: 400 }, children: "vs luna anterioară" })
    ] })
  ] });
}
function Section({ title, subtitle, children, kicker }) {
  return /* @__PURE__ */ jsxs("section", { style: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    padding: "24px 26px 20px",
    marginBottom: 18
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 18 }, children: [
      kicker && /* @__PURE__ */ jsx("div", { style: {
        fontFamily: FONT,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: C.amberGold,
        marginBottom: 4
      }, children: kicker }),
      /* @__PURE__ */ jsx("h2", { style: {
        fontFamily: FONT,
        fontSize: 18,
        fontWeight: 700,
        color: C.primary,
        margin: 0,
        lineHeight: 1.3
      }, children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { style: {
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: 400,
        color: C.muted,
        margin: "4px 0 0",
        lineHeight: 1.5
      }, children: subtitle })
    ] }),
    children
  ] });
}
function CustomTooltip({ active, payload, label, valueFormatter, suffix }) {
  if (!active || !payload || !payload.length) return null;
  return /* @__PURE__ */ jsxs("div", { style: {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 3,
    padding: "10px 12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    fontFamily: FONT,
    fontSize: 12
  }, children: [
    /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, color: C.primary, marginBottom: 6 }, children: label }),
    payload.map((p, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, color: C.text }, children: [
      /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, background: p.color, display: "inline-block", borderRadius: 1 } }),
        p.name
      ] }),
      /* @__PURE__ */ jsxs("span", { style: { fontWeight: 600 }, children: [
        valueFormatter ? valueFormatter(p.value) : fmtRONfull(p.value),
        suffix || ""
      ] })
    ] }, i))
  ] });
}
function Waterfall({ row }) {
  const steps = [
    { label: "Sold inițial", value: row.cashOpen, type: "total" },
    { label: "CF operațional", value: row.opCF, type: "in" },
    { label: "CF investiții", value: row.invCF, type: "out" },
    { label: "CF finanțare", value: row.finCF, type: "out" },
    { label: "Capital de lucru", value: row.wcCF, type: row.wcCF >= 0 ? "in" : "out" },
    { label: "Sold final", value: row.cashEnd, type: "total" }
  ];
  let running = 0;
  const barData = steps.map((s, i) => {
    if (s.type === "total") {
      running = s.value;
      return { ...s, base: 0, top: s.value, displayValue: s.value };
    }
    const start = running;
    running += s.value;
    return {
      ...s,
      base: Math.min(start, running),
      top: Math.max(start, running),
      displayValue: s.value
    };
  });
  const maxVal = Math.max(...barData.map((d) => d.top)) * 1.08;
  const colorFor = (t) => t === "total" ? C.primary : t === "in" ? C.olive : C.terracotta;
  return /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 320, display: "flex", alignItems: "flex-end", gap: 12, padding: "8px 4px 0" }, children: barData.map((d, i) => {
    const heightPct = (d.top - d.base) / maxVal * 100;
    const offsetPct = d.base / maxVal * 100;
    return /* @__PURE__ */ jsxs("div", { style: { flex: 1, height: "100%", position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 700,
        color: colorFor(d.type),
        textAlign: "center",
        marginBottom: 4
      }, children: [
        d.type === "total" ? "" : d.displayValue >= 0 ? "+" : "",
        fmtRON(d.displayValue)
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { height: "88%", position: "relative", borderBottom: `1px solid ${C.border}` }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          position: "absolute",
          bottom: `${offsetPct}%`,
          width: "100%",
          height: `${heightPct}%`,
          background: colorFor(d.type),
          borderRadius: "2px 2px 0 0",
          opacity: d.type === "total" ? 1 : 0.85,
          transition: "all 0.4s ease"
        } }),
        d.type === "total" && /* @__PURE__ */ jsx("div", { style: {
          position: "absolute",
          bottom: `${offsetPct + heightPct}%`,
          width: "100%",
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 12,
          fontWeight: 700,
          color: C.primary,
          transform: "translateY(-22px)"
        }, children: fmtRON(d.displayValue) }),
        i < barData.length - 1 && d.type !== "total" && /* @__PURE__ */ jsx("div", { style: {
          position: "absolute",
          bottom: `${running / maxVal * 100}%`,
          right: "-6px",
          width: 12,
          borderTop: `1px dashed ${C.muted}`,
          opacity: 0.5
        } })
      ] }),
      /* @__PURE__ */ jsx("div", { style: {
        fontFamily: FONT,
        fontSize: 11,
        fontWeight: 500,
        color: C.text,
        textAlign: "center",
        marginTop: 8,
        height: 30
      }, children: d.label })
    ] }, i);
  }) });
}
function CashflowDashboard() {
  const latest = DATA[DATA.length - 1];
  const prev = DATA[DATA.length - 2];
  const yearAgo = DATA[DATA.length - 13];
  const cashMoM = (latest.cashEnd - prev.cashEnd) / prev.cashEnd * 100;
  const ebitdaMoM = (latest.ebitda - prev.ebitda) / prev.ebitda * 100;
  const opCFMoM = (latest.opCF - prev.opCF) / Math.abs(prev.opCF) * 100;
  const totals = useMemo(() => {
    const sum = (k) => DATA.reduce((a, r) => a + r[k], 0);
    const ebitda = sum("ebitda");
    const opCF = sum("opCF");
    const invCF = sum("invCF");
    const finCF = sum("finCF");
    const wcCF = sum("wcCF");
    const totalGen = sum("totalGen");
    const capexAll = sum("capexRE") + sum("capexFitout") + sum("capexEQ");
    const conversion = opCF / ebitda * 100;
    return { ebitda, opCF, invCF, finCF, wcCF, totalGen, capexAll, conversion };
  }, []);
  const recentQ = DATA.slice(-3).reduce((a, r) => ({
    ebitda: a.ebitda + r.ebitda,
    opCF: a.opCF + r.opCF,
    totalGen: a.totalGen + r.totalGen
  }), { ebitda: 0, opCF: 0, totalGen: 0 });
  const yaQ = DATA.slice(0, 3).reduce((a, r) => ({
    ebitda: a.ebitda + r.ebitda,
    opCF: a.opCF + r.opCF,
    totalGen: a.totalGen + r.totalGen
  }), { ebitda: 0, opCF: 0, totalGen: 0 });
  const recentQOpCFGrowth = (recentQ.opCF - yaQ.opCF) / yaQ.opCF * 100;
  const opCFYoY = (latest.opCF - yearAgo.opCF) / yearAgo.opCF * 100;
  const avgDaysTotal = DATA.reduce((a, r) => a + r.daysTotal, 0) / DATA.length;
  const ttmEbitda = DATA.slice(-12).reduce((a, r) => a + r.ebitda, 0);
  const debtYoY = (latest.totalDebt - yearAgo.totalDebt) / yearAgo.totalDebt * 100;
  const fiscalDebtChange = (latest.fiscalDebt - DATA[0].fiscalDebt) / DATA[0].fiscalDebt * 100;
  const fiscalDebtMoM = (latest.fiscalDebt - prev.fiscalDebt) / prev.fiscalDebt * 100;
  return /* @__PURE__ */ jsxs("div", { style: {
    minHeight: "100vh",
    background: C.cream,
    fontFamily: FONT,
    padding: "0 0 60px",
    color: C.text
  }, children: [
    /* @__PURE__ */ jsx("style", { children: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap');
        .recharts-cartesian-axis-tick-value { font-family: ${FONT}; font-size: 11px; fill: ${C.muted}; }
        .recharts-legend-item-text { font-family: ${FONT}; font-size: 12px; color: ${C.text} !important; }
      ` }),
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("header", { style: {
        background: C.primary,
        borderRadius: 0,
        padding: "14px 32px",
        marginBottom: 18,
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
      }, children: [
        /* @__PURE__ */ jsx("h1", { style: {
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: 21,
          color: C.white,
          margin: 0,
          lineHeight: 1.2,
          letterSpacing: -0.2
        }, children: "Analiza Cashflow \u00b7 Iunie 2026 \u2013 Dr. Ardeleanu" }),
        /* @__PURE__ */ jsx("div", { style: {
          display: "inline-block",
          background: C.yellow,
          color: C.text,
          padding: "6px 14px",
          borderRadius: 999,
          fontFamily: FONT,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.8,
          textTransform: "uppercase",
          marginLeft: "auto"
        }, children: "Realizat Iun 2026" })
      ] }),      /* @__PURE__ */ jsxs("div", { style: { maxWidth: 1280, margin: "0 auto", padding: "0 28px" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsx(
          KPI,
          {
            label: "Numerar disponibil",
            value: fmtRONfull(latest.cashEnd) + " RON",
            sub: `vs ${fmtRONfull(prev.cashEnd)} luna anterioară`,
            accent: C.primary,
            trend: cashMoM
          }
        ),
        /* @__PURE__ */ jsx(
          KPI,
          {
            label: "GOURP EBITDA",
            value: fmtRONfull(latest.ebitda) + " RON",
            sub: `A doua cea mai bun\u0103 lun\u0103 din fereastr\u0103 \xB7 vs media ${fmtRON(totals.ebitda / DATA.length)}`,
            accent: C.amberGold,
            trend: ebitdaMoM
          }
        ),
        /* @__PURE__ */ jsx(
          KPI,
          {
            label: "Zile de plată furnizori",
            value: latest.daysTotal + " zile",
            sub: `vs media pe 15 luni ${avgDaysTotal.toFixed(0)}z \xB7 furnizori comerciali la minimul ferestrei ${latest.daysCurrent}z`,
            accent: C.terracotta,
            trend: latest.daysTotal - prev.daysTotal,
            trendType: "negative"
          }
        ),
        /* @__PURE__ */ jsx(
          KPI,
          {
            label: "Datorie totală",
            value: "\u20AC" + fmtRONfull(latest.totalDebtEUR),
            sub: `${fmtRONfull(latest.totalDebt)} RON \xB7 ${(latest.totalDebt / ttmEbitda).toFixed(2)}\u00d7 datorie netă/EBITDA`,
            accent: C.text,
            trend: (latest.totalDebt - prev.totalDebt) / prev.totalDebt * 100,
            trendType: "negative"
          }
        ),
        /* @__PURE__ */ jsx(
          KPI,
          {
            label: "Utilizare overdraft",
            value: (latest.odBal / OVERDRAFT_LIMIT * 100).toFixed(1) + "%",
            sub: `${fmtRONfull(latest.odBal)} din ${fmtRON(OVERDRAFT_LIMIT)} tras \xB7 rezerv\u0103 ${fmtRON(OVERDRAFT_LIMIT - latest.odBal)}`,
            accent: C.amberGold,
            trend: latest.odBal / OVERDRAFT_LIMIT * 100 - prev.odBal / OVERDRAFT_LIMIT * 100,
            trendType: "negative"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { style: {
        background: C.wheat,
        borderLeft: `3px solid ${C.primary}`,
        padding: "14px 18px",
        marginBottom: 18,
        borderRadius: 2
      }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: C.primary, marginBottom: 4 }, children: "Concluzia executiv\u0103" }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, lineHeight: 1.55, color: C.text }, children: [
          /* @__PURE__ */ jsx("strong", { children: "Iunie stabilizeaz\u0103 linia de numerar \u0219i aduce cea mai rapid\u0103 plat\u0103 a furnizorilor comerciali din fereastr\u0103" }),
          " \u2014 EBITDA urc\u0103 la ",
          fmtRONfull(latest.ebitda),
          " RON (",
          fmtPct(ebitdaMoM),
          " MoM, ",
          /* @__PURE__ */ jsxs("strong", { children: [
            fmtPct((latest.ebitda - yearAgo.ebitda) / yearAgo.ebitda * 100),
            " peste iunie 2025"
          ] }),
          "), a doua cea mai bun\u0103 lun\u0103 din fereastr\u0103, convertit\u0103 \u00een ",
          fmtRONfull(latest.opCF),
          " RON de cash flow opera\u021bional, la o rat\u0103 de ",
          (latest.opCF / latest.ebitda * 100).toFixed(0),
          "% (",
          fmtPct(opCFYoY),
          " peste iunie 2025). Aceast\u0103 for\u021b\u0103 opera\u021bional\u0103 este aproape integral consumat\u0103 de capitalul de lucru: furnizorii totali scad cu ",
          fmtPct((latest.payTotal - prev.payTotal) / prev.payTotal * 100),
          " to ",
          /* @__PURE__ */ jsxs("strong", { children: [
            fmtRON(latest.payTotal),
            " RON"
          ] }),
          " \u2014 cel mai mic sold din fereastra de 15 luni \u2014 absorbind ",
          fmtRONfull(Math.abs(latest.wcCF)),
          " RON de numerar \u0219i cobor\u00e2nd partea comercial\u0103 la ",
          /* @__PURE__ */ jsxs("strong", { children: [
            latest.daysCurrent,
            " zile"
          ] }),
          ", minimul ferestrei (totalul afi\u0219eaz\u0103 ",
          latest.daysTotal,
          " doar pentru c\u0103 componenta PROPCO se prelunge\u0219te la ",
          latest.daysPropco,
          "). Investi\u021biile se modereaz\u0103 la ",
          fmtRONfull(Math.abs(latest.invCF)),
          " RON \u2014 \u00eenc\u0103 ",
          fmtRON(Math.abs(latest.capexRE)),
          " RON imobiliare plus ",
          fmtRON(Math.abs(latest.capexFitout)),
          " RON fitout, f\u0103r\u0103 cheltuieli de echipamente \u2014 iar finan\u021barea este aproape neutr\u0103, ",
          fmtRONfull(latest.finCF),
          " RON, o ",
          fmtRONfull(Math.abs(latest.odMov)),
          " RON tragere de overdraft finan\u021b\u00e2nd dividende de ",
          fmtRON(latest.shSpend),
          " RON. Generarea net\u0103 de numerar este plat\u0103, ",
          fmtRONfull(latest.totalGen),
          " RON, iar numerarul disponibil se men\u021bine la ",
          /* @__PURE__ */ jsxs("strong", { children: [
            fmtRONfull(latest.cashEnd),
            " RON"
          ] }),
          " (",
          fmtPct(cashMoM),
          " MoM) dup\u0103 sc\u0103derea din mai. Costul acestei stabilit\u0103\u021bi este cre\u0219terea utiliz\u0103rii overdraftului la ",
          (latest.odBal / OVERDRAFT_LIMIT * 100).toFixed(0),
          "% din linie (de la ",
          (prev.odBal / OVERDRAFT_LIMIT * 100).toFixed(0),
          "% \u00een mai) \u2014 linia de bilan\u021b de urm\u0103rit; \u00een rest, datoria total\u0103 r\u0103m\u00e2ne plat\u0103 la ",
          /* @__PURE__ */ jsxs("strong", { children: [
            "\u20AC",
            fmtRONfull(latest.totalDebtEUR)
          ] }),
          " (",
          (latest.totalDebt / ttmEbitda).toFixed(2),
          "\u00d7 datorie net\u0103/EBITDA TTM), cu datoria fiscal\u0103 sc\u0103zut\u0103 la ",
          fmtRON(latest.fiscalDebt),
          " RON (",
          fmtPct(fiscalDebtChange),
          " sub nivelul de la \u00eenceputul ferestrei) \u0219i f\u0103r\u0103 alocare nou\u0103 intra-grup luna aceasta."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        Section,
        {
          kicker: "Sec\u021biunea 01 \xB7 Luna curent\u0103",
          title: "Iunie 2026 \u2014 Cash Bridge",
          subtitle: "De la soldul de numerar din 1 iunie la soldul de \u00eenchidere din 30 iunie. Opera\u021biunile genereaz\u0103 0,92M RON; investi\u021biile absorb 0,37M, \u00eemp\u0103r\u021bite \u00eentre o achizi\u021bie imobiliar\u0103 de 0,29M \u0219i 0,08M fitout, f\u0103r\u0103 cheltuieli de echipamente; finan\u021barea este aproape neutr\u0103, la -0,09M, o tragere de overdraft de 0,23M compens\u00e2nd 0,22M de dividende \u0219i rate de credit; capitalul de lucru absoarbe 0,44M pe m\u0103sur\u0103 ce furnizorii totali scad la cel mai mic sold din fereastr\u0103. Rezultatul net este practic plat, +0,01M pe lun\u0103 \u2014 numerarul \u00ee\u0219i men\u021bine nivelul dup\u0103 contrac\u021bia de -0,69M din mai.",
          children: [
            /* @__PURE__ */ jsx(Waterfall, { row: latest }),
            /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}` }, children: [
              /* @__PURE__ */ jsx(AggregateBox, { color: C.olive, label: "Intrări nete", value: fmtRONfull(latest.opCF + latest.wcCF) + " RON", sub: "Operațional + capital de lucru" }),
              /* @__PURE__ */ jsx(AggregateBox, { color: C.terracotta, label: "Ieșiri nete", value: fmtRONfull(latest.invCF + latest.finCF) + " RON", sub: "Investiții + finanțare" }),
              /* @__PURE__ */ jsx(AggregateBox, { color: C.primary, label: "Variație netă", value: fmtRONfull(latest.totalGen) + " RON", sub: `Sold final ${fmtRONfull(latest.cashEnd)} RON` })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Section,
        {
          kicker: "Sec\u021biunea 02 \xB7 Lichiditate",
          title: "Traiectoria pozi\u021biei de numerar",
          subtitle: "Soldul de numerar la sf\u00e2r\u0219it de lun\u0103, cu generarea net\u0103 lunar\u0103 de numerar. Minimul din decembrie 2025 reflect\u0103 o sc\u0103dere punctual\u0103 de EBITDA combinat\u0103 cu o absorb\u021bie masiv\u0103 de capital de lucru. Dup\u0103 sc\u0103derea abrupt\u0103 din mai 2026, iunie 2026 stabilizeaz\u0103 soldul aproximativ la acela\u0219i nivel \u2014 generarea net\u0103 este practic plat\u0103, numerarul opera\u021bional puternic fiind redirec\u021bionat c\u0103tre reducerea furnizorilor \u0219i imobiliare.",
          children: [
            /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 320, children: /* @__PURE__ */ jsxs(ComposedChart, { data: DATA, margin: { top: 10, right: 20, left: 0, bottom: 5 }, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "2 4", stroke: C.border, vertical: false }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "m", tickLine: false, axisLine: { stroke: C.border } }),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "left",
                  tickFormatter: fmtRON,
                  tickLine: false,
                  axisLine: { stroke: C.border },
                  label: { value: "Numerar (RON)", angle: -90, position: "insideLeft", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "right",
                  orientation: "right",
                  tickFormatter: fmtRON,
                  tickLine: false,
                  axisLine: { stroke: C.border },
                  label: { value: "Generare netă de numerar (RON)", angle: 90, position: "insideRight", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                }
              ),
              /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CustomTooltip, {}) }),
              /* @__PURE__ */ jsx(Legend, { wrapperStyle: { paddingTop: 10, fontFamily: FONT } }),
              /* @__PURE__ */ jsx(ReferenceLine, { yAxisId: "right", y: 0, stroke: C.muted, strokeWidth: 1 }),
              /* @__PURE__ */ jsx(Bar, { yAxisId: "right", dataKey: "totalGen", name: "Generare netă de numerar", radius: [2, 2, 0, 0], children: DATA.map((d, i) => /* @__PURE__ */ jsx(Cell, { fill: d.totalGen >= 0 ? C.olive : C.terracotta }, i)) }),
              /* @__PURE__ */ jsx(
                Line,
                {
                  yAxisId: "left",
                  type: "monotone",
                  dataKey: "cashEnd",
                  name: "Numerar disponibil (sold final)",
                  stroke: C.primary,
                  strokeWidth: 2.5,
                  dot: { r: 4, fill: C.primary, strokeWidth: 0 },
                  activeDot: { r: 6, fill: C.primary }
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 24, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsx(MiniStat, { label: "Sold ini\u021bial 15 luni", value: fmtRONfull(DATA[0].cashOpen) + " RON" }),
              /* @__PURE__ */ jsx(MiniStat, { label: "Sold final 15 luni", value: fmtRONfull(latest.cashEnd) + " RON" }),
              /* @__PURE__ */ jsx(MiniStat, { label: "Variație netă", value: fmtRONfull(latest.cashEnd - DATA[0].cashOpen) + " RON", accent: true }),
              /* @__PURE__ */ jsx(MiniStat, { label: "Vârf (Iul 25)", value: fmtRONfull(2153145) + " RON" }),
              /* @__PURE__ */ jsx(MiniStat, { label: "Minim (Dec 25)", value: fmtRONfull(321905) + " RON" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Section,
        {
          kicker: "Sec\u021biunea 03 \xB7 Capital de lucru \xB7 Furnizori",
          title: "Furnizori totali \u0219i zile de plat\u0103",
          subtitle: "Bare: furnizori totali (OPCO + PROPCO) \u00een RON. Linie: zile de plat\u0103 a furnizorilor. Mai pu\u021bine zile = plat\u0103 mai rapid\u0103 = rela\u021bii mai s\u0103n\u0103toase cu furnizorii \u0219i disciplin\u0103 opera\u021bional\u0103 mai bun\u0103.",
          children: [
            /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 320, children: /* @__PURE__ */ jsxs(ComposedChart, { data: DATA, margin: { top: 10, right: 20, left: 0, bottom: 5 }, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "2 4", stroke: C.border, vertical: false }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "m", tickLine: false, axisLine: { stroke: C.border } }),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "left",
                  tickFormatter: fmtRON,
                  tickLine: false,
                  axisLine: { stroke: C.border },
                  label: { value: "Furnizori (RON)", angle: -90, position: "insideLeft", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "right",
                  orientation: "right",
                  tickLine: false,
                  axisLine: { stroke: C.border },
                  domain: [0, "dataMax + 10"],
                  label: { value: "Zile de plată furnizori", angle: 90, position: "insideRight", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  content: ({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return /* @__PURE__ */ jsxs("div", { style: {
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: 3,
                      padding: "10px 12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontFamily: FONT,
                      fontSize: 12
                    }, children: [
                      /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, color: C.primary, marginBottom: 6 }, children: label }),
                      payload.map((p, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, color: C.text }, children: [
                        /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                          /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, background: p.color, display: "inline-block", borderRadius: 1 } }),
                          p.name
                        ] }),
                        /* @__PURE__ */ jsx("span", { style: { fontWeight: 600 }, children: p.dataKey === "daysTotal" ? p.value + " zile" : fmtRONfull(p.value) + " RON" })
                      ] }, i))
                    ] });
                  }
                }
              ),
              /* @__PURE__ */ jsx(Legend, { wrapperStyle: { paddingTop: 10, fontFamily: FONT } }),
              /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "payCurrent", stackId: "p", name: "Furnizori comerciali", fill: C.primary, radius: [0, 0, 0, 0] }),
              /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "payEuroFunds", stackId: "p", name: "Fonduri Europene", fill: C.olive, radius: [0, 0, 0, 0] }),
              /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "payPropco", stackId: "p", name: "Furnizori PROPCO", fill: C.terracotta, radius: [2, 2, 0, 0] }),
              /* @__PURE__ */ jsx(
                Line,
                {
                  yAxisId: "right",
                  type: "monotone",
                  dataKey: "daysTotal",
                  name: "Zile de plată",
                  stroke: C.amberGold,
                  strokeWidth: 2.5,
                  dot: { r: 4, fill: C.amberGold, strokeWidth: 0 },
                  activeDot: { r: 6 }
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }, children: [
              /* @__PURE__ */ jsx(AggregateBox, { color: C.primary, label: "Furnizori totali Iun 26", value: fmtRONfull(latest.payTotal), sub: "OPCO + PROPCO" }),
              /* @__PURE__ */ jsx(AggregateBox, { color: C.text, label: "vs Mai 26", value: fmtPct((latest.payTotal - prev.payTotal) / prev.payTotal * 100), sub: `\u0394 ${fmtRON(latest.payTotal - prev.payTotal)} RON` }),
              /* @__PURE__ */ jsx(AggregateBox, { color: C.amberGold, label: "Zile de plată furnizori", value: latest.daysTotal + " zile", sub: `${latest.daysTotal - prev.daysTotal >= 0 ? "+" : ""}${latest.daysTotal - prev.daysTotal}z MoM \xB7 componenta PROPCO se prelunge\u0219te` }),
              /* @__PURE__ */ jsx(AggregateBox, { color: C.olive, label: "vs media pe 15 luni", value: (latest.daysTotal - avgDaysTotal).toFixed(0) + " zile", sub: `Medie ${avgDaysTotal.toFixed(0)} zile` }),
              /* @__PURE__ */ jsx(AggregateBox, { color: C.terracotta, label: "Parte comercială", value: fmtRONfull(latest.payCurrent), sub: `${latest.daysCurrent} zile \xB7 minim fereastr\u0103, furnizori comerciali` }),
              /* @__PURE__ */ jsx(AggregateBox, { color: C.olive, label: "Fonduri Europene", value: fmtRONfull(latest.payEuroFunds), sub: `${latest.daysEuroFunds} zile · nou, din ian 26` })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Section,
        {
          kicker: "Sec\u021biunea 04 \xB7 Structura capitalului",
          title: "Pozi\u021bia \u0219i structura datoriei",
          subtitle: "Evolu\u021bia datoriei totale, defalcat\u0103 \u00eentre datorie bancar\u0103 net\u0103 (finan\u021barea expansiunii) \u0219i datorie fiscal\u0103 (obliga\u021bii fiscale). Datoria bancar\u0103 a crescut odat\u0103 cu extinderea re\u021belei; datoria fiscal\u0103 a fost redus\u0103 constant. Levierul este raportat la EBITDA pe ultimele 12 luni.",
          children: [
            /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 340, children: /* @__PURE__ */ jsxs(ComposedChart, { data: DATA, margin: { top: 10, right: 20, left: 0, bottom: 5 }, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "2 4", stroke: C.border, vertical: false }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "m", tickLine: false, axisLine: { stroke: C.border } }),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "left",
                  tickFormatter: fmtRON,
                  tickLine: false,
                  axisLine: { stroke: C.border },
                  label: { value: "Datorie (RON)", angle: -90, position: "insideLeft", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "right",
                  orientation: "right",
                  tickFormatter: (v) => "\u20AC" + fmtRON(v),
                  tickLine: false,
                  axisLine: { stroke: C.border },
                  label: { value: "Datorie totală (EUR)", angle: 90, position: "insideRight", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  content: ({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return /* @__PURE__ */ jsxs("div", { style: {
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: 3,
                      padding: "10px 12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontFamily: FONT,
                      fontSize: 12
                    }, children: [
                      /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, color: C.primary, marginBottom: 6 }, children: label }),
                      payload.map((p, i) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16, color: C.text }, children: [
                        /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                          /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, background: p.color, display: "inline-block", borderRadius: 1 } }),
                          p.name
                        ] }),
                        /* @__PURE__ */ jsx("span", { style: { fontWeight: 600 }, children: p.dataKey === "totalDebtEUR" ? "\u20AC" + fmtRONfull(p.value) : fmtRONfull(p.value) + " RON" })
                      ] }, i))
                    ] });
                  }
                }
              ),
              /* @__PURE__ */ jsx(Legend, { wrapperStyle: { paddingTop: 10, fontFamily: FONT } }),
              /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "netBankDebt", stackId: "d", name: "Datorie bancară netă", fill: C.primary, radius: [0, 0, 0, 0] }),
              /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "fiscalDebt", stackId: "d", name: "Datorie fiscală", fill: C.terracotta, radius: [2, 2, 0, 0] }),
              /* @__PURE__ */ jsx(
                Line,
                {
                  yAxisId: "right",
                  type: "monotone",
                  dataKey: "totalDebtEUR",
                  name: "Datorie totală (EUR)",
                  stroke: C.amberGold,
                  strokeWidth: 2.5,
                  dot: { r: 4, fill: C.amberGold, strokeWidth: 0 },
                  activeDot: { r: 6 }
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }, children: [
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.text,
                  label: "Datorie totală Iun 26",
                  value: fmtRONfull(latest.totalDebt) + " RON",
                  sub: `\u20AC${fmtRONfull(latest.totalDebtEUR)} \xB7 MoM ${fmtRON(latest.totalDebt - prev.totalDebt)}`
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.primary,
                  label: "Datorie bancară netă",
                  value: fmtRONfull(latest.netBankDebt) + " RON",
                  sub: `${(latest.netBankDebt / latest.totalDebt * 100).toFixed(1)}% din total \xB7 finan\u021bare expansiune`
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.terracotta,
                  label: "Datorie fiscală",
                  value: fmtRONfull(latest.fiscalDebt) + " RON",
                  sub: `${fmtPct(fiscalDebtMoM, 0)} MoM \xB7 ${fmtPct(fiscalDebtChange, 0)} vs Apr 25`
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.amberGold,
                  label: "Datorie netă / EBITDA TTM",
                  value: (latest.totalDebt / ttmEbitda).toFixed(2) + "x",
                  sub: `EBITDA TTM ${fmtRON(ttmEbitda)} RON \xB7 levier s\u0103n\u0103tos`
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.olive,
                  label: "Datorie totală YoY",
                  value: fmtPct(debtYoY, 0),
                  sub: `Iun 25: ${fmtRON(yearAgo.totalDebt)} \u2192 Iun 26: ${fmtRON(latest.totalDebt)}`
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Section,
        {
          kicker: "Sec\u021biunea 05 \xB7 Linia de overdraft",
          title: "Pozi\u021bia liniei de overdraft",
          subtitle: `Plafon total al liniei de ${fmtRONfull(OVERDRAFT_LIMIT)} RON. Zona bordo = sold tras; conturul punctat de deasupra reprezint\u0103 rezerva neutilizat\u0103, \u00eenc\u0103 disponibil\u0103. Linia a fost activat\u0103 pentru prima dat\u0103 \u00een decembrie 2025 pentru a acoperi minimul sezonier de numerar \u0219i a atins un v\u00e2rf de 78% \u00een februarie 2026. Dup\u0103 ce mai 2026 a redus utilizarea la 31%, iunie 2026 trage din nou ${fmtRONfull(Math.abs(latest.odMov))} RON pentru a finan\u021ba reducerea furnizorilor \u0219i distribu\u021biile, urc\u00e2nd utilizarea la ${(latest.odBal / OVERDRAFT_LIMIT * 100).toFixed(0)}% \u2014 r\u0103m\u00e2n\u00e2nd ${fmtRONfull(OVERDRAFT_LIMIT - latest.odBal)} RON de rezerv\u0103, dar direc\u021bia se inverseaz\u0103 pentru prima dat\u0103 din februarie.`,
          children: [
            /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(
              ComposedChart,
              {
                data: DATA.map((d) => ({ ...d, odReserve: Math.max(0, OVERDRAFT_LIMIT - d.odBal) })),
                margin: { top: 16, right: 20, left: 0, bottom: 5 },
                stackOffset: "none",
                children: [
                  /* @__PURE__ */ jsxs("defs", { children: [
                    /* @__PURE__ */ jsxs("linearGradient", { id: "drawnGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                      /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: C.primary, stopOpacity: 0.95 }),
                      /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: C.primary, stopOpacity: 0.75 })
                    ] }),
                    /* @__PURE__ */ jsx("pattern", { id: "reservePattern", width: "6", height: "6", patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)", children: /* @__PURE__ */ jsx("line", { x1: "0", y1: "0", x2: "0", y2: "6", stroke: C.amberGold, strokeWidth: "1", strokeOpacity: "0.35" }) })
                  ] }),
                  /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "2 4", stroke: C.border, vertical: false }),
                  /* @__PURE__ */ jsx(XAxis, { dataKey: "m", tickLine: false, axisLine: { stroke: C.border } }),
                  /* @__PURE__ */ jsx(
                    YAxis,
                    {
                      tickFormatter: fmtRON,
                      tickLine: false,
                      axisLine: { stroke: C.border },
                      domain: [0, OVERDRAFT_LIMIT * 1.08],
                      label: { value: "RON", angle: -90, position: "insideLeft", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Tooltip,
                    {
                      content: ({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const drawn = payload.find((p) => p.dataKey === "odBal")?.value ?? 0;
                        const reserve = OVERDRAFT_LIMIT - drawn;
                        const utilPct = drawn / OVERDRAFT_LIMIT * 100;
                        return /* @__PURE__ */ jsxs("div", { style: {
                          background: C.white,
                          border: `1px solid ${C.border}`,
                          borderRadius: 3,
                          padding: "10px 12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          fontFamily: FONT,
                          fontSize: 12,
                          minWidth: 220
                        }, children: [
                          /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, color: C.primary, marginBottom: 6 }, children: label }),
                          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16 }, children: [
                            /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                              /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, background: C.primary, display: "inline-block", borderRadius: 1 } }),
                              "Tras"
                            ] }),
                            /* @__PURE__ */ jsxs("span", { style: { fontWeight: 600 }, children: [
                              fmtRONfull(drawn),
                              " RON"
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16 }, children: [
                            /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                              /* @__PURE__ */ jsx("span", { style: { width: 8, height: 8, background: C.amberGold, display: "inline-block", borderRadius: 1, opacity: 0.5, border: `1px dashed ${C.amberGold}` } }),
                              "Rezervă disponibilă"
                            ] }),
                            /* @__PURE__ */ jsxs("span", { style: { fontWeight: 600 }, children: [
                              fmtRONfull(reserve),
                              " RON"
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { style: { borderTop: `1px solid ${C.border}`, marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", gap: 16 }, children: [
                            /* @__PURE__ */ jsx("span", { style: { color: C.muted }, children: "Utilizare" }),
                            /* @__PURE__ */ jsxs("span", { style: { fontWeight: 700, color: utilPct > 70 ? C.alert : utilPct > 40 ? C.amberGold : C.olive }, children: [
                              utilPct.toFixed(1),
                              "%"
                            ] })
                          ] })
                        ] });
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Legend,
                    {
                      wrapperStyle: { paddingTop: 10, fontFamily: FONT },
                      payload: [
                        { value: "Sold tras", type: "square", color: C.primary, id: "drawn" },
                        { value: "Rezervă disponibilă", type: "square", color: C.amberGold, id: "reserve" },
                        { value: `Plafon linie (${fmtRON(OVERDRAFT_LIMIT)})`, type: "line", color: C.text, id: "limit" }
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Area,
                    {
                      type: "monotone",
                      dataKey: "odBal",
                      stackId: "ovd",
                      name: "Tras",
                      stroke: C.primary,
                      strokeWidth: 2,
                      fill: "url(#drawnGrad)",
                      isAnimationActive: true
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Area,
                    {
                      type: "monotone",
                      dataKey: "odReserve",
                      stackId: "ovd",
                      name: "Rezervă",
                      stroke: C.amberGold,
                      strokeWidth: 1.5,
                      strokeDasharray: "5 4",
                      fill: "url(#reservePattern)",
                      fillOpacity: 1,
                      isAnimationActive: true
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    ReferenceLine,
                    {
                      y: OVERDRAFT_LIMIT,
                      stroke: C.text,
                      strokeWidth: 1.5,
                      strokeDasharray: "2 2",
                      label: {
                        value: `Plafon linie: ${fmtRONfull(OVERDRAFT_LIMIT)} RON`,
                        position: "insideTopRight",
                        fill: C.text,
                        fontSize: 11,
                        fontFamily: FONT,
                        fontWeight: 600
                      }
                    }
                  )
                ]
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }, children: [
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.primary,
                  label: "Tras (Iun 26)",
                  value: fmtRONfull(latest.odBal) + " RON",
                  sub: `${(latest.odBal / OVERDRAFT_LIMIT * 100).toFixed(1)}% din linie utilizat`
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.amberGold,
                  label: "Rezervă disponibilă",
                  value: fmtRONfull(OVERDRAFT_LIMIT - latest.odBal) + " RON",
                  sub: `${((OVERDRAFT_LIMIT - latest.odBal) / OVERDRAFT_LIMIT * 100).toFixed(1)}% din plafon neutilizat`
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.terracotta,
                  label: "Tragere Iun 26",
                  value: "+" + fmtRONfull(Math.abs(latest.odMov)) + " RON",
                  sub: "Retras pentru reducerea furnizorilor"
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.terracotta,
                  label: "Utilizare maximă (Feb 26)",
                  value: (782391 / OVERDRAFT_LIMIT * 100).toFixed(1) + "%",
                  sub: `${fmtRONfull(782391)} RON trași la vârf`
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Section,
        {
          kicker: "Sec\u021biunea 06 \xB7 Intra-grup",
          title: "\u00cemprumuturi acordate altor entit\u0103\u021bi",
          subtitle: "Numerar cumulat alocat din Dr. Ardeleanu OPCO c\u0103tre entit\u0103\u021bi afiliate/holding. Acumulare constant\u0103 \u00een T1\u2013T3 2025, urmat\u0103 de o faz\u0103 accelerat\u0103 de alocare \u00een T4 2025. Iunie 2026 nu adaug\u0103 nimic \u2014 prima lun\u0103 f\u0103r\u0103 alocare nou\u0103 din iunie 2025 \u2014 soldul r\u0103m\u00e2n\u00e2nd plat la 4,99M RON.",
          children: [
            /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(
              ComposedChart,
              {
                data: DATA.map((d, i) => ({
                  ...d,
                  ilNew: i === 0 ? d.ilBal : d.ilBal - DATA[i - 1].ilBal
                })),
                margin: { top: 16, right: 20, left: 0, bottom: 5 },
                children: [
                  /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "loansGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                    /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: C.primary, stopOpacity: 0.85 }),
                    /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: C.primary, stopOpacity: 0.55 })
                  ] }) }),
                  /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "2 4", stroke: C.border, vertical: false }),
                  /* @__PURE__ */ jsx(XAxis, { dataKey: "m", tickLine: false, axisLine: { stroke: C.border } }),
                  /* @__PURE__ */ jsx(
                    YAxis,
                    {
                      yAxisId: "left",
                      tickFormatter: fmtRON,
                      tickLine: false,
                      axisLine: { stroke: C.border },
                      label: { value: "Sold cumulat (RON)", angle: -90, position: "insideLeft", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    YAxis,
                    {
                      yAxisId: "right",
                      orientation: "right",
                      tickFormatter: fmtRON,
                      tickLine: false,
                      axisLine: { stroke: C.border },
                      label: { value: "Împrumut nou lunar (RON)", angle: 90, position: "insideRight", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Tooltip,
                    {
                      content: ({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const row = payload[0]?.payload || {};
                        return /* @__PURE__ */ jsxs("div", { style: {
                          background: C.white,
                          border: `1px solid ${C.border}`,
                          borderRadius: 3,
                          padding: "10px 12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          fontFamily: FONT,
                          fontSize: 12,
                          minWidth: 230
                        }, children: [
                          /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, color: C.primary, marginBottom: 6 }, children: label }),
                          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16 }, children: [
                            /* @__PURE__ */ jsx("span", { style: { color: C.muted }, children: "Cumulat" }),
                            /* @__PURE__ */ jsxs("span", { style: { fontWeight: 600 }, children: [
                              fmtRONfull(row.ilBal),
                              " RON"
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16 }, children: [
                            /* @__PURE__ */ jsx("span", { style: { color: C.muted }, children: "Echivalent EUR" }),
                            /* @__PURE__ */ jsxs("span", { style: { fontWeight: 600 }, children: [
                              "\u20AC",
                              fmtRONfull(row.ilBalEUR)
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { style: { borderTop: `1px solid ${C.border}`, marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", gap: 16 }, children: [
                            /* @__PURE__ */ jsx("span", { style: { color: C.muted }, children: "Nou luna aceasta" }),
                            /* @__PURE__ */ jsxs("span", { style: { fontWeight: 700, color: row.ilNew > 0 ? C.terracotta : C.olive }, children: [
                              row.ilNew > 0 ? "+" : "",
                              fmtRONfull(row.ilNew),
                              " RON"
                            ] })
                          ] })
                        ] });
                      }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Legend,
                    {
                      wrapperStyle: { paddingTop: 10, fontFamily: FONT },
                      payload: [
                        { value: "Sold cumulat", type: "square", color: C.primary, id: "cum" },
                        { value: "Ieșire nouă lunară", type: "square", color: C.terracotta, id: "new" }
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(Bar, { yAxisId: "right", dataKey: "ilNew", name: "Ieșire nouă lunară", fill: C.terracotta, radius: [2, 2, 0, 0] }),
                  /* @__PURE__ */ jsx(
                    Area,
                    {
                      yAxisId: "left",
                      type: "monotone",
                      dataKey: "ilBal",
                      name: "Sold cumulat",
                      stroke: C.primary,
                      strokeWidth: 2.5,
                      fill: "url(#loansGrad)"
                    }
                  )
                ]
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }, children: [
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.primary,
                  label: "Sold Iun 26",
                  value: fmtRONfull(latest.ilBal) + " RON",
                  sub: `\u20AC${fmtRONfull(latest.ilBalEUR)} alocat cumulat`
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.olive,
                  label: "Împrumut nou Iun 26",
                  value: fmtRONfull(latest.ilBal - prev.ilBal) + " RON",
                  sub: "F\u0103r\u0103 alocare nou\u0103 \xB7 229k \u00een mai"
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.amberGold,
                  label: "Cea mai mare lună (Oct 25)",
                  value: fmtRONfull(172e4) + " RON",
                  sub: "Faza de alocare T4 2025"
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.olive,
                  label: "Total alocat 15 luni",
                  value: "\u20AC" + fmtRONfull(latest.ilBalEUR),
                  sub: `De la \u20AC${fmtRONfull(DATA[0].ilBalEUR)} (Apr 25) la \u20AC${fmtRONfull(latest.ilBalEUR)} (Iun 26)`
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Section,
        {
          kicker: "Sec\u021biunea 07 \xB7 Ac\u021bionari",
          title: "Distribu\u021bii c\u0103tre ac\u021bionari \u2014 ie\u0219iri nete lunare",
          subtitle: /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("strong", { style: { color: C.primary }, children: "Net" }),
            " \u2014 distribu\u021bii de numerar c\u0103tre ac\u021bionari; cifrele exclud deja sumele reinvestite \u00een companie prin DP. Este ar\u0103tat doar banul care a ie\u0219it efectiv din business. August 2025 marcheaz\u0103 v\u00e2rful (\u20AC136.572), o distribu\u021bie extraordinar\u0103. Iunie 2026 se \u00eencheie la ",
            /* @__PURE__ */ jsxs("strong", { children: [
              "\u20AC",
              fmtRONfull(latest.shSpendEUR)
            ] }),
            ", sub media pe 15 luni \u0219i \u00een sc\u0103dere fa\u021b\u0103 de mai (\u20AC",
            fmtRONfull(prev.shSpendEUR),
            ") \u2014 o lun\u0103 normalizat\u0103, f\u0103r\u0103 element extraordinar."
          ] }),
          children: [
            /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxs(ComposedChart, { data: DATA, margin: { top: 16, right: 20, left: 0, bottom: 5 }, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "2 4", stroke: C.border, vertical: false }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "m", tickLine: false, axisLine: { stroke: C.border } }),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "left",
                  tickFormatter: fmtRON,
                  tickLine: false,
                  axisLine: { stroke: C.border },
                  domain: [0, 8e5],
                  label: { value: "Ieșire lunară (RON)", angle: -90, position: "insideLeft", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  yAxisId: "right",
                  orientation: "right",
                  tickFormatter: (v) => "\u20AC" + fmtRON(v / 5),
                  tickLine: false,
                  axisLine: { stroke: C.border },
                  domain: [0, 8e5],
                  label: { value: "Echivalent EUR", angle: 90, position: "insideRight", style: { fontFamily: FONT, fontSize: 11, fill: C.muted } }
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  content: ({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const row = payload[0]?.payload || {};
                    return /* @__PURE__ */ jsxs("div", { style: {
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: 3,
                      padding: "10px 12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      fontFamily: FONT,
                      fontSize: 12,
                      minWidth: 200
                    }, children: [
                      /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, color: C.primary, marginBottom: 6 }, children: label }),
                      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16 }, children: [
                        /* @__PURE__ */ jsx("span", { style: { color: C.muted }, children: "Distribuție" }),
                        /* @__PURE__ */ jsxs("span", { style: { fontWeight: 600 }, children: [
                          fmtRONfull(row.shSpend),
                          " RON"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 16 }, children: [
                        /* @__PURE__ */ jsx("span", { style: { color: C.muted }, children: "Echivalent EUR" }),
                        /* @__PURE__ */ jsxs("span", { style: { fontWeight: 600 }, children: [
                          "\u20AC",
                          fmtRONfull(row.shSpendEUR)
                        ] })
                      ] })
                    ] });
                  }
                }
              ),
              /* @__PURE__ */ jsx(
                Legend,
                {
                  wrapperStyle: { paddingTop: 10, fontFamily: FONT },
                  payload: [
                    { value: "Distribuție lunară", type: "square", color: C.primary, id: "sh" },
                    {
                      value: `Media pe 15 luni \xB7 ${fmtRON(DATA.reduce((a, r) => a + r.shSpend, 0) / DATA.length)} RON \xB7 \u20AC${fmtRON(DATA.reduce((a, r) => a + r.shSpendEUR, 0) / DATA.length)}`,
                      type: "line",
                      color: C.amberGold,
                      id: "avg"
                    }
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                ReferenceLine,
                {
                  yAxisId: "left",
                  y: DATA.reduce((a, r) => a + r.shSpend, 0) / DATA.length,
                  stroke: C.amberGold,
                  strokeWidth: 1.5,
                  strokeDasharray: "5 4",
                  label: {
                    value: "MEDIE",
                    position: "insideTopLeft",
                    offset: 8,
                    fill: C.amberGold,
                    fontSize: 10,
                    fontFamily: FONT,
                    fontWeight: 700,
                    letterSpacing: 1.5
                  }
                }
              ),
              /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "shSpend", name: "Distribuție acționari", radius: [2, 2, 0, 0], children: DATA.map((d, i) => /* @__PURE__ */ jsx(Cell, { fill: d.shSpend > 5e5 ? C.terracotta : C.primary }, i)) })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }, children: [
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.primary,
                  label: "Distribuit Iun 26",
                  value: fmtRONfull(latest.shSpend) + " RON",
                  sub: `\u20AC${fmtRONfull(latest.shSpendEUR)} \xB7 sub media pe 15 luni`
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.terracotta,
                  label: "Vârf (Aug 25)",
                  value: fmtRONfull(682862) + " RON",
                  sub: "\u20AC136.572 \u2014 distribu\u021bie extraordinar\u0103"
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.amberGold,
                  label: "Medie lunară (12 luni)",
                  value: fmtRONfull(Math.round(DATA.slice(-12).reduce((a, r) => a + r.shSpend, 0) / 12)) + " RON",
                  sub: `\u20AC${fmtRONfull(Math.round(DATA.slice(-12).reduce((a, r) => a + r.shSpendEUR, 0) / 12))} pe lun\u0103 \xB7 ultimele 12 luni`
                }
              ),
              /* @__PURE__ */ jsx(
                AggregateBox,
                {
                  color: C.olive,
                  label: "Total 12 luni",
                  value: fmtRONfull(DATA.slice(-12).reduce((a, r) => a + r.shSpend, 0)) + " RON",
                  sub: `\u20AC${fmtRONfull(DATA.slice(-12).reduce((a, r) => a + r.shSpendEUR, 0))} \xB7 Iul 25 \u2013 Iun 26`
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: 10.5, color: C.muted, marginTop: 22, textAlign: "center", letterSpacing: 0.2
      }, children: "Raportare CFO \xB7 Trezorerie & Cashflow \xB7 Perioada: Apr 2025 \u2013 Iun 2026 \xB7 Toate cifrele \u00een RON \xB7 OPCO + PROPCO consolidat" })
      ] })
    ] })
  ] });
}
function MiniStat({ label, value, accent }) {
  return /* @__PURE__ */ jsxs("div", { style: { flex: "0 1 auto" }, children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", color: C.muted, marginBottom: 2 }, children: label }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 700, color: accent ? C.primary : C.text }, children: value })
  ] });
}
function AggregateBox({ label, value, sub, color = C.primary }) {
  return /* @__PURE__ */ jsxs("div", { style: {
    background: C.cream,
    borderLeft: `3px solid ${color}`,
    padding: "10px 12px",
    borderRadius: 2
  }, children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.muted, marginBottom: 4 }, children: label }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.1 }, children: value }),
    sub && /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.muted, marginTop: 3 }, children: sub })
  ] });
}
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsx(CashflowDashboard, {}));
export {
  CashflowDashboard as default
};
