/* ═══════════════════════════════════════
   export.js — Exportar perfil y selectivo
   ═══════════════════════════════════════ */

/* ══════════════════════════════════════════════
   EXPORT OPTIONS CONFIG
   Cada opción tiene id, nombre, descripción e ícono
   ══════════════════════════════════════════════ */
const EXPORT_OPTIONS = [
  { id:'profile',  name:'Perfil del paciente',   desc:'Nombre, edad, peso, talla, objetivo y restricciones', icon:'👤' },
  { id:'planner',  name:'Plan semanal completo',  desc:'Todas las comidas organizadas por día y tipo',         icon:'📅' },
  { id:'summary',  name:'Resumen visual',         desc:'Estadísticas calóricas y tabla resumen de la semana',  icon:'📊' },
  { id:'shopping', name:'Lista de compras',       desc:'Ingredientes agrupados por categoría de supermercado', icon:'🛒' },
];

let exportSelections = new Set(['profile','planner','shopping']); // defaults

/* ── Abrir modal de exportación selectiva ── */
function openExportModal() {
  const body = document.getElementById('export-options-body');
  body.innerHTML = EXPORT_OPTIONS.map(opt => `
    <div class="export-option ${exportSelections.has(opt.id) ? 'selected' : ''}"
         onclick="toggleExportOption('${opt.id}', this)">
      <div class="export-option-icon">${opt.icon}</div>
      <div class="export-option-info">
        <div class="export-option-name">${opt.name}</div>
        <div class="export-option-desc">${opt.desc}</div>
      </div>
      <div class="export-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    </div>
  `).join('');
  document.getElementById('export-modal').classList.add('open');
}

function closeExportModal() {
  document.getElementById('export-modal').classList.remove('open');
}

function toggleExportOption(id, el) {
  el.classList.toggle('selected');
  if (exportSelections.has(id)) {
    exportSelections.delete(id);
  } else {
    exportSelections.add(id);
  }
}

/* ── Exportar perfil completo → JSON descargable ── */
function exportFullProfile() {
  const p      = state.patient;
  const obj    = OBJECTIVES.find(o => o.id === state.objective);
  const tags   = state.dietTags.map(t => DIET_TAGS.find(dt => dt.id === t)?.label).filter(Boolean);
  const allMeals = {};
  DAYS.forEach(day => {
    allMeals[day] = {};
    MEALS.forEach(m => { allMeals[day][m.label] = getMeals(day, m.id); });
  });

  const profile = {
    exportDate:   new Date().toLocaleDateString('es-AR'),
    appVersion:   'NutriPlanner v2',
    patient:      p,
    objetivo:     obj ? `${obj.emoji} ${obj.name}` : '',
    restricciones: tags,
    evitar:       state.avoidFoods,
    planSemanal:  allMeals,
    listaCompras: buildShoppingList(),
  };

  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `nutriplanner_${(p.name || 'paciente').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📥 Perfil exportado como JSON');
}

/* ── Exportar selección → HTML imprimible ── */
function exportSelected() {
  if (exportSelections.size === 0) {
    showToast('⚠️ Seleccioná al menos una sección');
    return;
  }
  closeExportModal();

  const p      = state.patient;
  const obj    = OBJECTIVES.find(o => o.id === state.objective);
  const tags   = state.dietTags.map(t => DIET_TAGS.find(dt => dt.id === t)?.label).filter(Boolean);
  const allFoods = getAllFoods();
  const totalCals = allFoods.reduce((s, f) => s + (parseInt(f.cal)||0), 0);

  let sections = '';

  /* ─ Perfil ─ */
  if (exportSelections.has('profile')) {
    sections += `
    <div class="ex-section">
      <div class="ex-section-title">👤 Perfil del paciente</div>
      <table class="ex-table">
        <tr><td class="ex-td-label">Nombre</td><td>${p.name || '—'}</td></tr>
        <tr><td class="ex-td-label">Edad</td><td>${p.age || '—'} años</td></tr>
        <tr><td class="ex-td-label">Peso</td><td>${p.weight || '—'} kg</td></tr>
        <tr><td class="ex-td-label">Talla</td><td>${p.height || '—'} cm</td></tr>
        <tr><td class="ex-td-label">Calorías obj.</td><td>${p.calories || '—'} kcal/día</td></tr>
        <tr><td class="ex-td-label">Objetivo</td><td>${obj ? obj.emoji + ' ' + obj.name : '—'}</td></tr>
        <tr><td class="ex-td-label">Restricciones</td><td>${tags.length ? tags.join(', ') : 'Ninguna'}</td></tr>
        ${p.avoidFoods || state.avoidFoods ? `<tr><td class="ex-td-label">Evitar</td><td>${state.avoidFoods}</td></tr>` : ''}
        ${p.notes ? `<tr><td class="ex-td-label">Notas</td><td>${p.notes}</td></tr>` : ''}
      </table>
    </div>`;
  }

  /* ─ Plan semanal ─ */
  if (exportSelections.has('planner')) {
    sections += `<div class="ex-section"><div class="ex-section-title">📅 Plan semanal</div>`;
    DAYS.forEach(day => {
      const hasMeals = MEALS.some(m => getMeals(day, m.id).length > 0);
      if (!hasMeals) return;
      sections += `<div class="ex-day"><strong>${day}</strong></div>`;
      MEALS.forEach(m => {
        const foods = getMeals(day, m.id);
        if (!foods.length) return;
        sections += `<div class="ex-meal-label">${m.icon} ${m.label}</div>`;
        foods.forEach(f => {
          const detail = [f.portion, f.cal ? f.cal+' kcal' : ''].filter(Boolean).join(' · ');
          sections += `<div class="ex-food-row">
            <span class="ex-food-name">${escHtml(f.name)}</span>
            ${detail ? `<span class="ex-food-detail">${detail}</span>` : ''}
          </div>`;
        });
      });
    });
    sections += '</div>';
  }

  /* ─ Resumen ─ */
  if (exportSelections.has('summary')) {
    sections += `
    <div class="ex-section">
      <div class="ex-section-title">📊 Resumen de la semana</div>
      <div class="ex-stats">
        <div class="ex-stat"><div class="ex-stat-v">${allFoods.length}</div><div class="ex-stat-l">Comidas</div></div>
        <div class="ex-stat"><div class="ex-stat-v">${totalCals.toLocaleString()}</div><div class="ex-stat-l">kcal totales</div></div>
        <div class="ex-stat"><div class="ex-stat-v">${allFoods.length ? Math.round(totalCals/7).toLocaleString() : 0}</div><div class="ex-stat-l">kcal prom/día</div></div>
        <div class="ex-stat"><div class="ex-stat-v">${countDaysWithMeals()}/7</div><div class="ex-stat-l">días cubiertos</div></div>
      </div>
    </div>`;
  }

  /* ─ Lista compras ─ */
  if (exportSelections.has('shopping')) {
    const list = buildShoppingList();
    sections += `<div class="ex-section"><div class="ex-section-title">🛒 Lista de compras</div>`;
    for (const cat of Object.keys(CATEGORY_META)) {
      if (!list[cat]) continue;
      const meta  = CATEGORY_META[cat];
      const items = Object.values(list[cat]);
      sections += `<div class="ex-cat-title">${meta.icon} ${meta.label}</div>`;
      sections += '<ul class="ex-ing-list">' + items.map(i =>
        `<li>${escHtml(i.name)}${i.count > 1 ? ` <em>×${i.count}</em>` : ''}</li>`
      ).join('') + '</ul>';
    }
    sections += '</div>';
  }

  /* Build full HTML doc */
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>NutriPlanner — ${escHtml(p.name || 'Paciente')}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1E2421; max-width: 820px; margin: 40px auto; padding: 0 24px; font-size: 14px; }
  h1   { font-family: Georgia, serif; font-size: 28px; color: #3A5238; margin-bottom: 4px; }
  .subtitle { color: #8A9590; font-size: 13px; margin-bottom: 32px; }
  .ex-section { border: 1px solid #DDE5DC; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; }
  .ex-section-title { font-size: 16px; font-weight: 600; color: #3A5238; margin-bottom: 14px; }
  .ex-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .ex-table tr:not(:last-child) td { border-bottom: 1px solid #EEF4ED; }
  .ex-table td { padding: 7px 0; }
  .ex-td-label { color: #8A9590; width: 140px; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
  .ex-day { font-weight: 700; color: #3A5238; margin: 14px 0 6px; font-size: 15px; }
  .ex-meal-label { color: #5C7A5A; font-weight: 600; font-size: 13px; margin: 8px 0 4px 12px; }
  .ex-food-row { display: flex; gap: 12px; align-items: baseline; padding: 4px 0 4px 24px; border-bottom: 1px solid #F0EDE4; }
  .ex-food-name { flex: 1; }
  .ex-food-detail { color: #8A9590; font-size: 12px; }
  .ex-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-top: 4px; }
  .ex-stat { background: #EEF4ED; border-radius: 10px; padding: 14px; text-align: center; }
  .ex-stat-v { font-family: Georgia,serif; font-size: 24px; color: #3A5238; }
  .ex-stat-l { font-size: 11px; color: #8A9590; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
  .ex-cat-title { font-weight: 600; margin: 12px 0 4px; color: #4A5552; }
  .ex-ing-list { margin: 0 0 8px 20px; padding: 0; font-size: 13.5px; }
  .ex-ing-list li { padding: 3px 0; }
  .ex-ing-list em { color: #8A9590; font-style: normal; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
  <h1>🌿 NutriPlanner</h1>
  <div class="subtitle">Plan generado el ${new Date().toLocaleDateString('es-AR')} · ${escHtml(p.name || 'Paciente')}</div>
  ${sections}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `plan_${(p.name || 'paciente').replace(/\s+/g,'_')}_${new Date().toISOString().slice(0,10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📄 Plan exportado como HTML');
}

/* ── Importar perfil desde JSON ── */
function importProfile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.patient) { showToast('❌ Archivo inválido'); return; }
      state = {
        patient:         data.patient         || defaultState().patient,
        objective:       data.objetivo ? OBJECTIVES.find(o => data.objetivo.includes(o.name))?.id || 'health' : 'health',
        dietTags:        data.restricciones   ? DIET_TAGS.filter(t => data.restricciones.includes(t.label)).map(t => t.id) : [],
        avoidFoods:      data.evitar          || '',
        meals:           {},
        shoppingChecked: {},
      };
      /* Re-map meals */
      if (data.planSemanal) {
        DAYS.forEach(day => {
          MEALS.forEach(m => {
            const arr = data.planSemanal[day]?.[m.label];
            if (arr && arr.length) state.meals[`${day}-${m.id}`] = arr;
          });
        });
      }
      saveState();
      initSetup();
      showToast('✅ Perfil importado correctamente');
    } catch { showToast('❌ Error al leer el archivo'); }
  };
  reader.readAsText(file);
  input.value = '';
}
