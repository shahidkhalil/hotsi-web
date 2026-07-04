/** Site-wide category ids (matches menuData + spinner wheel) */
export const ALL_CATEGORY_IDS = [
  'burgers',
  'shawarma',
  'pizza',
  'sandwiches',
  'wraps',
  'fries',
  'chicken',
  'deals',
];

export const CATEGORY_META = {
  burgers: { label: 'Burgers', emoji: '🍔' },
  shawarma: { label: 'Shawarma', emoji: '🌯' },
  pizza: { label: 'Pizza', emoji: '🍕' },
  sandwiches: { label: 'Sandwiches', emoji: '🥪' },
  wraps: { label: 'Wraps & Rolls', emoji: '🌯' },
  fries: { label: 'Fries & Sides', emoji: '🍟' },
  chicken: { label: 'Fried Chicken', emoji: '🍗' },
  deals: { label: 'Deals', emoji: '💰' },
};

export const DEFAULT_SETTINGS = {
  phone: '0340 4112112',
  whatsapp: '923404112112',
  address: 'Plot 505, Karim Block, Allama Iqbal Town, Lahore 54570',
  hours: 'Open Daily — Closes 4:00 AM',
  deliveryTime: '25 Min',
  spinnerOfferEnabled: true,
  hiddenCategories: [],
};

export function normalizeSettings(data) {
  if (!data) return { ...DEFAULT_SETTINGS, id: null };
  const hidden = Array.isArray(data.hiddenCategories) ? data.hiddenCategories : [];
  return {
    id: data.id || null,
    phone: data.phone || DEFAULT_SETTINGS.phone,
    whatsapp: data.whatsapp || DEFAULT_SETTINGS.whatsapp,
    address: data.address || DEFAULT_SETTINGS.address,
    hours: data.hours || DEFAULT_SETTINGS.hours,
    deliveryTime: data.deliveryTime || DEFAULT_SETTINGS.deliveryTime,
    spinnerOfferEnabled: data.spinnerOfferEnabled !== false,
    hiddenCategories: hidden.filter((id) => ALL_CATEGORY_IDS.includes(id)),
  };
}

export function isCategoryVisible(settings, categoryId) {
  if (!categoryId) return true;
  const hidden = settings?.hiddenCategories || [];
  return !hidden.includes(categoryId);
}

export function getVisibleCategoryIds(settings) {
  return ALL_CATEGORY_IDS.filter((id) => isCategoryVisible(settings, id));
}

/** Fields persisted to Firestore settings document */
export function pickSettingsPayload(form) {
  return {
    phone: form.phone ?? DEFAULT_SETTINGS.phone,
    whatsapp: form.whatsapp ?? DEFAULT_SETTINGS.whatsapp,
    address: form.address ?? DEFAULT_SETTINGS.address,
    hours: form.hours ?? DEFAULT_SETTINGS.hours,
    deliveryTime: form.deliveryTime ?? DEFAULT_SETTINGS.deliveryTime,
    spinnerOfferEnabled: form.spinnerOfferEnabled === false ? false : true,
    hiddenCategories: Array.isArray(form.hiddenCategories) ? form.hiddenCategories : [],
  };
}
