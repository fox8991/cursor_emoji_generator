"use client";

import React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Heart } from "lucide-react";
import Image from "next/image";

interface GeneratedEmoji {
  url: string;
  prompt: string;
  liked?: boolean;
}

export default function Home(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentEmojis, setRecentEmojis] = useState<GeneratedEmoji[]>([]);

  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `emoji-${prompt}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download emoji');
    }
  };

  const toggleLike = (index: number) => {
    setRecentEmojis(prev => prev.map((emoji, i) => 
      i === index ? { ...emoji, liked: !emoji.liked } : emoji
    ));
  };

  const handleGenerateEmoji = async (prompt: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentEmoji(null);
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate emoji");
      }

      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        throw new Error("Invalid response format");
      }

      const imageUrl = result.data[0];
      if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
        throw new Error("Invalid image URL received");
      }

      setCurrentEmoji(imageUrl);
      setRecentEmojis(prev => [{url: imageUrl, prompt}, ...prev].slice(0, 12));
    } catch (err) {
      console.error("Error details:", err);
      setError(err instanceof Error ? err.message : "An error occurred while generating the emoji");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const prompt = formData.get('prompt') as string;
    if (prompt.trim()) {
      handleGenerateEmoji(prompt.trim());
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <span className="font-medium">emojis</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold">AI Emojis</h1>
          <p className="text-gray-400">
            {recentEmojis.length} emojis generated and counting!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-16">
          <div className="relative">
            <Input
              name="prompt"
              className="w-full bg-zinc-900 border-zinc-800 rounded-xl py-6 pl-4 pr-12 text-lg"
              placeholder="cat"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 -translate-y-1/2"
              disabled={isLoading}
            >
              ↵
            </button>
          </div>
        </form>

        {error && (
          <div className="text-red-500 text-center mb-8">{error}</div>
        )}

        {isLoading && (
          <div className="flex justify-center mb-8">
            <div className="animate-pulse bg-zinc-800 w-32 h-32 rounded-xl" />
          </div>
        )}

        {currentEmoji && !isLoading && (
          <div className="flex justify-center mb-12">
            <div className="relative group">
              <Image
                src={currentEmoji}
                alt="Generated emoji"
                width={196}
                height={196}
                className="rounded-xl"
                onError={() => {
                  console.error('Image failed to load:', currentEmoji);
                  setError('Failed to load the generated image');
                  setCurrentEmoji(null);
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 text-white hover:text-white hover:bg-white/20"
                  onClick={() => handleDownload(currentEmoji, "current-emoji")}
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 text-white hover:text-white hover:bg-white/20"
                  onClick={() => {
                    const index = recentEmojis.findIndex(emoji => emoji.url === currentEmoji);
                    if (index !== -1) toggleLike(index);
                  }}
                >
                  <Heart className={`h-5 w-5 ${recentEmojis.find(emoji => emoji.url === currentEmoji)?.liked ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {recentEmojis.length > 0 && (
          <section className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Recents</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentEmojis.map((emoji, index) => (
                <div key={index} className="bg-zinc-900 rounded-xl p-3 group relative">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <Image
                        src={emoji.url}
                        alt={emoji.prompt}
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                          onClick={() => handleDownload(emoji.url, emoji.prompt)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 text-white hover:text-white hover:bg-white/20 ${
                            emoji.liked ? 'text-red-500 hover:text-red-500' : ''
                          }`}
                          onClick={() => toggleLike(index)}
                        >
                          <Heart className={`h-4 w-4 ${emoji.liked ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-400 line-clamp-2">:{emoji.prompt}:</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
