import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.HF_TOKEN) {
      return NextResponse.json(
        { error: "Hugging Face token not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", errorText);
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();

    if (imageBuffer.byteLength === 0) {
      throw new Error("Received empty image data");
    }

    const base64Image = Buffer.from(imageBuffer).toString("base64");

    return NextResponse.json({
      image: `data:image/jpeg;base64,${base64Image}`,
    });
  } catch (error) {
    console.error("Image generation error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      cause: error instanceof Error ? error.cause : undefined,
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Image generation failed: ${error.message}`
            : "Failed to generate image - please try again",
      },
      { status: 500 }
    );
  }
}
