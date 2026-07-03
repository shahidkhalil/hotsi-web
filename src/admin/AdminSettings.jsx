import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../firebase/services';

const DEFAULT = {
  phone: '0340 4112112',
  whatsapp: '923404112112',
  address: 'Plot 505, Karim Block, Allama Iqbal Town, Lahore 54570',
  hours: 'Open Daily — Closes 4:00 AM',
  deliveryTime: '25 Min',
};

export default function AdminSettings() {
  const [form, setForm] = useState(DEFAULT);
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      if (s) {
        setForm({
          phone: s.phone || DEFAULT.phone,
          whatsapp: s.whatsapp || DEFAULT.whatsapp,
          address: s.address || DEFAULT.address,
          hours: s.hours || DEFAULT.hours,
          deliveryTime: s.deliveryTime || DEFAULT.deliveryTime,
        });
        setDocId(s.id);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const id = await saveSettings(docId, form);
      setDocId(id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-spinner-wrap"><div className="admin-spinner" /></div>;
  }

  return (
    <>
      <div className="admin-toolbar">
        <p className="admin-page-sub">Business info stored in Firebase</p>
        {saved && <span className="admin-live">Saved successfully!</span>}
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head"><div className="admin-panel-title">Restaurant Details</div></div>
        <form onSubmit={handleSave}>
          <div className="admin-form-grid">
            <div className="admin-field">
              <label className="admin-label">Phone</label>
              <input className="admin-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="admin-field">
              <label className="admin-label">WhatsApp Number (no +)</label>
              <input className="admin-input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <div className="admin-field full">
              <label className="admin-label">Address</label>
              <input className="admin-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Opening Hours</label>
              <input className="admin-input" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Avg Delivery Time</label>
              <input className="admin-input" value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn" style={{ width: 'auto', padding: '12px 32px' }} disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
