import { IMAGE_KW } from '../data/menuData';

/** Consistent food photography URLs (same source as menu cards) */
export function getFoodPhoto(kw, width, height, seed = 1) {
  return `https://loremflickr.com/${width}/${height}/${encodeURIComponent(kw || 'food')}?lock=${seed}`;
}

export function getCategoryBg(categoryId) {
  const kw = IMAGE_KW[categoryId] || 'food';
  const seed = (categoryId.length * 47) % 9000 + 100;
  return getFoodPhoto(kw, 400, 500, seed);
}

export const HERO_FOOD_IMAGE = getFoodPhoto('burger,fries,gourmet', 640, 640, 77);

export const LOADER_FOOD_IMAGE = getFoodPhoto('burger,gourmet', 320, 320, 42);

export const STORY_IMAGES = {
  kitchen: getFoodPhoto('restaurant,kitchen,chef', 600, 480, 301),
  dish: getFoodPhoto('burger,gourmet', 480, 560, 302),
};

export const DEALS_IMAGES = [
  { kw: 'burger,combo', seed: 401 },
  { kw: 'shawarma,wrap', seed: 402 },
  { kw: 'pizza,meal', seed: 403 },
];

export const GALLERY_ITEMS = [
  { label: 'Classic Burger', kw: 'burger', seed: 501, aspect: 'landscape' },
  { label: 'Wood Fired Pizza', kw: 'pizza', seed: 502, aspect: 'portrait' },
  { label: 'Garlic Shawarma', kw: 'shawarma', seed: 503, aspect: 'landscape' },
  { label: 'Truffle Fries', kw: 'french-fries', seed: 504, aspect: 'portrait' },
  { label: 'Signature Drinks', kw: 'milkshake,drink', seed: 505, aspect: 'landscape' },
  { label: 'Lava Cake', kw: 'chocolate,cake', seed: 506, aspect: 'portrait' },
  { label: 'Club Supreme', kw: 'sandwich', seed: 507, aspect: 'landscape' },
  { label: "Chef's Special", kw: 'grilled,food', seed: 508, aspect: 'portrait' },
  { label: 'Sweet Endings', kw: 'dessert', seed: 509, aspect: 'landscape' },
  { label: 'Fresh Salads', kw: 'salad', seed: 510, aspect: 'portrait' },
  { label: 'HOTSI Bowl', kw: 'rice,bowl', seed: 511, aspect: 'landscape' },
  { label: 'Crispy Chicken', kw: 'fried-chicken', seed: 512, aspect: 'portrait' },
];

export function getGalleryPhoto(item) {
  const w = item.aspect === 'portrait' ? 400 : 560;
  const h = item.aspect === 'portrait' ? 560 : 360;
  return getFoodPhoto(item.kw, w, h, item.seed);
}

export const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Plot+505,+Karim+Block,+Allama+Iqbal+Town,+Lahore+54570';

export const MAP_STATIC_IMAGE = getFoodPhoto('lahore,city,map', 800, 500, 601);
