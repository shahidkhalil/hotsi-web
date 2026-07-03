export const CATEGORY_TABS = [
  { id: 'burgers', label: '🍔 Burgers' },
  { id: 'shawarma', label: '🌯 Shawarma' },
  { id: 'pizza', label: '🍕 Pizza' },
  { id: 'sandwiches', label: '🥪 Sandwiches' },
  { id: 'wraps', label: '🌯 Wraps & Rolls' },
  { id: 'fries', label: '🍟 Fries & Sides' },
  { id: 'chicken', label: '🍗 Fried Chicken' },
  { id: 'deals', label: '💰 Deals' },
];

export const CAT_CARDS = [
  { id: 'burgers', emoji: '🍔', name: 'Burgers' },
  { id: 'shawarma', emoji: '🌯', name: 'Shawarma' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza' },
  { id: 'sandwiches', emoji: '🥪', name: 'Sandwiches' },
  { id: 'wraps', emoji: '🌯', name: 'Wraps' },
  { id: 'fries', emoji: '🍟', name: 'Fries' },
  { id: 'deals', emoji: '💰', name: 'Deals' },
];

export const IMAGE_KW = {
  burgers: 'burger',
  chicken: 'fried-chicken',
  shawarma: 'shawarma',
  pizza: 'pizza',
  sandwiches: 'sandwich',
  wraps: 'wrap,burrito',
  fries: 'french-fries',
  deals: 'fast-food,meal',
};

const item = (name, price, emoji, sub) => ({ name, price, emoji, sub });

export const MENU_DATA = {
  burgers: {
    sections: [{ title: '🍔 Classic Burgers', items: [
      item('Steak Burger', 630, '🍔'), item('Fajita Burger', 630, '🍔'), item('Tower Burger', 520, '🍔'),
      item('Saucy Grill', 480, '🍔'), item('Special Saucy', 530, '🍔'), item('Pizza Grill', 580, '🍔'),
      item('Pizza Burger', 480, '🍔'), item('Zinger Burger', 350, '🍔'), item('Patty Burger', 280, '🍔'),
      item('Zee Pizza Burger', 510, '🍔'), item('Malai Boti Burger', 450, '🍔'), item('Chat Patta Burger', 400, '🍔'),
      item('Molten Lava TT', 700, '🍔'),
    ]}],
  },
  shawarma: {
    sections: [
      { title: '🌯 Shawarma', items: [
        item('BBQ Special Shawarma', 490, '🌯'), item('Jumbo Shawarma', 400, '🌯'), item('Small Shawarma', 300, '🌯'),
        item('Zinger Shawarma', 370, '🌯'), item('Doner Shawarma', 420, '🌯'), item('Malai Boti Shawarma', 450, '🌯'),
        item('Steak Shawarma', 450, '🌯'), item('Molten Lava Shawarma', 600, '🌯'),
      ]},
      { title: '🍽️ Platters', items: [
        item('BBQ Special Platter', 920, '🍽️'), item('Turkish Special Platter', 990, '🍽️'), item('Chicken Platter', 750, '🍽️'),
        item('Pratha Platter', 800, '🍽️'), item('Malai Boti Platter', 880, '🍽️'), item('Steak Platter', 880, '🍽️'),
      ]},
    ],
  },
  pizza: {
    sections: [
      {
        title: '🍕 Pizza — Choose Your Size',
        pizzas: [
          'BBQ Chicken', 'Chicken Fajita', 'Veggie Lover', 'Chicken Tikka', 'Super Supreme',
          'Malai Boti Pizza', 'Kabab Lover', 'Cheese Lover', 'Stick Pizza', 'Lasagna Pizza',
        ],
      },
      { title: '🌙 Mid Night Craving', items: [
        item('2 Medium Pizza + 1.5L Drink', 2100, '🍕'), item('2 Large Pizza + 1.5L Drink', 3000, '🍕'),
      ]},
    ],
  },
  sandwiches: {
    sections: [{ title: '🥪 Sandwiches', items: [
      item('Grilled Sandwich', 550, '🥪'), item('Malai Boti Sandwich', 550, '🥪'), item('Chicken Sandwich', 450, '🥪'),
      item('Club Sandwich', 420, '🥪'), item('Tikka Sandwich', 490, '🥪'), item('Fajita Sandwich', 490, '🥪'),
      item('Steak Sandwich', 550, '🥪'),
    ]}],
  },
  wraps: {
    sections: [
      { title: '🌯 Wraps', items: [
        item('Special Turkish Burrito (L)', 630, '🌯', 'Large'), item('Special Turkish Burrito (S)', 530, '🌯', 'Small'),
        item('Zinger Wrap', 520, '🌯'), item('Steak Wrap', 700, '🌯'), item('Malai Boti Wrap', 700, '🌯'),
        item('Molten Lava Wrap', 850, '🌯'),
      ]},
      { title: '🍞 Paratha Rolls', items: [
        item('BBQ Special Roll', 420, '🍞'), item('Zinger Roll', 450, '🍞'), item('Malai Boti Roll', 450, '🍞'),
        item('Steak Roll', 450, '🍞'),
      ]},
    ],
  },
  fries: {
    sections: [
      { title: '🍟 Fries', items: [
        { name: 'Regular Fries', price: 150, emoji: '🍟', sub: 'Small / Large', priceLabel: 'PKR 150 / 230' }, item('Saucy Fries', 280, '🍟'), item('Family Fries', 330, '🍟'),
        item('Wehshi Fries', 430, '🍟'), item('Pizza Loaded Fries', 530, '🍕'),
      ]},
      { title: '🧀 Add-Ons', items: [
        item('Cheese Slice', 80, '🧀'), item('Beef Patty', 180, '🥩'), item('Steak Pics', 160, '🥩'),
        item('Extra Bread', 60, '🍞'), item('Mushroom', 70, '🍄'), item('Jalapeno', 70, '🌶️'), { name: 'Dips', price: 70, emoji: '🥡', priceLabel: 'PKR 60–100' },
      ]},
      { title: '🥤 Beverages', items: [
        item('Drink 330ml', 70, '🥤'), item('Drink 500ml', 130, '🥤'), item('Drink 1.5L', 250, '🥤'),
      ]},
    ],
  },
  chicken: {
    sections: [{ title: '🍗 Fried Chicken', items: [
      item('Hot Wings 5pcs', 380, '🍗'), item('Hot Wings 10pcs', 650, '🍗'), item('Chicken Piece 1pc', 310, '🍗'),
      item('Chicken Piece 5pcs', 1300, '🍗'), item('Nuggets 5pcs', 310, '🍗'), item('Nuggets 10pcs', 510, '🍗'),
    ]}],
  },
  deals: {
    isDeals: true,
    items: [
      { badge: 'Deal 1', title: 'Zinger Combo', list: '1 Zinger + 1 Reg Fries + 350ml Drink', price: 550, name: 'Deal 1 — Zinger Combo', delay: '' },
      { badge: 'Deal 2', title: 'Chicken Sandwich Combo', list: '1 Chicken Sandwich + Reg Fries + 350ml Drink', price: 650, name: 'Deal 2 — Chicken Sandwich Combo', delay: 'd1' },
      { badge: 'Deal 3', title: 'Hot Wings Party', list: '10 Hot Wings + Half Fries + Half Liter', price: 650, name: 'Deal 3 — Hot Wings Party', delay: 'd2' },
      { badge: 'Deal 4', title: 'Chicken Feast', list: '3 Chicken Pcs + Half Liter', price: 750, name: 'Deal 4 — Chicken Feast', delay: '' },
      { badge: 'Deal 5', title: 'Chicken Box', list: '1 Chicken Pc + 1 Patty Burger + Reg Fries + Half Liter', price: 700, name: 'Deal 5 — Chicken Box', delay: 'd1' },
      { badge: 'Deal 6', title: 'Doner Double', list: '2 Doner + Reg Fries + Half Liter', price: 999, name: 'Deal 6 — Doner Double', delay: 'd2' },
      { badge: 'Deal 7', title: 'Pizza Night', list: '2 Small Pizzas + Half Liter + Reg Fries', price: 1200, name: 'Deal 7 — Pizza Night', delay: '' },
      { badge: 'Deal 8', title: 'Wrap & Shawarma', list: 'Zinger Wrap + Pocket Shawarma + Full Fries + Half Liter', price: 1250, name: 'Deal 8 — Wrap & Shawarma', delay: 'd1' },
      { badge: 'Deal 9', title: 'Saucy Grill Box', list: '2 Saucy Grill + 2 Chicken Pcs + Reg Fries + Half Liter', price: 1199, name: 'Deal 9 — Saucy Grill Box', delay: 'd2' },
      { badge: 'Deal 10', title: 'Zinger Burger Box', list: '2 Zinger Burgers + 2 Chicken Pcs + Reg Fries + Half Liter', price: 1350, name: 'Deal 10 — Zinger Burger Box', delay: '' },
      { badge: 'Combo 1', title: 'Shawarma Mega', list: '3 BBQ Special Shawarma + 2 Zinger Shawarma + 1.5L Drink', price: 2150, name: 'Combo Deal 1 — Shawarma Mega', delay: 'd1' },
      { badge: 'Combo 2', title: 'Burger & Sandwich', list: '3 Zinger Burgers + 2 Tikka/Fajita Sandwiches + 1.5L Drink', price: 2250, name: 'Combo Deal 2 — Burger & Sandwich', delay: 'd2' },
      { badge: 'Combo 3', title: 'Burger Party', list: '8 Zinger Burgers + Family Fries + 1 Ltr', price: 1850, name: 'Combo Deal 3 — Burger Party', delay: '' },
      { badge: 'Combo 4', title: 'Doner & Burger', list: '3 Doner + Family Fries + 2 Zinger Burgers + 1 Ltr', price: 1350, name: 'Combo Deal 4 — Doner & Burger', delay: 'd1' },
      { badge: 'Family Deal', title: '👨‍👩‍👧 Ultimate Family Deal', list: '1 Large Pizza + 1 BBQ Special Platter + 2 Zinger Burgers + 3 Chicken Pieces + 1 Family Fries + 1.5L Drink', price: 3400, name: 'Family Deal — Ultimate', delay: 'd2', featured: true },
    ],
  },
};

export const PIZZA_SIZES = [
  { label: 'S', price: 550 },
  { label: 'M', price: 1100 },
  { label: 'L', price: 1500 },
];

export function countWebsiteMenuItems() {
  let count = 0;
  Object.values(MENU_DATA).forEach((cat) => {
    cat.sections?.forEach((sec) => {
      count += sec.items?.length || 0;
    });
    count += cat.deals?.length || 0;
  });
  return count;
}
