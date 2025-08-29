"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Post, User } from "@/lib/types";
import { likeDb, userDb } from "@/lib/mock-db";

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  onUpdate?: () => void;
}

export function PostCard({ post, currentUser, onUpdate }: PostCardProps) {
  const [creator, setCreator] = useState<User | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isLoading, setIsLoading] = useState(false);

  // Load creator data
  useState(() => {
    const loadCreator = async () => {
      const creatorData = await userDb.findById(post.creatorId);
      setCreator(creatorData);
      
      // Check if current user has liked this post
      if (currentUser) {
        const like = await likeDb.findByUserAndPost(currentUser.id, post.id);
        setIsLiked(!!like);
      }
    };
    loadCreator();
  });

  const handleLike = async () => {
    if (!currentUser || isLoading) return;
    
    setIsLoading(true);
    try {
      if (isLiked) {
        await likeDb.delete(post.id, currentUser.id);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await likeDb.create({ postId: post.id, userId: currentUser.id });
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
      onUpdate?.();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isAccessible = post.type === 'free' || 
    (currentUser && (currentUser.id === post.creatorId || currentUser.role === 'creator'));

  if (!creator) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Link 
            href={`/profile/${creator.username}`}
            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-slate-800 p-2 -m-2 rounded-lg transition-colors"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{creator.name}</p>
                {creator.isVerified && (
                  <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                @{creator.username} • {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            {post.type === 'premium' && (
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                Premium
              </Badge>
            )}
            {post.featured && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                ⭐ Featured
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Title */}
        <Link href={`/post/${post.id}`} className="block">
          <h2 className="text-xl font-bold hover:text-purple-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Post Content */}
        <div className="relative">
          {isAccessible ? (
            <>
              {post.media && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  {post.media.type === 'image' && (
                    <img
                      src={post.media.url}
                      alt={post.title}
                      className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {post.media.type === 'video' && (
                    <div className="relative">
                      <img
                        src={post.media.thumbnail || post.media.url}
                        alt={post.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Button size="lg" className="rounded-full w-16 h-16">
                          ▶
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 line-clamp-4">
                  {post.excerpt || post.content.substring(0, 300) + (post.content.length > 300 ? '...' : '')}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-6 rounded-lg text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">Premium Content</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Subscribe to access this exclusive content from {creator.name}
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Subscribe for $5/month
              </Button>
            </div>
          )}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
              disabled={!currentUser || isLoading}
            >
              <span className={`text-lg ${isLiked ? 'animate-pulse' : ''}`}>
                {isLiked ? '❤️' : '🤍'}
              </span>
              <span>{likesCount.toLocaleString()}</span>
            </Button>
            
            <Link href={`/post/${post.id}`}>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <span className="text-lg">💬</span>
                <span>{post.comments.toLocaleString()}</span>
              </Button>
            </Link>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <span className="text-lg">👁️</span>
              <span>{post.views.toLocaleString()}</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <span className="text-lg">📤</span>
            </Button>
            <Button variant="ghost" size="sm">
              <span className="text-lg">🔖</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}