import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getArticles } from "@/lib/contentful/queries";
import { RichText } from "@/components/rich-text";
import { ContentfulImage } from "@/components/contentful-image";
import { Views, ViewsSkeleton } from "@/components/views";
import { TrackView } from "@/components/track-view";
import { cacheLife, cacheTag } from "next/cache";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

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
