"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Heart } from "lucide-react";
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

  useEffect(() => {
    getEmojiUrl(emoji.storagePath)
      .then(setBlobUrl)
      .catch(console.error);
    
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [emoji.storagePath, getEmojiUrl]);

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
  const [isLoadingUserEmojis, setIsLoadingUserEmojis] = useState(false);
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
      } else {
        setIsLoadingUserEmojis(true);
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

      setUserEmojis(prev => append ? [...prev, ...newEmojis] : newEmojis);
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching user emojis:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch emojis');
    } finally {
      setIsLoadingMore(false);
      setIsLoadingUserEmojis(false);
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
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    isLoading,
    setIsLoading,
    isLoadingUserEmojis,
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
    isLoadingUserEmojis,
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
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">AI Emojis</h1>
        <p className="text-gray-400">
          {userEmojis.length + recentEmojis.length} emojis generated and counting!
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
              unoptimized
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
                onClick={() => handleDownload(recentEmojis[0].storagePath, "current-emoji")}
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 text-white hover:text-white hover:bg-white/20"
                onClick={() => {
                  const index = recentEmojis.findIndex(emoji => emoji.storagePath === currentEmoji);
                  if (index !== -1) toggleLike(recentEmojis[index].id);
                }}
              >
                <Heart className={`h-5 w-5 ${recentEmojis.find(emoji => emoji.storagePath === currentEmoji)?.liked ? 'fill-current text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoadingUserEmojis ? (
        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-xl font-semibold mb-4">Your Emojis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl p-3 animate-pulse">
                <div className="w-16 h-16 bg-zinc-800 rounded-lg" />
              </div>
            ))}
          </div>
        </section>
      ) : userEmojis.length > 0 && (
        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-xl font-semibold mb-4">Your Emojis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="mt-8 text-center">
              <Button 
                className="bg-zinc-800 hover:bg-zinc-700 text-white"
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
        <section className="max-w-4xl mx-auto mt-12">
          <h2 className="text-xl font-semibold mb-4">Recent</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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