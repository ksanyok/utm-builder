# Troubleshooting

## "Unknown UTM parameter"

Only standard GA4 parameters are accepted: source, medium, campaign, term, content, id, source_platform, creative_format and marketing_tactic.

## My shell breaks the URL

Quote URLs that contain `&` or `?`: `utm-builder --check "https://example.com/?a=1&utm_source=x"`.

## Visits still show as (direct) / (none)

A redirect may be dropping the query string, or the link is opened from an app that strips parameters. Open the final URL in a browser and check the address bar.

## Still stuck?

Open an [issue](https://github.com/ksanyok/utm-builder/issues/new/choose) with the command, the output (`--json` if possible) and your Node.js version — or compare with the [online version](https://promopilot.link/en/tools/utm-builder.php?utm_source=github&utm_medium=repo&utm_campaign=tools&utm_content=utm-builder).
