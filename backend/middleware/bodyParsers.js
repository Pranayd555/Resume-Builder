const express = require('express');

const WEBHOOK_PATH = '/api/payment/webhook';

/**
 * Request body parsing. Razorpay webhooks are signed over the raw bytes, so
 * that path gets a Buffer (req.body) and skips JSON parsing; everything else
 * is parsed as JSON / urlencoded as usual.
 */
function applyBodyParsers(app) {
  app.use(WEBHOOK_PATH, express.raw({ type: '*/*', limit: '1mb' }));
  const json = express.json({ limit: '10mb' });
  app.use((req, res, next) => (req.originalUrl.startsWith(WEBHOOK_PATH) ? next() : json(req, res, next)));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
}

module.exports = { applyBodyParsers, WEBHOOK_PATH };
