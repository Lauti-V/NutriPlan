/* ═══════════════════════════════════════
   ui.js — Navigation, Toast, Modals
   ═══════════════════════════════════════ */

/* ── TOAST ── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── NAVIGATION ── */
function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') === `navigate('${view}')`) n.classList.add('active');
  });
  if (view === 'planner')  renderPlanner();
  if (view === 'summary')  renderSummary();
  if (view === 'shopping') renderShopping();
}

/* ── CONFIRM CLEAR MODAL ── */
function confirmClear() {
  document.getElementById('confirm-modal').classList.add('open');
}
function closeConfirm() {
  document.getElementById('confirm-modal').classList.remove('open');
}
function clearAll() {
  localStorage.removeItem('nutriplanner_v2');
  state = defaultState();
  closeConfirm();
  initSetup();
  navigate('setup');
  showToast('🗑️ Datos eliminados');
}

/* ── KEYBOARD & OVERLAY CLOSE ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('food-modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  document.getElementById('confirm-modal').addEventListener('click', function(e) {
    if (e.target === this) closeConfirm();
  });
  document.getElementById('export-modal').addEventListener('click', function(e) {
    if (e.target === this) closeExportModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeConfirm(); closeExportModal(); }
  });
});

/* ── PRINT ── */
function exportPrint() {
  window.print();
}
