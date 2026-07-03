import { MENU_DATA, PIZZA_SIZES } from '../data/menuData.js';

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Flatten all website menu products for Firestore seeding */
export function extractAllMenuProducts() {
  const products = [];

  const push = (product) => {
    products.push({
      available: true,
      source: 'hotsi-seed',
      ...product,
    });
  };

  Object.entries(MENU_DATA).forEach(([category, catData]) => {
    if (catData.isDeals && catData.items) {
      catData.items.forEach((deal, index) => {
        const slug = `deals-${slugify(deal.badge || `deal-${index + 1}`)}`;
        push({
          slug,
          name: deal.name || deal.title,
          price: deal.price,
          category: 'deals',
          emoji: deal.featured ? '👨‍👩‍👧' : '💰',
          description: deal.list || '',
          badge: deal.badge || '',
          featured: Boolean(deal.featured),
          section: 'Deals & Combos',
        });
      });
      return;
    }

    catData.sections?.forEach((section) => {
      if (section.pizzas) {
        section.pizzas.forEach((pizzaName) => {
          PIZZA_SIZES.forEach((sz) => {
            push({
              slug: `pizza-${slugify(pizzaName)}-${sz.label.toLowerCase()}`,
              name: `${pizzaName} (${sz.label})`,
              price: sz.price,
              category: 'pizza',
              emoji: '🍕',
              section: section.title,
              size: sz.label,
              pizzaFlavor: pizzaName,
            });
          });
        });
      }

      section.items?.forEach((item) => {
        push({
          slug: `${category}-${slugify(item.name)}`,
          name: item.name,
          price: item.price,
          category,
          emoji: item.emoji || '🍔',
          section: section.title,
          sub: item.sub || '',
          priceLabel: item.priceLabel || '',
        });
      });
    });
  });

  return products;
}

export function countSeedMenuProducts() {
  return extractAllMenuProducts().length;
}
