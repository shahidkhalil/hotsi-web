import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PM_ADDONS, PM_DESC } from '../context/AppContext';
import { getProductImageSrc } from '../utils/cloudinary';

export default function Cart() {
  const {
    cart, cartCount, cartTotal, cartOpen, closeCart,
    changeQty, removeItem, placedOrder, placeCartOrder, sendPlacedOrderWhatsApp,
  } = useApp();

  const [form, setForm] = useState({ name: '', contact: '', address: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.contact.trim()) next.contact = 'Contact is required';
    else if (!/^[\d\s+\-()]{7,}$/.test(form.contact.trim())) next.contact = 'Enter a valid phone number';
    if (!form.address.trim()) next.address = 'Address is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await placeCartOrder(form);
    } catch {
      alert('Could not save order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div id="cart-overlay" className={cartOpen ? 'open' : ''} onClick={closeCart} />
      <div id="cart-drawer" className={cartOpen ? 'open' : ''}>
        <div className="cart-head">
          <h3>Your Order <span className="cart-count">{cartCount}</span></h3>
          <button type="button" className="cart-close" onClick={closeCart}>&#x2715;</button>
        </div>

        <div id="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty" id="cart-empty">
              <span>&#x1F6D2;</span>
              <p>Your cart is empty.<br />Tap <strong>+</strong> on menu items to add them here.</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div className="ci" key={`${item.name}-${idx}`}>
                <div className="ci-emoji">{item.emoji}</div>
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-price">PKR {(item.price * item.qty).toLocaleString()}</div>
                  {!placedOrder && (
                    <div className="ci-qty">
                      <button type="button" className="qty-btn" onClick={() => changeQty(idx, -1)}>&#x2212;</button>
                      <span className="qty-num">{item.qty}</span>
                      <button type="button" className="qty-btn" onClick={() => changeQty(idx, 1)}>+</button>
                      <button type="button" className="ci-del" onClick={() => removeItem(idx)} title="Remove">&#x1F5D1;</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-foot" id="cart-foot">
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-num" id="cart-total">PKR {cartTotal.toLocaleString()}</span>
            </div>

            {placedOrder ? (
              <div className="cart-success">
                <div className="cart-success-icon">&#x2705;</div>
                <p className="cart-success-title">Order Saved!</p>
                <p className="cart-success-id">Order ID: <strong>{placedOrder.orderId}</strong></p>
                <p className="cart-success-hint">WhatsApp opened with your order details — tap <strong>Send</strong> to notify HOTSI.</p>
                <button type="button" className="cart-wa-btn" onClick={sendPlacedOrderWhatsApp}>
                  <span>&#x1F4AC;</span> Contact on WhatsApp
                </button>
              </div>
            ) : (
              <form className="cart-checkout-form" onSubmit={handlePlaceOrder}>
                <p className="cart-form-title">Delivery Details</p>
                <div className="cart-field">
                  <label htmlFor="cart-name">Full Name</label>
                  <input
                    id="cart-name"
                    className={errors.name ? 'error' : ''}
                    placeholder="Your name"
                    value={form.name}
                    onChange={set('name')}
                    autoComplete="name"
                  />
                  {errors.name && <span className="cart-field-error">{errors.name}</span>}
                </div>
                <div className="cart-field">
                  <label htmlFor="cart-contact">Contact</label>
                  <input
                    id="cart-contact"
                    className={errors.contact ? 'error' : ''}
                    placeholder="03XX XXXXXXX"
                    value={form.contact}
                    onChange={set('contact')}
                    autoComplete="tel"
                  />
                  {errors.contact && <span className="cart-field-error">{errors.contact}</span>}
                </div>
                <div className="cart-field">
                  <label htmlFor="cart-address">Address</label>
                  <textarea
                    id="cart-address"
                    className={errors.address ? 'error' : ''}
                    placeholder="House, street, area, city…"
                    value={form.address}
                    onChange={set('address')}
                    rows={2}
                  />
                  {errors.address && <span className="cart-field-error">{errors.address}</span>}
                </div>
                <button type="submit" className="cart-place-btn" disabled={saving}>
                  {saving ? 'Saving order…' : 'Place Order'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function ProductModal() {
  const { productOpen, pm, closeProduct, pmQty, togglePmAddon, pmAddToCart, pmRecalc } = useApp();

  if (!productOpen) {
    return (
      <>
        <div id="product-overlay" />
        <div id="product-modal" />
      </>
    );
  }

  const sd = pm.seed || 7;
  const rating = (4.3 + (sd % 7) / 10).toFixed(1);
  const reviews = 40 + (sd % 460);
  const full = Math.round(parseFloat(rating));
  const stars = '★'.repeat(full) + '☆'.repeat(5 - full);
  const showTag = sd % 3 === 0;
  const total = pmRecalc(pm);
  const imgSrc = getProductImageSrc(pm.imageUrl, pm.kw, sd);

  return (
    <>
      <div id="product-overlay" className="open" onClick={closeProduct} />
      <div id="product-modal" className="open">
        <button type="button" className="pm-close" onClick={closeProduct}>&#x2715;</button>
        <div className="pm-grid">
          <div className="pm-media">
            <span className="pm-emoji">{pm.emoji}</span>
            <img
              id="pm-img"
              alt=""
              src={imgSrc}
              onLoad={(e) => e.target.classList.add('loaded')}
              onError={(e) => { e.target.removeAttribute('src'); e.target.classList.remove('loaded'); }}
            />
            {showTag && <span className="pm-tag" id="pm-tag">Bestseller</span>}
          </div>
          <div className="pm-info">
            <div className="pm-cat" id="pm-cat">{(pm.cat || 'menu').replace(/-/g, ' ')}</div>
            <h2 className="pm-name" id="pm-name">{pm.name}</h2>
            <div className="pm-rating">
              <span className="pm-stars" id="pm-stars">{stars}</span>
              <span id="pm-reviews">{rating} ({reviews} reviews)</span>
            </div>
            <p className="pm-desc" id="pm-desc">{PM_DESC[pm.kw] || 'A HOTSI favourite, made fresh to order with premium ingredients.'}</p>
            <div className="pm-addons">
              <div className="pm-section-title">Make It Yours</div>
              <div className="pm-addon-list" id="pm-addon-list">
                {PM_ADDONS.map((a, idx) => (
                  <div
                    key={a.name}
                    className={`pm-addon${pm.addons.has(idx) ? ' active' : ''}`}
                    onClick={() => togglePmAddon(idx)}
                  >
                    <span className="pm-addon-left">
                      <span className="pm-addon-check">&#x2713;</span>
                      {a.emoji} {a.name}
                    </span>
                    <span className="pm-addon-price">+PKR {a.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pm-foot">
              <div className="pm-qty">
                <button type="button" onClick={() => pmQty(-1)}>&#x2212;</button>
                <span id="pm-qty-num">{pm.qty}</span>
                <button type="button" onClick={() => pmQty(1)}>+</button>
              </div>
              <button type="button" className="pm-add" onClick={pmAddToCart}>
                Add to Cart &middot; <span id="pm-total">PKR {total.toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
