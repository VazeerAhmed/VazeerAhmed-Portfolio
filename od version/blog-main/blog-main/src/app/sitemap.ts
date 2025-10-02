import { getBlogPosts } from "@/lib/api/blog";
import { BASE_URL, POSTS_DIR, ARCHIVES_DIR } from "@/lib/constants";

async function sitemap() {
  const blogs = getBlogPosts(POSTS_DIR).map((post) => ({
    url: `${BASE_URL}/${post.slug}`,
    lastModified: post.publishedAt,
  }));

  const archivedBlogs = getBlogPosts(ARCHIVES_DIR).map((post) => ({
    url: `${BASE_URL}/archive/${post.slug}`,
    lastModified: post.publishedAt,
  }));

  const routes = ["", "/archive"].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs, ...archivedBlogs];
}

export default sitemap;
