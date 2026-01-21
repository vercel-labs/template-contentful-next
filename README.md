[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel-partner-solutions%2Fnextjs-16-contentful-guide&env=CONTENTFUL_SPACE_ID,CONTENTFUL_ACCESS_TOKEN,CONTENTFUL_PREVIEW_ACCESS_TOKEN,CONTENTFUL_REVALIDATE_SECRET,CONTENTFUL_PREVIEW_SECRET)

# Next.js 16 + Contentful Starter

This is a [Next.js](https://nextjs.org/) project that integrates with [Contentful](https://www.contentful.com/) for viewing knowledge articles. This project uses the latest Next.js 16 features, including:

- [Next.js App Router](https://nextjs.org/docs/app)
- [Cache Components](#)
- Article listing
- Article detail pages
- On-demand [revalidation](https://nextjs.org/docs/app/getting-started/fetching-data) with Next.js [Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) and Contentful [Webhooks](https://www.contentful.com/developers/docs/webhooks/overview/)
- Content Preview with Next.js [Draft Mode](https://nextjs.org/docs/app/guides/draft-mode) and Contentful [Content Preview](https://www.contentful.com/developers/docs/references/content-preview-api/)

For a complete guide on how to get started with Next.js 16 and Contentful, see the [Next.js 16 and Contentful integration guide](https://www.contentful.com/blog/nextjs-16-contentful-guide/).

## Required Environment Variables

This project requires the following environment variables to be set:

```
CONTENTFUL_SPACE_ID=<Replace with your Contentful Space ID>
CONTENTFUL_ACCESS_TOKEN=<Replace with your Contentful access token>
CONTENTFUL_PREVIEW_ACCESS_TOKEN=<Replace with your Contentful preview access token>
CONTENTFUL_REVALIDATE_SECRET=<Replace with a secret string to be set in Contentful's webhook settings>
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js 16 announcement](#)
- [Next.js documentation](https://nextjs.org/docs)
- [nextjs.org/learn](https://nextjs.org/learn)
