import { Post } from "@/types/post";

export type SortKey = "date" | "views";
export type SortDirection = "desc" | "asc";
export type SortSetting = [SortKey, SortDirection];

/**
 * Toggle sort setting for date
 * If current sort is not date, switch to date desc
 * If current sort is date, toggle direction
 */
export function toggleDateSort(currentSort: SortSetting): SortSetting {
  const [currentKey, currentDirection] = currentSort;

  if (currentKey !== "date" || currentDirection === "asc") {
    return ["date", "desc"];
  }
  return ["date", "asc"];
}

/**
 * Toggle sort setting for views
 * Complex logic: if currently views asc, switch to date desc
 * Otherwise toggle views direction or switch to views desc
 */
export function toggleViewsSort(currentSort: SortSetting): SortSetting {
  const [currentKey, currentDirection] = currentSort;

  if (currentKey === "views" && currentDirection === "asc") {
    return ["date", "desc"];
  }

  if (currentKey !== "views") {
    return ["views", "desc"];
  }

  return ["views", currentDirection === "desc" ? "asc" : "desc"];
}

/**
 * Sort posts based on sort setting
 */
export function sortPosts(posts: Post[], sort: SortSetting): Post[] {
  const [sortKey, sortDirection] = sort;

  return [...posts].sort((a, b) => {
    if (sortKey === "date") {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();

      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    } else {
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;

      return sortDirection === "desc" ? viewsB - viewsA : viewsA - viewsB;
    }
  });
}

/**
 * Get sort indicator arrow
 */
export function getSortIndicator(
  currentSort: SortSetting,
  targetKey: SortKey,
  showDesc: boolean,
  showAsc: boolean,
): string {
  const [sortKey, sortDirection] = currentSort;

  if (sortKey === targetKey && showDesc && showAsc) {
    return sortDirection === "asc" ? "↑" : "↓";
  } else if (sortKey === targetKey && showDesc) {
    return sortDirection === "desc" ? "↓" : "";
  } else if (sortKey === targetKey && showAsc) {
    return sortDirection === "asc" ? "↑" : "";
  }

  return "";
}

/**
 * Check if a sort key is currently active
 */
export function isSortActive(
  currentSort: SortSetting,
  targetKey: SortKey,
): boolean {
  return currentSort[0] === targetKey;
}
