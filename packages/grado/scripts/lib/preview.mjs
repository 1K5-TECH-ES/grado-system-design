// Página autocontenida (dist/preview.html) para revisar los tokens en el navegador.
// Usa solo los propios tokens: si algo se ve mal aquí, se verá mal en las apps.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function renderPreview({ css, data, contrast, logoWhite, version, tintNote }) {
  const colorNames = Object.keys(data.themes.consola.light.color)
  const brandRows = Object.keys(data.brand)
    .map((name) => {
      const steps = Object.keys(data.palette).filter((k) => k === name || k.startsWith(`${name}-`))
      return `<div class="pal-row"><span class="pal-name">${name}</span>${steps
        .map(
          (k) =>
            `<span class="pal-sw"><i style="background:var(--k5-${k})"></i><code>${k.replace(`${name}-`, '') === name ? '100' : k.replace(`${name}-`, '')}</code><code>${data.palette[k]}</code></span>`,
        )
        .join('')}</div>`
    })
    .join('')
  const neutralRow = `<div class="pal-row"><span class="pal-name">graphite</span>${Object.keys(data.palette)
    .filter((k) => k.startsWith('graphite'))
    .map(
      (k) =>
        `<span class="pal-sw"><i style="background:var(--k5-${k})"></i><code>${k === 'graphite' ? '100' : k.replace('graphite-', '')}</code><code>${data.palette[k]}</code></span>`,
    )
    .join('')}</div>`

  const chips = colorNames
    .map(
      (n) =>
        `<div class="chip"><i style="background:var(--k5-${n})"></i><div><code class="chip-name">--${n}</code><code class="chip-val" data-color="${n}"></code></div></div>`,
    )
    .join('')

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Grado · tokens ${esc(version)}</title>
<style>
${css}
</style>
<style>
* { box-sizing: border-box; }
body { margin: 0; background: var(--k5-background); color: var(--k5-foreground); font-family: var(--k5-font-sans); font-size: var(--k5-text-body); line-height: 1.5; }
code { font-family: var(--k5-font-mono); }
h1, h2, h3 { margin: 0; letter-spacing: var(--k5-tracking-title); font-weight: var(--k5-weight-semibold); }
:where(button):focus-visible { outline: 2px solid var(--k5-ring); outline-offset: 2px; }
.bar { position: sticky; top: 0; z-index: 5; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; min-height: 56px; padding: 8px 20px; background: var(--k5-header); color: var(--k5-header-foreground); }
.bar svg { height: 26px; width: auto; }
.bar-title { font-weight: 600; font-size: 14px; }
.bar-title span { opacity: .7; font-weight: 400; margin-left: 6px; }
.bar-controls { margin-left: auto; display: flex; flex-wrap: wrap; gap: 10px; }
.seg { display: inline-flex; padding: 2px; gap: 2px; border-radius: calc(var(--k5-radius) + 2px); background: rgb(255 255 255 / .12); }
.seg button { font: inherit; font-size: var(--k5-text-label); font-weight: 500; border: 0; background: none; color: inherit; opacity: .8; height: calc(var(--k5-control-h-sm) - 4px); padding: 0 10px; border-radius: calc(var(--k5-radius) - 2px); cursor: pointer; }
.seg button[aria-pressed="true"] { background: rgb(255 255 255 / .2); opacity: 1; }
main { max-width: 1120px; margin: 0 auto; padding: 32px 20px 64px; display: grid; gap: 48px; }
.sec-head { display: grid; gap: 4px; margin-bottom: 16px; }
.sec-head h2 { font-size: var(--k5-text-section); }
.sec-head p { margin: 0; color: var(--k5-muted-foreground); }

.demo { display: grid; grid-template-columns: 220px minmax(0, 1fr); border: 1px solid var(--k5-border); border-radius: 16px; overflow: hidden; background: var(--k5-card); box-shadow: 0 1px 2px rgb(0 0 0 / .05); }
.side { background: var(--k5-sidebar); color: var(--k5-sidebar-foreground); border-right: 1px solid var(--k5-sidebar-border); padding: 12px; display: grid; gap: 2px; align-content: start; }
.nav { display: flex; align-items: center; gap: 10px; height: var(--k5-control-h); padding: 0 10px; border-radius: calc(var(--k5-radius) - 2px); font-weight: 500; }
.nav.on { background: var(--k5-sidebar-accent); color: var(--k5-sidebar-accent-foreground); }
.nav.on::after { content: ""; margin-left: auto; width: 7px; height: 7px; border-radius: 50%; border: 2.5px solid var(--k5-sidebar-primary); }
.count { margin-left: auto; font-size: var(--k5-text-badge); font-weight: 600; padding: 1px 7px; border-radius: 999px; background: var(--k5-brand-pink); color: var(--k5-graphite); }
.content { padding: 24px; display: grid; gap: 20px; background: var(--k5-background); min-width: 0; }
.content h3 { font-size: var(--k5-text-title); }
.muted { color: var(--k5-muted-foreground); margin: 4px 0 0; }
.row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.btn { font: inherit; font-size: var(--k5-text-label); font-weight: 500; height: var(--k5-control-h); padding: 0 12px; border-radius: calc(var(--k5-radius) - 2px); border: 1px solid transparent; cursor: pointer; display: inline-flex; align-items: center; }
.btn.primary { background: var(--k5-primary); color: var(--k5-primary-foreground); }
.btn.secondary { background: transparent; border-color: var(--k5-border); color: var(--k5-foreground); }
.btn.ghost { background: transparent; color: var(--k5-muted-foreground); }
.btn.accent { background: var(--k5-accent); color: var(--k5-accent-foreground); }
.btn.danger { background: var(--k5-destructive); color: var(--k5-destructive-foreground); }
.badge { display: inline-flex; align-items: center; font-size: var(--k5-text-badge); font-weight: 500; line-height: 1; padding: 4px 6px; border-radius: 4px; border: 1px solid; }
.badge.ok { color: var(--k5-success); background: color-mix(in srgb, var(--k5-success) 10%, transparent); border-color: color-mix(in srgb, var(--k5-success) 25%, transparent); }
.badge.warn { color: var(--k5-warning-strong); background: color-mix(in srgb, var(--k5-warning) 10%, transparent); border-color: color-mix(in srgb, var(--k5-warning) 25%, transparent); }
.badge.crit { color: var(--k5-destructive); background: color-mix(in srgb, var(--k5-destructive) 10%, transparent); border-color: color-mix(in srgb, var(--k5-destructive) 25%, transparent); }
.badge.info { color: var(--k5-info); background: color-mix(in srgb, var(--k5-info) 10%, transparent); border-color: color-mix(in srgb, var(--k5-info) 25%, transparent); }
.badge.brand { color: var(--k5-primary); background: color-mix(in srgb, var(--k5-primary) 10%, transparent); border-color: color-mix(in srgb, var(--k5-primary) 20%, transparent); }
.field { display: grid; gap: 6px; max-width: 320px; }
.field span { font-size: var(--k5-text-label); font-weight: 500; }
.field input { font: inherit; height: var(--k5-control-h); padding: 0 10px; border-radius: var(--k5-radius); border: 1px solid var(--k5-input); background: var(--k5-background); color: var(--k5-foreground); outline: none; }
.field input:focus { border-color: var(--k5-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--k5-primary) 20%, transparent); }
.panel { border: 1px solid var(--k5-border); border-radius: 16px; background: var(--k5-card); color: var(--k5-card-foreground); padding: 16px; display: grid; gap: 6px; }
.panel b { font-size: var(--k5-text-body); }
.kpi { font-size: var(--k5-text-title); font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.pop { box-shadow: var(--k5-shadow-popover); background: var(--k5-popover); color: var(--k5-popover-foreground); border: 1px solid var(--k5-border); border-radius: var(--k5-radius); padding: 6px; display: grid; gap: 2px; width: 220px; }
.pop span { padding: 6px 8px; border-radius: calc(var(--k5-radius) - 2px); }
.pop span.hl { background: var(--k5-accent); color: var(--k5-accent-foreground); }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; align-items: start; }

.chips { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 8px; }
.chip { display: grid; grid-template-columns: 36px minmax(0, 1fr); gap: 10px; align-items: center; padding: 8px; border: 1px solid var(--k5-border); border-radius: var(--k5-radius); background: var(--k5-card); }
.chip i { width: 36px; height: 36px; border-radius: calc(var(--k5-radius) - 2px); box-shadow: inset 0 0 0 1px rgb(0 0 0 / .08); }
.chip div { display: grid; min-width: 0; }
.chip-name { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chip-val { font-size: 11px; color: var(--k5-muted-foreground); }

table { width: 100%; border-collapse: collapse; font-size: 13px; }
.tw { overflow-x: auto; border: 1px solid var(--k5-border); border-radius: 12px; background: var(--k5-card); }
th, td { text-align: left; padding: 8px 12px; border-top: 1px solid var(--k5-border); white-space: nowrap; }
thead th { border-top: 0; font-weight: 500; color: var(--k5-muted-foreground); background: var(--k5-muted); }
td.num { font-family: var(--k5-font-mono); font-variant-numeric: tabular-nums; }
.sample { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
.pill { font-size: var(--k5-text-badge); font-weight: 600; padding: 2px 7px; border-radius: 999px; }
.pill.ok { color: var(--k5-success); background: color-mix(in srgb, var(--k5-success) 12%, transparent); }
.pill.no { color: var(--k5-destructive); background: color-mix(in srgb, var(--k5-destructive) 12%, transparent); }

.pal { display: grid; gap: 14px; }
.pal-row { display: grid; grid-template-columns: 90px repeat(5, minmax(0, 1fr)); gap: 8px; align-items: end; }
.pal-name { font-weight: 600; padding-bottom: 30px; }
.pal-sw { display: grid; gap: 2px; }
.pal-sw i { height: 44px; border-radius: 6px; box-shadow: inset 0 0 0 1px rgb(0 0 0 / .08); }
.pal-sw code { font-size: 11px; color: var(--k5-muted-foreground); }
.note { font-size: 12px; color: var(--k5-muted-foreground); margin: 10px 0 0; }
@media (max-width: 720px) {
  .demo { grid-template-columns: 1fr; }
  .side { border-right: 0; border-bottom: 1px solid var(--k5-sidebar-border); }
  .pal-row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .pal-name { grid-column: 1 / -1; padding: 0; }
}
</style>
</head>
<body>
<header class="bar">
  ${logoWhite}
  <span class="bar-title">Grado<span>tokens ${esc(version)}</span></span>
  <div class="bar-controls">
    <div class="seg" role="group" aria-label="Tema">
      <button type="button" data-theme-btn="consola" aria-pressed="true">Consola</button>
      <button type="button" data-theme-btn="marca" aria-pressed="false">Marca</button>
    </div>
    <div class="seg" role="group" aria-label="Modo">
      <button type="button" data-mode-btn="light" aria-pressed="true">Claro</button>
      <button type="button" data-mode-btn="dark" aria-pressed="false">Oscuro</button>
    </div>
  </div>
</header>
<main>
  <section>
    <div class="sec-head"><h2>Así se ve</h2><p>Piezas hechas solo con las variables de tokens.css. Cambia tema y modo arriba.</p></div>
    <div class="demo">
      <nav class="side" aria-label="Ejemplo de navegación">
        <span class="nav">Chat</span>
        <span class="nav on">Tickets <span class="count">12</span></span>
        <span class="nav">Clientes</span>
        <span class="nav">Estadísticas</span>
      </nav>
      <div class="content">
        <div><h3>Tickets</h3><p class="muted">Soporte postventa · España</p></div>
        <div class="row">
          <button class="btn primary" type="button">Nuevo ticket</button>
          <button class="btn secondary" type="button">Exportar</button>
          <button class="btn ghost" type="button">Ver historial</button>
          <button class="btn accent" type="button">Asignarme</button>
          <button class="btn danger" type="button">Eliminar</button>
        </div>
        <div class="row">
          <span class="badge brand">Nuevo</span><span class="badge info">Abierto</span><span class="badge warn">Pendiente</span><span class="badge ok">Resuelto</span><span class="badge crit">Vencido</span>
        </div>
        <div class="grid2">
          <label class="field"><span>Potencia instalada (kWp)</span><input id="kwp" value="8,4"></label>
          <div class="panel"><b>Primera respuesta</b><span class="kpi">1 h 12 min</span><span class="muted">antes 1 h 24 min</span></div>
          <div class="pop" role="presentation"><span>Asignar a…</span><span class="hl">Marta Gil</span><span>Andrés Molina</span></div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="sec-head"><h2>Colores del tema</h2><p>Cada token existe como <code>--k5-nombre</code> (color completo) y con su nombre de shadcn (<code>--nombre</code>).</p></div>
    <div class="chips">${chips}</div>
  </section>

  <section>
    <div class="sec-head"><h2>Contraste</h2><p>WCAG 2.x. Mínimo para texto normal: 4,5 : 1.</p></div>
    <div class="tw"><table><thead><tr><th>Uso</th><th>Muestra</th><th>Texto / fondo</th><th>Relación</th><th></th></tr></thead><tbody id="contrast"></tbody></table></div>
  </section>

  <section>
    <div class="sec-head"><h2>Marca</h2><p>Colores de la guía de 1KOMMA5° y sus tonos. Iguales en todos los temas.</p></div>
    <div class="pal">${brandRows}${neutralRow}</div>
    <p class="note">${esc(tintNote)}</p>
  </section>
</main>
<script>
const DATA = ${JSON.stringify({ themes: data.themes, contrast })};
const root = document.documentElement;
let theme = 'consola', mode = 'light';
try { theme = localStorage.getItem('grado-theme') || theme; mode = localStorage.getItem('grado-mode') || mode; } catch (e) {}
function render() {
  root.classList.toggle('dark', mode === 'dark');
  if (theme === 'consola') root.removeAttribute('data-k5-theme'); else root.setAttribute('data-k5-theme', theme);
  document.querySelectorAll('[data-theme-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeBtn === theme)));
  document.querySelectorAll('[data-mode-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modeBtn === mode)));
  const values = DATA.themes[theme][mode].color;
  document.querySelectorAll('[data-color]').forEach(el => { el.textContent = values[el.dataset.color]; });
  document.getElementById('contrast').innerHTML = DATA.contrast[theme][mode].map(r =>
    '<tr><td>' + r.label + '</td><td><span class="sample" style="color:var(--k5-' + r.fg + ');background:var(--k5-' + r.bg + ')">Aa</span></td>' +
    '<td><code>' + r.fg + ' / ' + r.bg + '</code></td><td class="num">' + r.ratio.toFixed(2).replace('.', ',') + ' : 1</td>' +
    '<td><span class="pill ' + (r.ratio >= 4.5 ? 'ok">AA' : 'no">Bajo AA') + '</span></td></tr>').join('');
  try { localStorage.setItem('grado-theme', theme); localStorage.setItem('grado-mode', mode); } catch (e) {}
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-theme-btn]'); if (t) { theme = t.dataset.themeBtn; render(); }
  const m = e.target.closest('[data-mode-btn]'); if (m) { mode = m.dataset.modeBtn; render(); }
});
render();
</script>
</body>
</html>
`
}
