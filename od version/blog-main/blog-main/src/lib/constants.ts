import { join } from "path";

const BASE_URL = "https://dev.1chooo.com";

const POSTS_DIR = join(process.cwd(), "src", "content");
const DRAFTS_DIR = join(process.cwd(), "src", "content", "draft");
const ARCHIVES_DIR = join(process.cwd(), "src", "content", "archive");

export { BASE_URL, POSTS_DIR, DRAFTS_DIR, ARCHIVES_DIR };
