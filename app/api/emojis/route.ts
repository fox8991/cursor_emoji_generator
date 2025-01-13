import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch user's emojis
    const { data: emojis, error } = await supabase
      .from('emojis')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      emojis 
    });
  } catch (error) {
    console.error("Error fetching emojis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch emojis" },
      { status: 500 }
    );
  }
} 