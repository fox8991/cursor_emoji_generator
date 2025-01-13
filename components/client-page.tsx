"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"
import { Download, Heart, ArrowRight } from "lucide-react";
import Image from "next/image";
import { UserMenu } from "@/components/user-menu";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

interface GeneratedEmoji {
  storagePath: string;
  prompt: string;
  liked?: boolean;
  id: string;
  likesCount?: number;
}

interface EmojiCardProps {
  emoji: GeneratedEmoji;
  onDownload: (storagePath: string, prompt: string) => Promise<void>;
  onToggleLike: (emojiId: string) => Promise<void>;
  getEmojiUrl: (storagePath: string) => Promise<string>;
}

function EmojiCard({ emoji, onDownload, onToggleLike, getEmojiUrl }: EmojiCardProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getEmojiUrl(emoji.storagePath)
      .then((url) => {
        setBlobUrl(url);
        setIsLoading(false);
      })
      .catch(console.error);
  }, [emoji.storagePath, getEmojiUrl]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (isLoading) {
    return (
      <div className="bg-zinc-900 rounded-xl p-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 bg-zinc-700 rounded-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="h-4 bg-zinc-700 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!blobUrl) return null;

  return (
    <div className="bg-zinc-900 rounded-xl p-3 group relative">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Image
            src={blobUrl}
            alt={emoji.prompt}
            width={64}
            height={64}
            className="rounded-lg"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
              onClick={() => onDownload(emoji.storagePath, emoji.prompt)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 text-white hover:text-white hover:bg-white/20 ${
                emoji.liked ? 'text-red-500 hover:text-red-500' : ''
              }`}
              onClick={() => onToggleLike(emoji.id)}
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
  );
}

interface EmojiData {
  id: string;
  storage_path: string;
  prompt: string;
  visibility: 'public' | 'private';
  created_at: string;
  user_id: string;
  likes_count: number;
  user_likes: { user_id: string }[] | null;
}

const supabase = createClient();

function useEmojiState() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentEmojis, setRecentEmojis] = useState<GeneratedEmoji[]>([]);
  const [userEmojis, setUserEmojis] = useState<GeneratedEmoji[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const hasFetchedRef = useRef(false);
  const router = useRouter();

  const fetchUserEmojis = useCallback(async (page: number, append = false) => {
    if (!user) return;
    
    try {
      if (append) {
        setIsLoadingMore(true);
      }

      const response = await fetch(`/api/emojis?page=${page}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch emojis');
      }

      const newEmojis = result.emojis.map((emoji: EmojiData) => ({
        id: emoji.id,
        storagePath: emoji.storage_path,
        prompt: emoji.prompt,
        liked: Boolean(emoji.user_likes?.length),
        likesCount: emoji.likes_count
      }));

      if (append) {
        setUserEmojis(prev => [...prev, ...newEmojis]);
      } else {
        setUserEmojis(newEmojis);
      }
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching user emojis:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch emojis');
    } finally {
      setIsLoadingMore(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchUserEmojis(1);
  }, [user, fetchUserEmojis]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchUserEmojis(currentPage + 1, true);
    }
  }, [isLoadingMore, hasMore, currentPage, fetchUserEmojis]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        // Clear emoji states on sign out
        setUserEmojis([]);
        setRecentEmojis([]);
        setCurrentEmoji(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    isLoading,
    setIsLoading,
    isLoadingMore,
    currentEmoji,
    setCurrentEmoji,
    error,
    setError,
    recentEmojis,
    setRecentEmojis,
    userEmojis,
    setUserEmojis,
    hasMore,
    loadMore,
    user,
    router,
  };
}

export function AuthSection() {
  const { user, router } = useEmojiState();

  return user ? (
    <UserMenu user={user} />
  ) : (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={() => router.push('/login')}>
        Sign in
      </Button>
      <GoogleSignInButton />
    </div>
  );
}

export function MainContent() {
  const {
    isLoading,
    isLoadingMore,
    setIsLoading,
    currentEmoji,
    setCurrentEmoji,
    error,
    setError,
    recentEmojis,
    setRecentEmojis,
    userEmojis,
    setUserEmojis,
    hasMore,
    loadMore,
  } = useEmojiState();

  const supabase = createClient();

  const handleDownload = async (storagePath: string, prompt: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('emojis')
        .download(storagePath);

      if (error) throw error;

      const blob = new Blob([data], { type: 'image/png' });
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

  const getEmojiUrl = async (storagePath: string): Promise<string> => {
    try {
      // Add early return if no user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.storage
        .from('emojis')
        .download(storagePath);

      if (error) throw error;

      const blob = new Blob([data], { type: 'image/png' });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Failed to get emoji:', err);
      throw err;
    }
  };

  const toggleLike = async (emojiId: string) => {
    try {
      const response = await fetch("/api/emojis/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emojiId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to toggle like");
      }

      // Update both recent and user emojis
      setUserEmojis(prev => prev.map(emoji => 
        emoji.id === emojiId 
          ? { ...emoji, liked: result.liked, likesCount: result.likesCount }
          : emoji
      ));

      setRecentEmojis(prev => prev.map(emoji => 
        emoji.id === emojiId 
          ? { ...emoji, liked: result.liked, likesCount: result.likesCount }
          : emoji
      ));
    } catch (err) {
      console.error("Error toggling like:", err);
      setError(err instanceof Error ? err.message : "Failed to toggle like");
    }
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

      const blobUrl = await getEmojiUrl(result.storagePath);
      setCurrentEmoji(blobUrl);
      
      // Add to recent emojis (session only)
      setRecentEmojis(prev => [{
        id: result.emojiId,
        storagePath: result.storagePath,
        prompt,
        liked: false,
        likesCount: 0
      }, ...prev].slice(0, 12));
      
      // Add to user emojis (persisted)
      setUserEmojis((prev: GeneratedEmoji[]) => [{
        id: result.emojiId,
        storagePath: result.storagePath,
        prompt,
        liked: false,
        likesCount: 0
      }, ...prev]);
      
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
    <main className="container mx-auto px-4 py-16 min-h-screen">
    <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
      <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">AI Emojis</h1>
      <p className="text-zinc-400 text-lg">
        {userEmojis.length + recentEmojis.length} emojis generated and counting!
      </p>
    </div>

    <Card className="max-w-xl mx-auto mb-16 bg-zinc-800/50 border-zinc-700">
      <CardContent className="p-2">
        <form onSubmit={handleSubmit} className="flex items-center">
          <Input
            name="prompt"
            className="flex-grow bg-transparent border-none text-lg placeholder-zinc-500 focus-visible:ring-0 text-white caret-white"
            placeholder="Describe your emoji..."
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : <ArrowRight className="h-5 w-5" />}
          </Button>
        </form>
      </CardContent>
    </Card>

    {error && (
      <div className="text-red-500 text-center mb-8 bg-red-500/10 p-4 rounded-lg">{error}</div>
    )}

    {isLoading && (
      <div className="flex justify-center mb-12">
        <div className="animate-pulse bg-zinc-800 w-48 h-48 rounded-2xl" />
      </div>
    )}

    {currentEmoji && !isLoading && (
      <div className="flex justify-center mb-16">
        <div className="relative group">
          <Image
            src={currentEmoji}
            alt="Generated emoji"
            width={256}
            height={256}
            className="rounded-2xl shadow-lg"
            unoptimized
            onError={() => {
              console.error('Image failed to load:', currentEmoji);
              setError('Failed to load the generated image');
              setCurrentEmoji(null);
            }}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-2xl">
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 text-white hover:text-white hover:bg-white/20 rounded-full"
              onClick={() => handleDownload(recentEmojis[0].storagePath, "current-emoji")}
            >
              <Download className="h-6 w-6" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 text-white hover:text-white hover:bg-white/20 rounded-full"
              onClick={() => {
                const index = recentEmojis.findIndex(emoji => emoji.storagePath === currentEmoji);
                if (index !== -1) toggleLike(recentEmojis[index].id);
              }}
            >
              <Heart className={`h-6 w-6 ${recentEmojis.find(emoji => emoji.storagePath === currentEmoji)?.liked ? 'fill-current text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    )}

    {userEmojis.length > 0 && (
      <section className="max-w-5xl mx-auto mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-zinc-200">Your Emojis</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {userEmojis.map((emoji) => (
            <EmojiCard
              key={emoji.storagePath}
              emoji={emoji}
              onDownload={handleDownload}
              onToggleLike={toggleLike}
              getEmojiUrl={getEmojiUrl}
            />
          ))}
        </div>
        {hasMore && (
          <div className="mt-10 text-center">
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-2 rounded-full"
              onClick={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </section>
    )}

    {recentEmojis.length > 0 && (
      <section className="max-w-5xl mx-auto mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-zinc-200">Recent</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recentEmojis.map((emoji) => (
            <EmojiCard
              key={emoji.id}
              emoji={emoji}
              onDownload={handleDownload}
              onToggleLike={toggleLike}
              getEmojiUrl={getEmojiUrl}
            />
          ))}
        </div>
      </section>
    )}
  </main>
  );
} 