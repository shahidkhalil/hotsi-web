import { useEffect, useState } from 'react';
import { subscribeSettings, saveSettings } from '../firebase/services';
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  ALL_CATEGORY_IDS,
  CATEGORY_META,
  pickSettingsPayload,
} from '../utils/siteSettings';

export default function AdminSettings() {
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS, hiddenCategories: [] });
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSpinner, setSavingSpinner] = useState(false);
  const [savingCategory, setSavingCategory] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = subscribeSettings((data) => {
      setForm(normalizeSettings(data));
      if (data?.id) setDocId(data.id);
      setLoading(false);
    });
    return unsub;
  }, []);

  const persistSettings = async (patch, { spinnerOnly = false } = {}) => {
    const next = normalizeSettings({ ...form, ...patch });
    setForm(next);
    if (spinnerOnly) setSavingSpinner(true);
    else setSaving(true);
    setSaved(false);
    try {
      const id = await saveSettings(docId, pickSettingsPayload(next));
      if (id) setDocId(id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Could not save settings. Please try again.');
    } finally {
      if (spinnerOnly) setSavingSpinner(false);
      else setSaving(false);
    }
  };

  const toggleCategory = async (id) => {
    const hidden = form.hiddenCategories || [];
    const nextHidden = hidden.includes(id)
      ? hidden.filter((x) => x !== id)
      : [...hidden, id];
    setSavingCategory(id);
    setSaved(false);
    try {
      const next = normalizeSettings({ ...form, hiddenCategories: nextHidden });
      setForm(next);
      const savedId = await saveSettings(docId, pickSettingsPayload(next));
      if (savedId) setDocId(savedId);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Could not save category visibility. Please try again.');
    } finally {
      setSavingCategory(null);
    }
  };

  const handleSpinnerToggle = () => {
    const nextEnabled = form.spinnerOfferEnabled === false;
    persistSettings({ spinnerOfferEnabled: nextEnabled }, { spinnerOnly: true });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await persistSettings(form);
  };

  if (loading) {
    return <div className="admin-spinner-wrap"><div className="admin-spinner" /></div>;
  }

  const spinnerOn = form.spinnerOfferEnabled !== false;

  return (
    <>
      <div className="admin-toolbar">
        <p className="admin-page-sub">Control website visibility — special offer &amp; menu categories</p>
        {saved && <span className="admin-live">Saved successfully!</span>}
      </div>

      <div className="admin-panel" style={{ marginBottom: 24 }}>
        <div className="admin-panel-head"><div className="admin-panel-title">Spin &amp; Win — Special Offer</div></div>
        <div className="admin-settings-block">
          <div className="admin-toggle-row">
            <button
              type="button"
              className={`admin-toggle${spinnerOn ? ' on' : ''}`}
              onClick={handleSpinnerToggle}
              disabled={savingSpinner}
              aria-label="Toggle spinner offer"
            >
              <span className="admin-toggle-knob" />
            </button>
            <div>
              <strong>{spinnerOn ? 'Visible on website' : 'Hidden from website'}</strong>
              <p className="admin-settings-hint">
                {savingSpinner
                  ? 'Saving…'
                  : 'Show or hide the entire Spin & Win section on the homepage. Saves instantly.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-panel" style={{ marginBottom: 24 }}>
        <div className="admin-panel-head"><div className="admin-panel-title">Menu Categories</div></div>
        <p className="admin-settings-intro">
          Hide entire sections (Explore cards, menu tabs, and spin wheel segments). Hidden categories disappear from the public site instantly.
        </p>
        <div className="admin-category-grid">
          {ALL_CATEGORY_IDS.map((id) => {
            const meta = CATEGORY_META[id];
            const hidden = (form.hiddenCategories || []).includes(id);
            const visible = !hidden;
            return (
              <div
                key={id}
                className={`admin-category-card${visible ? ' visible-cat' : ' hidden-cat'}`}
              >
                <span className="admin-category-toggle-emoji">{meta.emoji}</span>
                <span className="admin-category-toggle-label">{meta.label}</span>
                <button
                  type="button"
                  className={`admin-toggle${visible ? ' on' : ''}`}
                  onClick={() => toggleCategory(id)}
                  disabled={savingCategory === id}
                  aria-label={`${visible ? 'Hide' : 'Show'} ${meta.label} on website`}
                  title={visible ? 'Visible on website' : 'Hidden from website'}
                >
                  <span className="admin-toggle-knob" />
                </button>
              </div>
            );
          })}
        </div>
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
