import RSS from "rss";

import { NextResponse } from "next/server";

import { getBlogPosts } from "@/lib/api/blog";
import { BASE_URL, POSTS_DIR, ARCHIVES_DIR } from "@/lib/constants";

import type { ItemOptions } from "@/types/rss";

const rssOptions = {
  title: "Hugo Lin Dev",
  description: "Hugo Lin's Dev Blog",
  site_url: "https://dev.1chooo.com",
  feed_url: "https://dev.1chooo.com/rss",
  language: "en-US",
  managingEditor: "hugo@1chooo.com (Chun-Ho Lin)",
  webMaster: "hugo@1chooo.com (Chun-Ho Lin)",
  copyright: "© 2025 Chun-Ho (Hugo) Lin",
  categories: [
    "Technology",
    "Software Development",
    "Web Development",
    "Programming",
  ],
};

export async function GET() {
  const feed = new RSS(rssOptions);

  let allBlogs = await getBlogPosts(POSTS_DIR);

  for (const post of allBlogs) {
    const { title, publishedAt, summary } = post;

    let itemOptions: ItemOptions;
    itemOptions = {
      title,
      url: `${BASE_URL}/${post.slug}`,
      date: publishedAt,
      description: summary,
      author: "Hugo Lin",
    };

    feed.item(itemOptions);
  }

  const archivedPosts = await getBlogPosts(ARCHIVES_DIR);

  for (const post of archivedPosts) {
    const { title, publishedAt, summary } = post;

    let itemOptions: ItemOptions;
    itemOptions = {
      title: `Archived: ${title}`,
      url: `${BASE_URL}/archive/${post.slug}`,
      date: publishedAt,
      description: summary,
      author: "Hugo Lin",
    };

    feed.item(itemOptions);
  }

  return new NextResponse(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
