// app/api/generate/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    if (!process.env.NEBIUS_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      baseURL: "https://api.studio.nebius.ai/v1/",
      apiKey: process.env.NEBIUS_API_KEY,
    });

    const { platform, topic, tone, specialInstructions } = await req.json();

    if (!platform || !topic || !tone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Attempting API call with:", {
      platform,
      topic,
      tone,
      specialInstructions,
    });

    const completion = await client.chat.completions.create({
      temperature: 0.6,
      max_tokens: 512,
      top_p: 0.9,
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-fast",
      messages: [
        {
          role: "system",
          content:
            "You are an expert social media content creator. Your task is to create compelling content for various social media platforms. Respond with ONLY the JSON object, no additional text or markdown.",
        },
        {
          role: "user",
          content: `Create 3 ${tone} posts for ${platform} about ${topic}. ${specialInstructions}. Respond with ONLY the following JSON format, no additional text:
          {
            "content1": "First post content",
            "content2": "Second post content",
            "content3": "Third post content"
          }`,
        },
      ],
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error("No content generated");
    }

    return NextResponse.json(JSON.parse(result));
  } catch (error) {
    console.error("Detailed API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
