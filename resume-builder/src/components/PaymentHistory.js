import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import {
  CheckCircleIcon,
  ArrowUturnLeftIcon,
  GiftIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { paymentAPI } from '../services/api';

const formatDate = (value) => (value
  ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : '');
const rupees = (paise) => `₹${(Number(paise || 0) / 100).toFixed(2)}`;

function statusLabel(payment) {
  if (payment.type === 'bonus') return { text: 'Bonus', tone: 'text-green-700 bg-green-100' };
  if (payment.status === 'refunded') {
    return payment.refund?.status === 'processed'
      ? { text: 'Refunded', tone: 'text-gray-700 bg-gray-100' }
      : { text: 'Refund in progress', tone: 'text-yellow-800 bg-yellow-100' };
  }
  if (payment.status === 'paid') return { text: 'Paid', tone: 'text-green-700 bg-green-100' };
  return { text: payment.status, tone: 'text-gray-700 bg-gray-100' };
}

/**
 * The user's token purchases and bonus grants, newest first, with a
 * self-serve refund for packs that qualify (unused, within the window).
 */
const PaymentHistory = ({ onChange }) => {
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null); // payment being refunded
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await paymentAPI.getPaymentHistory();
      setPayments(res?.data?.payments || []);
      setError(null);
    } catch (err) {
      setError('Could not load your payment history.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitRefund = async () => {
    if (!confirming) return;
    setSubmitting(true);
    try {
      const res = await paymentAPI.requestRefund(confirming.id, reason.trim() || undefined);
      toast.success(res?.message || 'Refund issued.');
      setConfirming(null);
      setReason('');
      await load();
      onChange?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'The refund could not be processed. Please try again.');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button type="button" onClick={load} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Try again
        </button>
      </div>
    );
  }
  if (!payments) {
    return <p className="text-center text-sm text-gray-500 py-6">Loading payment history…</p>;
  }
  if (payments.length === 0) {
    return <p className="text-center text-sm text-gray-500 dark:text-gray-700 py-6">No payments yet.</p>;
  }

  return (
    <>
      <ul className="space-y-3" data-testid="payment-history">
        {payments.map((payment) => {
          const status = statusLabel(payment);
          const isBonus = payment.type === 'bonus';
          return (
            <li key={payment.id} className="border border-gray-200 dark:border-orange-700/30 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  {isBonus
                    ? <GiftIcon className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    : <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-700">
                      {isBonus
                        ? `${payment.bonusTokens} bonus tokens`
                        : `${payment.tokens} tokens${payment.bonusTokens > 0 ? ` + ${payment.bonusTokens} bonus` : ''}`}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-700">
                      {formatDate(payment.paidAt || payment.createdAt)}
                      {payment.receiptNumber ? ` · Receipt ${payment.receiptNumber}` : ''}
                      {isBonus && payment.reason ? ` · ${payment.reason}` : ''}
                    </p>
                    {payment.refundable && payment.refundableUntil && (
                      <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                        <ClockIcon className="h-3.5 w-3.5" />
                        Refundable until {formatDate(payment.refundableUntil)} while unused
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {!isBonus && <p className="font-semibold text-gray-900 dark:text-gray-600">{rupees(payment.amount)}</p>}
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.tone}`}>{status.text}</span>
                  {payment.refundable && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setConfirming(payment)}
                        className="mt-2 inline-flex items-center px-2 py-1 border border-red-300 text-red-700 text-xs font-medium rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <ArrowUturnLeftIcon className="w-3 h-3 mr-1" />
                        Refund
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {confirming && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="refund-title">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 id="refund-title" className="text-lg font-semibold text-gray-900">Refund this pack?</h3>
              <button type="button" onClick={() => setConfirming(null)} disabled={submitting} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-700">
              You will get <strong>{rupees(confirming.amount)}</strong> back to your original payment method
              (usually within 5-7 business days), and{' '}
              <strong>
                {confirming.tokens} tokens{confirming.bonusTokens > 0 ? ` + ${confirming.bonusTokens} bonus tokens` : ''}
              </strong>{' '}
              will be removed from your balance. This cannot be undone.
            </p>
            <label htmlFor="refund-reason" className="block text-sm font-medium text-gray-700 mt-4 mb-1">
              Reason (optional)
            </label>
            <textarea
              id="refund-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us what didn't work for you"
            />
            <div className="flex justify-end gap-3 mt-5">
              <button type="button" onClick={() => setConfirming(null)} disabled={submitting} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
                Keep my tokens
              </button>
              <button type="button" onClick={submitRefund} disabled={submitting} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
                {submitting ? 'Refunding…' : `Refund ${rupees(confirming.amount)}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PaymentHistory;
