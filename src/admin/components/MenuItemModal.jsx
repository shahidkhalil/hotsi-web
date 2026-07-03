import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MENU_CATEGORIES } from '../../utils/menuFirebase';
import MenuImageUpload from './MenuImageUpload';

export default function MenuItemModal({ mode, form, setForm, onSubmit, onClose, saving }) {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const isView = mode === 'view';

  useEffect(() => {
    const overlay = overlayRef.current;
    const card = cardRef.current;
    if (!overlay || !card) return undefined;
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(card, { opacity: 0, y: 32, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.4)' });
    return () => {
      gsap.killTweensOf([overlay, card]);
    };
  }, [mode]);

  const title = mode === 'create' ? 'Add Product' : mode === 'edit' ? 'Edit Product' : 'Product Details';

  const handleCategoryChange = (category) => {
    const cat = MENU_CATEGORIES.find((c) => c.id === category);
    setForm((f) => ({ ...f, category, emoji: cat?.emoji || f.emoji }));
  };

  return (
    <div className="admin-modal-overlay" ref={overlayRef} onClick={onClose}>
      <div className="admin-modal admin-menu-modal" ref={cardRef} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h2>{title}</h2>
          <button type="button" className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="admin-form-grid">
            <MenuImageUpload form={form} setForm={setForm} disabled={isView} />

            <div className="admin-field full">
              <label className="admin-label">Product Name *</label>
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={isView}
                placeholder="e.g. Zinger Burger"
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Price (PKR) *</label>
              <input
                className="admin-input"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                disabled={isView}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Category *</label>
              <select
                className="admin-select"
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={isView}
              >
                {MENU_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Emoji</label>
              <input
                className="admin-input"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                maxLength={4}
                disabled={isView}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Section</label>
              <input
                className="admin-input"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                disabled={isView}
                placeholder="e.g. Classic Burgers"
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Subtitle</label>
              <input
                className="admin-input"
                value={form.sub}
                onChange={(e) => setForm({ ...form, sub: e.target.value })}
                disabled={isView}
                placeholder="e.g. Large / Small"
              />
            </div>
            <div className="admin-field full">
              <label className="admin-label">Description</label>
              <textarea
                className="admin-input admin-textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={isView}
                rows={3}
                placeholder="Deal contents or extra notes…"
              />
            </div>
            {form.category === 'deals' && (
              <>
                <div className="admin-field">
                  <label className="admin-label">Deal Badge</label>
                  <input
                    className="admin-input"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    disabled={isView}
                    placeholder="e.g. Deal 1"
                  />
                </div>
                <div className="admin-field admin-field-check">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      disabled={isView}
                    />
                    Featured deal
                  </label>
                </div>
              </>
            )}
            <div className="admin-field admin-field-check">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  disabled={isView}
                />
                Available on website
              </label>
            </div>
          </div>

          <div className="admin-modal-actions">
            <button type="button" className="admin-btn-sm" onClick={onClose}>
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && (
              <button type="submit" className="admin-btn-sm success" disabled={saving}>
                {saving ? 'Saving…' : mode === 'edit' ? 'Update Product' : 'Create Product'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
