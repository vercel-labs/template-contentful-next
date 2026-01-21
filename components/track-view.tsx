"use client";

import { useEffect } from "react";
import { incrementViews } from "@/app/actions";

export function TrackView({ slug }: { slug: string }) {
  useEffect(() => {
    incrementViews(slug).catch((err) => {
      // Avoid unhandled promise rejections if the server action fails.

      console.warn("Failed to increment views", err);
    });
  }, [slug]);

  return null;
}
