import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, GiftIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { paymentAPI } from '../services/api';

const formatDate = (value) => (value
  ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  : '');
const rupees = (paise) => `₹${(Number(paise || 0) / 100).toFixed(2)}`;

function statusLabel(payment) {
  if (payment.type === 'bonus') return { text: 'Bonus', tone: 'text-green-700 bg-green-100' };
  if (payment.status === 'refunded') {
    return payment.refund?.status === 'processed'
      ? { text: `Refunded ${rupees(payment.refund.amount)}`, tone: 'text-gray-700 bg-gray-100' }
      : { text: 'Refund in progress', tone: 'text-yellow-800 bg-yellow-100' };
  }
  if (payment.status === 'paid') return { text: 'Paid', tone: 'text-green-700 bg-green-100' };
  return { text: payment.status, tone: 'text-gray-700 bg-gray-100' };
}

/**
 * The user's token purchases and bonus grants, newest first. Tokens are
 * non-refundable; payment problems go to support (Contact Us).
 */
const PaymentHistory = () => {
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState(null);

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
          const Icon = isBonus ? GiftIcon : payment.status === 'refunded' ? ArrowUturnLeftIcon : CheckCircleIcon;
          return (
            <li key={payment.id} className="border border-gray-200 dark:border-orange-700/30 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <Icon className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
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
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {!isBonus && <p className="font-semibold text-gray-900 dark:text-gray-600">{rupees(payment.amount)}</p>}
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.tone}`}>{status.text}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-700">
        Tokens never expire and are non-refundable. A problem with a payment (charged twice, or charged
        without receiving tokens)? <Link to="/contact-us" className="text-blue-600 hover:underline">Contact us</Link> with
        the receipt number and we&apos;ll look into it.
      </p>
    </>
  );
};

export default PaymentHistory;
