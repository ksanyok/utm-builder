export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id', 'utm_source_platform', 'utm_creative_format', 'utm_marketing_tactic'];

/** Default channel groups in GA4 recognise these medium values. */
export const KNOWN_MEDIUMS = ['cpc', 'ppc', 'paid', 'paidsearch', 'display', 'banner', 'cpm', 'email', 'e-mail', 'social', 'social-network', 'sm', 'organic', 'referral', 'affiliate', 'video', 'audio', 'sms', 'push', 'mobile', 'notification', 'qr', 'print', 'partner'];

const short = (k) => k.replace(/^utm_/, '');

/**
 * Normalise a UTM value: trim, lowercase and replace spaces with a separator.
 * @param {string} value
 * @param {{lowercase?: boolean, separator?: string}} [options]
 */
export function normaliseValue(value, options = {}) {
  let v = String(value ?? '').trim().replace(/\s+/g, options.separator ?? '_');
  if (options.lowercase !== false) v = v.toLowerCase();
  return v;
}

/**
 * Add UTM parameters to a URL. Existing UTM parameters are replaced, other query
 * parameters and the #fragment are kept.
 * @param {string} url
 * @param {Record<string,string>} params keys with or without the utm_ prefix
 * @param {{lowercase?: boolean, separator?: string}} [options]
 */
export function buildUtmUrl(url, params, options = {}) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    const key = k.startsWith('utm_') ? k : `utm_${k}`;
    if (!UTM_KEYS.includes(key)) throw new TypeError(`Unknown UTM parameter "${k}"`);
    u.searchParams.set(key, normaliseValue(v, options));
  }
  return u.toString();
}

/** Extract UTM parameters from a URL. */
export function parseUtmUrl(url) {
  const u = new URL(url);
  const utm = {};
  const other = {};
  for (const [k, v] of u.searchParams) (UTM_KEYS.includes(k.toLowerCase()) ? utm : other)[k] = v;
  u.search = new URLSearchParams(other).toString();
  return { base: u.toString(), utm, other };
}

/**
 * Lint UTM parameters of a URL for analytics mistakes.
 * @returns {{level: 'error'|'warning'|'info', code: string, message: string}[]}
 */
export function lintUtm(url) {
  const out = [];
  const add = (level, code, message) => out.push({ level, code, message });
  let u;
  try { u = new URL(url); } catch { return [{ level: 'error', code: 'invalid-url', message: `"${url}" is not an absolute URL.` }]; }
  const keys = [...u.searchParams.keys()];
  const utm = parseUtmUrl(url).utm;
  for (const req of ['utm_source', 'utm_medium', 'utm_campaign']) {
    if (!utm[req]) add('error', `missing-${short(req)}`, `${req} is missing; GA4 needs source, medium and campaign to attribute the visit.`);
  }
  for (const k of new Set(keys)) {
    if (/^utm_/i.test(k) && keys.filter((x) => x === k).length > 1) add('error', 'duplicate-key', `"${k}" appears more than once; only one value is used.`);
    if (/^utm_/i.test(k) && k !== k.toLowerCase()) add('error', 'uppercase-key', `"${k}" must be lowercase; analytics treats it as an unknown parameter.`);
    else if (/^utm_/.test(k) && !UTM_KEYS.includes(k)) add('warning', 'unknown-key', `"${k}" is not a standard UTM parameter.`);
  }
  for (const [k, v] of Object.entries(utm)) {
    if (v !== v.toLowerCase()) add('warning', 'mixed-case', `${k}=${v} has capitals; values are case-sensitive, so "${v}" and "${v.toLowerCase()}" become separate rows in reports.`);
    if (/\s/.test(v)) add('warning', 'spaces', `${k}=${v} contains spaces; use "_" or "-".`);
    if (/[^\w.\-~+]/.test(v.replace(/\s/g, ''))) add('info', 'special-chars', `${k}=${v} contains special characters.`);
  }
  if (utm.utm_medium && !KNOWN_MEDIUMS.includes(utm.utm_medium.toLowerCase())) add('warning', 'custom-medium', `utm_medium=${utm.utm_medium} does not match GA4 default channel rules; visits may land in "Unassigned".`);
  if (u.hash && u.hash.includes('utm_')) add('error', 'utm-in-fragment', 'UTM parameters after "#" are not sent to the server and are ignored by most analytics.');
  if (u.protocol === 'http:') add('info', 'http', 'The URL uses http://; a redirect to https:// may drop parameters on some servers.');
  return out;
}
