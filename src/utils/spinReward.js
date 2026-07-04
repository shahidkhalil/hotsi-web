const STORAGE_KEY = 'hotsi_spin_reward_v1';

export const SPIN_PRIZES = [
  {
    key: 'free',
    label: 'Get One Free',
    icon: '🎁',
    desc: 'Buy 1 item from your category, get the 2nd one FREE!',
    color: '#FF6B35',
    discount: 1,
  },
  { key: 'ten', label: '10% Off', icon: '💸', desc: '10% off items from your winning category', color: '#FFC857', discount: 0.1 },
  { key: 'twenty', label: '20% Off', icon: '🔥', desc: '20% off items from your winning category', color: '#16A34A', discount: 0.2 },
];

export function loadSpinReward() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.foodId || !data?.prizeKey) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveSpinReward(reward) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...reward,
    savedAt: new Date().toISOString(),
  }));
}

export function clearSpinReward() {
  localStorage.removeItem(STORAGE_KEY);
}

export function countPaidCategoryUnits(cart, categoryId) {
  return (cart || [])
    .filter((i) => i.categoryId === categoryId && (i.price || 0) > 0)
    .reduce((s, i) => s + i.qty, 0);
}

export function countFreeCategoryUnits(cart, categoryId) {
  return (cart || [])
    .filter((i) => i.categoryId === categoryId && (i.price || 0) === 0 && (i.isSpinFree || i.spinNote))
    .reduce((s, i) => s + i.qty, 0);
}

export function cartHasPaidItems(cart) {
  return (cart || []).some((i) => (i.price || 0) > 0);
}

export function cartHasSpinCategoryItems(cart, foodId) {
  if (!foodId) return false;
  return (cart || []).some((i) => i.categoryId === foodId);
}

/** Cart must include at least one paid item before checkout */
export function canPlaceOrder(cart) {
  return cartHasPaidItems(cart);
}

/**
 * Apply spin discount for percent-off prizes only.
 * BOGO free lines are added automatically via buildSpinCartAdd.
 */
export function applySpinPrice(basePrice, categoryId, reward, cart = []) {
  if (!reward || reward.foodId !== categoryId) {
    return { price: basePrice, spinNote: null };
  }

  if (reward.prizeKey === 'free') {
    return { price: basePrice, spinNote: null };
  }

  const prize = SPIN_PRIZES.find((p) => p.key === reward.prizeKey);
  if (!prize) return { price: basePrice, spinNote: null };

  const discounted = Math.round(basePrice * (1 - prize.discount));
  return {
    price: discounted,
    spinNote: `${prize.label} on ${reward.foodName}`,
  };
}

export function markFreeItemUsed(reward) {
  if (!reward || reward.prizeKey !== 'free') return reward;
  return { ...reward, freeItemUsed: true };
}

function mergeLineIntoCart(cart, line) {
  const spinNote = line.spinNote || '';
  const existing = cart.find(
    (i) => i.name === line.name
      && i.price === line.price
      && (i.spinNote || '') === spinNote
      && !!i.isSpinFree === !!line.isSpinFree,
  );
  if (existing) {
    return cart.map((i) => (i === existing ? { ...i, qty: i.qty + (line.qty || 1) } : i));
  }
  return [...cart, { ...line, qty: line.qty || 1 }];
}

/**
 * Build cart lines for a new add — BOGO auto-includes a free line on first paid spin-category item.
 */
export function buildSpinCartAdd(name, price, emoji, categoryId, reward, prevCart = []) {
  const baseLine = {
    name,
    price,
    originalPrice: price,
    emoji: emoji || '🍔',
    qty: 1,
    categoryId: categoryId || '',
    spinNote: '',
  };

  if (!reward || !categoryId || reward.foodId !== categoryId) {
    return { lines: [baseLine], rewardUpdate: null, toastNote: null };
  }

  if (reward.prizeKey === 'free') {
    const paidUnits = countPaidCategoryUnits(prevCart, categoryId);
    const freeUnits = countFreeCategoryUnits(prevCart, categoryId);

    if (paidUnits === 0 && freeUnits === 0 && !reward.freeItemUsed) {
      return {
        lines: [
          baseLine,
          {
            name,
            price: 0,
            originalPrice: price,
            emoji: emoji || '🍔',
            qty: 1,
            categoryId,
            spinNote: '🎁 Spin reward — FREE item!',
            isSpinFree: true,
          },
        ],
        rewardUpdate: markFreeItemUsed(reward),
        toastNote: '🎁 FREE item added to your order!',
      };
    }

    return { lines: [baseLine], rewardUpdate: null, toastNote: null };
  }

  const applied = applySpinPrice(price, categoryId, reward, prevCart);
  return {
    lines: [{
      ...baseLine,
      price: applied.price,
      spinNote: applied.spinNote || '',
    }],
    rewardUpdate: null,
    toastNote: applied.spinNote,
  };
}

export function mergeSpinLinesIntoCart(prevCart, lines) {
  return lines.reduce((cart, line) => mergeLineIntoCart(cart, line), [...prevCart]);
}

/** Cart footer hint — only when spin-category items are in the cart */
export function getSpinCartHint(reward, cart) {
  if (!reward || reward.prizeKey !== 'free') return null;
  if (!cartHasSpinCategoryItems(cart, reward.foodId)) return null;

  const paid = countPaidCategoryUnits(cart, reward.foodId);
  const free = countFreeCategoryUnits(cart, reward.foodId);

  if (paid > 0 && free > 0) return null;

  return `🎁 Add a ${reward.foodName} item — your FREE reward will be added automatically!`;
}

/** Whether an item should show its spin note in the cart UI */
export function shouldShowSpinNote(item, reward) {
  if (!item.spinNote) return false;
  if (item.isSpinFree) return true;
  if (!reward) return false;
  return item.categoryId === reward.foodId;
}

export function getLineLabel(item) {
  if ((item.price || 0) === 0 && (item.isSpinFree || item.spinNote)) return 'FREE';
  if (item.originalPrice && item.originalPrice > item.price) return 'DISCOUNT';
  return 'PAID';
}

/** Receipt breakdown for cart drawer */
export function buildCartReceipt(cart) {
  let subtotal = 0;
  let savings = 0;
  let paidCount = 0;
  let freeCount = 0;

  (cart || []).forEach((item) => {
    const orig = item.originalPrice ?? item.price;
    const lineOrig = orig * item.qty;
    const lineFinal = item.price * item.qty;
    subtotal += lineOrig;
    savings += Math.max(0, lineOrig - lineFinal);
    if ((item.price || 0) === 0 && (item.isSpinFree || item.spinNote)) freeCount += item.qty;
    else if ((item.price || 0) > 0) paidCount += item.qty;
  });

  return {
    subtotal,
    savings,
    total: (cart || []).reduce((s, i) => s + i.price * i.qty, 0),
    paidCount,
    freeCount,
  };
}

/** Remove orphan free lines when no paid spin-category item remains */
export function reconcileSpinCart(cart, reward) {
  if (!reward || reward.prizeKey !== 'free') return { cart, rewardUpdated: null };

  const paid = countPaidCategoryUnits(cart, reward.foodId);
  if (paid > 0) return { cart, rewardUpdated: null };

  let changed = false;
  const next = (cart || []).filter((item) => {
    const isFreeSpin = item.categoryId === reward.foodId
      && (item.price || 0) === 0
      && (item.isSpinFree || item.spinNote);
    if (isFreeSpin) {
      changed = true;
      return false;
    }
    return true;
  });

  if (!changed) return { cart: next, rewardUpdated: null };
  return {
    cart: next,
    rewardUpdated: { ...reward, freeItemUsed: false },
  };
}

/** Remove spin discounts / free lines when special offer is disabled */
export function stripSpinFromCart(cart) {
  return (cart || [])
    .filter((item) => !item.isSpinFree)
    .map((item) => {
      const orig = item.originalPrice ?? item.price;
      if (item.spinNote || (item.originalPrice != null && item.price !== orig)) {
        return { ...item, price: orig, spinNote: '' };
      }
      return item;
    });
}

/** When a paid BOGO item is removed, also remove its linked free line */
export function removeLinkedBogoFree(cart, removedItem, reward) {
  if (!removedItem || !reward || reward.prizeKey !== 'free') return cart;
  if ((removedItem.price || 0) <= 0) return cart;
  if (removedItem.categoryId !== reward.foodId) return cart;

  return cart.filter(
    (item) => !(item.isSpinFree && item.name === removedItem.name && item.categoryId === removedItem.categoryId),
  );
}
