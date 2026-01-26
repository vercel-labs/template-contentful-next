# Integrating Contentful with Next.js 16 Cache Components

Content teams traditionally had to choose between fast static sites and dynamic, personalized experiences. Cache Components in Next.js 16 eliminate this trade-off, letting you build sites that are both fast and personalized without sacrificing performance. Pair this with Contentful to serve content instantly while still reflecting updates as soon as an editor hits Publish.

This guide walks through three rendering strategies in Next.js to explain the why and how behind Cache Components.

1. **Dynamic rendering** — Fresh content, slower pages
2. **Static rendering** — Fast pages, stale content
3. **Mixed (Cache Components)** — Fast pages and fresh content

The [full source](https://github.com/vercel-labs/template-contentful-next) is available on GitHub, and this guide starts from the `dynamic` branch.

---

## Prerequisites

- Contentful account: [https://www.contentful.com/sign-up/](https://www.contentful.com/sign-up/)
- Vercel account: [https://vercel.com/signup](https://vercel.com/signup)
- Node.js 18.17+
- `pnpm`
- Redis (optional)

---

## Setup

Start with a fully dynamic version of the application.

### 1. Clone the repo

```bash
npx create-next-app@latest my-contentful-app --example "https://github.com/vercel-labs/template-contentful-next/tree/dynamic"
cd my-contentful-app
```

### 2. Run the setup script

```bash
pnpm setup-contentful
```

The script creates a Contentful space, configures your content model, and writes credentials to `.env.local` so you can start your development server.

If you run into issues with the script, follow the manual steps below.

<details>
<summary><strong>Manual setup</strong></summary>

#### Create a Contentful space

Go to [https://app.contentful.com/spaces/new](https://app.contentful.com/spaces/new) and create an empty space.

#### Get API tokens

1. **Settings → API keys → Add API key**
2. Copy the **Space ID** and **Content Delivery API access token**
3. Go to **CMA tokens** and generate a personal token: [https://app.contentful.com/account/profile/cma_tokens](https://app.contentful.com/account/profile/cma_tokens)

#### Configure environment

Create `.env.local`:

```bash
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token

# Optional (only needed for `pnpm setup-contentful`)
# Create one at: https://app.contentful.com/account/profile/cma_tokens
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
```

#### Create the content model

In **Content model → Add content type**, create **Article** with ID `article`:

| Field         | ID             | Type                | Required |
| ------------- | -------------- | ------------------- | -------- |
| Title         | `title`        | Short text          | Yes      |
| Slug          | `slug`         | Short text (unique) | Yes      |
| Summary       | `summary`      | Short text          | No       |
| Details       | `details`      | Rich text           | No       |
| Date          | `date`         | Date only           | No       |
| Article Image | `articleImage` | Media               | No       |
| Author Name   | `authorName`   | Short text          | No       |
| Category Name | `categoryName` | Short text          | No       |

#### Create content

Add at least one Article entry and publish it.

</details>

Once setup is complete, your Contentful space should look like this:

![Contentful screenshot](./public/images/start_contentful.png)

### 3. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Next.js application. Your home page should look like this:
![Home page screenshot](./public/images/start_dev.png)

---

## Dynamic rendering

Dynamic rendering is the simplest place to start. It also mirrors what many teams ship first: fetch on every request to show the latest content.

### Home page

```jsx
// app/page.tsx
export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Articles />
    </main>
  );
}
```

The home page renders a single component named `<Articles />`, which uses the `getArticles` function to fetch from Contentful. Since `getArticles` runs without any dynamic params, Next.js treats this route as static by default.

### Article page

```jsx
// app/articles/[slug]/page.tsx
export default async function ArticlePage(props: { params: Promise<{ slug: string }> }) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <nav className="mb-12 flex items-center justify-between text-sm">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-black/50 transition-colors hover:text-black"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span>All articles</span>
        </Link>
        <Suspense fallback={<ViewsSkeleton />}>
          <Views params={props.params} />
        </Suspense>
      </nav>
      <Suspense fallback={<ArticleContentSkeleton />}>
        <ArticleContent params={props.params} />
      </Suspense>
    </main>
  );
}
```

However, the `/articles/[slug]` route renders `<ArticleContent>`, which depends on the dynamic parameter `[slug]`. This makes the route [dynamic by default](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#behavior), causing Next.js to fetch articles from Contentful on every request.

### Article component

```jsx
async function ArticleContent(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;

  const articles = await getArticles({
    "fields.slug": params.slug,
    limit: 1,
  });

  if (!articles || articles.length === 0) {
    notFound();
  }

  const { title, categoryName, authorName, summary, details, articleImage } = articles[0];

  return (
    <article>
      <TrackView slug={params.slug} />
      <div className="mb-8 flex items-center gap-4">
        <span className="inline-block bg-black px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
          {categoryName}
        </span>
      </div>

      <h1 className="mb-6 text-5xl leading-tight font-semibold text-balance text-black">{title}</h1>

      <div className="mb-12 flex items-center gap-3 text-lg text-black/60">
        <span>By {authorName}</span>
      </div>

      <div className="relative mb-12 aspect-2/1 w-full overflow-hidden border border-black/5 bg-black/5 shadow-sm">
        <ContentfulImage
          src={articleImage?.fields?.file?.url}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <div className="mb-12 border-b border-black/10 pb-12">
        <p className="text-xl leading-relaxed font-medium text-pretty text-black/80">{summary}</p>
      </div>

      <div
        className="max-w-none"
        style={{
          color: "rgb(0 0 0 / 0.8)",
        }}
      >
        <RichText content={details} />
      </div>
    </article>
  );
}
```

The `Views` component also depends on `[slug]` and reads real-time data from Redis.

### Views component

```jsx
// components/views.tsx
import { getViews } from "@/lib/redis";

type ViewsProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export function ViewsSkeleton() {
  return <span className="inline-block h-4 w-16 animate-pulse rounded-sm bg-black/10" />;
}

export async function Views({ params }: ViewsProps) {
  const resolvedParams = await params;
  // NOTE: `getViews()` uses Redis when `REDIS_URL` is set. Otherwise it returns a placeholder
  // value (so this template works without extra setup).
  const views = await getViews(resolvedParams.slug);

  return <span className="text-black/50 tabular-nums">{views.toLocaleString()} views</span>;
}
```

### The problem

This approach doesn't scale as traffic grows. The application hits the Contentful API on every request for articles that haven't changed, adding latency that harms user experience and degrades Core Web Vitals.

---

## Static rendering

Static generation becomes the logical next step when you need to scale content delivery. Next.js supports [static generation](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) via `generateStaticParams` and allows you to choose which pages to pre-render at build time.

### Generate static paths

Add this to the top of `app/articles/[slug]/page.tsx`:

```jsx
// app/articles/[slug]/page.tsx
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}
```

Now run `pnpm build`. Next.js generates static HTML for every article `slug` in `generateStaticParams`.

![Static Site Build](./public/images/ssg_terminal.png)

### The problems

This solved the latency issue of dynamic rendering, but introduced two new problems. Content was pre-rendered at build time, so it won't update when a user hits Publish in Contentful. The view counter was also pre-rendered, so it always shows a stale value.

You could try to hydrate the view counter on the client, but that has more trade-offs:

- Layout shift: The server sends initial HTML (often with a placeholder or stale value), then the client fetches the real data and updates the UI, causing visible content to jump around.
- Hydration mismatches: If the server-rendered HTML differs from what React expects on the client (e.g., a counter showing "0" on server but "42" after hydration), React will warn and potentially re-render, hurting performance.
- Extra API calls: The client must make a separate request to fetch the current count after the page loads, adding latency and network overhead that wouldn't exist with a pure server approach.

### The wrong workaround

You might think: wrap the view counter in `unstable_cache()` with `revalidate: 0` so it stays fresh—which is technically possible.

```jsx
// lib/redis.ts
import { unstable_cache } from "next/cache";

export const getCachedViews = unstable_cache(
  async (slug: string) => {
    const views = await redis.get(`views:${slug}`);
    return views ?? 0;
  },
  ["views"],
  {
    tags: ["views"],
    revalidate: 0, // Cache expires immediately
  }
);

// components/views.tsx
export async function Views({ slug }: { slug: string }) {
  const views = await getCachedViews(slug);
  return <span>{views} views</span>;
}
```

But `revalidate: 0` means the cache expires immediately, so every request still triggers a fetch. You pay for caching infrastructure and get zero caching benefit. You also add the complexity of `unstable_cache()` and manually coordinating cache tags.

Most importantly, you still can't mix rendering strategies on the same route. Articles want to cache for minutes or hours, and views want to update on every request. Static rendering is all-or-nothing; you can't keep one part static while another part stays dynamic.

---

## Cache Components

Cache Components solve this problem by letting you mix rendering strategies on the same page. Static sections are delivered instantly from the cache, while dynamic sections stream in with `Suspense`.

### Enable Cache Components

```ts
// next.config.ts
const nextConfig = {
  cacheComponents: true,

  // ...the rest of your config
} satisfies NextConfig;

export default nextConfig;
```

With `cacheComponents` enabled, async components require either the `"use cache"` directive or a `<Suspense>` boundary. Without one of these patterns, Next.js throws an error to help developers avoid performance issues.

### Cache home page content

Add `"use cache"` to the top of the `<Articles>` component. Next.js caches the rendered output of the component, allowing it to statically render this page at build time.

```jsx
async function Articles() {
  "use cache";
  cacheLife("days");
  const articles = await getArticles();

  // the rest of the component remains unchanged
}
```

Your home page content might change frequently, or it might stay static for weeks. Next.js provides `cacheLife` to configure the cache policy that best fits your needs. Learn more [here](https://nextjs.org/docs/app/api-reference/functions/cacheLife#preset-cache-profiles).

### Mix cached and dynamic content

The article detail page uses dynamic data in the `<Views>` component and static content in the `<ArticleContent>` component. Cache Components make it easy to mix these strategies on a single page. Start by removing the `<Suspense>` boundary around the `ArticleContent` component.

```jsx
// app/articles/[slug]/page.tsx
export default async function ArticlePage(props: { params: Promise<{ slug: string }> }) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <nav className="mb-12 flex items-center justify-between text-sm">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-black/50 transition-colors hover:text-black"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span>All articles</span>
        </Link>
        <Suspense fallback={<ViewsSkeleton />}>
          <Views params={props.params} /> {/* Fetches per request, streams in */}
        </Suspense>
      </nav>
      <ArticleContent params={props.params} /> {/* Cached via "use cache" */}
    </main>
  );
}
```

Run your development server and you’ll see this error: `Data that blocks navigation was accessed outside of <Suspense>`. To fix it, add `"use cache"` to the `<ArticleContent>` component.

```jsx
async function ArticleContent(props: { params: Promise<{ slug: string }> }) {
  "use cache";
  const params = await props.params;

  const article = await getArticles({
    "fields.slug": params.slug,
    limit: 1,
  });

  // the rest of the component remains unchanged
}
```

On-demand revalidation updates the page whenever a user hits Publish in Contentful. Before Cache Components, developers had to define cache tags before fetching content. The new `cacheTag` API lets you define them afterward. Fetch the content, create a unique cache tag based on the response, and use webhooks to revalidate.

Add a cache tag to `ArticleContent` based on the `sys.id` of the Contentful entry. This ID is a unique value assigned to every piece of content in Contentful. `sys.id` is more stable than the slug, which may change (and potentially require redirects). Next.js recommends pairing on-demand revalidation with the `"max"` cache profile for best performance.

```jsx
async function ArticleContent(props: { params: Promise<{ slug: string }> }) {
  "use cache";
  const params = await props.params;

  const articles = await getArticles({
    "fields.slug": params.slug,
    limit: 1,
  });

  if (!articles || articles.length === 0) {
    notFound();
  }

  cacheTag(articles[0].id);
  cacheLife("max");

  // the rest of the component remains unchanged
}
```

> Note: If a slug was not pre-rendered at build time, Next.js can still generate it on-demand and cache it (ISR-style).

The static shell renders instantly, covering navigation, layout, and article content. Meanwhile, `<Views>` streams in dynamic content with `<Suspense>`. You maintain both freshness and speed without compromise.

---

## On-demand revalidation

Use Contentful webhooks to notify your app about publish events. The webhook payload includes the entry `sys.id`, which you can use to invalidate any cached data tagged with that ID.

Protect the endpoint with a shared secret.

### Create a revalidation secret

```bash
openssl rand -base64 32
```

Add it to `.env.local`:

```bash
CONTENTFUL_REVALIDATE_SECRET=your-generated-secret
```

### Add the webhook endpoint

```ts
// app/api/contentful/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-vercel-reval-key");

  if (secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const entryId = body?.sys?.id;

  if (!entryId || typeof entryId !== "string") {
    return NextResponse.json({ message: "Missing or invalid entry ID" }, { status: 400 });
  }

  revalidateTag(entryId, "max");

  return NextResponse.json({ revalidated: true, entryId });
}
```

`revalidateTag(entryId, "max")` marks cached data tagged with that entry ID as stale. The next request can serve stale content immediately while fetching fresh data in the background, which gives you stale-while-revalidate behavior.

### Configure the Contentful webhook

1. **Settings → Webhooks → Add webhook**
2. **URL:** `https://your-domain.vercel.app/api/contentful/revalidate`
3. **Headers:** `x-vercel-reval-key: your-secret`
4. **Triggers:** Publish, Unpublish
5. **Save**

Now when you publish in Contentful, your `/api/contentful/revalidate` route invalidates the right cache entries and updates the application immediately.

---

## Commit all changes

```bash
git add .
git commit -m "Add Cache Components"
git push origin main
```

Import the project into Vercel: [https://vercel.com](https://vercel.com)

Add these environment variables:

- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ACCESS_TOKEN`
- `CONTENTFUL_REVALIDATE_SECRET`
- `REDIS_URL` (optional)

Deploy.

> After you deploy, update the Contentful webhook URL to point at your Vercel domain.

---

## Summary

You migrated a fully dynamic application to Cache Components. You now get granular cache invalidation and strong performance without sacrificing the ability to immediately update your content.

Cache Components eliminate the need to choose between performance and freshness. Your users get instant loading, your content editors get real-time publishing, and your development team stops rebuilding the entire site for every update.

To learn more about Next.js and Cache Components, visit [https://nextjs.org](https://nextjs.org).
