import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { ErrorResponseSchema } from "@/lib/schemas/page-views";

export async function GET() {
  try {
    const supabase = createClient();

    const { data: viewsData, error } = await supabase
      .from("page_views")
      .select("page, views")
      .like("page", "/archive/%");

    if (error) {
      throw error;
    }

    // Transform data to a more convenient format
    const viewsMap: Record<string, number> = {};
    if (viewsData) {
      viewsData.forEach((item) => {
        // Extract slug from archive path: /archive/slug -> slug
        const slug = item.page.replace("/archive/", "");
        viewsMap[slug] = item.views;
      });
    }

    return NextResponse.json({ views: viewsMap });
  } catch (error) {
    console.error("Error fetching all archive views:", error);

    const errorResponse = ErrorResponseSchema.parse({
      error: "Failed to fetch archive views",
    });
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
