import { getContentfulClient } from "./client";
import { ArticleQuery, ArticleSkeleton, CONTENT_TYPE_IDS } from "./types";
import { extractArticleFields } from "./utils";

export const getArticles = async (query?: ArticleQuery) => {
  const client = getContentfulClient();
  const entriesResult = await client.withoutUnresolvableLinks.getEntries<ArticleSkeleton>({
    content_type: CONTENT_TYPE_IDS.ARTICLE,
    ...query,
  });
  const entries = extractArticleFields(entriesResult);
  return entries;
};
