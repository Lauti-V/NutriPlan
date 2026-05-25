/* ═══════════════════════════════════════
   planner.js — Plan semanal + modal comida
   ═══════════════════════════════════════ */

let currentDay     = 0;
let editingFood    = null;
let currentTarget  = null;

/* ── RENDER PLANNER ── */
function renderPlanner() {
  /* Patient badge */
  const name     = state.patient.name || 'Sin paciente';
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '—';
  document.getElementById('patient-badge-name').textContent = name;
  document.getElementById('patient-avatar').textContent     = initials;

  /* Day tabs */
  document.getElementById('days-tabs').innerHTML = DAYS.map((d, i) => {
    const count = MEALS.reduce((acc, m) => acc + getMeals(d, m.id).length, 0);
    const dot   = count > 0
      ? `<span style="width:6px;height:6px;border-radius:50%;background:${i === currentDay ? 'rgba(255,255,255,0.7)' : 'var(--sage-light)'};margin-top:2px"></span>`
      : `<span style="width:6px;height:6px"></span>`;
    return `
    <div class="day-tab ${i === currentDay ? 'active' : ''}" onclick="selectDay(${i})">
      <span class="day-short">${DAYS_SHORT[i]}</span>
      <span class="day-full">${d.substring(0, 3)}</span>
      ${dot}
    </div>`;
  }).join('');

  /* Meals grid */
  const day = DAYS[currentDay];
  document.getElementById('meals-grid').innerHTML = MEALS.map(m => {
    const foods = getMeals(day, m.id);
    return `
    <div class="meal-card">
      <div class="meal-header">
        <div class="meal-title-wrap">
          <div class="meal-icon ${m.cls}">${m.icon}</div>
          <div>
            <div class="meal-title">${m.label}</div>
            <div class="meal-time">${m.time}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="openAddFood('${day}','${m.id}')" title="Agregar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      <div class="meal-body">
        ${foods.length === 0 ? `
          <div class="empty-state" style="padding:20px 10px">
            <div class="empty-emoji">🍽️</div>
            <div class="empty-desc" style="font-size:12px">Sin comidas registradas</div>
          </div>` : ''}
        ${foods.map(f => renderFoodItem(f, day, m.id)).join('')}
        <button class="add-food-btn" onclick="openAddFood('${day}','${m.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Agregar alimento
        </button>
      </div>
    </div>`;
  }).join('');
}

function renderFoodItem(f, day, mealId) {
  const tagHtml = (f.tags || []).map(t => {
    const tag = DIET_TAGS.find(dt => dt.id === t);
    return tag ? `<span class="food-tag-mini ${tag.cls}">${tag.label}</span>` : '';
  }).join('');
  return `
  <div class="food-item" id="food-${f.id}">
    <div class="food-info">
      <div class="food-name">${escHtml(f.name)}</div>
      ${f.portion || f.cal ? `<div class="food-detail">${[f.portion, f.cal ? f.cal + ' kcal' : ''].filter(Boolean).join(' · ')}</div>` : ''}
      ${f.notes   ? `<div class="food-detail" style="font-style:italic">${escHtml(f.notes)}</div>` : ''}
      ${tagHtml   ? `<div class="food-tags">${tagHtml}</div>` : ''}
    </div>
    <div class="food-actions">
      <button class="btn-icon-sm" onclick="openEditFood('${day}','${mealId}','${f.id}')" title="Editar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="btn-icon-sm del" onclick="deleteFood('${day}','${mealId}','${f.id}')" title="Eliminar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </button>
    </div>
  </div>`;
}

function selectDay(idx) {
  currentDay = idx;
  renderPlanner();
}

/* ── FOOD MODAL ── */
function openAddFood(day, mealId) {
  currentTarget = { day, mealId };
  editingFood   = null;
  document.getElementById('modal-title').textContent = 'Agregar alimento';
  clearFoodForm();
  initModalTags([...state.dietTags]);
  document.getElementById('food-modal').classList.add('open');
  setTimeout(() => document.getElementById('food-name').focus(), 100);
}

function openEditFood(day, mealId, foodId) {
  currentTarget    = { day, mealId };
  const foods      = getMeals(day, mealId);
  const food       = foods.find(f => f.id === foodId);
  if (!food) return;
  editingFood      = { ...food, day, mealId };

  document.getElementById('modal-title').textContent     = 'Editar alimento';
  document.getElementById('food-name').value             = food.name        || '';
  document.getElementById('food-portion').value          = food.portion     || '';
  document.getElementById('food-cal').value              = food.cal         || '';
  document.getElementById('food-notes').value            = food.notes       || '';
  document.getElementById('food-ingredients').value      = (food.ingredients || []).join(', ');
  initModalTags(food.tags || []);
  document.getElementById('food-modal').classList.add('open');
  setTimeout(() => document.getElementById('food-name').focus(), 100);
}

function closeModal() {
  document.getElementById('food-modal').classList.remove('open');
  editingFood   = null;
  currentTarget = null;
}

function clearFoodForm() {
  ['food-name','food-portion','food-cal','food-notes','food-ingredients'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function initModalTags(selected = []) {
  document.getElementById('modal-tags').innerHTML = DIET_TAGS.map(t => `
    <span class="diet-tag ${selected.includes(t.id) ? 'active' : ''}"
          onclick="toggleModalTag('${t.id}', this)">
      <span class="dot"></span>${t.label}
    </span>
  `).join('');
}

function toggleModalTag(id, el) { el.classList.toggle('active'); }

function getModalTags() {
  return [...document.querySelectorAll('#modal-tags .diet-tag.active')]
    .map(el => el.getAttribute('onclick').match(/'([^']+)'/)[1]);
}

function saveFood() {
  const name = document.getElementById('food-name').value.trim();
  if (!name) { showToast('⚠️ Escribí el nombre del alimento'); return; }

  const ingRaw      = document.getElementById('food-ingredients').value;
  const ingredients = ingRaw ? ingRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const food = {
    id:          editingFood ? editingFood.id : 'f' + Date.now(),
    name,
    portion:     document.getElementById('food-portion').value.trim(),
    cal:         document.getElementById('food-cal').value,
    notes:       document.getElementById('food-notes').value.trim(),
    tags:        getModalTags(),
    ingredients,
  };

  const { day, mealId } = currentTarget;
  let foods = getMeals(day, mealId);
  if (editingFood) {
    foods = foods.map(f => f.id === editingFood.id ? food : f);
  } else {
    foods.push(food);
  }
  setMeals(day, mealId, foods);
  closeModal();
  renderPlanner();
  showToast(editingFood ? '✏️ Alimento actualizado' : '✅ Alimento agregado');
}

function deleteFood(day, mealId, foodId) {
  setMeals(day, mealId, getMeals(day, mealId).filter(f => f.id !== foodId));
  renderPlanner();
  showToast('🗑️ Alimento eliminado');
}
