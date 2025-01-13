import { NextResponse } from "next/server";
import Replicate from "replicate";
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

    const { prompt, visibility = 'private' } = await request.json();

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      {
        input: {
          prompt: "A TOK emoji of " + prompt,
          apply_watermark: false,
        },
      }
    );

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('Invalid response from Replicate API');
    }

    const imageUrl = output[0]?.toString();
    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    // Download the image from Replicate
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error('Failed to download generated image');
    const imageBlob = await imageResponse.blob();

    // Generate unique ID for the emoji
    const emojiId = crypto.randomUUID();
    const storagePath = `${user.id}/${emojiId}.png`;

    console.log('Uploading to path:', storagePath);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('emojis')
      .upload(storagePath, imageBlob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload emoji: ${uploadError.message}`);
    }

    // Store metadata in database
    const { error: dbError } = await supabase
      .from('emojis')
      .insert({
        id: emojiId,
        user_id: user.id,
        prompt,
        storage_path: storagePath,
        visibility,
        likes_count: 0
      });

    if (dbError) {
      // Cleanup the uploaded file if database insert fails
      await supabase.storage.from('emojis').remove([storagePath]);
      throw new Error(`Failed to store emoji metadata: ${dbError.message}`);
    }

    // Return just the storage path
    return NextResponse.json({ 
      success: true, 
      storagePath,
      emojiId
    });
  } catch (error) {
    console.error("Error generating emoji:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate emoji" },
      { status: 500 }
    );
  }
} 