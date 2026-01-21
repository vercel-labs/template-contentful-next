import { getArticles } from "@/lib/contentful/queries";
import { ContentfulImage } from "@/components/contentful-image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Articles />
    </main>
  );
}

async function Articles() {
  const articles = await getArticles();

  return (
    <>
      {articles.map((article) => (
        <Link key={article.slug} href={`/articles/${article.slug}`}>
          <article className="group mb-8 overflow-hidden border border-black/5 bg-white shadow-sm transition-all duration-300 hover:border-black/10 hover:shadow-xl">
            <div className="relative aspect-2/1 w-full overflow-hidden bg-black/5">
              <ContentfulImage
                src={article.articleImage?.fields?.file?.url}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="p-10">
              <div className="mb-4 flex items-center gap-4">
                <span className="inline-block bg-black px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
                  {article.categoryName}
                </span>
                <span className="text-sm text-black/50">{article.authorName}</span>
              </div>

              <h2 className="mb-4 text-3xl leading-tight font-semibold text-balance text-black transition-colors group-hover:text-black/80">
                {article.title}
              </h2>

              <p className="text-base leading-relaxed text-pretty text-black/60">
                {article.summary}
              </p>
            </div>
          </article>
        </Link>
      ))}
    </>
  );
}
