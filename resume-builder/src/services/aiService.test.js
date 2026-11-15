jest.mock('./api', () => ({ apiHelpers: { updateTokenData: jest.fn() } }));

import { aiErrorMessage, plainTextLength } from './aiService';

describe('aiErrorMessage', () => {
  test('uses the server message, validation errors, or a status-specific fallback', () => {
    expect(aiErrorMessage(403, { limitReached: true, error: 'Insufficient tokens.' })).toMatch(/no AI tokens left/);
    expect(aiErrorMessage(502, { error: 'The AI returned an incomplete answer. Please try again.' })).toMatch(/incomplete answer/);
    expect(aiErrorMessage(400, { errors: [{ msg: 'Invalid field' }] })).toBe('Invalid field');
    expect(aiErrorMessage(504, {})).toMatch(/took too long/);
    // A message that merely mentions tokens is not turned into "tokens exhausted".
    expect(aiErrorMessage(500, { error: 'Your token was refunded.' })).toBe('Your token was refunded.');
  });
});

describe('plainTextLength', () => {
  test('counts visible text, not markup', () => {
    expect(plainTextLength('<ul><li>Hello</li><li>world</li></ul>')).toBe('Hello world'.length);
    expect(plainTextLength('<p>&nbsp;</p>')).toBe(0);
  });
});
