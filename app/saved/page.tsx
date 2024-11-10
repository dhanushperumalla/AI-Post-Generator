"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

import { Edit, Trash, Copy, Save, Download } from "lucide-react";

import { toast } from "sonner";

import Image from "next/image";

interface CopyButtonState {
  [key: number]: boolean;
}

interface SavedPost {
  content: string;
  type: "text" | "image";
}

export default function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [copiedStates, setCopiedStates] = useState<CopyButtonState>({});

  useEffect(() => {
    const posts = localStorage.getItem("savedPosts");

    if (posts) {
      setSavedPosts(JSON.parse(posts));
    }
  }, []);

  const handleDelete = (index: number) => {
    const newPosts = savedPosts.filter((_, i) => i !== index);

    setSavedPosts(newPosts);

    localStorage.setItem("savedPosts", JSON.stringify(newPosts));

    toast.success("Post deleted successfully!", {
      description: "The post has been removed from your saved posts",

      dismissible: true,
    });
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleUpdate = (index: number, newContent: string) => {
    const updatedPosts = [...savedPosts];
    updatedPosts[index] = {
      content: newContent,
      type: savedPosts[index].type,
    };

    setSavedPosts(updatedPosts);
    localStorage.setItem("savedPosts", JSON.stringify(updatedPosts));
    setEditingIndex(null);

    toast.success("Post updated successfully!", {
      description: "Your changes have been saved",
      dismissible: true,
    });
  };

  const handleCopy = async (index: number, post: string) => {
    try {
      // Use the Clipboard API with a fallback

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(post);
      } else {
        // Fallback for older browsers

        const textArea = document.createElement("textarea");

        textArea.value = post;

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
          textArea.remove();

          throw new Error("Failed to copy");
        }
      }

      // Update copied state for this specific post

      setCopiedStates((prev) => ({ ...prev, [index]: true }));

      toast.success("Post copied to clipboard!", {
        description: "Ready to paste anywhere",

        dismissible: true,
      });

      // Reset copied state after 2 seconds

      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [index]: false }));
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy post", {
        description: "Please try again",

        dismissible: true,
      });

      console.error("Copy failed", err);
    }
  };

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
      link.download = `saved-image-${Date.now()}.jpg`;

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Saved Posts
      </h1>

      <div className="grid gap-4">
        {savedPosts.map((post, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              {post.type === "image" ? (
                <div className="relative w-full aspect-square">
                  <Image
                    src={post.content}
                    alt="Saved content"
                    fill
                    className="rounded-md object-cover"
                    priority
                  />
                </div>
              ) : (
                <p>{post.content}</p>
              )}
            </CardContent>

            <CardFooter className="flex gap-2">
              {post.type === "image" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(post.content)}
                    className="min-w-[100px]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(index)}
                    className="min-w-[100px]"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  {editingIndex === index ? (
                    <Button onClick={() => handleUpdate(index, post.content)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(index)}
                        className="min-w-[100px]"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCopy(index, post.content)}
                        disabled={copiedStates[index]}
                        className="min-w-[100px]"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {copiedStates[index] ? "Copied!" : "Copy"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(index)}
                        className="min-w-[100px]"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
