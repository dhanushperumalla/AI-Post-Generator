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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, Copy, Download, Trash } from "lucide-react";

interface GeneratedContent {
  content1: string;
  content2: string;
  content3: string;
  image?: string;
}

interface SaveButtonState {
  [key: string]: boolean;
}

interface CopyButtonState {
  [key: string]: boolean;
}

async function generateContent(
  platform: string,
  topic: string,
  tone: string,
  specialInstructions: string,
  withImage: boolean
): Promise<GeneratedContent> {
  const postResponse = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, topic, tone, specialInstructions }),
  });

  const postData = await postResponse.json();

  if (!postResponse.ok) {
    throw new Error(
      postData.error || `HTTP error! status: ${postResponse.status}`
    );
  }

  if (withImage) {
    try {
      const imageResponse = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic }),
      });

      const imageData = await imageResponse.json();

      if (imageResponse.ok && imageData.image) {
        return {
          ...postData,
          image: imageData.image,
        };
      }
    } catch (error) {
      console.error("Image generation failed:", error);
    }
  }

  return postData;
}

const handleDownload = async (imageUrl: string) => {
  try {
    // Remove the data:image/jpeg;base64, prefix
    const base64Data = imageUrl.split(",")[1];

    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/jpeg" });

    // Create download link
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `generated-image-${Date.now()}.jpg`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(downloadUrl);

    toast.success("Image download started!", {
      description: "Check your downloads folder",
      dismissible: true,
    });
  } catch (error) {
    toast.error("Failed to download image");
    console.error("Download failed", error);
  }
};

export default function SocialMediaPostGenerator() {
  const [platform, setPlatform] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(() => {
      // Try to get previously generated content from localStorage
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("generatedContent");
        return saved ? JSON.parse(saved) : null;
      }
      return null;
    });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedStates, setSavedStates] = useState<SaveButtonState>({});
  const [copiedStates, setCopiedStates] = useState<CopyButtonState>({});
  const [includeImage, setIncludeImage] = useState(false);

  // Save generated content to localStorage when it changes
  useEffect(() => {
    if (generatedContent) {
      localStorage.setItem(
        "generatedContent",
        JSON.stringify(generatedContent)
      );
    }
  }, [generatedContent]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setSavedStates({});
    setCopiedStates({});

    try {
      if (!platform || !topic || !tone) {
        throw new Error("Please fill in all required fields");
      }

      const result = await generateContent(
        platform,
        topic,
        tone,
        specialInstructions,
        includeImage
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

  const handleCopy = async (key: string, content: string) => {
    try {
      // Use the Clipboard API with a fallback
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = content;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          textArea.remove();
        } catch (err) {
          console.error("Fallback: Oops, unable to copy", err);
          textArea.remove();
          throw new Error("Failed to copy");
        }
      }

      // Update copied state for this specific post
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      toast.success("Post copied to clipboard!", {
        description: "Ready to paste anywhere",
        dismissible: true,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy post");
      console.error("Copy failed", err);
    }
  };

  const handleSave = (key: string, content: string) => {
    try {
      const savedPosts = JSON.parse(localStorage.getItem("savedPosts") || "[]");
      const newPost = {
        content,
        type: key === "image" ? "image" : "text",
      };
      const newPosts = [...savedPosts, newPost];
      localStorage.setItem("savedPosts", JSON.stringify(newPosts));

      // Update saved state for this specific post
      setSavedStates((prev) => ({ ...prev, [key]: true }));
      toast.success("Post saved successfully!", {
        description: "You can find it in the Saved Posts section",
        dismissible: true,
      });

      // Reset saved state after 2 seconds
      setTimeout(() => {
        setSavedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      toast.error("Failed to save post");
      console.error("Save failed", error);
    }
  };

  const handleDelete = (key: string) => {
    setGeneratedContent((prev) => {
      if (!prev) return null;
      const { [key]: deleted, ...rest } = prev;
      // Save the updated content to localStorage
      localStorage.setItem("generatedContent", JSON.stringify(rest));
      return rest;
    });
    toast.success("Post deleted successfully!");
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
            <Select value={platform} onValueChange={setPlatform}>
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
            <Select value={tone} onValueChange={setTone}>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeImage"
              checked={includeImage}
              onCheckedChange={(checked: boolean) => setIncludeImage(checked)}
            />
            <Label
              htmlFor="includeImage"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Generate with AI Image
            </Label>
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
            {generatedContent?.image && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={generatedContent.image}
                    alt="AI Generated"
                    className="w-full h-auto rounded-md"
                  />
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={() => handleSave("image", generatedContent.image!)}
                    disabled={savedStates["image"]}
                    className="min-w-[100px]"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {savedStates["image"] ? "Saved!" : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(generatedContent.image!)}
                    className="min-w-[100px]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete("image")}
                    className="min-w-[100px]"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            )}

            {generatedContent &&
              Object.entries(generatedContent)
                .filter(([key]) => key !== "image")
                .map(([key, content], index) => (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle>Post {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{content as string}</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        onClick={() => handleSave(key, content as string)}
                        disabled={savedStates[key]}
                        className="min-w-[100px]"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {savedStates[key] ? "Saved!" : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCopy(key, content as string)}
                        disabled={copiedStates[key]}
                        className="min-w-[100px]"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {copiedStates[key] ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(key)}
                        className="min-w-[100px]"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
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
