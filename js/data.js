/* ═══════════════════════════════════════
   data.js — Constants & State
   ═══════════════════════════════════════ */

const DAYS       = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const DAYS_SHORT = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];

const MEALS = [
  { id:'breakfast', label:'Desayuno', icon:'🌅', time:'7:00 – 9:00',   cls:'breakfast' },
  { id:'lunch',     label:'Almuerzo', icon:'☀️', time:'12:00 – 14:00', cls:'lunch'     },
  { id:'snack',     label:'Merienda', icon:'🍎', time:'15:00 – 17:00', cls:'snack'     },
  { id:'dinner',    label:'Cena',     icon:'🌙', time:'19:00 – 21:00', cls:'dinner'    },
];

const OBJECTIVES = [
  { id:'loss',      emoji:'⚖️', name:'Pérdida de peso',        desc:'Déficit calórico controlado'    },
  { id:'maintain',  emoji:'🎯', name:'Mantenimiento',           desc:'Balance energético estable'     },
  { id:'gain',      emoji:'💪', name:'Ganancia muscular',       desc:'Superávit + proteínas'          },
  { id:'health',    emoji:'❤️', name:'Salud general',          desc:'Nutrición equilibrada'           },
  { id:'diabetes',  emoji:'🩸', name:'Diabetes / glucemia',    desc:'Control de índice glucémico'    },
  { id:'cardio',    emoji:'🫀', name:'Salud cardiovascular',   desc:'Grasas saludables, sodio bajo'  },
  { id:'digestive', emoji:'🌿', name:'Salud digestiva',        desc:'Fibra, probióticos'             },
  { id:'sport',     emoji:'🏃', name:'Rendimiento deportivo',  desc:'Energía y recuperación'         },
];

const DIET_TAGS = [
  { id:'vegetariano',  label:'Vegetariano',  cls:'ftag-veg'    },
  { id:'vegano',       label:'Vegano',        cls:'ftag-vegan'  },
  { id:'sinGluten',    label:'Sin gluten',    cls:'ftag-gluten' },
  { id:'sinLactosa',   label:'Sin lactosa',   cls:'ftag-dairy'  },
  { id:'cetogenica',   label:'Cetogénica',    cls:'ftag-keto'   },
  { id:'paleo',        label:'Paleo',         cls:'ftag-paleo'  },
  { id:'altaProteina', label:'Alta proteína', cls:'ftag-prot'   },
  { id:'mediterranea', label:'Mediterránea',  cls:'ftag-veg'    },
  { id:'hiposodica',   label:'Hipósodica',    cls:'ftag-custom' },
  { id:'diabetica',    label:'Diabética',     cls:'ftag-custom' },
];

/* ── Ingredient categorization ── */
const INGREDIENT_CATEGORIES = {
  verduras:    ['lechuga','espinaca','acelga','zanahoria','zapallo','calabaza','brócoli','coliflor','pimiento','tomate','pepino','cebolla','ajo','apio','remolacha','choclo','arvejas','chaucha','berenjena','zucchini','kale','rúcula','repollo','papa','batata','nabo','puerro','repollito','hinojo','alcaucil'],
  frutas:      ['manzana','pera','banana','naranja','mandarina','limón','pomelo','frutilla','arándano','uva','melón','sandía','kiwi','durazno','ciruela','cereza','mango','ananá','papaya','higo','granada','maracuyá','frambuesa','mora','damasco'],
  proteinas:   ['pollo','carne','bife','pechuga','atún','salmón','merluza','huevo','lentejas','garbanzos','porotos','quinoa','tofu','tempeh','carne picada','milanesa','fiambre','jamón','cerdo','cordero','trucha','sardina'],
  lacteos:     ['leche','yogur','queso','ricota','crema','manteca','kéfir','queso crema','mozzarella','parmesano','cheddar','brie','queso cottage','leche descremada'],
  secos:       ['arroz','avena','fideos','pasta','pan','harina','polenta','cous cous','mijo','trigo','cebada','centeno','pan integral','galletas','tostadas','lenteja seca','garbanzo seco','legumbres','nueces','almendras','maní','castañas','semillas','chia','lino','sésamo','girasol'],
  congelados:  ['espinaca congelada','brócoli congelado','arvejas congeladas','maíz congelado','mezcla de verduras','nuggets','hamburguesa','helado','frutos del mar congelados'],
  condimentos: ['aceite','aceite de oliva','vinagre','sal','pimienta','orégano','albahaca','tomillo','romero','laurel','pimentón','cúrcuma','comino','curry','jengibre','canela','miel','azúcar','edulcorante','mostaza','mayonesa','ketchup','salsa de soja','caldo','levadura','polvo hornear'],
};

const CATEGORY_META = {
  verduras:    { label:'Verduras y hortalizas', icon:'🥦', color:'#E8F5E2', border:'#C5DFBC' },
  frutas:      { label:'Frutas',                icon:'🍎', color:'#FFF0F0', border:'#F5CACA' },
  proteinas:   { label:'Proteínas',             icon:'🥩', color:'#FBF5E8', border:'#E8D5B0' },
  lacteos:     { label:'Lácteos y huevos',      icon:'🥛', color:'#EEF0F8', border:'#C8CCE8' },
  secos:       { label:'Secos y panificados',   icon:'🌾', color:'#FDF5EE', border:'#E8D5BC' },
  congelados:  { label:'Congelados',            icon:'❄️', color:'#EEF8FC', border:'#B8DCF0' },
  condimentos: { label:'Condimentos y aceites', icon:'🫙', color:'#F5F0F8', border:'#D8C8E8' },
};

/* ── State ── */
function defaultState() {
  return {
    patient:         { name:'', age:'', weight:'', height:'', calories:'', notes:'', week:'' },
    objective:       'health',
    dietTags:        [],
    avoidFoods:      '',
    meals:           {},  // key: 'Lunes-breakfast' → [{id, name, portion, cal, notes, tags, ingredients}]
    shoppingChecked: {},  // key: 'category:ingredient' → boolean
  };
}

let state = loadState();

function loadState() {
  try {
    const s = localStorage.getItem('nutriplanner_v2');
    return s ? JSON.parse(s) : defaultState();
  } catch { return defaultState(); }
}

function saveState() {
  localStorage.setItem('nutriplanner_v2', JSON.stringify(state));
}

/* ── Helpers ── */
function getMeals(day, mealId) {
  return state.meals[`${day}-${mealId}`] || [];
}

function setMeals(day, mealId, foods) {
  state.meals[`${day}-${mealId}`] = foods;
  saveState();
}

function getAllFoods() {
  const foods = [];
  DAYS.forEach(day => MEALS.forEach(m => getMeals(day, m.id).forEach(f => foods.push(f))));
  return foods;
}

function countDaysWithMeals() {
  return DAYS.filter(day => MEALS.some(m => getMeals(day, m.id).length > 0)).length;
}

function categorizeIngredient(ingredient) {
  const ing = ingredient.toLowerCase().trim();
  for (const [cat, keywords] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (keywords.some(k => ing.includes(k) || k.includes(ing))) return cat;
  }
  return 'secos';
}

function buildShoppingList() {
  const list = {};
  DAYS.forEach(day => {
    MEALS.forEach(m => {
      getMeals(day, m.id).forEach(f => {
        (f.ingredients || []).forEach(ing => {
          const cat = categorizeIngredient(ing);
          if (!list[cat]) list[cat] = {};
          const key = ing.toLowerCase().trim();
          if (!list[cat][key]) list[cat][key] = { name: ing.trim(), days: [], count: 0 };
          list[cat][key].count++;
          if (!list[cat][key].days.includes(day)) list[cat][key].days.push(day);
        });
      });
    });
  });
  return list;
}

function formatWeek(w) {
  if (!w) return 'Sin fecha';
  try {
    const [year, weekStr] = w.split('-W');
    return `Semana ${parseInt(weekStr)} / ${year}`;
  } catch { return w; }
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escAttr(str) {
  return String(str || '').replace(/'/g,'&#39;').replace(/"/g,'&quot;');
}
