# Next.js 16 + Contentful Starter

A starter template demonstrating three rendering strategies in Next.js 16 with Contentful as the content source.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Ftemplate-contentful-next&env=CONTENTFUL_SPACE_ID,CONTENTFUL_ACCESS_TOKEN,CONTENTFUL_PREVIEW_ACCESS_TOKEN,CONTENTFUL_REVALIDATE_SECRET)

## The Problem

Content teams face a tradeoff:

- **Dynamic rendering** → Fresh content, but slow pages
- **Static rendering** → Fast pages, but stale content until rebuild

Cache Components in Next.js 16 break this tradeoff. You cache the stable parts (Contentful content) and keep the live parts (views, personalization) dynamic—on the same page.

## Branches

This repo includes three branches, each demonstrating a different rendering strategy:

| Branch             | Rendering    | Description                                            |
| ------------------ | ------------ | ------------------------------------------------------ |
| `main`             | Dynamic      | Fresh content on every request                         |
| `static`           | Static (SSG) | Pre-rendered at build time with `generateStaticParams` |
| `cache-components` | Mixed        | Cached content + dynamic views via Cache Components    |

## Quick Start

```bash
npx create-next-app@latest my-contentful-app --example "https://github.com/vercel-labs/template-contentful-next"
cd my-contentful-app
pnpm setup-contentful
pnpm dev
```

The setup wizard creates a Contentful space, configures the content model, and writes credentials to `.env.local`.

## Environment Variables

```bash
CONTENTFUL_SPACE_ID=<your space id>
CONTENTFUL_ACCESS_TOKEN=<delivery api token>
CONTENTFUL_PREVIEW_ACCESS_TOKEN=<preview api token>
CONTENTFUL_REVALIDATE_SECRET=<secret for webhook revalidation>
REDIS_URL=<optional, for view counts>
```

## Project Structure

```
app/
├── page.tsx                    # Article listing
├── articles/[slug]/page.tsx    # Article detail
└── api/contentful/revalidate/  # Webhook endpoint
lib/
└── contentful/
    ├── client.ts               # Contentful client
    ├── queries.ts              # Data fetching (cached in cache-components branch)
    └── types.ts                # TypeScript types
```

## Learn More

For a complete walkthrough of the three rendering strategies and how to implement Cache Components, see [guide.md](./guide.md).

- [Next.js Documentation](https://nextjs.org/docs)
- [Contentful Documentation](https://www.contentful.com/developers/docs/)
- [Cache Components](https://nextjs.org/docs/app/building-your-application/caching)
