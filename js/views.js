/* ═══════════════════════════════════════
   views.js — Resumen visual + Lista compras
   ═══════════════════════════════════════ */

/* ══════════════════════════
   SUMMARY VIEW
   ══════════════════════════ */
function renderSummary() {
  const p         = state.patient;
  const allFoods  = getAllFoods();
  const totalCals = allFoods.reduce((s, f) => s + (parseInt(f.cal) || 0), 0);
  const avgCals   = allFoods.length ? Math.round(totalCals / 7) : 0;
  const objMeta   = OBJECTIVES.find(o => o.id === state.objective) || OBJECTIVES[3];
  const container = document.getElementById('summary-content');

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">${p.name || 'Paciente'}</h2>
        <div class="section-subtitle">Semana: ${formatWeek(p.week)} · Objetivo: ${objMeta.emoji} ${objMeta.name}</div>
      </div>
    </div>

    ${state.dietTags.length ? `
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px">
      ${state.dietTags.map(t => {
        const tag = DIET_TAGS.find(dt => dt.id === t);
        return tag ? `<span class="food-tag-mini ${tag.cls}" style="font-size:12.5px;padding:4px 12px">${tag.label}</span>` : '';
      }).join('')}
      ${state.avoidFoods ? `<span class="food-tag-mini ftag-custom" style="font-size:12.5px;padding:4px 12px">Evitar: ${escHtml(state.avoidFoods)}</span>` : ''}
    </div>` : ''}

    <div class="summary-grid">
      <div class="stat-card">
        <div class="stat-label">Comidas totales</div>
        <div class="stat-value">${allFoods.length}<span class="stat-unit">registros</span></div>
        <div class="stat-sub">en la semana</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Calorías estimadas</div>
        <div class="stat-value">${totalCals.toLocaleString()}<span class="stat-unit">kcal</span></div>
        <div class="stat-sub">total semanal</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Promedio diario</div>
        <div class="stat-value">${avgCals.toLocaleString()}<span class="stat-unit">kcal</span></div>
        <div class="stat-sub">${p.calories ? 'Obj: ' + p.calories + ' kcal' : 'sin objetivo definido'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Cobertura semanal</div>
        <div class="stat-value">${countDaysWithMeals()}<span class="stat-unit">/7 días</span></div>
        <div class="stat-sub">con al menos 1 comida</div>
      </div>
    </div>

    ${p.calories ? `
    <div class="info-card" style="margin-bottom:24px">
      <h3 style="font-size:16px;margin-bottom:12px">Progreso calórico por día</h3>
      ${DAYS.map(day => {
        const dayCals = MEALS.reduce((s, m) => s + getMeals(day, m.id).reduce((ss, f) => ss + (parseInt(f.cal)||0), 0), 0);
        const pct     = Math.min(100, Math.round((dayCals / (parseInt(p.calories)||2000)) * 100));
        const color   = pct > 110 ? 'var(--terracotta)' : pct > 85 ? 'var(--sage)' : 'var(--gold)';
        return `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
          <span style="font-size:12px;font-weight:500;color:var(--text-secondary);width:72px;flex-shrink:0">${day}</span>
          <div style="flex:1;background:var(--border);border-radius:999px;height:10px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${color};border-radius:999px;transition:width 0.4s"></div>
          </div>
          <span style="font-size:12px;color:var(--text-muted);width:70px;text-align:right">${dayCals > 0 ? dayCals + ' kcal' : '—'}</span>
        </div>`;
      }).join('')}
    </div>` : ''}

    <div class="info-card">
      <h3 style="font-size:16px;margin-bottom:16px">Resumen por día</h3>
      <table class="week-overview-table">
        <thead>
          <tr>
            <th>Día</th>
            <th>Desayuno</th><th>Almuerzo</th><th>Merienda</th><th>Cena</th>
          </tr>
        </thead>
        <tbody>
          ${DAYS.map(day => `
          <tr>
            <td style="font-weight:500">${day}</td>
            ${MEALS.map(m => {
              const foods = getMeals(day, m.id);
              return `<td>${foods.length === 0
                ? '<span style="color:var(--text-muted);font-size:12px">—</span>'
                : foods.map(f => `<span class="meal-pill">${escHtml(f.name)}</span>`).join('')
              }</td>`;
            }).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ══════════════════════════
   SHOPPING VIEW
   ══════════════════════════ */
function renderShopping() {
  const list      = buildShoppingList();
  const catKeys   = Object.keys(list);
  const container = document.getElementById('shopping-content');

  if (catKeys.length === 0) {
    container.innerHTML = `
    <div class="notice">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Para generar la lista de compras, agregá alimentos con ingredientes en el plan semanal.
    </div>
    <div class="empty-state" style="padding:60px 20px">
      <div class="empty-emoji">🛒</div>
      <div class="empty-title">Lista de compras vacía</div>
      <div class="empty-desc">Los ingredientes aparecerán aquí automáticamente según el plan semanal.</div>
      <button class="btn btn-primary" style="margin-top:20px" onclick="navigate('planner')">
        Ir al plan semanal
      </button>
    </div>`;
    return;
  }

  const totalItems   = catKeys.reduce((s, c) => s + Object.keys(list[c]).length, 0);
  const checkedCount = Object.values(state.shoppingChecked).filter(Boolean).length;
  const pct          = totalItems ? Math.round((checkedCount / totalItems) * 100) : 0;

  let html = `
  <div class="shop-header">
    <div>
      <div id="shop-progress-label" style="font-size:14px;font-weight:500;color:var(--text-primary);margin-bottom:4px">
        ${checkedCount} de ${totalItems} productos comprados
      </div>
      <div class="progress-bar-wrap" style="width:280px">
        <div class="progress-bar" id="shop-pbar" style="width:${pct}%"></div>
      </div>
    </div>
    <span id="shop-pct" style="font-family:var(--font-display);font-size:28px">${pct}%</span>
  </div>
  <div class="shop-categories">`;

  for (const cat of Object.keys(CATEGORY_META)) {
    if (!list[cat]) continue;
    const meta  = CATEGORY_META[cat];
    const items = Object.values(list[cat]);
    html += `
    <div class="shop-cat">
      <div class="shop-cat-header" onclick="toggleCatSection(this)">
        <div class="cat-icon" style="background:${meta.color}">${meta.icon}</div>
        <div class="shop-cat-name">${meta.label}</div>
        <div class="shop-cat-count">${items.length} productos</div>
        <svg class="shop-cat-chevron" style="transform:rotate(180deg)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;color:var(--text-muted)">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </div>
      <div class="shop-items">
        ${items.map(item => {
          const itemKey   = `${cat}:${item.name.toLowerCase()}`;
          const isChecked = !!state.shoppingChecked[itemKey];
          return `
          <div class="shop-item ${isChecked ? 'done' : ''}">
            <button class="shop-check ${isChecked ? 'checked' : ''}" onclick="toggleShopItem('${escAttr(itemKey)}', this)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
            <span class="item-name">${escHtml(item.name)}</span>
            ${item.count > 1 ? `<span class="item-qty">×${item.count}</span>` : ''}
            <span class="item-day">${item.days.slice(0, 2).join(', ')}${item.days.length > 2 ? '…' : ''}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

function toggleShopItem(key, btn) {
  state.shoppingChecked[key] = !state.shoppingChecked[key];
  saveState();
  btn.classList.toggle('checked');
  btn.closest('.shop-item').classList.toggle('done');
  updateShopProgress();
}

function updateShopProgress() {
  const list         = buildShoppingList();
  const totalItems   = Object.values(list).reduce((s, c) => s + Object.keys(c).length, 0);
  const checkedCount = Object.values(state.shoppingChecked).filter(Boolean).length;
  const pct          = totalItems ? Math.round((checkedCount / totalItems) * 100) : 0;
  const pb  = document.getElementById('shop-pbar');
  const lbl = document.getElementById('shop-progress-label');
  const pEl = document.getElementById('shop-pct');
  if (pb)  pb.style.width = pct + '%';
  if (lbl) lbl.textContent = `${checkedCount} de ${totalItems} productos comprados`;
  if (pEl) pEl.textContent = pct + '%';
}

function toggleCatSection(header) {
  const items   = header.nextElementSibling;
  const chevron = header.querySelector('.shop-cat-chevron');
  const isOpen  = items.style.display !== 'none';
  items.style.display    = isOpen ? 'none' : 'block';
  chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

function clearChecked() {
  state.shoppingChecked = {};
  saveState();
  renderShopping();
  showToast('🔄 Marcados eliminados');
}
