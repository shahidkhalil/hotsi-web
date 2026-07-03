import { useEffect, useState } from 'react';
import {
  subscribeMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../firebase/services';

const CATEGORIES = ['burgers', 'shawarma', 'pizza', 'sandwiches', 'wraps', 'fries', 'chicken', 'deals'];

const EMPTY = { name: '', price: '', category: 'burgers', emoji: '🍔', available: true };

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeMenuItems(setItems), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        price: parseInt(form.price, 10) || 0,
        category: form.category,
        emoji: form.emoji,
        available: form.available,
      };
      if (editing) {
        await updateMenuItem(editing, data);
        setEditing(null);
      } else {
        await addMenuItem(data);
      }
      setForm(EMPTY);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({
      name: item.name,
      price: String(item.price),
      category: item.category || 'burgers',
      emoji: item.emoji || '🍔',
      available: item.available !== false,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this menu item?')) await deleteMenuItem(id);
  };

  const toggleAvailable = async (item) => {
    await updateMenuItem(item.id, { available: !item.available });
  };

  return (
    <>
      <div className="admin-toolbar">
        <p className="admin-page-sub">Add extra items to your Firebase menu database</p>
      </div>

      <div className="admin-panel" style={{ marginBottom: 24 }}>
        <div className="admin-panel-head">
          <div className="admin-panel-title">{editing ? 'Edit Item' : 'Add New Item'}</div>
          {editing && (
            <button type="button" className="admin-btn-sm" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancel Edit</button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-label">Name</label>
              <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="admin-field">
              <label className="admin-label">Price (PKR)</label>
              <input className="admin-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="admin-field">
              <label className="admin-label">Category</label>
              <select className="admin-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Emoji</label>
              <input className="admin-input" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={4} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn" style={{ width: 'auto', padding: '12px 32px' }} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <div className="admin-panel-title">Firebase Menu ({items.length} items)</div>
        </div>
        <p style={{ padding: '12px 24px', fontSize: 13, color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          Your public website still uses the built-in menu. Items here are stored in Firebase for admin management and future dynamic menu support.
        </p>
        {items.length === 0 ? (
          <div className="admin-empty"><span>🍔</span><p>No items in database yet. Add one above.</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Emoji</th><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontSize: 24 }}>{item.emoji}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.category}</td>
                    <td>PKR {(item.price || 0).toLocaleString()}</td>
                    <td>
                      <span className={`admin-badge ${item.available !== false ? 'admin-badge-confirmed' : 'admin-badge-cancelled'}`}>
                        {item.available !== false ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" className="admin-btn-sm" onClick={() => startEdit(item)}>Edit</button>
                        <button type="button" className="admin-btn-sm" onClick={() => toggleAvailable(item)}>
                          {item.available !== false ? 'Disable' : 'Enable'}
                        </button>
                        <button type="button" className="admin-btn-sm danger" onClick={() => handleDelete(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
