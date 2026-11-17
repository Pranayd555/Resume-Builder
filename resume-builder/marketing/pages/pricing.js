const { packs, cheapestPack, SIGNUP_TOKENS, MAX_RESUMES, BRAND_NAME } = require('../facts');

const rows = packs.map((p) => `<tr><td>${p.tokens} tokens${p.popular ? ' <span class="badge">Most popular</span>' : ''}</td><td class="num">${p.priceLabel}</td><td class="num">${p.perToken}</td></tr>`).join('\n');

module.exports = {
  path: '/pricing',
  title: `Pricing: Free Resume Builder, AI Tokens from ${cheapestPack.priceLabel} | ${BRAND_NAME}`,
  description: `${BRAND_NAME} is free for building and downloading resumes. AI tools use tokens: ${SIGNUP_TOKENS} free on signup, then packs from ${cheapestPack.priceLabel}. No subscription, and tokens never expire.`,
  h1: 'Pricing',
  lede: `Building, editing and downloading resumes is free. You only pay if you want more AI help than the ${SIGNUP_TOKENS} free tokens you get when you sign up, and you pay once per pack. There is no subscription.`,
  body: `
<div class="grid">
  <div class="card">
    <span class="badge">Free</span>
    <p class="price">₹0</p>
    <ul class="ticks">
      <li>Up to ${MAX_RESUMES} resumes</li>
      <li>All public resume templates</li>
      <li>PDF download</li>
      <li>${SIGNUP_TOKENS} free AI tokens when you sign up</li>
      <li>AI without tokens using your own Gemini API key (<a href="/byok">how it works</a>; Google's free-tier limits apply)</li>
    </ul>
  </div>
  <div class="card">
    <span class="badge">Token packs</span>
    <p class="price">from ${cheapestPack.priceLabel}</p>
    <ul class="ticks">
      <li>1 token = 1 AI action</li>
      <li>One-time payment, no subscription</li>
      <li>Tokens never expire</li>
      <li>If an AI action fails, its token is returned automatically</li>
    </ul>
  </div>
</div>

<h2 id="packs">Token packs</h2>
<div class="table-wrap"><table>
<caption class="note" style="caption-side:bottom;text-align:left;padding:10px 14px">Prices in Indian rupees (INR). Paid securely through Razorpay.</caption>
<thead><tr><th scope="col">Pack</th><th scope="col">Price</th><th scope="col">Per token</th></tr></thead>
<tbody>
${rows}
</tbody>
</table></div>

<h2>What does one token buy?</h2>
<div class="prose">
<p>Each AI action uses one token:</p>
<ul>
  <li>Rewriting or improving one section of your resume with AI</li>
  <li>Condensing a long section into a shorter, tighter version</li>
  <li>An ATS score check of your resume against a job description (<a href="/ats-resume-checker">see what it checks</a>)</li>
  <li>Adjusting the tone of your resume, or adding missing keywords, after an ATS check</li>
  <li>Importing an existing resume from a PDF or Word file (<a href="/import-resume">how import works</a>)</li>
  <li>Generating or restructuring a custom template with AI</li>
</ul>
<p>Everything else, including writing your resume yourself, switching templates and downloading the PDF, is free.</p>
</div>

<h2>Use your own AI key instead</h2>
<p class="prose">If you have a Google Gemini API key (Google offers a free tier), you can add it to your profile. AI actions then run on your key and don't use tokens. <a href="/byok">Read the guide to using your own key</a>.</p>
`,
  faq: [
    { q: `Is ${BRAND_NAME} really free?`, a: 'Yes. Creating an account, writing resumes, using the templates and downloading PDFs cost nothing. Only the AI tools use tokens, and every new account gets ' + SIGNUP_TOKENS + ' free tokens.' },
    { q: 'Do tokens expire?', a: 'No. Tokens you buy stay in your account until you use them.' },
    { q: 'Is there a subscription or auto-renewal?', a: 'No. Each pack is a one-time payment. Nothing renews or charges you again.' },
    { q: 'What happens if an AI action fails?', a: 'The token for that action is returned to your balance automatically.' },
    { q: 'How do I pay?', a: 'Payments go through Razorpay\'s secure checkout. You choose a pack inside the app after logging in.' },
    { q: 'Can I get a refund?', a: 'See our <a href="/cancellation-refunds">cancellation and refund policy</a> for when refunds apply and how to ask for one.' },
  ],
};
