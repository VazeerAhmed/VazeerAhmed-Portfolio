import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { calculateReadingTime } from "@/lib/reading-time";

import { Post } from "@/types/post";

function getMDXFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, "utf-8");
  let { data, content } = matter(rawContent);
  return { data, content };
}

function getMDXData(dir: string): Post[] {
  let mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    let { data, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));
    const readingTime = calculateReadingTime(content);

    return {
      slug,
      title: data.title,
      publishedAt: data.publishedAt,
      summary: data.summary,
      image: data.image,
      content,
      views: 0,
      viewsFormatted: "0",
      readingTime: readingTime,
    } as Post;
  });
}

export function getBlogPosts(postsDir: string): Post[] {
  return getMDXData(postsDir);
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date);

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  let daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  let fullDate = targetDate.toLocaleString("en-us", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!includeRelative) {
    return fullDate;
  }

  return `${fullDate} (${formattedDate})`;
}
