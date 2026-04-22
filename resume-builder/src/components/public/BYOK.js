import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  KeyIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EyeSlashIcon,
  ServerIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  ChevronRightIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import AnimatedBackground from '../AnimatedBackground';
import { useScrollToTop } from '../../hooks/useAutoScroll';

/* ─────────────────────────────────────────────
   Small reusable Step badge
───────────────────────────────────────────── */
const StepBadge = ({ n }) => (
  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20">
    {n}
  </div>
);

/* ─────────────────────────────────────────────
   Inline code chip
───────────────────────────────────────────── */
const Code = ({ children }) => (
  <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-400 text-xs font-mono">
    {children}
  </code>
);

/* ─────────────────────────────────────────────
   Security pipeline diagram (pure JSX/Tailwind)
───────────────────────────────────────────── */
const SecurityPipeline = () => {
  const nodes = [
    { icon: '🖥️', label: 'Your Browser', sub: 'HTTPS / TLS 1.3' },
    { icon: '🔒', label: 'Our Server', sub: 'AES-256-CBC + random IV' },
    { icon: '🗄️', label: 'Database', sub: 'Only ciphertext stored' },
    { icon: '👁️', label: 'Back to You', sub: '80% masked on display' },
  ];

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center gap-0 min-w-max mx-auto w-fit">
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-2 w-32">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl shadow-sm">
                {node.icon}
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">
                {node.label}
              </p>
              <p className="text-[10px] text-slate-400 text-center leading-tight">
                {node.sub}
              </p>
            </div>
            {i < nodes.length - 1 && (
              <div className="flex items-center mx-1 mb-6">
                <div className="w-8 h-0.5 bg-gradient-to-r from-violet-400 to-indigo-400" />
                <ChevronRightIcon className="w-3 h-3 text-indigo-400 -ml-1" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const BYOKGuide = () => {
  const navigate = useNavigate();
  const { scrollToTop } = useScrollToTop();

  useEffect(() => {
    scrollToTop();
  },[scrollToTop]);

  const geminiSteps = [
    {
      title: 'Go to Google AI Studio',
      desc: (
        <>
          Visit{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 dark:text-violet-400 underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-violet-500"
          >
            aistudio.google.com/apikey
            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
          </a>{' '}
          and sign in with your Google account.
        </>
      ),
    },
    {
      title: 'Create a new API key',
      desc: (
        <>
          Click <strong className="text-slate-800 dark:text-slate-200">"Create API key"</strong>, choose{' '}
          <strong className="text-slate-800 dark:text-slate-200">"Create API key in new project"</strong> (or select an
          existing project), then click <strong className="text-slate-800 dark:text-slate-200">"Create"</strong>.
        </>
      ),
    },
    {
      title: 'Copy your key',
      desc: (
        <>
          Your key will look like <Code>AIzaSy…</Code>. Click the copy icon next to it. Keep it safe — Google will not
          show it again in full after you leave the page.
        </>
      ),
    },
    {
      title: 'Paste it in Presmistique',
      desc: (
        <>
          Head to your <strong className="text-slate-800 dark:text-slate-200">Profile → API Key</strong> section, paste
          the key, and hit <strong className="text-slate-800 dark:text-slate-200">Save</strong>. That's it — unlimited AI
          features, zero cost.
        </>
      ),
    },
  ];

  const securityPoints = [
    {
      icon: ShieldCheckIcon,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50/60 dark:bg-emerald-900/15',
      title: 'Encrypted in Transit',
      desc: 'Your key travels from your browser to our server over HTTPS/TLS, so it is never visible on the network.',
    },
    {
      icon: LockClosedIcon,
      color: 'text-violet-500',
      bg: 'bg-violet-50/60 dark:bg-violet-900/15',
      title: 'AES-256 at Rest',
      desc: 'We encrypt your key with AES-256-CBC and a unique random IV before persisting it. Only the ciphertext enters the database — never the raw key.',
    },
    {
      icon: EyeSlashIcon,
      color: 'text-blue-500',
      bg: 'bg-blue-50/60 dark:bg-blue-900/15',
      title: 'Masked on Display',
      desc: "When your key is sent back to the UI it's 80% masked (e.g. AIz**************kQ). You can confirm it's saved without exposing the full value.",
    },
    {
      icon: ServerIcon,
      color: 'text-rose-500',
      bg: 'bg-rose-50/60 dark:bg-rose-900/15',
      title: 'Used Only for Your Requests',
      desc: 'Your decrypted key is used exclusively to call the Gemini API on your behalf and is never logged, exported, or shared.',
    },
  ];

  const faqItems = [
    {
      q: 'Is the free Gemini API tier enough?',
      a: "Yes — Google's free tier (Gemini 1.5 Flash) is generous for resume-building workloads. Most users never hit the rate limits.",
    },
    {
      q: 'Can I remove my key later?',
      a: 'Absolutely. Go to Profile → API Key and click "Remove Key". It is deleted from our database immediately.',
    },
    {
      q: 'What happens to my Presmistique tokens if I use BYOK?',
      a: 'Your existing tokens are preserved. BYOK simply bypasses the token system — the AI calls are charged to your own Google account instead.',
    },
    {
      q: 'Which Gemini model does Presmistique use?',
      a: 'We use Gemini 2.5 Flash lite by default — fast, capable, and available on the free tier.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <AnimatedBackground />

      <main className="relative z-10 max-w-4xl mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-violet-600 transition-colors mb-8 group"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-5 border border-violet-200 dark:border-violet-800">
            <KeyIcon className="w-3.5 h-3.5" />
            BRING YOUR OWN KEY
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Use AI Features{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              For Free
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Plug in your own Gemini API key and unlock unlimited AI-powered resume suggestions, ATS analysis,
            and more — at zero cost to you.
          </p>
        </div>

        <div className="space-y-8">

          {/* ── How to get your Gemini key ── */}
          <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-7">
              <div className="p-2.5 rounded-2xl bg-violet-50 dark:bg-violet-900/20">
                <SparklesIcon className="w-6 h-6 text-violet-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Step-by-step: Get Your Gemini API Key
              </h2>
            </div>

            <div className="space-y-5">
              {geminiSteps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <StepBadge n={i + 1} />
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                      {step.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick link CTA */}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
            >
              Open Google AI Studio
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
          </section>

          {/* ── How we keep your key safe ── */}
          <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
                <ShieldCheckIcon className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                How We Keep Your Key Safe
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-7 ml-14">
              We treat your API key with the same care we'd want for our own. Here's exactly what happens under the hood.
            </p>

            {/* Pipeline */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 mb-7 border border-slate-100 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5 text-center">
                Key lifecycle
              </p>
              <SecurityPipeline />
            </div>

            {/* Detail cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {securityPoints.map((pt, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className={`flex-shrink-0 p-2.5 rounded-xl ${pt.bg}`}>
                    <pt.icon className={`w-5 h-5 ${pt.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">
                      {pt.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Technical callout */}
            <div className="mt-6 flex gap-3 p-4 rounded-2xl bg-slate-900 dark:bg-black/40 border border-slate-700">
              <InformationCircleIcon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-relaxed space-y-1">
                <p>
                  <span className="text-indigo-300 font-semibold">Encryption:</span> AES-256-CBC with a unique{' '}
                  <Code>crypto.randomBytes(16)</Code> IV per encryption. Format stored:{' '}
                  <Code>ivHex:ciphertext</Code>.
                </p>
                <p>
                  <span className="text-indigo-300 font-semibold">Validation:</span> Before decryption we check the
                  pattern — malformed values are rejected, never decoded.
                </p>
                <p>
                  <span className="text-indigo-300 font-semibold">Display masking:</span> Only the first 3 and last 2
                  characters are shown in the UI — the remaining characters are replaced with <Code>*</Code>.
                </p>
              </div>
            </div>
          </section>

          {/* ── Important notice ── */}
          <div className="flex gap-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              <p className="font-semibold mb-1">Keep your API key private</p>
              <p className="text-amber-700 dark:text-amber-400 text-xs">
                Never share your Gemini API key publicly or commit it to source control. If you believe your key has
                been compromised, revoke it immediately in{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-amber-600"
                >
                  Google AI Studio
                </a>{' '}
                and generate a new one.
              </p>
            </div>
          </div>

          {/* ── FAQ ── */}
          <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-5">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-5 last:pb-0"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                    {item.q}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed ml-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <KeyIcon className="w-6 h-6" />
                  Ready to add your key?
                </h2>
                <p className="text-violet-200 text-sm">
                  Go to your profile and paste your Gemini API key to unlock unlimited AI.
                </p>
              </div>
              <Link
                to="/profile"
                className="flex-shrink-0 px-7 py-3 bg-white text-violet-700 rounded-2xl font-bold text-sm hover:bg-violet-50 transition-colors shadow-lg"
              >
                Go to Profile →
              </Link>
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-400 dark:text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} Presmistique - AI Resume Builder. All rights reserved.</p>
          <p className="mt-2 italic">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default BYOKGuide;