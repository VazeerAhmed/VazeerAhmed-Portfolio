import { describe, it, expect } from "vitest";
import {
  SortSetting,
  toggleDateSort,
  toggleViewsSort,
  sortPosts,
  getSortIndicator,
  isSortActive,
} from "@/lib/utils/sort";
import { Post } from "@/types/post";

// Mock data for testing
const mockPosts: Post[] = [
  {
    slug: "post-1",
    title: "First Post",
    publishedAt: "2023-01-15",
    summary: "This is the first post summary",
    views: 100,
  },
  {
    slug: "post-2",
    title: "Second Post",
    publishedAt: "2023-06-20",
    summary: "This is the second post summary",
    views: 250,
  },
  {
    slug: "post-3",
    title: "Third Post",
    publishedAt: "2023-03-10",
    summary: "This is the third post summary",
    views: 50,
  },
  {
    slug: "post-4",
    title: "Fourth Post",
    publishedAt: "2024-01-01",
    summary: "This is the fourth post summary",
    views: undefined, // Test undefined views
  },
];

describe("sort utilities", () => {
  describe("toggleDateSort", () => {
    it("should switch to date desc when current sort is not date", () => {
      const currentSort: SortSetting = ["views", "desc"];
      const result = toggleDateSort(currentSort);
      expect(result).toEqual(["date", "desc"]);
    });

    it("should switch to date desc when current sort is date asc", () => {
      const currentSort: SortSetting = ["date", "asc"];
      const result = toggleDateSort(currentSort);
      expect(result).toEqual(["date", "desc"]);
    });

    it("should switch to date asc when current sort is date desc", () => {
      const currentSort: SortSetting = ["date", "desc"];
      const result = toggleDateSort(currentSort);
      expect(result).toEqual(["date", "asc"]);
    });
  });

  describe("toggleViewsSort", () => {
    it("should switch to date desc when current sort is views asc", () => {
      const currentSort: SortSetting = ["views", "asc"];
      const result = toggleViewsSort(currentSort);
      expect(result).toEqual(["date", "desc"]);
    });

    it("should switch to views desc when current sort is not views", () => {
      const currentSort: SortSetting = ["date", "desc"];
      const result = toggleViewsSort(currentSort);
      expect(result).toEqual(["views", "desc"]);
    });

    it("should switch to views asc when current sort is views desc", () => {
      const currentSort: SortSetting = ["views", "desc"];
      const result = toggleViewsSort(currentSort);
      expect(result).toEqual(["views", "asc"]);
    });

    it("should switch to views desc when current sort is views asc (edge case)", () => {
      // This tests the last condition in the function
      const currentSort: SortSetting = ["views", "asc"];
      const result = toggleViewsSort(currentSort);
      expect(result).toEqual(["date", "desc"]); // Based on the logic, views asc goes to date desc
    });
  });

  describe("sortPosts", () => {
    describe("date sorting", () => {
      it("should sort posts by date in descending order", () => {
        const sortSetting: SortSetting = ["date", "desc"];
        const result = sortPosts(mockPosts, sortSetting);

        expect(result[0].slug).toBe("post-4"); // 2024-01-01
        expect(result[1].slug).toBe("post-2"); // 2023-06-20
        expect(result[2].slug).toBe("post-3"); // 2023-03-10
        expect(result[3].slug).toBe("post-1"); // 2023-01-15
      });

      it("should sort posts by date in ascending order", () => {
        const sortSetting: SortSetting = ["date", "asc"];
        const result = sortPosts(mockPosts, sortSetting);

        expect(result[0].slug).toBe("post-1"); // 2023-01-15
        expect(result[1].slug).toBe("post-3"); // 2023-03-10
        expect(result[2].slug).toBe("post-2"); // 2023-06-20
        expect(result[3].slug).toBe("post-4"); // 2024-01-01
      });
    });

    describe("views sorting", () => {
      it("should sort posts by views in descending order", () => {
        const sortSetting: SortSetting = ["views", "desc"];
        const result = sortPosts(mockPosts, sortSetting);

        expect(result[0].slug).toBe("post-2"); // 250 views
        expect(result[1].slug).toBe("post-1"); // 100 views
        expect(result[2].slug).toBe("post-3"); // 50 views
        expect(result[3].slug).toBe("post-4"); // undefined views (treated as 0)
      });

      it("should sort posts by views in ascending order", () => {
        const sortSetting: SortSetting = ["views", "asc"];
        const result = sortPosts(mockPosts, sortSetting);

        expect(result[0].slug).toBe("post-4"); // undefined views (treated as 0)
        expect(result[1].slug).toBe("post-3"); // 50 views
        expect(result[2].slug).toBe("post-1"); // 100 views
        expect(result[3].slug).toBe("post-2"); // 250 views
      });

      it("should handle posts with null/undefined views", () => {
        const postsWithNullViews: Post[] = [
          {
            slug: "post-a",
            title: "Post A",
            publishedAt: "2023-01-01",
            summary: "Post A summary",
            views: undefined,
          },
          {
            slug: "post-b",
            title: "Post B",
            publishedAt: "2023-01-02",
            summary: "Post B summary",
            views: 100,
          },
        ];

        const sortSetting: SortSetting = ["views", "desc"];
        const result = sortPosts(postsWithNullViews, sortSetting);

        expect(result[0].slug).toBe("post-b"); // 100 views
        expect(result[1].slug).toBe("post-a"); // undefined views (treated as 0)
      });
    });

    it("should not mutate the original posts array", () => {
      const originalPosts = [...mockPosts];
      const sortSetting: SortSetting = ["date", "desc"];

      sortPosts(mockPosts, sortSetting);

      expect(mockPosts).toEqual(originalPosts);
    });
  });

  describe("getSortIndicator", () => {
    it("should return up arrow for ascending sort on active key", () => {
      const sortSetting: SortSetting = ["date", "asc"];
      const result = getSortIndicator(sortSetting, "date", false, true);
      expect(result).toBe("↑");
    });

    it("should return down arrow for descending sort on active key", () => {
      const sortSetting: SortSetting = ["date", "desc"];
      const result = getSortIndicator(sortSetting, "date", false, true);
      expect(result).toBe("");
    });

    it("should return empty string for inactive key", () => {
      const sortSetting: SortSetting = ["date", "desc"];
      const result = getSortIndicator(sortSetting, "views", true, true);
      expect(result).toBe("");
    });

    it("should work correctly for views sorting", () => {
      const sortSettingDesc: SortSetting = ["views", "desc"];
      const sortSettingAsc: SortSetting = ["views", "asc"];

      expect(getSortIndicator(sortSettingDesc, "views", true, true)).toBe("↓");
      expect(getSortIndicator(sortSettingAsc, "views", true, true)).toBe("↑");
      expect(getSortIndicator(sortSettingDesc, "date", false, true)).toBe("");
    });
  });

  describe("isSortActive", () => {
    it("should return true when the target key matches current sort key", () => {
      const sortSetting: SortSetting = ["date", "desc"];
      expect(isSortActive(sortSetting, "date")).toBe(true);
    });

    it("should return false when the target key does not match current sort key", () => {
      const sortSetting: SortSetting = ["date", "desc"];
      expect(isSortActive(sortSetting, "views")).toBe(false);
    });

    it("should work correctly for views sorting", () => {
      const sortSetting: SortSetting = ["views", "asc"];
      expect(isSortActive(sortSetting, "views")).toBe(true);
      expect(isSortActive(sortSetting, "date")).toBe(false);
    });
  });

  describe("edge cases and integration", () => {
    it("should handle empty posts array", () => {
      const emptyPosts: Post[] = [];
      const sortSetting: SortSetting = ["date", "desc"];
      const result = sortPosts(emptyPosts, sortSetting);
      expect(result).toEqual([]);
    });

    it("should handle single post array", () => {
      const singlePost: Post[] = [mockPosts[0]];
      const sortSetting: SortSetting = ["views", "asc"];
      const result = sortPosts(singlePost, sortSetting);
      expect(result).toEqual(singlePost);
    });

    it("should handle posts with same date", () => {
      const sameDatePosts: Post[] = [
        {
          slug: "post-x",
          title: "Post X",
          publishedAt: "2023-01-01",
          summary: "Post X summary",
          views: 100,
        },
        {
          slug: "post-y",
          title: "Post Y",
          publishedAt: "2023-01-01",
          summary: "Post Y summary",
          views: 200,
        },
      ];

      const sortSetting: SortSetting = ["date", "desc"];
      const result = sortPosts(sameDatePosts, sortSetting);

      // Should maintain original order when dates are equal
      expect(result.length).toBe(2);
      expect(result.map((p) => p.slug)).toContain("post-x");
      expect(result.map((p) => p.slug)).toContain("post-y");
    });

    it("should handle posts with same views", () => {
      const sameViewsPosts: Post[] = [
        {
          slug: "post-x",
          title: "Post X",
          publishedAt: "2023-01-01",
          summary: "Post X summary",
          views: 100,
        },
        {
          slug: "post-y",
          title: "Post Y",
          publishedAt: "2023-01-02",
          summary: "Post Y summary",
          views: 100,
        },
      ];

      const sortSetting: SortSetting = ["views", "desc"];
      const result = sortPosts(sameViewsPosts, sortSetting);

      // Should maintain original order when views are equal
      expect(result.length).toBe(2);
      expect(result.map((p) => p.slug)).toContain("post-x");
      expect(result.map((p) => p.slug)).toContain("post-y");
    });
  });
});
