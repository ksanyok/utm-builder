# FAQ

## Which UTM parameters are required?

For GA4 attribution use `utm_source`, `utm_medium` and `utm_campaign` on every link. `utm_term`, `utm_content` and `utm_id` are optional.

## Why lowercase everything?

Analytics values are case-sensitive: `Facebook` and `facebook` are reported as different sources. Lowercasing every value is the simplest way to stay consistent across a team.

## Should I tag internal links on my own site?

No. UTM parameters on internal links start a new session and overwrite the original source, so the real channel is lost.

## What medium should I use?

Use the values GA4 maps to channels: `cpc` for paid search, `email`, `social` (or `paid_social` style values via campaign naming), `referral`, `display`, `affiliate`. Custom mediums end up in *Unassigned*.

## Can UTM tags hurt SEO?

Tagged URLs can be crawled as duplicates if they are linked publicly. Use a canonical tag on the landing page; never put UTM tags in your sitemap or internal navigation.
