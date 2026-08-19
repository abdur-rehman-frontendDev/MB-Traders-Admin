import React from 'react';

const CLASS_MAP = {
  Pending: 'pill-pending',
  Packing: 'pill-packing',
  'Out for Delivery': 'pill-out-for-delivery',
  Delivered: 'pill-delivered',
  Cancelled: 'pill-cancelled',
};

export default function StatusPill({ status }) {
  return <span className={`pill ${CLASS_MAP[status] || 'pill-pending'}`}>{status}</span>;
}
