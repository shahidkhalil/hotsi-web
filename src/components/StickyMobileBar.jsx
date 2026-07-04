import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function StickyMobileBar() {
  const { cartCount, openCart } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.75);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky-mobile-bar" role="navigation" aria-label="Quick actions">
      <a href="#menu-section" className="sticky-mobile-bar-menu">
        View Menu
      </a>
      <button type="button" className="sticky-mobile-bar-cart" onClick={openCart}>
        <span>&#x1F6D2;</span>
        Cart
        {cartCount > 0 && <span className="sticky-mobile-bar-badge">{cartCount}</span>}
      </button>
    </div>
  );
}
