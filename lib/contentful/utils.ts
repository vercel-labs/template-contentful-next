import { EntryCollection } from "contentful";
import { ArticleSkeleton } from "./types";

export const extractArticleFields = (
  entries: EntryCollection<ArticleSkeleton, "WITHOUT_UNRESOLVABLE_LINKS">
) => {
  return entries.items.map((entry) => ({
    ...entry.fields,
    id: entry.sys.id,
  }));
};
