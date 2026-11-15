import React from 'react';
import { toast } from 'react-toastify';

const copyText = async (text, what = 'Text') => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`);
  } catch {
    toast.error('Copy failed. Select the text and copy it manually.');
  }
};

const SmallButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-xs font-medium px-2 py-1 rounded-md border border-amber-300 text-amber-800 bg-white hover:bg-amber-100"
  >
    {children}
  </button>
);

const Block = ({ title, hint, children }) => (
  <div className="mt-4">
    <h5 className="text-sm font-semibold text-gray-900">{title}</h5>
    {hint && <p className="text-xs text-gray-600 mb-2">{hint}</p>}
    {children}
  </div>
);

/**
 * Shown after a resume import. Lists what the form could not hold, so nothing
 * from the user's file disappears without them seeing it: sections with no
 * matching form step, values too long for their field, lines that ended up in
 * no field, and the full extracted text.
 */
const ImportReviewPanel = ({ report, extractedText, onAddAsAchievement, onDismiss }) => {
  const safeReport = report || {};
  const sections = safeReport.additionalSections || [];
  const overflow = safeReport.overflow || [];
  const unplaced = safeReport.unplacedLines || [];
  const warnings = safeReport.warnings || [];
  const isFallback = safeReport.parsedBy === 'fallback';
  const nothingToReview = !sections.length && !overflow.length && !unplaced.length && !warnings.length;

  return (
    <div className={`rounded-lg p-4 border ${nothingToReview ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className={`text-sm font-semibold ${nothingToReview ? 'text-green-900' : 'text-amber-900'}`}>
            {isFallback ? 'We partly filled in the form from your file' : 'We filled in the form from your file'}
          </h4>
          <p className="text-sm text-gray-700 mt-1">
            {isFallback
              ? "Our AI couldn't read your file just now, so we filled in your contact details, summary and skills. The rest of your file is listed below to copy into the form, or you can upload it again."
              : 'Check each step before saving.'}
            {nothingToReview && !isFallback && ' Everything in your file found a place in the form.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
          title="Hide this review"
          aria-label="Hide this review"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {warnings.length > 0 && (
        <Block title="Please check">
          <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1">
            {warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </Block>
      )}

      {sections.length > 0 && (
        <Block
          title="Sections without a matching form step"
          hint="Add one to Achievements, or copy it into the field that suits it best."
        >
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div key={`${section.title}-${index}`} className="bg-white border border-amber-200 rounded-md p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{section.title}</span>
                  <span className="flex gap-2">
                    <SmallButton onClick={() => copyText(section.items.join('\n'), section.title)}>Copy</SmallButton>
                    {onAddAsAchievement && (
                      <SmallButton onClick={() => onAddAsAchievement(index)}>Add to Achievements</SmallButton>
                    )}
                  </span>
                </div>
                <ul className="list-disc ml-5 text-sm text-gray-700">
                  {section.items.map((item, i) => <li key={`${index}-${i}`}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Block>
      )}

      {overflow.length > 0 && (
        <Block title="Text too long for its field" hint="We kept the start of it in the form. The full text is here.">
          <ul className="space-y-2">
            {overflow.map((item, i) => (
              <li key={`${item.field}-${i}`} className="bg-white border border-amber-200 rounded-md p-2 text-sm text-gray-700 flex justify-between gap-2">
                <span><strong>{item.field}:</strong>{' '}{item.value}</span>
                <SmallButton onClick={() => copyText(item.value, item.field)}>Copy</SmallButton>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {unplaced.length > 0 && (
        <Block title="Lines we couldn't place" hint="These lines from your file are not in any field yet.">
          <div className="bg-white border border-amber-200 rounded-md p-3">
            <ul className="text-sm text-gray-700 space-y-1 max-h-48 overflow-y-auto">
              {unplaced.map((line, i) => <li key={`${i}-${line.slice(0, 20)}`}>{line}</li>)}
            </ul>
            <div className="mt-2">
              <SmallButton onClick={() => copyText(unplaced.join('\n'), 'Lines')}>Copy all</SmallButton>
            </div>
          </div>
        </Block>
      )}

      {extractedText && (
        <details className="mt-4">
          <summary className="text-sm font-medium text-gray-800 cursor-pointer">Show all text read from your file</summary>
          <div className="mt-2 bg-white border border-gray-200 rounded-md p-3 max-h-64 overflow-y-auto">
            <p className="text-xs text-gray-700 whitespace-pre-wrap">{extractedText}</p>
          </div>
          <div className="mt-2">
            <SmallButton onClick={() => copyText(extractedText, 'Resume text')}>Copy all text</SmallButton>
          </div>
        </details>
      )}
    </div>
  );
};

export default ImportReviewPanel;
