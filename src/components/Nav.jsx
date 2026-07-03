import { useApp } from '../context/AppContext';

export default function Nav() {
  const { cartCount, openCart } = useApp();

  return (
    <nav id="nav">
      <a href="#" className="nav-logo">HOT<span>SI</span></a>
      <ul className="nav-links">
        <li><a href="#categories">Menu</a></li>
        <li><a href="#pizza">Pizza</a></li>
        <li><a href="#deals">Deals</a></li>
        <li><a href="#story">Story</a></li>
        <li><a href="#gallery">Gallery</a></li>
        <li><a href="#delivery">Delivery</a></li>
      </ul>
      <div className="nav-cta">
        <button
          type="button"
          onClick={openCart}
          className="btn-primary cart-badge-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', border: 'none' }}
          id="cart-nav-btn"
        >
          <span>&#x1F6D2;</span> Cart{' '}
          {cartCount > 0 && <span className="badge" id="nav-badge">{cartCount}</span>}
        </button>
        <a href="#menu-section" className="btn-primary rp">Order Now &#x2197;</a>
      </div>
    </nav>
  );
}
