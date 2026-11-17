import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/adminApi';

const rupees = (paise) => `₹${(Number(paise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const formatDate = (value) => (value
  ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '-');

const STATUS_TONES = {
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-gray-100 text-gray-800',
  granted: 'bg-blue-100 text-blue-800',
  expired: 'bg-yellow-100 text-yellow-800',
  created: 'bg-yellow-100 text-yellow-800'
};

function refundLabel(payment) {
  if (!payment.refund) return null;
  if (payment.refund.status === 'failed') return 'Refund failed';
  if (payment.refund.status === 'pending') return 'Refund in progress';
  return 'Refunded';
}

/**
 * Admin view of every purchase and bonus grant. Tokens are non-refundable for
 * customers; an admin refunds here only after investigating a claim
 * (duplicate charge, paid without receiving tokens, service failure).
 */
const AdminPayments = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', type: 'purchase', search: '', page: 1 });
  const [refunding, setRefunding] = useState(null);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState(''); // rupees; empty = full payment
  const [removeTokens, setRemoveTokens] = useState(true);
  // Goodwill refunds keep Razorpay's fee; refunds for our own faults are in full.
  const [keepFee, setKeepFee] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const openRefund = (payment) => {
    setRefunding(payment);
    setReason('');
    setAmount('');
    setRemoveTokens(true);
    setKeepFee(true);
  };

  // What the customer gets back, in paise (null when the fee is not known yet).
  const refundPreview = (p) => {
    if (amount !== '') return Math.round(Number(amount) * 100);
    if (!keepFee) return p.amount;
    return Number.isInteger(p.fee) ? p.amount - p.fee : null;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.paymentsAdminApi.getPayments({ ...filters, limit: 25 });
      setData(res?.data || null);
    } catch (error) {
      toast.error(error.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const submitRefund = async () => {
    if (!refunding) return;
    setSubmitting(true);
    try {
      await adminAPI.paymentsAdminApi.refundPayment(refunding.id, {
        reason: reason.trim(),
        amount: amount === '' ? undefined : Number(amount),
        removeTokens,
        keepFee: amount === '' && keepFee
      });
      toast.success('Refund issued');
      setRefunding(null);
      setReason('');
      await load();
    } catch (error) {
      toast.error(error.message || 'Refund failed');
    } finally {
      setSubmitting(false);
    }
  };

  const summary = data?.summary;
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payments</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Token purchases and bonus grants. Tokens are non-refundable; refund here only after investigating a customer&apos;s claim.
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Paid (net revenue)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{rupees(summary.paid.amount)}</p>
            <p className="text-xs text-gray-500">{summary.paid.count} payments</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Refunded</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{rupees(summary.refunded.amount)}</p>
            <p className="text-xs text-gray-500">{summary.refunded.count} refunds</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Refund rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.paid.count + summary.refunded.count > 0
                ? `${Math.round((summary.refunded.count / (summary.paid.count + summary.refunded.count)) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label htmlFor="payments-type" className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <select id="payments-type" value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="purchase">Purchases</option>
            <option value="bonus">Bonus grants</option>
          </select>
        </div>
        <div>
          <label htmlFor="payments-status" className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select id="payments-status" value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="granted">Granted</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="payments-search" className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input
            id="payments-search"
            type="search"
            defaultValue={filters.search}
            onKeyDown={(e) => { if (e.key === 'Enter') setFilter('search', e.currentTarget.value); }}
            onBlur={(e) => { if (e.target.value !== filters.search) setFilter('search', e.target.value); }}
            placeholder="Email, receipt no., payment or order id"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Date', 'Customer', 'Pack', 'Amount', 'Status', 'Receipt / payment', ''].map((h) => (
                <th key={h || 'actions'} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading…</td></tr>
            )}
            {!loading && data?.payments?.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No payments found.</td></tr>
            )}
            {!loading && data?.payments?.map((p) => (
              <tr key={p.id} className="align-top">
                <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatDate(p.paidAt || p.createdAt)}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  <div>{p.user?.name || '-'}</div>
                  <div className="text-xs text-gray-500">{p.user?.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {p.type === 'bonus'
                    ? <span>{p.bonusTokens} bonus<span className="block text-xs text-gray-500">{p.reason}</span></span>
                    : <span>{p.tokens}{p.bonusTokens > 0 ? ` + ${p.bonusTokens} bonus` : ''}</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-white">{p.type === 'bonus' ? '-' : rupees(p.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_TONES[p.status] || 'bg-gray-100 text-gray-800'}`}>{p.status}</span>
                  {refundLabel(p) && <div className="text-xs text-gray-500 mt-1">{refundLabel(p)}</div>}
                  {p.refundError && <div className="text-xs text-red-600 mt-1">{p.refundError}</div>}
                  {p.refundReason && <div className="text-xs text-gray-500 mt-1">“{p.refundReason}”</div>}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-400">
                  <div>{p.receiptNumber || '-'}</div>
                  <div>{p.paymentId}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.type === 'purchase' && p.status === 'paid' && (
                    <button
                      type="button"
                      onClick={() => openRefund(p)}
                      className="px-3 py-1.5 text-xs font-medium rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
          <div className="flex gap-2">
            <button type="button" disabled={pagination.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))} className="px-3 py-1.5 border rounded-md disabled:opacity-50">Previous</button>
            <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} className="px-3 py-1.5 border rounded-md disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {refunding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="admin-refund-title">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 id="admin-refund-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Refund {refundPreview(refunding) === null ? `${rupees(refunding.amount)} minus Razorpay's fee` : rupees(refundPreview(refunding))} to {refunding.user?.email}?
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Tokens are non-refundable, so refund only after investigating a claim: a duplicate charge, a
              payment without tokens, or a failure on our side.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Pack: {refunding.tokens} tokens{refunding.bonusTokens > 0 ? ` + ${refunding.bonusTokens} bonus` : ''}.
              Customer&apos;s balance now: {refunding.user?.tokens?.purchased ?? 0} purchased + {refunding.user?.tokens?.bonus ?? 0} bonus.
            </p>
            <fieldset className="mt-4">
              <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Whose side was the problem on?</legend>
              <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="radio" name="admin-refund-fee" checked={keepFee} onChange={() => setKeepFee(true)} className="mt-0.5" />
                <span>
                  Customer&apos;s own reason (goodwill): keep Razorpay&apos;s processing fee
                  {Number.isInteger(refunding.fee) ? ` of ${rupees(refunding.fee)}` : ' (read from Razorpay when you refund)'}
                </span>
              </label>
              <label className="flex items-start gap-2 mt-1 text-sm text-gray-700 dark:text-gray-300">
                <input type="radio" name="admin-refund-fee" checked={!keepFee} onChange={() => setKeepFee(false)} className="mt-0.5" />
                <span>Our side (duplicate charge, no tokens, our failure): refund in full, {rupees(refunding.amount)}</span>
              </label>
            </fieldset>
            <label htmlFor="admin-refund-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 mb-1">
              Different amount in ₹ (optional, replaces the choice above)
            </label>
            <input
              id="admin-refund-amount"
              type="number"
              min="1"
              max={refunding.amount / 100}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
            />
            <label className="flex items-start gap-2 mt-3 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={removeTokens} onChange={(e) => setRemoveTokens(e.target.checked)} className="mt-0.5" />
              <span>Take back what is left of this pack&apos;s tokens (untick if the customer never received them)</span>
            </label>
            <label htmlFor="admin-refund-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mt-4 mb-1">What did you investigate? (required)</label>
            <textarea
              id="admin-refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. Charged twice for the same order; second payment refunded"
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-3 mt-5">
              <button type="button" onClick={() => setRefunding(null)} disabled={submitting} className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 dark:text-gray-300">Cancel</button>
              <button type="button" onClick={submitRefund} disabled={submitting || reason.trim().length < 5} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
                {submitting ? 'Refunding…' : 'Issue refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
