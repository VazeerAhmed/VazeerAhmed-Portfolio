export interface Post {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  content?: string;
  views?: number;
  viewsFormatted?: string;
  readingTime?: string;
}
