# Getting started

## Requirements

Node.js 18 or newer. No other dependencies.

## Install

```bash
# one-off run
npx github:ksanyok/utm-builder https://example.com --source newsletter --medium email --campaign spring_sale

# global CLI
npm install -g github:ksanyok/utm-builder

# as a library in your project
npm install github:ksanyok/utm-builder
```

## First run

```bash
utm-builder https://example.com --source newsletter --medium email --campaign spring_sale
```

When building, the tagged URL is printed to stdout (so you can pipe it) and any warnings go to stderr. With `--check`, the UTM parameters found are listed, followed by problems: `✖` errors break attribution, `!` warnings split or misclassify traffic.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | No errors (warnings allowed unless `--strict`) |
| 1 | Errors found (or warnings with `--strict`) |
| 2 | Bad arguments or the check could not run |

## More examples

**Check a link someone sent you**

```bash
utm-builder --check "https://example.com/?utm_source=Facebook&utm_medium=Social Media"
```

**Tag a list of links (one per line, optional ",source")**

```bash
utm-builder --batch links.txt --medium email --campaign october_digest > tagged.txt
```

**Keep the original case and use dashes**

```bash
utm-builder https://example.com --source LinkedIn --medium social --campaign "Q4 Launch" --keep-case --separator -
```

## Without installing anything

Use the [online UTM Builder](https://promopilot.link/en/tools/utm-builder.php?utm_source=github&utm_medium=repo&utm_campaign=tools&utm_content=utm-builder).
