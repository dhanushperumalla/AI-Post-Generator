"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash } from "lucide-react";

export default function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
  );
} 