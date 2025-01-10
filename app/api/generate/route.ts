import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

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

    console.log('Replicate API response:', output);

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('Invalid response from Replicate API');
    }

    const imageUrl = output[0]?.toString();
    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    return NextResponse.json({ success: true, data: [imageUrl] });
  } catch (error) {
    console.error("Error generating emoji:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate emoji" },
      { status: 500 }
    );
  }
} 