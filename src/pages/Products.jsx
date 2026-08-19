import React, { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../api/client';

const EMPTY_FORM = {
  id: '',
  categoryId: '',
  name: '',
  urdu: '',
  emoji: '🛒',
  unit: 'KG',
  tag: 'Fresh',
  description: '',
  basePrice: '',
  stockQty: 100,
  isActive: true,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating new
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [productsData, categoriesData] = await Promise.all([
        apiRequest('/products/admin/all'),
        apiRequest('/categories', { auth: false }),
      ]);
      setProducts(productsData.products);
      setCategories(categoriesData.categories);
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
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || '' });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      urdu: product.urdu,
      emoji: product.emoji,
      unit: product.unit,
      tag: product.tag,
      description: product.description,
      basePrice: product.basePrice,
      stockQty: product.stockQty,
      isActive: product.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!form.id || !form.categoryId || !form.name || !form.urdu || !form.basePrice) {
      setFormError('id, category, name, urdu, and base price are required.');
      return;
    }

    setSaving(true);
    try {
      const basePrice = Number(form.basePrice);
      const stockQty = Number(form.stockQty);

      if (editingId) {
        await apiRequest(`/products/${editingId}`, {
          method: 'PUT',
          body: {
            categoryId: form.categoryId,
            name: form.name,
            urdu: form.urdu,
            emoji: form.emoji,
            unit: form.unit,
            tag: form.tag,
            description: form.description,
            basePrice,
            stockQty,
            isActive: form.isActive,
            // Recalculate weight tiers from the new base price.
            weights: [
              { label: '250g', price: Math.round(basePrice * 0.25) },
              { label: '500g', price: Math.round(basePrice * 0.5) },
              { label: '1 KG', price: basePrice },
              { label: '2 KG', price: basePrice * 2 },
            ],
          },
        });
      } else {
        await apiRequest('/products', {
          method: 'POST',
          body: {
            id: form.id.trim(),
            categoryId: form.categoryId,
            name: form.name,
            urdu: form.urdu,
            emoji: form.emoji,
            unit: form.unit,
            tag: form.tag,
            description: form.description,
            basePrice,
            stockQty,
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

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    try {
      await apiRequest(`/products/${product.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.urdu.includes(q) || p.id.toLowerCase().includes(q);
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <div className="page-subtitle">{products.length} total — what shows up in the app</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate} disabled={categories.length === 0}>
          + Add Product
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          You need at least one category before adding products. Go to{' '}
          <a href="/categories" style={{ color: 'var(--primary)', fontWeight: 700 }}>Categories</a> and add one first.
        </div>
      )}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by name, urdu, or id…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-outline btn-sm" onClick={load}>Refresh</button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : error ? (
        <div className="error-text">Couldn't load products: {error}</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div className="empty-state">No products found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Base Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontSize: 22 }}>{p.emoji}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.urdu}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{p.name} · {p.id}</div>
                    </td>
                    <td>{categories.find((c) => c.id === p.categoryId)?.urdu || p.categoryId}</td>
                    <td>Rs. {p.basePrice}/{p.unit}</td>
                    <td>{p.stockQty}</td>
                    <td>
                      <span className={`pill ${p.isActive ? 'pill-delivered' : 'pill-cancelled'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
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
            <h2 className="modal-title">{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSave}>
              {!editingId && (
                <div className="field">
                  <label>Product ID (unique, used internally — e.g. "p11")</label>
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
                  <label>Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.urdu})</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Emoji Icon</label>
                  <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Base Price (Rs. per 1 KG/unit)</label>
                  <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
                </div>
                <div className="field">
                  <label>Stock Quantity</label>
                  <input type="number" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    <option>KG</option>
                    <option>LTR</option>
                    <option>DOZEN</option>
                    <option>PIECE</option>
                  </select>
                </div>
                <div className="field">
                  <label>Tag</label>
                  <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                    <option>Fresh</option>
                    <option>Premium</option>
                    <option>Sale</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Description (Urdu)</label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {editingId && (
                <div className="field">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      style={{ width: 'auto' }}
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    Active (visible in the app)
                  </label>
                </div>
              )}

              {formError && <div className="error-text">{formError}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
