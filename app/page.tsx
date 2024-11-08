// app/page.tsx
"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Save, Trash, Edit } from "lucide-react";
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

  // Validate the response structure
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
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const posts = localStorage.getItem("savedPosts");
    if (posts) {
      setSavedPosts(JSON.parse(posts));
    }
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      if (!platform || !topic || !tone) {
        throw new Error("Please fill in all required fields");
      }

      console.log("Sending request with:", {
        platform,
        topic,
        tone,
        specialInstructions,
      });

      const result = await generateContent(
        platform,
        topic,
        tone,
        specialInstructions
      );

      console.log("Received result:", result);
      setGeneratedContent(result);
    } catch (error) {
      console.error("Detailed error generating posts:", error);
      setError(
        error instanceof Error
          ? `Error: ${error.message}`
          : "An unknown error occurred"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = (post: string) => {
    const newPosts = [...savedPosts, post];
    setSavedPosts(newPosts);
    localStorage.setItem("savedPosts", JSON.stringify(newPosts));
  };

  const handleDelete = (index: number) => {
    setSavedPosts(savedPosts.filter((_, i) => i !== index));
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleUpdate = (index: number, newContent: string) => {
    const updatedPosts = [...savedPosts];
    updatedPosts[index] = newContent;
    setSavedPosts(updatedPosts);
    setEditingIndex(null);
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

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Saved Posts</h2>
            {savedPosts.map((post, index) => (
              <Card key={index} className="mb-4">
                <CardContent>
                  {editingIndex === index ? (
                    <Textarea
                      value={post}
                      onChange={(e) => handleUpdate(index, e.target.value)}
                      className="mb-2"
                    />
                  ) : (
                    <p>{post}</p>
                  )}
                </CardContent>
                <CardFooter>
                  {editingIndex === index ? (
                    <Button onClick={() => handleUpdate(index, post)}>
                      Save Changes
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(index)}
                        className="mr-2"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(index)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
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
                  <CardFooter className="flex justify-between">
                    <Button onClick={() => handleSave(content)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(savedPosts.length)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
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
