import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrating Contentful with Next.js 16 Cache Components",
  description:
    "Learn how to use Next.js 16 Cache Components with Contentful for fast, fresh content delivery.",
};

function CodeBlock({ children, language }: { children: string; language?: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
      <code>{children}</code>
    </pre>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">{children}</code>
  );
}

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <article className="prose prose-zinc max-w-none">
        <h1 className="text-4xl font-bold tracking-tight">
          Integrating Contentful with Next.js 16 Cache Components
        </h1>

        <p className="mt-6 text-lg text-zinc-600">
          Next.js 16 ships with Cache Components: a way to control caching at the component level
          instead of per route. Pair that with Contentful and you can serve content instantly from
          the edge while still reflecting updates right after an editor hits Publish.
        </p>

        <p className="mt-4 text-zinc-600">Here's the tension most content teams run into:</p>

        <ul className="mt-4 list-disc space-y-2 pl-6 text-zinc-600">
          <li>
            If you render dynamically, you get fresh content, but you pay for it on every request.
          </li>
          <li>If you render statically, you get speed, but publishes don't show up until you rebuild.</li>
          <li>
            If you try to bolt on workarounds, you usually push complexity to the client or lose the
            benefits of caching.
          </li>
        </ul>

        <p className="mt-4 text-zinc-600">
          Cache Components exist to break that tradeoff. You cache the parts that should be stable
          (Contentful content) and keep the parts that must be live (views, personalization,
          pricing, inventory) dynamic—on the same page.
        </p>

        <p className="mt-4 text-zinc-600">
          This guide walks through the three rendering strategies you can use in Next.js. The goal
          is to help you understand the why and the how behind Cache Components so you can ship
          faster, fresher sites.
        </p>

        <ol className="mt-4 list-decimal space-y-1 pl-6 text-zinc-600">
          <li>
            <strong>Dynamic rendering</strong> — Fresh content, slower pages
          </li>
          <li>
            <strong>Static rendering</strong> — Fast pages, stale content
          </li>
          <li>
            <strong>Mixed (Cache Components)</strong> — Fast and fresh
          </li>
        </ol>

        <p className="mt-4 text-zinc-600">
          The full source lives on GitHub:{" "}
          <Link
            href="https://github.com/vercel-labs/template-contentful-next"
            className="text-blue-600 hover:underline"
          >
            https://github.com/vercel-labs/template-contentful-next
          </Link>
        </p>

        <hr className="my-12 border-zinc-200" />

        <h2 className="mt-12 text-2xl font-semibold">Prerequisites</h2>

        <ul className="mt-4 list-disc space-y-1 pl-6 text-zinc-600">
          <li>
            Contentful account:{" "}
            <Link href="https://www.contentful.com/sign-up/" className="text-blue-600 hover:underline">
              https://www.contentful.com/sign-up/
            </Link>
          </li>
          <li>
            Vercel account:{" "}
            <Link href="https://vercel.com/signup" className="text-blue-600 hover:underline">
              https://vercel.com/signup
            </Link>
          </li>
          <li>Node.js 18.17+</li>
          <li>
            <InlineCode>pnpm</InlineCode>
          </li>
          <li>Redis (optional)</li>
        </ul>

        <hr className="my-12 border-zinc-200" />

        <h2 className="mt-12 text-2xl font-semibold">Setup</h2>

        <p className="mt-4 text-zinc-600">
          We start with a fully dynamic version of the site. Then we add static generation and call
          out the tradeoffs. Finally, we turn on Cache Components to get the best of both.
        </p>

        <h3 className="mt-8 text-xl font-medium">1. Clone the starter</h3>

        <CodeBlock language="bash">{`npx create-next-app@latest my-contentful-app --example "https://github.com/vercel-labs/template-contentful-next"
cd my-contentful-app`}</CodeBlock>

        <h3 className="mt-8 text-xl font-medium">2. Run the setup wizard</h3>

        <CodeBlock language="bash">pnpm setup-contentful</CodeBlock>

        <p className="mt-4 text-zinc-600">
          The wizard creates a Contentful space, configures your content model, and writes
          credentials to <InlineCode>.env.local</InlineCode>.
        </p>

        <p className="mt-4 text-zinc-600">
          If you hit issues with the wizard, follow the manual steps below.
        </p>

        <details className="mt-4">
          <summary className="cursor-pointer font-medium text-zinc-800">Manual setup</summary>
          <div className="mt-4 space-y-4 border-l-2 border-zinc-200 pl-4">
            <p className="text-zinc-600">
              If <InlineCode>pnpm setup-contentful</InlineCode> fails:
            </p>

            <h4 className="font-medium">Create a Contentful space</h4>
            <p className="text-zinc-600">
              Go to{" "}
              <Link
                href="https://app.contentful.com/spaces/new"
                className="text-blue-600 hover:underline"
              >
                https://app.contentful.com/spaces/new
              </Link>{" "}
              and create an empty space.
            </p>

            <h4 className="font-medium">Get API tokens</h4>
            <ol className="list-decimal space-y-1 pl-6 text-zinc-600">
              <li>
                <strong>Settings → API keys → Add API key</strong>
              </li>
              <li>
                Copy the <strong>Space ID</strong> and{" "}
                <strong>Content Delivery API access token</strong>
              </li>
              <li>
                Go to CMA tokens and generate a personal token:{" "}
                <Link
                  href="https://app.contentful.com/account/profile/cma_tokens"
                  className="text-blue-600 hover:underline"
                >
                  https://app.contentful.com/account/profile/cma_tokens
                </Link>
              </li>
            </ol>

            <h4 className="font-medium">Configure environment</h4>
            <p className="text-zinc-600">
              Create <InlineCode>.env.local</InlineCode>:
            </p>
            <CodeBlock language="bash">{`CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token`}</CodeBlock>

            <h4 className="font-medium">Create the content model</h4>
            <p className="text-zinc-600">
              In <strong>Content model → Add content type</strong>, create <strong>Article</strong>{" "}
              with ID <InlineCode>article</InlineCode>:
            </p>

            <div className="overflow-x-auto">
              <table className="mt-2 w-full text-left text-sm">
                <thead className="border-b border-zinc-200">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Field</th>
                    <th className="pb-2 pr-4 font-medium">ID</th>
                    <th className="pb-2 pr-4 font-medium">Type</th>
                    <th className="pb-2 font-medium">Required</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-600">
                  <tr className="border-b border-zinc-100">
                    <td className="py-2 pr-4">Title</td>
                    <td className="py-2 pr-4">
                      <InlineCode>title</InlineCode>
                    </td>
                    <td className="py-2 pr-4">Short text</td>
                    <td className="py-2">Yes</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="py-2 pr-4">Slug</td>
                    <td className="py-2 pr-4">
                      <InlineCode>slug</InlineCode>
                    </td>
                    <td className="py-2 pr-4">Short text (unique)</td>
                    <td className="py-2">Yes</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="py-2 pr-4">Summary</td>
                    <td className="py-2 pr-4">
                      <InlineCode>summary</InlineCode>
                    </td>
                    <td className="py-2 pr-4">Short text</td>
                    <td className="py-2">No</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="py-2 pr-4">Details</td>
                    <td className="py-2 pr-4">
                      <InlineCode>details</InlineCode>
                    </td>
                    <td className="py-2 pr-4">Rich text</td>
                    <td className="py-2">No</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="py-2 pr-4">Date</td>
                    <td className="py-2 pr-4">
                      <InlineCode>date</InlineCode>
                    </td>
                    <td className="py-2 pr-4">Date only</td>
                    <td className="py-2">No</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="py-2 pr-4">Article Image</td>
                    <td className="py-2 pr-4">
                      <InlineCode>articleImage</InlineCode>
                    </td>
                    <td className="py-2 pr-4">Media</td>
                    <td className="py-2">No</td>
                  </tr>
                  <tr className="border-b border-zinc-100">
                    <td className="py-2 pr-4">Author Name</td>
                    <td className="py-2 pr-4">
                      <InlineCode>authorName</InlineCode>
                    </td>
                    <td className="py-2 pr-4">Short text</td>
                    <td className="py-2">No</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Category Name</td>
                    <td className="py-2 pr-4">
                      <InlineCode>categoryName</InlineCode>
                    </td>
                    <td className="py-2 pr-4">Short text</td>
                    <td className="py-2">No</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="font-medium">Create content</h4>
            <p className="text-zinc-600">Add at least one Article entry and publish it.</p>
          </div>
        </details>

        <h3 className="mt-8 text-xl font-medium">3. Start the development server</h3>

        <CodeBlock language="bash">pnpm dev</CodeBlock>

        <p className="mt-4 text-zinc-600">
          Open{" "}
          <Link href="http://localhost:3000" className="text-blue-600 hover:underline">
            http://localhost:3000
          </Link>{" "}
          to see your Contentful-powered site.
        </p>

        <hr className="my-12 border-zinc-200" />

        <h2 className="mt-12 text-2xl font-semibold">Project structure</h2>

        <p className="mt-4 text-zinc-600">The starter has two routes:</p>

        <ul className="mt-4 list-disc space-y-1 pl-6 text-zinc-600">
          <li>
            <InlineCode>app/page.tsx</InlineCode> — lists all articles
          </li>
          <li>
            <InlineCode>app/articles/[slug]/page.tsx</InlineCode> — renders a single article
          </li>
        </ul>

        <p className="mt-4 text-zinc-600">
          All Contentful queries live in <InlineCode>lib/contentful/queries.ts</InlineCode>. That
          matters because you'll change how you fetch data without rewriting the pages.
        </p>

        <p className="mt-4 text-zinc-600">
          The app also includes a view counter. That's intentional. View counts change on every
          request, which creates tension with static rendering. We use this to show why Cache
          Components exist.
        </p>

        <blockquote className="mt-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600">
          Redis is optional. If you don't provide Redis, the app falls back to random view counts.
        </blockquote>

        <hr className="my-12 border-zinc-200" />

        <h2 className="mt-12 text-2xl font-semibold">Part 1: Dynamic rendering</h2>

        <p className="mt-4 text-zinc-600">
          Dynamic rendering is the simplest place to start. It also mirrors what many teams ship
          first: fetch on request, show the latest content, move on.
        </p>

        <p className="mt-4 text-zinc-600">
          It works—until traffic grows or you realize most of your content doesn't change often.
        </p>

        <h3 className="mt-8 text-xl font-medium">Homepage</h3>

        <CodeBlock language="tsx">{`// app/page.tsx
export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Articles />
    </main>
  );
}`}</CodeBlock>

        <p className="mt-4 text-zinc-600">
          The homepage is basically one component: <InlineCode>{"<Articles />"}</InlineCode>. It
          calls <InlineCode>getArticles</InlineCode> to fetch all articles from Contentful.
        </p>

        <p className="mt-4 text-zinc-600">
          Because <InlineCode>getArticles</InlineCode> runs without dynamic params, Next.js can
          treat this route as static by default. That sounds great, but the catch shows up on the
          article route.
        </p>

        <h3 className="mt-8 text-xl font-medium">Article page</h3>

        <CodeBlock language="tsx">{`// app/articles/[slug]/page.tsx
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
}`}</CodeBlock>

        <p className="mt-4 text-zinc-600">
          <InlineCode>/articles/[slug]</InlineCode> depends on the dynamic param{" "}
          <InlineCode>[slug]</InlineCode>. That makes the route dynamic by default, so Next.js
          fetches from Contentful on every request.
        </p>

        <h3 className="mt-8 text-xl font-medium">Views component</h3>

        <CodeBlock language="tsx">{`// components/views.tsx
import { getViews } from "@/lib/redis";

type ViewsProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export function ViewsSkeleton() {
  return <span className="inline-block h-4 w-16 animate-pulse rounded-sm bg-black/10" />;
}

export async function Views({ params }: ViewsProps) {
  const resolvedParams = await params;
  const views = await getViews(resolvedParams.slug);

  return <span className="text-black/50 tabular-nums">{views.toLocaleString()} views</span>;
}`}</CodeBlock>

        <p className="mt-4 text-zinc-600">
          <InlineCode>Views</InlineCode> fetches the latest count from Redis.{" "}
          <InlineCode>TrackView</InlineCode> increments the count when the page loads.
        </p>

        <h3 className="mt-8 text-xl font-medium">The problem</h3>

        <p className="mt-4 text-zinc-600">
          Dynamic rendering makes every request pay the full cost:
        </p>

        <ul className="mt-4 list-disc space-y-1 pl-6 text-zinc-600">
          <li>Every page load hits Contentful's API</li>
          <li>Time to first byte goes up</li>
          <li>You lose edge caching for content that barely changes</li>
          <li>You do redundant work at scale</li>
        </ul>

        <p className="mt-4 text-zinc-600">
          If your content updates once a week, fetching it on every request is wasted effort.
        </p>

        <hr className="my-12 border-zinc-200" />

        <h2 className="mt-12 text-2xl font-semibold">Part 2: Static rendering</h2>

        <p className="mt-4 text-zinc-600">
          Dynamic rendering wastes effort when content barely changes. Static generation is the
          obvious fix: pre-render pages at build time and serve them from the CDN.
        </p>

        <p className="mt-4 text-zinc-600">
          Next.js supports this via <InlineCode>generateStaticParams</InlineCode>, which tells the
          framework which paths to generate ahead of time.
        </p>

        <h3 className="mt-8 text-xl font-medium">Generate static paths</h3>

        <p className="mt-4 text-zinc-600">
          Add this to the top of <InlineCode>app/articles/[slug]/page.tsx</InlineCode>:
        </p>

        <CodeBlock language="tsx">{`// app/articles/[slug]/page.tsx
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}`}</CodeBlock>

        <p className="mt-4 text-zinc-600">Now run:</p>

        <CodeBlock language="bash">pnpm build</CodeBlock>

        <p className="mt-4 text-zinc-600">
          Next.js generates HTML for every article and serves it from the CDN.
        </p>

        <h3 className="mt-8 text-xl font-medium">The problems</h3>

        <p className="mt-4 text-zinc-600">
          Static generation works—until the first time someone publishes and expects the site to
          update.
        </p>

        <p className="mt-4 text-zinc-600">
          <strong>Content goes stale.</strong> An editor publishes an article and nothing changes
          until you redeploy. For content sites, that lag hurts.
        </p>

        <p className="mt-4 text-zinc-600">
          <strong>Dynamic features freeze.</strong> The view counter locks in at build time. Every
          user sees the same stale number. You can hydrate the counter on the client, but now you
          trade server simplicity for client complexity: layout shift, hydration mismatches, extra
          API calls.
        </p>

        <h3 className="mt-8 text-xl font-medium">The workaround (and why it still loses)</h3>

        <p className="mt-4 text-zinc-600">
          You might think: wrap the view counter in <InlineCode>unstable_cache()</InlineCode> with{" "}
          <InlineCode>revalidate: 0</InlineCode> so it stays fresh. It's technically possible:
        </p>

        <CodeBlock language="tsx">{`// lib/redis.ts
import { unstable_cache } from "next/cache";

export const getCachedViews = unstable_cache(
  async (slug: string) => {
    const views = await redis.get(\`views:\${slug}\`);
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
}`}</CodeBlock>

        <p className="mt-4 text-zinc-600">
          This defeats the purpose. <InlineCode>revalidate: 0</InlineCode> means the cache expires
          immediately, so every request still triggers a fetch. You pay for caching infrastructure
          and get zero caching benefit.
        </p>

        <p className="mt-4 text-zinc-600">You also add complexity:</p>

        <ul className="mt-4 list-disc space-y-1 pl-6 text-zinc-600">
          <li>
            You wrap every data function in <InlineCode>unstable_cache()</InlineCode>
          </li>
          <li>You define and coordinate tags manually</li>
          <li>You handle tag collisions across data sources</li>
          <li>You debug cache misses with limited visibility</li>
        </ul>

        <p className="mt-4 text-zinc-600">
          Most importantly, you still can't mix strategies on the same route. Contentful content
          wants to cache for minutes or hours. Views want to update every request. Page-level
          caching forces you to pick one.
        </p>

        <p className="mt-4 text-zinc-600">
          Static rendering is all-or-nothing. You can't keep one part static while another part
          stays dynamic.
        </p>

        <hr className="my-12 border-zinc-200" />

        <h2 className="mt-12 text-2xl font-semibold">Part 3: Cache Components</h2>

        <p className="mt-4 text-zinc-600">
          This is exactly the gap Cache Components fill: different cache policies on the same page,
          without pushing your dynamic pieces to the client.
        </p>

        <p className="mt-4 text-zinc-600">
          Cache Components let you mix cached and dynamic content on the same page using partial
          prerendering. The static parts serve instantly from cache. The dynamic parts stream in at
          request time.
        </p>

        <h3 className="mt-8 text-xl font-medium">Enable Cache Components</h3>

        <CodeBlock language="ts">{`// next.config.ts
const nextConfig = {
  cacheComponents: true,

  // ...the rest of your config
};

export default nextConfig;`}</CodeBlock>

        <p className="mt-4 text-zinc-600">
          With <InlineCode>cacheComponents</InlineCode> enabled, async components that fetch data
          must either:
        </p>

        <ul className="mt-4 list-disc space-y-1 pl-6 text-zinc-600">
          <li>
            Use <InlineCode>"use cache"</InlineCode> so they can run inside the cached shell
          </li>
          <li>
            Or wrap in <InlineCode>{"<Suspense>"}</InlineCode> so they stream at request time
          </li>
        </ul>

        <p className="mt-4 text-zinc-600">
          If you do neither, Next.js throws an error like:{" "}
          <InlineCode>Uncached data was accessed outside of {"<Suspense>"}.</InlineCode>
        </p>

        <p className="mt-4 text-zinc-600">
          That constraint forces you to be explicit about caching intent—which means fewer surprises
          in production.
        </p>

        <p className="mt-4 text-zinc-600">
          To enable proper data access, cache your <InlineCode>getArticles</InlineCode> query. That
          lets you keep Contentful content cached while keeping view count data dynamic on the same
          page.
        </p>

        <h3 className="mt-8 text-xl font-medium">Cache Contentful queries</h3>

        <CodeBlock language="ts">{`// lib/contentful/queries.ts
import { cacheTag } from "next/cache";
import { getContentfulClient } from "./client";
import { ArticleQuery, ArticleSkeleton, CONTENT_TYPE_IDS } from "./types";
import { extractArticleFields } from "./utils";

export const getArticles = async (query?: ArticleQuery) => {
  "use cache";
  const client = getContentfulClient();
  const entriesResult = await client.withoutUnresolvableLinks.getEntries<ArticleSkeleton>({
    content_type: CONTENT_TYPE_IDS.ARTICLE,
    ...query,
  });
  const entries = extractArticleFields(entriesResult);
  // Tag the cache with each article's ID for granular invalidation.
  // When any article changes, you invalidate only caches that include it.
  const tags = entries.map((entry) => entry.id);
  if (tags.length > 0) {
    cacheTag(...tags);
  }
  return entries;
};`}</CodeBlock>

        <p className="mt-4 text-zinc-600">Two key things happen here:</p>

        <ol className="mt-4 list-decimal space-y-1 pl-6 text-zinc-600">
          <li>
            <InlineCode>"use cache"</InlineCode> caches the function's return value in the static
            shell
          </li>
          <li>
            <InlineCode>cacheTag()</InlineCode> tags the cache with entry IDs for granular
            invalidation
          </li>
        </ol>

        <p className="mt-4 text-zinc-600">
          This changes the model. You invalidate only what changed instead of rebuilding the whole
          site.
        </p>

        <h3 className="mt-8 text-xl font-medium">Mix cached and dynamic content</h3>

        <CodeBlock language="tsx">{`// app/articles/[slug]/page.tsx
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
      <Suspense fallback={<ArticleContentSkeleton />}>
        <ArticleContent params={props.params} /> {/* Cached via "use cache" in getArticles() */}
      </Suspense>
    </main>
  );
}`}</CodeBlock>

        <blockquote className="mt-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600">
          <strong>Note:</strong> If a slug wasn't pre-rendered at build time, Next.js can still
          generate it on-demand and cache it (ISR-style). You don't need{" "}
          <InlineCode>{"<Suspense>"}</InlineCode> for <InlineCode>ArticleContent</InlineCode> in
          this setup because its Contentful data is cached via <InlineCode>"use cache"</InlineCode>.
          Keep <InlineCode>{"<Suspense>"}</InlineCode> for truly request-time data like{" "}
          <InlineCode>Views</InlineCode>.
        </blockquote>

        <p className="mt-4 text-zinc-600">What you get:</p>

        <ul className="mt-4 list-disc space-y-1 pl-6 text-zinc-600">
          <li>The static shell (navigation and layout) renders instantly</li>
          <li>
            <InlineCode>Views</InlineCode> stays dynamic and streams in because it sits inside{" "}
            <InlineCode>{"<Suspense>"}</InlineCode>
          </li>
          <li>
            <InlineCode>ArticleContent</InlineCode> resolves from cache with no extra wrappers
          </li>
        </ul>

        <p className="mt-4 text-zinc-600">Quick recap:</p>

        <ul className="mt-4 list-disc space-y-1 pl-6 text-zinc-600">
          <li>
            Cache Contentful content with <InlineCode>"use cache"</InlineCode>
          </li>
          <li>
            Stream truly dynamic bits with <InlineCode>{"<Suspense>"}</InlineCode>
          </li>
          <li>
            Invalidate by entry ID with <InlineCode>cacheTag()</InlineCode>
          </li>
        </ul>

        <p className="mt-4 text-zinc-600">
          The view counter works. Content stays fast. You don't trade off freshness for speed.
        </p>

        <hr className="my-12 border-zinc-200" />

        <h2 className="mt-12 text-2xl font-semibold">On-demand revalidation</h2>

        <p className="mt-4 text-zinc-600">
          When content changes in Contentful, invalidate the cache. Use Contentful webhooks to
          notify your app about publish events. The webhook payload includes the entry{" "}
          <InlineCode>sys.id</InlineCode>, which you can use to invalidate any cached data tagged
          with that ID.
        </p>

        <p className="mt-4 text-zinc-600">Protect the endpoint with a secret.</p>

        <h3 className="mt-8 text-xl font-medium">Create a revalidation secret</h3>

        <CodeBlock language="bash">openssl rand -base64 32</CodeBlock>

        <p className="mt-4 text-zinc-600">
          Add it to <InlineCode>.env.local</InlineCode>:
        </p>

        <CodeBlock language="bash">CONTENTFUL_REVALIDATE_SECRET=your-generated-secret</CodeBlock>

        <h3 className="mt-8 text-xl font-medium">Add the webhook endpoint</h3>

        <CodeBlock language="ts">{`// app/api/contentful/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-vercel-reval-key");

  if (secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json();
  const entryId = body?.sys?.id;

  if (!entryId) {
    return NextResponse.json({ message: "Missing entry ID" }, { status: 400 });
  }

  // Use the two-argument form with 'max' profile for stale-while-revalidate behavior.
  // This marks data as stale and serves cached content while fetching fresh data in the background.
  revalidateTag(entryId, "max");

  return NextResponse.json({ revalidated: true, entryId });
}`}</CodeBlock>

        <p className="mt-4 text-zinc-600">
          <InlineCode>revalidateTag(entryId, 'max')</InlineCode> marks cached data tagged with that
          entry ID as stale. The next request serves stale content immediately while fetching fresh
          data in the background—this is the stale-while-revalidate pattern that keeps your site
          fast even during revalidation.
        </p>

        <blockquote className="mt-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600">
          <strong>Note:</strong> The single-argument form <InlineCode>revalidateTag(tag)</InlineCode>{" "}
          is deprecated. Always use the two-argument form with a cache life profile like{" "}
          <InlineCode>'max'</InlineCode>.
        </blockquote>

        <h3 className="mt-8 text-xl font-medium">Configure the Contentful webhook</h3>

        <ol className="mt-4 list-decimal space-y-1 pl-6 text-zinc-600">
          <li>
            <strong>Settings → Webhooks → Add webhook</strong>
          </li>
          <li>
            <strong>URL:</strong>{" "}
            <InlineCode>https://your-domain.vercel.app/api/contentful/revalidate</InlineCode>
          </li>
          <li>
            <strong>Headers:</strong> <InlineCode>x-vercel-reval-key: your-secret</InlineCode>
          </li>
          <li>
            <strong>Triggers:</strong> Publish, Unpublish
          </li>
          <li>
            <strong>Save</strong>
          </li>
        </ol>

        <p className="mt-4 text-zinc-600">
          Now when you publish in Contentful, your{" "}
          <InlineCode>/api/contentful/revalidate</InlineCode> route invalidates the right cache
          entries and your site updates within seconds.
        </p>

        <hr className="my-12 border-zinc-200" />

        <h2 className="mt-12 text-2xl font-semibold">Deploy to Vercel</h2>

        <CodeBlock language="bash">{`git add .
git commit -m "Add Cache Components"
git push origin main`}</CodeBlock>

        <p className="mt-4 text-zinc-600">
          Import the project on Vercel:{" "}
          <Link href="https://vercel.com" className="text-blue-600 hover:underline">
            https://vercel.com
          </Link>
        </p>

        <p className="mt-4 text-zinc-600">Add these environment variables:</p>

        <ul className="mt-4 list-disc space-y-1 pl-6 text-zinc-600">
          <li>
            <InlineCode>CONTENTFUL_SPACE_ID</InlineCode>
          </li>
          <li>
            <InlineCode>CONTENTFUL_ACCESS_TOKEN</InlineCode>
          </li>
          <li>
            <InlineCode>CONTENTFUL_PREVIEW_ACCESS_TOKEN</InlineCode>
          </li>
          <li>
            <InlineCode>CONTENTFUL_REVALIDATE_SECRET</InlineCode>
          </li>
          <li>
            <InlineCode>REDIS_URL</InlineCode> (optional)
          </li>
        </ul>

        <p className="mt-4 text-zinc-600">Deploy.</p>

        <blockquote className="mt-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-600">
          After you deploy, update the Contentful webhook URL to point at your Vercel domain.
        </blockquote>

        <hr className="my-12 border-zinc-200" />

        <h2 className="mt-12 text-2xl font-semibold">Summary</h2>

        <p className="mt-4 text-zinc-600">
          You've migrated a fully dynamic site to Cache Components. You now get granular cache
          invalidation and strong performance without sacrificing freshness.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200">
              <tr>
                <th className="pb-2 pr-4 font-medium">Approach</th>
                <th className="pb-2 pr-4 font-medium">Speed</th>
                <th className="pb-2 pr-4 font-medium">Freshness</th>
                <th className="pb-2 font-medium">Dynamic features</th>
              </tr>
            </thead>
            <tbody className="text-zinc-600">
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4">Dynamic</td>
                <td className="py-2 pr-4">Slow</td>
                <td className="py-2 pr-4">Fresh</td>
                <td className="py-2">Work</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-2 pr-4">Static</td>
                <td className="py-2 pr-4">Fast</td>
                <td className="py-2 pr-4">Stale</td>
                <td className="py-2">Broken</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Cache Components</td>
                <td className="py-2 pr-4">Fast</td>
                <td className="py-2 pr-4">Fresh</td>
                <td className="py-2">Work</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-zinc-600">
          Cache Components eliminate the false choice between performance and freshness. Your users
          get edge speed, your editors get instant publishes, and you stop living on the rebuild
          treadmill.
        </p>

        <p className="mt-4 text-zinc-600">
          To learn more about Next.js and Cache Components, visit{" "}
          <Link
            href="https://nextjs.org/docs/app/getting-started/cache-components"
            className="text-blue-600 hover:underline"
          >
            https://nextjs.org/docs/app/getting-started/cache-components
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
