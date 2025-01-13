import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 8;
    const offset = (page - 1) * limit;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch paginated emojis with like status
    const { data: emojis, error, count } = await supabase
      .from('emojis')
      .select(`
        *,
        user_likes!left (
          user_id
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .eq('user_likes.user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      emojis,
      hasMore: count ? offset + limit < count : false,
      total: count
    });
  } catch (error) {
    console.error("Error fetching emojis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch emojis" },
      { status: 500 }
    );
  }
} 