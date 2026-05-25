/* ═══════════════════════════════════════
   setup.js — Pantalla inicial / objetivos
   ═══════════════════════════════════════ */

function initSetup() {
  /* Objectives */
  const og = document.getElementById('objectives-grid');
  og.innerHTML = OBJECTIVES.map(o => `
    <div class="obj-card ${state.objective === o.id ? 'selected' : ''}"
         onclick="selectObjective('${o.id}', this)">
      <div class="obj-emoji">${o.emoji}</div>
      <div class="obj-name">${o.name}</div>
      <div class="obj-desc">${o.desc}</div>
    </div>
  `).join('');

  /* Diet tags */
  const dt = document.getElementById('diet-tags-selector');
  dt.innerHTML = DIET_TAGS.map(t => `
    <span class="diet-tag ${state.dietTags.includes(t.id) ? 'active' : ''}"
          onclick="toggleDietTag('${t.id}', this)">
      <span class="dot"></span>${t.label}
    </span>
  `).join('');

  /* Fill form */
  const p = state.patient;
  document.getElementById('patient-name').value     = p.name     || '';
  document.getElementById('patient-age').value      = p.age      || '';
  document.getElementById('patient-weight').value   = p.weight   || '';
  document.getElementById('patient-height').value   = p.height   || '';
  document.getElementById('patient-calories').value = p.calories || '';
  document.getElementById('patient-notes').value    = p.notes    || '';
  document.getElementById('avoid-foods').value      = state.avoidFoods || '';

  /* Default week */
  if (!p.week) {
    const now         = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const week        = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    document.getElementById('plan-week').value = `${now.getFullYear()}-W${String(week).padStart(2,'0')}`;
  } else {
    document.getElementById('plan-week').value = p.week;
  }
}

function selectObjective(id, el) {
  document.querySelectorAll('.obj-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  state.objective = id;
}

function toggleDietTag(id, el) {
  el.classList.toggle('active');
  if (state.dietTags.includes(id)) {
    state.dietTags = state.dietTags.filter(t => t !== id);
  } else {
    state.dietTags.push(id);
  }
}

function saveSetup() {
  state.patient = {
    name:     document.getElementById('patient-name').value.trim(),
    age:      document.getElementById('patient-age').value,
    weight:   document.getElementById('patient-weight').value,
    height:   document.getElementById('patient-height').value,
    calories: document.getElementById('patient-calories').value,
    notes:    document.getElementById('patient-notes').value.trim(),
    week:     document.getElementById('plan-week').value,
  };
  state.avoidFoods = document.getElementById('avoid-foods').value.trim();
  saveState();
  showToast('✅ Datos guardados correctamente');
  setTimeout(() => navigate('planner'), 400);
}
