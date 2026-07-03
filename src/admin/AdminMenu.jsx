import { useEffect, useMemo, useState } from 'react';
import {
  subscribeMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedAllMenuItems,
} from '../firebase/services';
import { countSeedMenuProducts } from '../firebase/seedMenu';
import {
  EMPTY_MENU_FORM,
  MENU_CATEGORIES,
  formToMenuData,
  menuItemToForm,
} from '../utils/menuFirebase';
import MenuItemModal from './components/MenuItemModal';
import { cloudinaryThumb } from '../utils/cloudinary';

const SEED_COUNT = countSeedMenuProducts();

function MenuProductCard({ item, onView, onEdit, onDelete, onToggle }) {
  const thumb = item.imageUrl ? cloudinaryThumb(item.imageUrl, 120, 120) : null;

  return (
    <article className="admin-menu-card">
      <div className="admin-menu-card-top">
        {thumb ? (
          <img src={thumb} alt={item.name} className="admin-menu-card-photo" />
        ) : (
          <div className="admin-menu-card-icon">{item.emoji || '🍔'}</div>
        )}
        <div className="admin-menu-card-info">
          <h3>{item.name}</h3>
          <p>{item.section || item.category}</p>
        </div>
        <span className={`admin-badge ${item.available !== false ? 'admin-badge-confirmed' : 'admin-badge-cancelled'}`}>
          {item.available !== false ? 'Live' : 'Hidden'}
        </span>
      </div>
      <div className="admin-menu-card-meta">
        <span className="admin-menu-card-cat">{item.category}</span>
        <strong>PKR {(item.price || 0).toLocaleString()}</strong>
      </div>
      {item.description && <p className="admin-menu-card-desc">{item.description}</p>}
      <div className="admin-menu-card-actions">
        <button type="button" className="admin-order-action-btn" onClick={() => onView(item)}>View</button>
        <button type="button" className="admin-order-action-btn" onClick={() => onEdit(item)}>Edit</button>
        <button type="button" className="admin-order-action-btn" onClick={() => onToggle(item)}>
          {item.available !== false ? 'Hide' : 'Show'}
        </button>
        <button type="button" className="admin-order-action-btn danger" onClick={() => onDelete(item)}>Delete</button>
      </div>
    </article>
  );
}

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_MENU_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => subscribeMenuItems(setItems), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.name?.toLowerCase().includes(q)
        || item.category?.toLowerCase().includes(q)
        || item.section?.toLowerCase().includes(q)
      );
    });
  }, [items, search, categoryFilter]);

  const counts = useMemo(() => {
    const map = { all: items.length };
    MENU_CATEGORIES.forEach((c) => {
      map[c.id] = items.filter((i) => i.category === c.id).length;
    });
    return map;
  }, [items]);

  const openCreate = () => {
    setForm(EMPTY_MENU_FORM);
    setEditingId(null);
    setModal('create');
  };

  const openEdit = (item) => {
    setForm(menuItemToForm(item));
    setEditingId(item.id);
    setModal('edit');
  };

  const openView = (item) => {
    setForm(menuItemToForm(item));
    setEditingId(item.id);
    setModal('view');
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setForm(EMPTY_MENU_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const data = formToMenuData(form);
      if (modal === 'edit' && editingId) {
        await updateMenuItem(editingId, data);
        setMsg(`Updated "${data.name}"`);
      } else {
        await addMenuItem(data);
        setMsg(`Created "${data.name}"`);
      }
      closeModal();
    } catch (err) {
      setMsg(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" permanently?`)) return;
    setMsg('');
    try {
      await deleteMenuItem(item.id);
      setMsg(`Deleted "${item.name}"`);
      if (editingId === item.id) closeModal();
    } catch (err) {
      setMsg(err.message || 'Delete failed');
    }
  };

  const handleToggle = async (item) => {
    try {
      await updateMenuItem(item.id, { available: item.available === false });
      setMsg(`${item.available === false ? 'Showing' : 'Hiding'} "${item.name}" on website`);
    } catch (err) {
      setMsg(err.message || 'Update failed');
    }
  };

  const handleSeed = async () => {
    if (!window.confirm(`Import all ${SEED_COUNT} website products? Existing IDs will be updated.`)) return;
    setSeeding(true);
    setMsg('');
    try {
      const count = await seedAllMenuItems();
      setMsg(`Imported ${count} products`);
    } catch (err) {
      setMsg(err.message || 'Import failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <>
      {modal && (
        <MenuItemModal
          mode={modal}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={closeModal}
          saving={saving}
        />
      )}

      <div className="admin-toolbar">
        <div>
          <p className="admin-page-sub">Create, read, update & delete menu products — changes sync to the website</p>
          {msg && <p className="admin-revenue-sync-msg">{msg}</p>}
        </div>
        <div className="admin-filter-bar">
          <button type="button" className="admin-btn-sm success" onClick={openCreate}>+ Add Product</button>
          <button type="button" className="admin-btn-sm" onClick={handleSeed} disabled={seeding}>
            {seeding ? 'Importing…' : `📥 Import ${SEED_COUNT}`}
          </button>
        </div>
      </div>

      <div className="admin-menu-search-row">
        <input
          className="admin-input admin-menu-search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-order-tabs">
        <button
          type="button"
          className={`admin-order-tab${categoryFilter === 'all' ? ' active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          All
          <span className="admin-order-tab-count">{counts.all}</span>
        </button>
        {MENU_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`admin-order-tab${categoryFilter === c.id ? ' active' : ''}`}
            onClick={() => setCategoryFilter(c.id)}
          >
            {c.emoji} {c.label}
            <span className="admin-order-tab-count">{counts[c.id] || 0}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="admin-empty-rich" style={{ padding: '64px 24px' }}>
          <div className="admin-empty-orbit">
            <span className="admin-empty-ring" style={{ borderColor: 'rgba(255,107,53,0.3)' }} />
            <span className="admin-empty-icon">🍔</span>
          </div>
          <p className="admin-empty-title">{items.length === 0 ? 'No products yet' : 'No matches'}</p>
          <p className="admin-empty-text">
            {items.length === 0
              ? 'Click Import or Add Product to get started.'
              : 'Try a different search or category filter.'}
          </p>
          {items.length === 0 && (
            <button type="button" className="admin-btn-sm success" style={{ marginTop: 16 }} onClick={openCreate}>
              + Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="admin-menu-grid">
          {filtered.map((item) => (
            <MenuProductCard
              key={item.id}
              item={item}
              onView={openView}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </>
  );
}
