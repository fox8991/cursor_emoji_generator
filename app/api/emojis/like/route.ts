import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { emojiId } = await request.json();

    // Start a transaction using Supabase's RPC
    const { data: result, error: rpcError } = await supabase
      .rpc('toggle_emoji_like', {
        p_emoji_id: emojiId,
        p_user_id: user.id
      });

    if (rpcError) {
      throw rpcError;
    }

    return NextResponse.json({ 
      success: true,
      liked: result.liked,
      likesCount: result.likes_count
    });
  } catch (error) {
    console.error("Error toggling emoji like:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle like" },
      { status: 500 }
    );
  }
} 