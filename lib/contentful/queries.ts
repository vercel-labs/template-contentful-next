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
  // We use an array so cacheTag includes all articles returned.
  // If any article changes, we can invalidate all caches that include that article.
  cacheTag(...entries.map((entry) => entry.id));
  return entries;
};
