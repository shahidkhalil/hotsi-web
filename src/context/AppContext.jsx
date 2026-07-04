import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { submitCustomerOrder } from '../firebase/services';
import { calcOrderTotal, formatItemsText, generateOrderId, openAdminOrderNotification, openWhatsAppContact } from '../utils/orderUtils';
import { useSiteSettings } from './SiteSettingsContext';
import {
  loadSpinReward,
  saveSpinReward,
  clearSpinReward,
  buildSpinCartAdd,
  mergeSpinLinesIntoCart,
  reconcileSpinCart,
  removeLinkedBogoFree,
  stripSpinFromCart,
} from '../utils/spinReward';

const AppContext = createContext(null);

export const PM_ADDONS = [
  { name: 'Extra Cheese', price: 80, emoji: '🧀' },
  { name: 'Extra Patty / Filling', price: 150, emoji: '🥩' },
  { name: 'Loaded Fries', price: 130, emoji: '🍟' },
  { name: 'Soft Drink (Regular)', price: 90, emoji: '🥤' },
  { name: 'Garlic Mayo Dip', price: 50, emoji: '🧄' },
];

export const PM_DESC = {
  burger: 'A flame-grilled patty stacked with melted cheese, crisp lettuce, fresh tomato and our signature HOTSI sauce — all hugged by a toasted brioche bun.',
  'fried-chicken': 'Double-breaded, golden and shatter-crisp on the outside, juicy and tender inside. Marinated in our secret blend of 11 spices.',
  shawarma: 'Slow-roasted marinated meat, shaved fresh off the spit and wrapped with garlic sauce, pickles and warm pita for that authentic street-food hit.',
  pizza: 'Hand-stretched dough, rich slow-cooked tomato base and a bubbling blanket of mozzarella, loaded with toppings and fired until the crust sings.',
  sandwich: 'Freshly toasted bread piled with premium fillings, crunchy salad and house-made sauces — simple, generous and seriously satisfying.',
  'wrap,burrito': 'A warm tortilla packed tight with seasoned filling, fresh veg and a zesty kick of sauce. Built for big bites on the go.',
  'french-fries': 'Golden, crispy and seasoned just right — then loaded with cheese, sauces and toppings until every fry is a treat.',
  'fast-food,meal': 'A complete HOTSI combo bundled for maximum flavour and value. Everything you love, in one box.',
};

export function AppProvider({ children }) {
  const { spinnerOfferEnabled, loaded: settingsLoaded } = useSiteSettings();
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [cartToast, setCartToast] = useState(null);
  const [activeMenuCat, setActiveMenuCat] = useState('burgers');
  const [activeCatCard, setActiveCatCard] = useState('burgers');
  const [booted, setBooted] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [pm, setPm] = useState({ name: '', base: 0, emoji: '🍔', kw: 'food', qty: 1, addons: new Set(), seed: 0, cat: '' });
  const [spinReward, setSpinReward] = useState(() => loadSpinReward());

  const activeSpinReward = useMemo(
    () => (spinnerOfferEnabled ? spinReward : null),
    [spinnerOfferEnabled, spinReward],
  );

  useEffect(() => {
    if (!settingsLoaded) return;
    if (spinnerOfferEnabled) return;
    clearSpinReward();
    setSpinReward(null);
    setCart((prev) => stripSpinFromCart(prev));
  }, [spinnerOfferEnabled, settingsLoaded]);

  useEffect(() => {
    if (spinReward && spinnerOfferEnabled) saveSpinReward(spinReward);
  }, [spinReward, spinnerOfferEnabled]);

  useEffect(() => {
    if (!cartOpen || !activeSpinReward) return;
    setCart((prev) => {
      const { cart: fixed, rewardUpdated } = reconcileSpinCart(prev, activeSpinReward);
      if (rewardUpdated) setSpinReward(rewardUpdated);
      if (JSON.stringify(fixed) === JSON.stringify(prev)) return prev;
      return fixed;
    });
  }, [cartOpen, activeSpinReward]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const setActiveSpinReward = useCallback((reward) => {
    setSpinReward(reward);
    if (reward) saveSpinReward(reward);
  }, []);

  /** Add item — BOGO free line auto-added on first paid spin-category item */
  const addItem = useCallback((name, price, emoji, categoryId = '') => {
    setPlacedOrder(null);
    let rewardUpdate = null;
    let toastNote = null;

    setCart((prev) => {
      const { lines, rewardUpdate: ru, toastNote: tn } = buildSpinCartAdd(
        name, price, emoji, categoryId, activeSpinReward, prev,
      );
      if (ru) rewardUpdate = ru;
      toastNote = tn;
      return mergeSpinLinesIntoCart(prev, lines);
    });

    if (rewardUpdate) setSpinReward(rewardUpdate);
    setCartToast({ name, emoji: emoji || '🍔', spinNote: toastNote });
  }, [activeSpinReward]);

  const clearCartToast = useCallback(() => setCartToast(null), []);

  const resetPlacedOrder = useCallback(() => setPlacedOrder(null), []);

  const openCart = useCallback(() => {
    setCartOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeCart = useCallback(() => {
    setCartOpen(false);
    setPlacedOrder(null);
    if (!productOpen) document.body.style.overflow = '';
  }, [productOpen]);

  const reconcileCart = useCallback((items) => {
    if (!activeSpinReward) return items;
    const { cart: fixed, rewardUpdated } = reconcileSpinCart(items, activeSpinReward);
    if (rewardUpdated) setSpinReward(rewardUpdated);
    return fixed;
  }, [activeSpinReward]);

  const changeQty = useCallback((idx, delta) => {
    setPlacedOrder(null);
    setCart((prev) => {
      const item = prev[idx];
      if (item?.isSpinFree) return prev;

      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + delta };

      if (next[idx].qty <= 0) {
        const removed = next[idx];
        let filtered = next.filter((_, i) => i !== idx);
        filtered = removeLinkedBogoFree(filtered, removed, activeSpinReward);
        return reconcileCart(filtered);
      }

      return reconcileCart(next);
    });
  }, [reconcileCart, activeSpinReward]);

  const removeItem = useCallback((idx) => {
    setPlacedOrder(null);
    setCart((prev) => {
      const removed = prev[idx];
      let next = prev.filter((_, i) => i !== idx);
      next = removeLinkedBogoFree(next, removed, activeSpinReward);

      if (removed?.isSpinFree && activeSpinReward?.prizeKey === 'free') {
        const { cart: fixed, rewardUpdated } = reconcileSpinCart(next, {
          ...activeSpinReward,
          freeItemUsed: false,
        });
        if (rewardUpdated) setSpinReward(rewardUpdated);
        return fixed;
      }

      return reconcileCart(next);
    });
  }, [reconcileCart, activeSpinReward]);

  const placeCartOrder = useCallback(async (customer) => {
    if (cart.length === 0) throw new Error('Cart is empty');
    const items = cart.map((i) => ({ ...i }));
    const total = calcOrderTotal(items);
    let result = { orderId: null, offline: true };
    try {
      result = await submitCustomerOrder({
        customerName: customer.name.trim(),
        contact: customer.contact.trim(),
        address: customer.address.trim(),
        items,
        itemsText: formatItemsText(items),
        total,
      });
    } catch {
      /* still show success + WhatsApp if Firebase fails */
    }
    const saved = {
      orderId: result?.orderId || generateOrderId(),
      customer: {
        name: customer.name.trim(),
        contact: customer.contact.trim(),
        address: customer.address.trim(),
      },
      items,
      total,
    };
    setPlacedOrder(saved);
    openAdminOrderNotification(saved.customer, saved.items, saved.total, saved.orderId);
    return saved;
  }, [cart]);

  const sendPlacedOrderWhatsApp = useCallback(() => {
    openWhatsAppContact();
    setCart([]);
    setPlacedOrder(null);
    setCartOpen(false);
    document.body.style.overflow = '';
  }, []);

  const showCat = useCallback((id) => {
    setActiveMenuCat(id);
    setActiveCatCard(id === 'chicken' ? 'burgers' : id);
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const scrollToMenu = useCallback((cat) => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => showCat(cat), 400);
  }, [showCat]);

  const openProduct = useCallback((name, price, emoji, kw, seed, cat, imageUrl = '') => {
    setPm({ name, base: price, emoji: emoji || '🍔', kw: kw || 'food', qty: 1, addons: new Set(), seed: parseInt(seed) || 0, cat: cat || '', imageUrl: imageUrl || '' });
    setProductOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeProduct = useCallback(() => {
    setProductOpen(false);
    if (!cartOpen) document.body.style.overflow = '';
  }, [cartOpen]);

  const pmRecalc = useCallback((state) => {
    let unit = state.base;
    state.addons.forEach((i) => { unit += PM_ADDONS[i].price; });
    return unit * state.qty;
  }, []);

  const pmQty = useCallback((d) => {
    setPm((prev) => ({ ...prev, qty: Math.max(1, prev.qty + d) }));
  }, []);

  const togglePmAddon = useCallback((idx) => {
    setPm((prev) => {
      const addons = new Set(prev.addons);
      if (addons.has(idx)) addons.delete(idx);
      else addons.add(idx);
      return { ...prev, addons };
    });
  }, []);

  const pmAddToCart = useCallback(() => {
    setPlacedOrder(null);
    let rewardUpdate = null;
    let toastNote = null;

    setPm((prev) => {
      let unit = prev.base;
      const extras = [];
      prev.addons.forEach((i) => { unit += PM_ADDONS[i].price; extras.push(PM_ADDONS[i].name); });
      const label = extras.length ? `${prev.name} (+ ${extras.join(', ')})` : prev.name;
      const cat = prev.cat || '';

      setCart((cartPrev) => {
        const { lines, rewardUpdate: ru, toastNote: tn } = buildSpinCartAdd(
          label, unit, prev.emoji, cat, activeSpinReward, cartPrev,
        );
        if (ru) rewardUpdate = ru;
        toastNote = tn;
        return mergeSpinLinesIntoCart(cartPrev, lines.map((l) => ({ ...l, qty: prev.qty })));
      });

      if (rewardUpdate) setSpinReward(rewardUpdate);
      setCartToast({ name: label, emoji: prev.emoji, spinNote: toastNote });
      return prev;
    });
    setProductOpen(false);
    setCartOpen(true);
    document.body.style.overflow = 'hidden';
  }, [activeSpinReward]);

  return (
    <AppContext.Provider value={{
      cart, cartCount, cartTotal, cartOpen, openCart, closeCart,
      addItem, changeQty, removeItem,
      placedOrder, placeCartOrder, sendPlacedOrderWhatsApp, resetPlacedOrder,
      cartToast, clearCartToast,
      activeMenuCat, activeCatCard, setActiveCatCard, showCat, scrollToMenu,
      booted, setBooted,
      productOpen, pm, openProduct, closeProduct, pmQty, togglePmAddon, pmAddToCart, pmRecalc,
      spinReward: activeSpinReward, setActiveSpinReward, spinnerOfferEnabled,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
