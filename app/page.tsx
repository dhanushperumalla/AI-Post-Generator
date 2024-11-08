// app/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GeneratedContent {
  content1: string;
  content2: string;
  content3: string;
}

async function generateContent(
  platform: string,
  topic: string,
  tone: string,
  specialInstructions: string
): Promise<GeneratedContent> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ platform, topic, tone, specialInstructions }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  if (!data.content1 || !data.content2 || !data.content3) {
    throw new Error("Invalid response format from server");
  }

  return data;
}

export default function SocialMediaPostGenerator() {
  const [platform, setPlatform] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      if (!platform || !topic || !tone) {
        throw new Error("Please fill in all required fields");
      }

      const result = await generateContent(
        platform,
        topic,
        tone,
        specialInstructions
      );

      setGeneratedContent(result);
    } catch (error) {
      console.error("Error generating posts:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = (post: string) => {
    const savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "[]");
    const newPosts = [...savedPosts, post];
    localStorage.setItem("savedPosts", JSON.stringify(newPosts));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        AI Social Media Post Generator
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select onValueChange={setPlatform}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic"
            />
          </div>

          <div>
            <Label htmlFor="tone">Tone</Label>
            <Select onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
                <SelectItem value="inspirational">Inspirational</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="specialInstructions">
              Special Instructions (Optional)
            </Label>
            <Textarea
              id="specialInstructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Enter any special instructions"
            />
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Posts"
            )}
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Generated Posts</h2>
          <div className="space-y-4">
            {generatedContent &&
              Object.entries(generatedContent).map(([key, content], index) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle>Post {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{content}</p>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => handleSave(content)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
