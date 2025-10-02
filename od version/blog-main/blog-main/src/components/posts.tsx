import { getBlogPosts } from "@/lib/api/blog";
import { PostsClient } from "@/components/posts-client";
import { POSTS_DIR } from "@/lib/constants";

export function BlogPosts() {
  const allBlogs = getBlogPosts(POSTS_DIR);

  return <PostsClient posts={allBlogs} />;
}
