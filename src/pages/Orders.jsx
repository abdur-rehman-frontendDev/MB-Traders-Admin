import React, { useEffect, useState, useCallback } from 'react';
import { apiRequest } from '../api/client';
import StatusPill from '../components/StatusPill';

const TABS = ['All', 'Pending', 'Packing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const NEXT_STATUS = {
  Pending: 'Packing',
  Packing: 'Out for Delivery',
  'Out for Delivery': 'Delivered',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const query = activeTab === 'All' ? '' : `?status=${encodeURIComponent(activeTab)}`;
      const data = await apiRequest(`/admin/orders${query}`);
      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const handleAdvance = async (order) => {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;
    setUpdatingId(order._id);
    try {
      await apiRequest(`/admin/orders/${order._id}/status`, {
        method: 'PUT',
        body: { status: nextStatus },
      });
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (order) => {
    if (!confirm(`Cancel order #${order.orderNumber}?`)) return;
    setUpdatingId(order._id);
    try {
      await apiRequest(`/admin/orders/${order._id}/status`, {
        method: 'PUT',
        body: { status: 'Cancelled' },
      });
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <div className="page-subtitle">{orders.length} shown — update status as orders move through fulfillment</div>
        </div>
      </div>

      <div className="tab-row">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-chip${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : error ? (
        <div className="error-text">Couldn't load orders: {error}</div>
      ) : orders.length === 0 ? (
        <div className="card"><div className="empty-state">No orders in this status.</div></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <React.Fragment key={o._id}>
                  <tr>
                    <td>#{o.orderNumber}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{o.user?.name || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{o.user?.phone}</div>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setExpandedId(expandedId === o._id ? null : o._id)}
                      >
                        {o.items.length} item{o.items.length !== 1 ? 's' : ''} {expandedId === o._id ? '▲' : '▼'}
                      </button>
                    </td>
                    <td>Rs. {o.total}</td>
                    <td>{o.paymentMethod}</td>
                    <td><StatusPill status={o.status} /></td>
                    <td>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      {NEXT_STATUS[o.status] && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAdvance(o)}
                          disabled={updatingId === o._id}
                        >
                          {updatingId === o._id ? '…' : `Mark ${NEXT_STATUS[o.status]}`}
                        </button>
                      )}
                      {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(o)}
                          disabled={updatingId === o._id}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === o._id && (
                    <tr>
                      <td colSpan={8} style={{ background: '#fafbfa' }}>
                        <div style={{ padding: '6px 4px' }}>
                          <strong style={{ fontSize: 12 }}>Delivery Address:</strong>{' '}
                          <span style={{ fontSize: 12 }}>{o.addressLine}</span>
                          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                            {o.items.map((item, idx) => (
                              <li key={idx} style={{ fontSize: 12, marginBottom: 2 }}>
                                {item.urdu} ({item.name}) — {item.weightLabel} × {item.qty} — Rs. {item.price * item.qty}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
