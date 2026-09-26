// Punctul de intrare al raportului de Cashflow. Randează pagina existentă (CashflowDashboard) și, DOAR dacă
// cfo-data.js există (generat local de build_cfo_data.py, blocat în .gitignore), adaugă bara de tab-uri a
// pachetului CFO: Sinteză CFO · Cashflow · Finanțare & datorie · Capex · Acționari. Fără cfo-data.js pagina arată ca înainte.
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import CashflowDashboard from "./cashflow-report.js?v=20260926h";

let CFO = null, Pack = null;
try {
  ({ CFO } = await import("./cfo-data.js"));
  Pack = await import("./cfo-pack.js?v=20260926h");
} catch (e) { CFO = null; Pack = null; }

const TABS = [["sum", "Sinteză CFO"], ["cash", "Cashflow"], ["fin", "Finanțare & datorie"], ["capex", "Capex"], ["sh", "Acționari"]];

function App() {
  const [tab, setTab] = useState(CFO ? "sum" : "cash");
  const go = (t) => { setTab(t); try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {} };
  const tabBar = CFO ? jsx("div", {
    className: "cfoTabs",
    style: { background: "#FFFFFF", borderBottom: "1px solid #E8DDD0", padding: "0 28px", display: "flex", gap: 2, overflowX: "auto", fontFamily: "'Poppins',system-ui,sans-serif", marginBottom: 18 },
    children: TABS.map(([k, l]) => jsx("button", {
      onClick: () => go(k),
      style: { border: "none", background: "transparent", cursor: "pointer", padding: "12px 16px", fontSize: 12.5, fontWeight: tab === k ? 700 : 500, color: tab === k ? "#7B1C16" : "#6b5d52", borderBottom: `2.5px solid ${tab === k ? "#7B1C16" : "transparent"}`, whiteSpace: "nowrap", fontFamily: "inherit" },
      children: l,
    }, k)),
  }) : null;
  return jsx(CashflowDashboard, { tabBar, active: tab, renderOther: CFO ? (t) => Pack.renderTab(t, CFO, go) : null });   // secțiunea 07 (acționari) rămâne în tab-ul Cashflow (decizie Vlad)
}
createRoot(document.getElementById("root")).render(jsx(App, {}));
