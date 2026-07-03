import { CATEGORY_TABS } from '../data/menuData.js';

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Turn flat Firestore menu_items into MENU_DATA shape for the website */
export function buildMenuFromFirebaseItems(items) {
  const available = items.filter((i) => i.available !== false);
  if (available.length === 0) return null;

  const result = {};

  const deals = available.filter((i) => i.category === 'deals');
  if (deals.length > 0) {
    result.deals = {
      isDeals: true,
      items: deals.map((i) => ({
        badge: i.badge || 'Deal',
        title: i.name.replace(/^(Deal|Combo) \d+ — /, '').split(' — ').pop() || i.name,
        list: i.description || i.sub || '',
        price: i.price,
        name: i.name,
        featured: Boolean(i.featured),
        delay: i.featured ? 'd2' : '',
        imageUrl: i.imageUrl || '',
        emoji: i.emoji || '💰',
      })),
    };
  }

  const nonDeals = available.filter((i) => i.category !== 'deals');
  nonDeals.forEach((item) => {
    const cat = item.category || 'burgers';
    if (!result[cat]) result[cat] = { sections: {} };

    const sectionTitle = item.section || 'Menu';
    if (!result[cat].sections[sectionTitle]) {
      result[cat].sections[sectionTitle] = { title: sectionTitle, items: [] };
    }

    result[cat].sections[sectionTitle].items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      emoji: item.emoji || '🍔',
      sub: item.sub || '',
      priceLabel: item.priceLabel || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      imagePublicId: item.imagePublicId || '',
    });
  });

  Object.keys(result).forEach((cat) => {
    if (cat === 'deals') return;
    result[cat].sections = Object.values(result[cat].sections);
  });

  return result;
}

export function getVisibleCategoryTabs(menuData) {
  if (!menuData) return [];
  return CATEGORY_TABS.filter((tab) => {
    const data = menuData[tab.id];
    if (!data) return false;
    if (data.isDeals) return data.items?.length > 0;
    return data.sections?.some((s) => (s.items?.length > 0) || (s.pizzas?.length > 0));
  });
}

export function generateMenuSlug(category, name) {
  const base = `${category}-${slugify(name)}`;
  const suffix = Date.now().toString(36).slice(-4);
  return `${base}-${suffix}`;
}

export const MENU_CATEGORIES = [
  { id: 'burgers', label: 'Burgers', emoji: '🍔' },
  { id: 'shawarma', label: 'Shawarma', emoji: '🌯' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'sandwiches', label: 'Sandwiches', emoji: '🥪' },
  { id: 'wraps', label: 'Wraps & Rolls', emoji: '🌯' },
  { id: 'fries', label: 'Fries & Sides', emoji: '🍟' },
  { id: 'chicken', label: 'Fried Chicken', emoji: '🍗' },
  { id: 'deals', label: 'Deals', emoji: '💰' },
];

export const EMPTY_MENU_FORM = {
  name: '',
  price: '',
  category: 'burgers',
  emoji: '🍔',
  section: '',
  sub: '',
  description: '',
  badge: '',
  featured: false,
  available: true,
  imageUrl: '',
  imagePublicId: '',
};

export function menuItemToForm(item) {
  return {
    name: item.name || '',
    price: String(item.price ?? ''),
    category: item.category || 'burgers',
    emoji: item.emoji || '🍔',
    section: item.section || '',
    sub: item.sub || '',
    description: item.description || '',
    badge: item.badge || '',
    featured: Boolean(item.featured),
    available: item.available !== false,
    imageUrl: item.imageUrl || '',
    imagePublicId: item.imagePublicId || '',
  };
}

export function formToMenuData(form) {
  return {
    name: form.name.trim(),
    price: parseInt(form.price, 10) || 0,
    category: form.category,
    emoji: form.emoji || '🍔',
    section: form.section.trim(),
    sub: form.sub.trim(),
    description: form.description.trim(),
    badge: form.badge.trim(),
    featured: form.featured,
    available: form.available,
    imageUrl: form.imageUrl.trim(),
    imagePublicId: form.imagePublicId.trim(),
  };
}
