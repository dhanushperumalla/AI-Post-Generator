"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

import { Edit, Trash, Copy, Save } from "lucide-react";

import { toast } from "sonner";

interface CopyButtonState {
  [key: number]: boolean;
}

export default function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

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

    updatedPosts[index] = newContent;

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Saved Posts
      </h1>

      <div className="grid gap-4">
        {savedPosts.map((post, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
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

            <CardFooter className="flex gap-2">
              {editingIndex === index ? (
                <Button onClick={() => handleUpdate(index, post)}>
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
                    onClick={() => handleCopy(index, post)}
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
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
