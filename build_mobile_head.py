#!/usr/bin/env python3
"""Generează antetul de rețea din sales-mobile.html (ambele vederi: Lună / YTD) din datele
din sales-desktop.html (CD / NET / ACT_MO) — aceeași logică ca antetul tab-ului Rețea din desktop:
card principal cu evoluția lunară, 3 indicatori (creștere, LFL, buget), split comparabile vs noi,
progres față de bugetul anual și analiza „Puncte forte / De urmărit".

Rulare (din rădăcina repo-ului):  python3 build_mobile_head.py [sales-desktop.html] [sales-mobile.html]
Idempotent: înlocuiește doar blocurile dintre markerii <!-- NET-HEAD:month --> / <!-- NET-HEAD:ytd -->
(la prima rulare înlocuiește highlight-bar + lfl-bar din fiecare vedere).
"""
import re, html, sys

DESK = sys.argv[1] if len(sys.argv) > 1 else 'sales-desktop.html'
MOB = sys.argv[2] if len(sys.argv) > 2 else 'sales-mobile.html'
MONTHS = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec']
MONTHS_FULL = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie']
LFL = ['OLT','GRG','SLB','CLR','DRB','CTR']

d = open(DESK, encoding='utf-8').read()
ACT_MO = int(re.search(r'let ACT_MO = (\d+);', d).group(1))
arr = lambda v: [None if x.strip()=='null' else float(x) for x in v.split(',')]
blk = d[d.index('const CD = {'):d.index('const NET')]
CD = {}
for m in re.finditer(r"(\w{3}): \{ name:'([^']+)'.*?actuals:\{(.*?)\}, budget:\{2026:\[(.*?)\]\}", blk, re.S):
    CD[m.group(1)] = {'name': m.group(2), 'act': {int(y): arr(v) for y, v in re.findall(r"(\d{4}):\[(.*?)\]", m.group(3))}, 'bud': arr(m.group(4))}
nb = d[d.index('const NET = {'):d.index('};', d.index('const NET = {'))]
NETA = {int(y): arr(v) for y, v in re.findall(r"(\d{4}):\[(.*?)\]", nb[:nb.index('budget')])}
NETB = {int(y): arr(v) for y, v in re.findall(r"(\d{4}):\[(.*?)\]", nb[nb.index('budget'):])}

S = lambda a: sum(x or 0 for x in a)
gr = lambda a, b: (a - b) / b * 100 if b else None
def K(v):  # 4141413 -> "4.141K"
    return f"{round(v/1000):,}".replace(',', '.') + 'K'
def KS(v): return ('+' if v >= 0 else '−') + K(abs(v))
DEC = '.'  # separator zecimal — detectat mai jos din cardul mobil (șablonul skill-ului folosește virgulă)
def P(v, dec=1): return '—' if v is None else (('+' if v > 0 else '−' if v < 0 else '') + f"{abs(v):.{dec}f}".replace('.', DEC) + '%')
def P0(v): return P(v, 0)
esc = html.escape

def val(code, yr, per):
    a = CD[code]['act'].get(yr)
    if not a: return 0
    return (a[ACT_MO-1] or 0) if per == 'month' else S(a[:ACT_MO])
def bval(code, per):
    b = CD[code]['bud']
    return (b[ACT_MO-1] or 0) if per == 'month' else S(b[:ACT_MO])

def build(per):
    mi = ACT_MO - 1; isM = per == 'month'
    n26 = NETA[2026][mi] if isM else S(NETA[2026][:ACT_MO])
    n25 = NETA[2025][mi] if isM else S(NETA[2025][:ACT_MO])
    nbv = NETB[2026][mi] if isM else S(NETB[2026][:ACT_MO])
    yoy, vb = gr(n26, n25), gr(n26, nbv)
    l26 = sum(val(c, 2026, per) for c in LFL); l25 = sum(val(c, 2025, per) for c in LFL)
    lfl = gr(l26, l25); dNet = n26 - n25; dL = l26 - l25; dN = dNet - dL
    newC = [c for c in CD if c not in LFL and val(c, 2026, per)]
    bm = [(MONTHS[k], (NETA[2026][k] or 0) - (NETB[2026][k] or 0)) for k in range(ACT_MO)]
    below = [m for m, x in bm if x < 0]
    ytd26 = S(NETA[2026][:ACT_MO]); fyB = S(NETB[2026]); est = ytd26 + S(NETB[2026][ACT_MO:])
    prog = ytd26 / fyB; elapsed = ACT_MO / 12
    vbY = gr(ytd26, S(NETB[2026][:ACT_MO]))
    per_lbl = f"{MONTHS_FULL[mi]} 2026" if isM else f"YTD Ian–{MONTHS[mi]} 2026"
    vs_lbl = f"{MONTHS[mi]} 2025" if isM else "YTD 2025"

    # mini-grafic lunar 2026 (bară = realizat, linie = buget)
    vals = [NETA[2026][k] or 0 for k in range(ACT_MO)]; buds = [NETB[2026][k] or 0 for k in range(ACT_MO)]
    mx = max(vals + buds)
    bars = ''.join(
        f'<div class="nh-b{" on" if (not isM or k == mi) else ""}" title="{MONTHS[k]} 26: {K(vals[k])} · buget {K(buds[k])}">'
        f'<i style="height:{vals[k]/mx*100:.1f}%"></i><s class="{"up" if vals[k] >= buds[k] else "dn"}" style="bottom:{buds[k]/mx*100:.1f}%"></s></div>'
        for k in range(ACT_MO))
    mlab = ''.join(f'<span{" class=on" if (not isM or k == mi) else ""}>{MONTHS[k]}</span>' for k in range(ACT_MO))
    sq = ''.join(f'<i class="{"up" if x >= 0 else "dn"}{" cur" if isM and k == mi else ""}"></i>' for k, (m, x) in enumerate(bm))
    share = max(0, min(1, dL / dNet)) if dNet else 0

    # analiză (aceeași logică ca desktop / tab Rețea)
    pos, watch = [], []
    (pos if yoy >= 0 else watch).append((f"Rețea {P(yoy)} YoY ({KS(dNet)} RON)",
        f"{round(dL/dNet*100) if dNet else 0}% din creștere vine din clinicile comparabile, restul din clinicile noi ({', '.join(newC)})."))
    (pos if lfl >= 0 else watch).append((f"Creștere organică {P(lfl)}", "La clinicile cu minimum 1 an complet de activitate (Cluster 1 + DRB + CTR)."))
    (pos if vb >= 0 else watch).append((f"{P(vb)} față de buget" + (f" în {MONTHS[mi]}" if isM else ''),
        (f"YTD {P(vbY)} · " if isM else '') + f"peste buget în {ACT_MO-len(below)} din {ACT_MO} luni" + (f" (sub: {', '.join(below)})" if below else '') + '.'))
    ub = []
    for c in CD:
        a, b = val(c, 2026, 'ytd'), bval(c, 'ytd')
        if a and b and a < b:
            p25 = (CD[c]['act'].get(2025) or [None]*12)[:ACT_MO]
            y = gr(a, S(p25)) if all(x is not None for x in p25) else None
            ub.append((a - b, c, gr(a, b), y))
    for dd, c, g, y in sorted(ub):
        watch.append((f"{CD[c]['name']} sub buget YTD: {KS(dd)}", f"{P(g)} vs buget · " + (f"{P(y)} YoY." if y is not None else 'clinică nouă, fără bază YoY.')))
    if isM and mi >= 1:
        fx = []
        for c in CD:
            a25 = CD[c]['act'].get(2025)
            if not a25 or not a25[mi] or not a25[mi-1]: continue
            y = gr(CD[c]['act'][2026][mi], a25[mi]); dip = gr(a25[mi], a25[mi-1])
            if y is not None and y >= 25 and dip <= -20: fx.append(f"{CD[c]['name']} {P(y)} ({MONTHS[mi]} 25 {P(dip)} vs {MONTHS[mi-1]} 25)")
        if fx: watch.append((f"Efect de bază în {MONTHS[mi]}", ' · '.join(fx) + ' — creștere din baza slabă, nu accelerare; urmăriți YTD.'))
    items = lambda L, cls: ''.join(f'<div class="ins-i {cls}"><b>{esc(t)}</b><span>{esc(x)}</span></div>' for t, x in L)

    return f'''<!-- NET-HEAD:{per} (generat de build_mobile_head.py — nu edita manual) -->
      <div class="nh">
        <div class="nh-hero">
          <div class="nh-lbl">Vânzări rețea · {per_lbl}</div>
          <div class="nh-row"><span class="nh-val">{K(n26)}</span><span class="hl-badge {"pos" if vb >= 0 else "neg"}">{KS(n26-nbv)} · {P(vb)}</span></div>
          <div class="nh-sub">YoY {P(yoy)} · vs {vs_lbl} {K(n25)} · buget {K(nbv)}</div>
          <div class="nh-spark">{bars}</div>
          <div class="nh-ml">{mlab}</div>
          <div class="nh-note">bară = vânzări 2026 · linie = buget (verde peste, roșu sub)</div>
        </div>
        <div class="nh-tiles">
          <div class="nh-t"><div class="nh-tl">Creștere YoY</div><div class="nh-tv {"g" if yoy >= 0 else "r"}">{P0(yoy)}</div><div class="nh-ts">{KS(dNet)} RON</div></div>
          <div class="nh-t"><div class="nh-tl">Organic (LFL)</div><div class="nh-tv {"g" if lfl >= 0 else "r"}">{P0(lfl)}</div><div class="nh-ts">6 clinici comparabile</div></div>
          <div class="nh-t"><div class="nh-tl">Față de buget</div><div class="nh-tv {"g" if vb >= 0 else "r"}">{P(vb)}</div><div class="nh-sq">{sq}</div><div class="nh-ts">{ACT_MO-len(below)} din {ACT_MO} luni peste</div></div>
        </div>
        <div class="nh-box">
          <div class="nh-bl">Din ce vine creșterea</div>
          <div class="nh-split"><i style="width:{share*100:.1f}%"></i><s></s></div>
          <div class="nh-leg"><span><em class="a"></em>comparabile <b>{KS(dL)}</b></span><span><em class="b"></em>noi ({', '.join(newC)}) <b>{KS(dN)}</b></span></div>
        </div>
        <div class="nh-box">
          <div class="nh-bl">Progres față de bugetul anual 2026</div>
          <div class="nh-prog"><i style="width:{min(prog,1)*100:.1f}%"></i><s style="left:{elapsed*100:.1f}%"></s></div>
          <div class="nh-ps"><b>{K(ytd26)}</b> din {K(fyB)} ({round(prog*100)}%) · timp scurs {ACT_MO}/12 ({round(elapsed*100)}%)</div>
          <div class="nh-ps">Estimare an: <b class="{"g" if est >= fyB else "r"}">{K(est)}</b> ({KS(est-fyB)} vs buget) · realizat + buget rămas</div>
        </div>
      </div>
      <div class="slabel"><span>Analiză · {per_lbl}</span></div>
      <div class="ins">
        <div class="ins-h pos">Puncte forte <em>({len(pos)})</em></div>{items(pos, "pos")}
        <div class="ins-h watch">De urmărit <em>({len(watch)})</em></div>{items(watch, "watch")}
      </div>
      <!-- /NET-HEAD:{per} -->'''

CSS = '''
/* ── ANTET REȚEA (generat de build_mobile_head.py) ── */
.nh{padding:4px 12px 0;}
.nh-hero{background:linear-gradient(145deg,#7B1C16 0%,#5E140F 100%);border-radius:14px;padding:14px 16px 12px;color:#fff;}
.nh-lbl{font-size:9px;font-weight:600;color:rgba(242,218,183,0.78);letter-spacing:0.10em;text-transform:uppercase;}
.nh-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:3px;}
.nh-val{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;line-height:1;}
.nh-row .hl-badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;border:1px solid;white-space:nowrap;}
.nh-sub{font-size:10.5px;color:#F2DAB7;margin-top:5px;}
.nh-spark{display:flex;align-items:flex-end;gap:4px;height:40px;margin-top:10px;}
.nh-b{flex:1;height:100%;position:relative;display:flex;align-items:flex-end;}
.nh-b i{display:block;width:100%;background:rgba(255,255,255,0.28);border-radius:3px 3px 0 0;}
.nh-b.on i{background:#F2DAB7;}
.nh-b s{position:absolute;left:-1px;right:-1px;height:2px;border-radius:1px;text-decoration:none;}
.nh-b s.up{background:#B5BD5C;} .nh-b s.dn{background:#FF8A80;}
.nh-ml{display:flex;gap:4px;margin-top:3px;}
.nh-ml span{flex:1;text-align:center;font-size:8px;color:rgba(255,255,255,0.45);}
.nh-ml span.on{color:rgba(255,255,255,0.88);}
.nh-note{font-size:8.5px;color:rgba(255,255,255,0.5);margin-top:4px;}
.nh-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:8px;}
.nh-t{background:#fff;border:1px solid #ecddd4;border-radius:11px;padding:9px 9px 8px;}
.nh-tl{font-size:8px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#a08070;}
.nh-tv{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;line-height:1.05;margin-top:3px;}
.nh-tv.g,.nh-ps b.g{color:#4a7c3f;} .nh-tv.r,.nh-ps b.r{color:#b33030;}
.nh-ts{font-size:9px;color:#a08070;margin-top:3px;line-height:1.3;}
.nh-sq{display:flex;gap:2px;margin-top:5px;}
.nh-sq i{flex:1;height:8px;border-radius:2px;}
.nh-sq i.up{background:#cfe8c9;} .nh-sq i.dn{background:#f5c2bb;}
.nh-sq i.cur{outline:1.5px solid #7B1C16;outline-offset:1px;}
.nh-box{background:#fff;border:1px solid #ecddd4;border-radius:11px;padding:9px 12px;margin-top:6px;}
.nh-bl{font-size:8.5px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#a08070;margin-bottom:6px;}
.nh-split{display:flex;gap:2px;height:7px;border-radius:4px;overflow:hidden;}
.nh-split i{background:#7B1C16;} .nh-split s{flex:1;background:#F2DAB7;}
.nh-leg{display:flex;justify-content:space-between;gap:6px;font-size:9.5px;color:#6b5448;margin-top:5px;}
.nh-leg em{display:inline-block;width:7px;height:7px;border-radius:2px;margin-right:4px;vertical-align:0;}
.nh-leg em.a{background:#7B1C16;} .nh-leg em.b{background:#F2DAB7;}
.nh-prog{position:relative;height:8px;background:#F1ECE6;border-radius:4px;}
.nh-prog i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#7B1C16,#A0352C);border-radius:4px;}
.nh-prog s{position:absolute;top:-3px;bottom:-3px;width:2px;margin-left:-1px;background:#1e0e0b;border-radius:1px;}
.nh-ps{font-size:9.5px;color:#6b5448;margin-top:5px;line-height:1.35;}
.ins{padding:0 12px;}
.ins-h{font-size:9px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;margin:4px 2px 5px;display:flex;align-items:center;gap:6px;}
.ins-h::before{content:'';width:7px;height:7px;border-radius:4px;}
.ins-h em{font-style:normal;font-weight:500;color:#a08070;}
.ins-h.pos{color:#4a7c3f;} .ins-h.pos::before{background:#4a7c3f;}
.ins-h.watch{color:#B45309;margin-top:10px;} .ins-h.watch::before{background:#B45309;}
.ins-i{border-radius:0 9px 9px 0;padding:7px 10px;margin-bottom:5px;border-left:3px solid;}
.ins-i.pos{background:#F3FBF5;border-color:#4a7c3f;} .ins-i.watch{background:#FFFAEB;border-color:#B45309;}
.ins-i b{display:block;font-size:11px;color:#1e0e0b;font-weight:700;margin-bottom:1px;}
.ins-i span{display:block;font-size:10px;color:#6b5448;line-height:1.45;}
/* ── /ANTET REȚEA ── */
'''

m = open(MOB, encoding='utf-8').read()
_body = re.sub(r'<!-- NET-HEAD:.*?<!-- /NET-HEAD:\w+ -->', '', m, flags=re.S)
DEC = ',' if len(re.findall(r'\d,\d%', _body)) > len(re.findall(r'\d\.\d%', _body)) else '.'
for per in ('month', 'ytd'):
    new = build(per)
    mk = re.compile(r'<!-- NET-HEAD:%s .*?<!-- /NET-HEAD:%s -->' % (per, per), re.S)
    if mk.search(m):
        m = mk.sub(lambda _: new, m, count=1)
    else:  # prima rulare: înlocuiește highlight-bar + lfl-bar din vedere
        vs = m.index(f'id="view-{per}"')
        st = m.index('<div class="highlight-bar">', vs)
        en = m.index('<div class="slabel"><span>Clinici', st)
        m = m[:st] + new + '\n\n      ' + m[en:]
cm = re.compile(r'/\* ── ANTET REȚEA \(generat.*?/\* ── /ANTET REȚEA ── \*/', re.S)
if cm.search(m):
    m = cm.sub(lambda _: CSS.strip(), m, count=1)
elif '/* ── ANTET REȚEA (generat' in m:  # bloc vechi fără marker de final — până la VIEW SWITCHING
    a = m.index('/* ── ANTET REȚEA (generat'); b = m.index('/* ── VIEW SWITCHING ── */', a)
    m = m[:a] + CSS.strip() + '\n\n' + m[b:]
else:
    m = m.replace('/* ── VIEW SWITCHING ── */', CSS.strip() + '\n\n/* ── VIEW SWITCHING ── */', 1)
open(MOB, 'w', encoding='utf-8').write(m)
print(f'OK · ACT_MO={ACT_MO} · {MONTHS_FULL[ACT_MO-1]} 2026')
