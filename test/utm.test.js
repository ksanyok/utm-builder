import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildUtmUrl, parseUtmUrl, lintUtm, normaliseValue } from '../src/index.js';

const codes = (l) => l.map((i) => i.code);

test('builds a tagged URL and keeps query and fragment', () => {
  const url = buildUtmUrl('https://example.com/p?a=1#top', { source: 'News Letter', medium: 'email', campaign: 'Spring Sale' });
  assert.equal(url, 'https://example.com/p?a=1&utm_source=news_letter&utm_medium=email&utm_campaign=spring_sale#top');
});

test('replaces existing UTM values and skips empty ones', () => {
  const url = buildUtmUrl('https://example.com/?utm_source=old', { utm_source: 'new', medium: 'cpc', campaign: 'x', term: '' });
  assert.deepEqual(parseUtmUrl(url).utm, { utm_source: 'new', utm_medium: 'cpc', utm_campaign: 'x' });
});

test('normalisation options', () => {
  assert.equal(normaliseValue('  Black Friday  '), 'black_friday');
  assert.equal(normaliseValue('Black Friday', { lowercase: false, separator: '-' }), 'Black-Friday');
  assert.throws(() => buildUtmUrl('https://example.com', { foo: 'x' }), /Unknown UTM/);
});

test('parses UTM and other parameters', () => {
  const p = parseUtmUrl('https://example.com/a?id=5&utm_source=x&utm_medium=y');
  assert.equal(p.base, 'https://example.com/a?id=5');
  assert.deepEqual(p.other, { id: '5' });
});

test('a clean URL has no issues', () => {
  assert.deepEqual(lintUtm('https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=brand'), []);
});

test('lints analytics mistakes', () => {
  const c = codes(lintUtm('http://example.com/?utm_source=Facebook&UTM_Medium=x&utm_campaign=a&utm_campaign=b&utm_medium=social%20media&utm_foo=1#utm_term=x'));
  for (const code of ['duplicate-key', 'uppercase-key', 'mixed-case', 'spaces', 'custom-medium', 'unknown-key', 'utm-in-fragment', 'http']) assert.ok(c.includes(code), code);
  assert.ok(codes(lintUtm('https://example.com/')).includes('missing-source'));
  assert.ok(codes(lintUtm('not a url')).includes('invalid-url'));
});
