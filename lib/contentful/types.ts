import { EntriesQueries, EntryFieldTypes, EntrySkeletonType } from "contentful";

export enum CONTENT_TYPE_IDS {
  ARTICLE = "article",
}

export type ArticleQuery = EntriesQueries<ArticleSkeleton, "WITHOUT_UNRESOLVABLE_LINKS">;

export interface ArticleSkeleton extends EntrySkeletonType {
  contentTypeId: CONTENT_TYPE_IDS.ARTICLE;
  fields: {
    title: EntryFieldTypes.Text;
    slug: EntryFieldTypes.Text;
    summary: EntryFieldTypes.Text;
    details: EntryFieldTypes.RichText;
    date: EntryFieldTypes.Date;
    authorName: EntryFieldTypes.Text;
    categoryName: EntryFieldTypes.Text;
    articleImage: EntryFieldTypes.AssetLink;
  };
}
