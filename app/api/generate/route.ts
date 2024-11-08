// app/api/generate/route.ts

import { NextResponse } from "next/server";

import OpenAI from "openai";



const client = new OpenAI({

  baseURL: "https://api.studio.nebius.ai/v1/",

  apiKey: process.env.NEBIUS_API_KEY,

});



if (!process.env.NEBIUS_API_KEY) {

  throw new Error("NEBIUS_API_KEY is not configured in environment variables");

}



export async function POST(req: Request) {

  try {

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



    if (!completion.choices[0]?.message?.content) {

      throw new Error("No content received from AI");

    }



    try {

      // Extract JSON content if it's wrapped in backticks
      let contentStr = completion.choices[0].message.content.trim();
      
      // Remove markdown code block if present
      if (contentStr.startsWith('```')) {
        contentStr = contentStr
          .replace(/^```(?:json)?\n/, '') // Remove opening ```
          .replace(/\n```$/, ''); // Remove closing ```
      }
      
      // Remove any preceding text before the JSON
      if (contentStr.includes('{')) {
        contentStr = contentStr.substring(contentStr.indexOf('{'));
      }

      const generatedContent = JSON.parse(contentStr);

      if (!generatedContent.content1 || !generatedContent.content2 || !generatedContent.content3) {
        throw new Error("Invalid response format from AI");
      }

      return NextResponse.json(generatedContent);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Raw content:", completion.choices[0].message.content);
      throw new Error("Failed to parse AI response as JSON");
    }

  } catch (error) {
    console.error("Detailed API Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate content: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}


