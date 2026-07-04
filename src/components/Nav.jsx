import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useScrollSpy } from '../hooks/useScrollSpy';

const NAV_LINKS = [
  { href: '#hero', label: 'Menu', sectionId: 'hero', always: true },
  { href: '#menu-section', label: 'Pizza', sectionId: 'menu-section', category: 'pizza', menuCat: 'pizza' },
  { href: '#deals', label: 'Deals', sectionId: 'deals', category: 'deals' },
  { href: '#story', label: 'Story', sectionId: 'story', always: true },
  { href: '#gallery', label: 'Gallery', sectionId: 'gallery', always: true },
  { href: '#delivery', label: 'Delivery', sectionId: 'delivery', always: true },
];

export default function Nav() {
  const { cartCount, openCart, scrollToMenu } = useApp();
  const { isCategoryVisible } = useSiteSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = NAV_LINKS.filter((link) => link.always || isCategoryVisible(link.category));

  const sectionIds = useMemo(
    () => links.map((l) => l.sectionId).filter(Boolean),
    [links],
  );

  const activeSectionId = useScrollSpy(sectionIds);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const isActive = (link) => activeSectionId === link.sectionId;

  const handleNavClick = (e, link) => {
    if (link.menuCat) {
      e.preventDefault();
      scrollToMenu(link.menuCat);
      closeMenu();
    }
  };

  return (
    <>
      <nav id="nav" className={menuOpen ? 'menu-open' : ''}>
        <a href="#" className="nav-logo">HOT<span>SI</span></a>
        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={isActive(link) ? 'active' : ''}
                aria-current={isActive(link) ? 'true' : undefined}
                onClick={(e) => handleNavClick(e, link)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-cta">
          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
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
          <a href="#menu-section" className="btn-primary rp nav-order-btn">Order Now &#x2197;</a>
        </div>
      </nav>

      <div className={`nav-mobile-overlay${menuOpen ? ' open' : ''}`} onClick={closeMenu} aria-hidden={!menuOpen} />
      <div className={`nav-mobile-drawer${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <div className="nav-mobile-head">
          <span className="nav-mobile-title">Menu</span>
          <button type="button" className="nav-mobile-close" onClick={closeMenu} aria-label="Close menu">&#x2715;</button>
        </div>
        <ul className="nav-mobile-links">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={isActive(link) ? 'active' : ''}
                onClick={(e) => { handleNavClick(e, link); if (!link.menuCat) closeMenu(); }}
                aria-current={isActive(link) ? 'true' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-mobile-actions">
          <a href="#menu-section" className="hero-btn-main" onClick={closeMenu}>Order Now</a>
          <button type="button" className="btn-primary cart-badge-btn" onClick={() => { closeMenu(); openCart(); }}>
            Cart {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </>
  );
}
