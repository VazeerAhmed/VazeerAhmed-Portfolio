import { getBlogPosts } from "@/lib/api/blog";
import { ArchivePostsClient } from "@/components/archive-posts-client";
import { ARCHIVES_DIR } from "@/lib/constants";

export function ArchivePosts() {
  const allBlogs = getBlogPosts(ARCHIVES_DIR);

  return <ArchivePostsClient posts={allBlogs} />;
}
