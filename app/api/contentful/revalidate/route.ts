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