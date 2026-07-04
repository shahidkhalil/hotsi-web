import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { subscribeMenuItems } from '../firebase/services';
import { CATEGORY_TABS, MENU_DATA, IMAGE_KW, PIZZA_SIZES } from '../data/menuData';
import { buildMenuFromFirebaseItems, getVisibleCategoryTabs } from '../utils/menuFirebase';
import { getMenuImageSrc } from '../utils/cloudinary';
import { revealFadeElements } from '../utils/animations';

function MenuItemCard({ item, catId, index, kw, onAdd, onOpen }) {
  const delay = index % 3 === 1 ? ' d1' : index % 3 === 2 ? ' d2' : '';
  const seed = (catId.length * 131 + index * 17) % 9973;
  const priceLabel = item.priceLabel || `PKR ${(Number(item.price) || 0).toLocaleString()}`;
  const imgSrc = getMenuImageSrc(item, kw, seed);
  const badge = item.badge || (item.featured ? 'Popular' : null);

  return (
    <div
      className={`mi-card mi-card-v fu${delay}`}
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        if (e.target.closest('.mi-add')) return;
        onOpen(item.name, item.price, item.emoji, kw, seed, catId, item.imageUrl);
      }}
    >
      <div className="mi-img-wrap">
        {badge && <span className="mi-badge">{badge}</span>}
        <img
          className="mi-photo"
          loading="lazy"
          alt={item.name}
          src={imgSrc}
          onLoad={(e) => e.target.classList.add('loaded')}
          onError={(e) => {
            if (item.imageUrl) {
              e.target.style.display = 'none';
              return;
            }
            e.target.src = `https://loremflickr.com/400/220/${encodeURIComponent(kw)}?lock=${seed}`;
          }}
        />
      </div>
      <div className="mi-details">
        <div className="mi-name">{item.name}</div>
        {item.sub && <div className="mi-sub">{item.sub}</div>}
        <div className="mi-foot">
          <span className="mi-price">{priceLabel}</span>
          <button type="button" className="mi-add rp" onClick={(e) => { e.stopPropagation(); onAdd(item.name, item.price, item.emoji, catId); }}>+</button>
        </div>
      </div>
    </div>
  );
}

function PizzaCard({ name, index, onAdd, onOpen }) {
  const [selectedSize, setSelectedSize] = useState(0);
  const delay = index % 3 === 1 ? ' d1' : index % 3 === 2 ? ' d2' : '';
  const kw = 'pizza';
  const seed = ('pizza'.length * 131 + index * 17) % 9973;
  const price = PIZZA_SIZES[selectedSize].price;

  return (
    <div
      className={`mi-card fu${delay}`}
      style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}
      onClick={(e) => {
        if (e.target.closest('.mi-add') || e.target.closest('.sz-btn')) return;
        const sizeLabel = PIZZA_SIZES[selectedSize].label;
        onOpen(`${name} (${sizeLabel})`, price, '🍕', kw, seed, 'pizza');
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div className="mi-icon">🍕</div>
        <div className="mi-name" style={{ fontFamily: "'Clash Display',sans-serif", fontSize: '16px', fontWeight: 600 }}>{name}</div>
      </div>
      <div className="size-btns">
        {PIZZA_SIZES.map((sz, i) => (
          <button
            key={sz.label}
            type="button"
            className={`sz-btn${selectedSize === i ? ' active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setSelectedSize(i); }}
          >
            {sz.label} — PKR {sz.price.toLocaleString()}
          </button>
        ))}
      </div>
      <div className="mi-foot" style={{ width: '100%' }}>
        <span className="mi-price">PKR {price.toLocaleString()}</span>
        <button
          type="button"
          className="mi-add rp"
          onClick={(e) => {
            e.stopPropagation();
            const sizeLabel = PIZZA_SIZES[selectedSize].label;
            onAdd(`${name} (${sizeLabel})`, price, '🍕', 'pizza');
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function MenuSection() {
  const { activeMenuCat, showCat, openCart, addItem, openProduct } = useApp();
  const { isCategoryVisible } = useSiteSettings();
  const [firebaseItems, setFirebaseItems] = useState([]);

  useEffect(() => subscribeMenuItems(setFirebaseItems), []);

  const menuData = useMemo(() => {
    const fromFirebase = buildMenuFromFirebaseItems(firebaseItems);
    return fromFirebase || MENU_DATA;
  }, [firebaseItems]);

  const categoryTabs = useMemo(() => {
    const fromMenu = getVisibleCategoryTabs(menuData);
    const base = fromMenu.length > 0 ? fromMenu : CATEGORY_TABS;
    return base.filter((t) => isCategoryVisible(t.id));
  }, [menuData, isCategoryVisible]);

  const usingFirebase = firebaseItems.some((i) => i.available !== false);

  // Firebase menu loads after boot — reveal cards that missed the initial fade observer
  useEffect(() => {
    const id = requestAnimationFrame(() => revealFadeElements('#menu-section'));
    return () => cancelAnimationFrame(id);
  }, [menuData, activeMenuCat, firebaseItems.length]);

  useEffect(() => {
    if (categoryTabs.length > 0 && !categoryTabs.some((t) => t.id === activeMenuCat)) {
      showCat(categoryTabs[0].id);
    }
  }, [categoryTabs, activeMenuCat, showCat]);

  return (
    <section id="menu-section" className="section-divider-top">
      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }} className="fu">
          <div>
            <div className="sl">Full Menu</div>
            <h2 className="st">Order Now</h2>
            {usingFirebase && (
              <p style={{ fontSize: 13, color: 'rgba(17,17,17,0.45)', marginTop: 6 }}>Live menu from admin</p>
            )}
          </div>
          <button type="button" onClick={openCart} className="btn-primary rp" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>&#x1F6D2; View Cart</button>
        </div>
        <div className="menu-cats fu d1">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`mcat-btn${activeMenuCat === tab.id ? ' active' : ''}`}
              onClick={() => showCat(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {Object.entries(menuData)
          .filter(([catId]) => isCategoryVisible(catId))
          .map(([catId, data]) => {
          if (data.isDeals) {
            return (
              <div key={catId} className={`menu-category${activeMenuCat === catId ? ' show' : ''}`} id={`cat-${catId}`}>
                <div className="menu-sub-title">💰 HOTSI Deals</div>
                <div className="deal-grid">
                  {data.items.map((deal) => (
                    <div
                      key={deal.name}
                      className={`deal-mi fu ${deal.delay}`}
                      style={deal.featured ? { gridColumn: '1/-1', background: 'linear-gradient(135deg,#1a1a1a,var(--primary))' } : undefined}
                    >
                      {deal.imageUrl && (
                        <div className="deal-photo-wrap">
                          <img src={getMenuImageSrc(deal, 'fast-food,meal', 0, 600)} alt={deal.title} className="deal-photo" loading="lazy" />
                        </div>
                      )}
                      <div className="deal-badge" style={deal.featured ? { background: 'var(--secondary)', color: 'var(--dark)' } : undefined}>{deal.badge}</div>
                      <div className="deal-title" style={deal.featured ? { fontSize: '24px' } : undefined}>{deal.title}</div>
                      <div className="deal-items-list">{deal.list}</div>
                      <div className="deal-foot">
                        <span className="deal-price" style={deal.featured ? { fontSize: '36px' } : undefined}>PKR {deal.price.toLocaleString()}</span>
                        <button type="button" className="deal-add rp" onClick={() => addItem(deal.name, deal.price, deal.featured ? '👨‍👩‍👧' : '💰', 'deals')}>Add Deal</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={catId} className={`menu-category${activeMenuCat === catId ? ' show' : ''}`} id={`cat-${catId}`}>
              {data.sections.map((section, si) => (
                <div key={section.title}>
                  <div className="menu-sub-title">{section.title}</div>
                  <div className="menu-items-grid">
                    {section.pizzas ? section.pizzas.map((name, i) => (
                      <PizzaCard key={name} name={name} index={si * 10 + i} onAdd={addItem} onOpen={openProduct} />
                    )) : section.items.map((item, i) => (
                      <MenuItemCard
                        key={item.id || item.name}
                        item={item}
                        catId={catId}
                        index={si * 20 + i}
                        kw={IMAGE_KW[catId] || 'food'}
                        onAdd={addItem}
                        onOpen={openProduct}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
