import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import StatusPill from '../components/StatusPill';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const result = await apiRequest('/admin/dashboard');
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="page">
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="error-text">Couldn't load dashboard: {error}</div>
        <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-subtitle">Overview of orders, sales, and inventory</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{data.totalOrders}</div>
        </div>
        <div className="stat-card accent-gold">
          <div className="stat-label">Total Sales</div>
          <div className="stat-value">Rs. {data.totalSales.toLocaleString()}</div>
        </div>
        <div className="stat-card accent-info">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{data.totalCustomers}</div>
        </div>
        <div className="stat-card accent-warning">
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value">{data.pendingOrders}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="card-title" style={{ margin: 0 }}>Recent Orders</h2>
          <Link to="/orders" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <div className="empty-state">No orders yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.order_number || o.orderNumber}>
                  <td>#{o.orderNumber}</td>
                  <td>{o.user?.name || o.customer_name || '—'}</td>
                  <td>Rs. {o.total}</td>
                  <td><StatusPill status={o.status} /></td>
                  <td>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Top Products</h2>
        {data.topProducts.length === 0 ? (
          <div className="empty-state">No sales data yet — place a few test orders to see this fill in.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p) => (
                <tr key={p._id}>
                  <td>{p.urdu} ({p.name})</td>
                  <td>{p.unitsSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
