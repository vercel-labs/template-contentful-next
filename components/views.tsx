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
