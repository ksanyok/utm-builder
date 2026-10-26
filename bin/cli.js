#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { buildUtmUrl, parseUtmUrl, lintUtm } from '../src/index.js';

const HELP = `Usage: utm-builder <url> --source <s> --medium <m> --campaign <c> [options]
       utm-builder --check <url>
       utm-builder --batch links.csv --medium email --campaign spring_sale

Adds UTM parameters to a URL (normalised to lowercase, spaces → "_") or checks
an existing tagged URL for mistakes that break analytics attribution.

Options:
  --source, --medium, --campaign, --term, --content, --id   UTM values
  --keep-case        Do not lowercase values
  --separator <c>    Replacement for spaces (default: "_")
  --check <url>      Lint the UTM parameters of an existing URL
  --batch <file>     Tag every URL in a file (one per line, or "url,source" CSV)
  --json             Print JSON
  --strict           Exit with code 1 on warnings too (with --check)
  -h, --help         Show this help

Online version (no install): https://promopilot.link/en/tools/utm-builder.php
`;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const value = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
if (!args.length || flag('-h') || flag('--help')) { process.stdout.write(HELP); process.exit(args.length ? 0 : 2); }

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
const ICON = { error: c(31, '✖'), warning: c(33, '!'), info: c(36, 'i') };
const FIELDS = ['source', 'medium', 'campaign', 'term', 'content', 'id'];
const valued = new Set([...FIELDS.map((f) => `--${f}`), '--separator', '--check', '--batch']);
const params = Object.fromEntries(FIELDS.map((f) => [f, value(`--${f}`)]));
const opts = { lowercase: !flag('--keep-case'), separator: value('--separator') ?? '_' };

try {
  if (value('--check')) {
    const url = value('--check');
    const issues = lintUtm(url);
    if (flag('--json')) console.log(JSON.stringify({ url, ...parseUtmUrl(url), issues }, null, 2));
    else {
      const { utm } = parseUtmUrl(url);
      for (const [k, v] of Object.entries(utm)) console.log(`  ${c(1, k.padEnd(14))} ${v}`);
      console.log('');
      if (!issues.length) console.log(c(32, '✔ UTM tags look good'));
      for (const i of issues) console.log(`  ${ICON[i.level]} ${i.message}`);
    }
    process.exit(issues.some((i) => i.level === 'error' || (flag('--strict') && i.level === 'warning')) ? 1 : 0);
  }
  if (value('--batch')) {
    const lines = readFileSync(value('--batch'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    const out = lines.map((l) => {
      const [url, source] = l.split(',').map((s) => s.trim());
      return { url, tagged: buildUtmUrl(url, { ...params, source: source || params.source }, opts) };
    });
    console.log(flag('--json') ? JSON.stringify(out, null, 2) : out.map((o) => o.tagged).join('\n'));
    process.exit(0);
  }
  const url = args.find((a, i) => !a.startsWith('-') && !valued.has(args[i - 1]));
  if (!url) throw new Error('A URL is required');
  const tagged = buildUtmUrl(url, params, opts);
  const issues = lintUtm(tagged);
  if (flag('--json')) console.log(JSON.stringify({ url: tagged, issues }, null, 2));
  else {
    console.log(tagged);
    for (const i of issues) console.error(`  ${ICON[i.level]} ${i.message}`);
  }
  process.exit(issues.some((i) => i.level === 'error') ? 1 : 0);
} catch (err) {
  console.error(c(31, `Error: ${err.message}`));
  process.exit(2);
}
