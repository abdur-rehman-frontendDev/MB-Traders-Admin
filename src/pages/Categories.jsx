import React, { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../api/client';

const EMPTY_FORM = { id: '', name: '', urdu: '', emoji: '🛒', sortOrder: 0 };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await apiRequest('/categories', { auth: false });
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, sortOrder: categories.length + 1 });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ id: cat.id, name: cat.name, urdu: cat.urdu, emoji: cat.emoji, sortOrder: cat.sortOrder ?? 0 });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.id || !form.name || !form.urdu || !form.emoji) {
      setFormError('id, name, urdu, and emoji are all required.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await apiRequest(`/categories/${editingId}`, {
          method: 'PUT',
          body: { name: form.name, urdu: form.urdu, emoji: form.emoji, sortOrder: Number(form.sortOrder) },
        });
      } else {
        await apiRequest('/categories', {
          method: 'POST',
          body: {
            id: form.id.trim(),
            name: form.name,
            urdu: form.urdu,
            emoji: form.emoji,
            sortOrder: Number(form.sortOrder),
          },
        });
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await apiRequest(`/categories/${cat.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <div className="page-subtitle">{categories.length} total — shown on the app's Categories screen</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Category</button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : error ? (
        <div className="error-text">Couldn't load categories: {error}</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {categories.length === 0 ? (
            <div className="empty-state">No categories yet — add your first one.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Sort Order</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontSize: 22 }}>{c.emoji}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{c.urdu}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{c.name}</div>
                    </td>
                    <td>{c.id}</td>
                    <td>{c.sortOrder}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{editingId ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSave}>
              {!editingId && (
                <div className="field">
                  <label>Category ID (unique, lowercase — e.g. "spices")</label>
                  <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
                </div>
              )}
              <div className="field-row">
                <div className="field">
                  <label>Name (English)</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="field">
                  <label>Name (Urdu)</label>
                  <input value={form.urdu} onChange={(e) => setForm({ ...form, urdu: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Emoji Icon</label>
                  <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
                </div>
                <div className="field">
                  <label>Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                </div>
              </div>

              {formError && <div className="error-text">{formError}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
