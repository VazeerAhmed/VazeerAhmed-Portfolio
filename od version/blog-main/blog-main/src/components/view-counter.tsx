"use client";

import { useEffect } from "react";
import useSWR from "swr";
import {
  ViewResponseSchema,
  type ViewResponse,
} from "@/lib/schemas/page-views";

interface ViewCounterProps {
  slug: string;
  className?: string;
  trackView?: boolean;
  displayViews?: boolean;
  isArchive?: boolean;
}

export function ViewCounter({
  slug,
  className = "",
  trackView = false,
  displayViews = true,
  isArchive = false,
}: ViewCounterProps) {
  // Fetcher function for SWR
  const fetcher = async (url: string) => {
    let response: Response;

    if (trackView) {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    } else {
      response = await fetch(url, {
        method: "GET",
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData: ViewResponse | { error: string } = await response.json();
    const data = ViewResponseSchema.parse(rawData);
    return data.views;
  };

  // Use SWR to fetch views data
  const apiEndpoint = isArchive ? "/api/views/archive" : "/api/views";
  const swrKey = trackView
    ? apiEndpoint
    : `${apiEndpoint}?slug=${encodeURIComponent(slug)}`;
  const {
    data: views = 0,
    isLoading,
    error,
  } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false, // Don't revalidate when window gets focus for view counter
    revalidateOnReconnect: false, // Don't revalidate when reconnected
    dedupingInterval: 60000, // Dedupe requests within 1 minute
    errorRetryCount: 3, // Retry 3 times on error
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Error fetching views:", error);
    }
  }, [error]);

  if (isLoading) {
    return displayViews ? (
      <p className={className}>{"... views"}</p>
    ) : (
      <p className={className}>{"..."}</p>
    );
  }

  return displayViews ? (
    <p
      className={className}
    >{`${Number(views).toLocaleString("en-US")} views`}</p>
  ) : (
    <p className={className}>{`${Number(views).toLocaleString("en-US")}`}</p>
  );
}
