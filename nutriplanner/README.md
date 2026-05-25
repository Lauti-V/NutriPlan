# 🌿 NutriPlanner

Planificador semanal de comidas para nutricionistas. App 100% frontend, sin backend ni dependencias externas obligatorias.

## Estructura del proyecto

```
nutriplanner/
│
├── index.html              ← Punto de entrada, solo markup HTML
│
├── css/
│   ├── variables.css       ← Design tokens: colores, tipografía, radios, sombras
│   ├── layout.css          ← App shell, sidebar, topbar, vistas, page-content
│   ├── components.css      ← Botones, formularios, tarjetas, badges, tags, toasts
│   └── views.css           ← Planner, summary, shopping, modales, export options
│
└── js/
    ├── data.js             ← Constantes (DAYS, MEALS, OBJECTIVES…) + estado global + helpers
    ├── ui.js               ← Navegación, toast, cierre de modales, teclado
    ├── setup.js            ← Pantalla de inicio/objetivos y configuración del paciente
    ├── planner.js          ← Plan semanal, tabs de días, modal de alimento (add/edit/delete)
    ├── views.js            ← Resumen visual + lista de compras interactiva
    └── export.js           ← Exportar perfil completo (JSON), exportar selección (HTML), importar (JSON)
```

## Orden de carga de scripts

El orden importa porque cada archivo depende del anterior:

1. `data.js`    — constantes y `state` global
2. `ui.js`      — `navigate()`, `showToast()`, listeners de teclado
3. `setup.js`   — `initSetup()`, `saveSetup()`
4. `planner.js` — `renderPlanner()`, `saveFood()`
5. `views.js`   — `renderSummary()`, `renderShopping()`
6. `export.js`  — `exportFullProfile()`, `exportSelected()`, `importProfile()`

## Funcionalidades

| Feature | Descripción |
|---|---|
| Perfil del paciente | Nombre, edad, peso, talla, calorías objetivo, notas clínicas |
| Objetivos nutricionales | 8 objetivos seleccionables visualmente |
| Etiquetas de dieta | 10 tags (vegetariano, vegano, sin gluten, cetogénica, etc.) |
| Plan semanal | Lunes a domingo · 4 comidas por día |
| CRUD de alimentos | Agregar, editar, eliminar con modal completo |
| Lista de compras | Auto-generada, agrupada en 7 categorías, checkboxes interactivos |
| Resumen visual | Stats calóricos, barra de progreso diaria, tabla semanal |
| Exportar perfil completo | JSON descargable con todos los datos |
| Exportar selección | HTML imprimible con las secciones elegidas |
| Importar perfil | Cargar un JSON previamente exportado |
| Imprimir / PDF | Estilos `@media print` optimizados |
| Persistencia | `localStorage` automático |

## Cómo usar

Abrí `index.html` directamente en un navegador moderno (Chrome, Firefox, Edge, Safari).
No requiere servidor web.

> **Nota:** Las fuentes (DM Serif Display + DM Sans) se cargan desde Google Fonts. Sin conexión a internet se usarán las fuentes del sistema.
