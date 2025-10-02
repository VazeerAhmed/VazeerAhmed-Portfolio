import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { ErrorResponseSchema } from "@/lib/schemas/page-views";

export async function GET() {
  try {
    const supabase = createClient();

    const { data: viewsData, error } = await supabase
      .from("page_views")
      .select("page, views");

    if (error) {
      throw error;
    }

    // Transform data to a more convenient format
    const viewsMap: Record<string, number> = {};
    if (viewsData) {
      viewsData.forEach((item) => {
        // Remove leading slash from page path to match slug
        const slug = item.page.startsWith("/") ? item.page.slice(1) : item.page;
        viewsMap[slug] = item.views;
      });
    }

    return NextResponse.json({ views: viewsMap });
  } catch (error) {
    console.error("Error fetching all views:", error);

    const errorResponse = ErrorResponseSchema.parse({
      error: "Failed to fetch views",
    });
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
