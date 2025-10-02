"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import useSWR from "swr";
import { FadeDown, FadeInLi } from "@/components/animations";
import { Post } from "@/types/post";
import {
  SortSetting,
  toggleDateSort,
  toggleViewsSort,
  sortPosts,
  getSortIndicator,
  isSortActive,
} from "@/lib/utils/sort";

interface PostsProps {
  posts: Post[];
}

export function PostsClient({ posts: initialPosts }: PostsProps) {
  const [sort, setSort] = useState<SortSetting>(["date", "desc"]);

  // Fetcher function for SWR
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch views");
    }
    const data = await response.json();
    return data.views || {};
  };

  // Use SWR to fetch views data with automatic revalidation
  const { data: viewsMap = {}, isLoading } = useSWR("/api/views/all", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true, // Revalidate when window gets focus
    revalidateOnReconnect: true, // Revalidate when reconnected
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  });

  // Merge posts with views data
  const posts = useMemo(() => {
    return initialPosts.map((post) => {
      const views = viewsMap[post.slug] || 0;
      return {
        ...post,
        views,
        viewsFormatted: views.toLocaleString("en-US"),
      };
    });
  }, [initialPosts, viewsMap]);

  // Sort handlers using utility functions
  const handleDateSort = () => {
    setSort((currentSort) => toggleDateSort(currentSort));
  };

  const handleViewsSort = () => {
    setSort((currentSort) => toggleViewsSort(currentSort));
  };

  return (
    <main className="flex-auto min-w-0 my-6 flex flex-col px-2 md:px-0 mb-10 text-sm font-mono">
      <FadeDown delay={0.3 * 3}>
        <header className="text-neutral-500 dark:text-neutral-600 flex items-center text-xs">
          <button
            onClick={handleDateSort}
            className={`w-12 h-9 text-left cursor-pointer ${
              isSortActive(sort, "date") && sort[1] !== "desc"
                ? "text-neutral-700 dark:text-neutral-400"
                : ""
            }`}
          >
            date
            {getSortIndicator(sort, "date", false, true)}
          </button>
          <span className="grow pl-2">title</span>
          <button
            onClick={handleViewsSort}
            className={`
              h-9
              pl-4
              cursor-pointer
              ${
                isSortActive(sort, "views")
                  ? "text-neutral-700 dark:text-neutral-400"
                  : ""
              }
            `}
          >
            views
            {getSortIndicator(sort, "views", true, true)}
          </button>
        </header>
      </FadeDown>

      <List posts={posts} sort={sort} isViewsLoading={isLoading} />
    </main>
  );
}

function List({
  posts,
  sort,
  isViewsLoading,
}: {
  posts: Post[];
  sort: SortSetting;
  isViewsLoading: boolean;
}) {
  // Use utility function to sort posts
  const sortedPosts = useMemo(() => {
    return sortPosts(posts, sort);
  }, [posts, sort]);

  return (
    <ul>
      {sortedPosts.map((post, i: number) => {
        const postDate = post.publishedAt;
        const year = getYear(postDate);
        const firstOfYear =
          !sortedPosts[i - 1] ||
          getYear(sortedPosts[i - 1].publishedAt) !== year;
        const lastOfYear =
          !sortedPosts[i + 1] ||
          getYear(sortedPosts[i + 1].publishedAt) !== year;

        return (
          <FadeInLi key={post.slug} delay={i * 0.1} divKey={post.slug}>
            <Link href={`/${post.slug}`}>
              <span
                className={`flex transition-[background-color] hover:bg-neutral-100 dark:hover:bg-[#242424] active:bg-neutral-200 dark:active:bg-[#222] border-y border-neutral-200 dark:border-[#313131]
                    ${!firstOfYear ? "border-t-0" : ""}
                    ${lastOfYear ? "border-b-0" : ""}
                  `}
              >
                <span
                  className={`py-3 flex grow items-center ${
                    !firstOfYear ? "ml-14" : ""
                  }`}
                >
                  {firstOfYear && (
                    <span className="w-14 inline-block self-start shrink-0 text-neutral-600 dark:text-neutral-400">
                      {year}
                    </span>
                  )}

                  <span className="grow text-neutral-800 dark:text-neutral-100 mr-6">
                    <Balancer>{post.title}</Balancer>
                  </span>
                  {isViewsLoading ? (
                    <span className="text-neutral-600 dark:text-neutral-400 text-xs mr-1 tabular-nums">
                      ...
                    </span>
                  ) : (
                    <span className="text-neutral-600 dark:text-neutral-400 text-xs mr-1 tabular-nums">
                      {(post.views || 0).toLocaleString("en-US")}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </FadeInLi>
        );
      })}
    </ul>
  );
}

function getYear(date: string) {
  return new Date(date).getFullYear();
}
