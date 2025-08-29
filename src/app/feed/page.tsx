"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { postDb, userDb, followDb } from "@/lib/mock-db";
import { Post, User } from "@/lib/types";
import Link from "next/link";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedCreators, setSuggestedCreators] = useState<User[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
      return;
    }

    const loadFeedData = async () => {
      if (!user) return;

      try {
        // Load feed posts
        const feedPosts = await postDb.getFeed(user.id);
        setPosts(feedPosts);

        // Load suggested creators (creators user isn't following)
        const allCreators = await userDb.getCreators();
        const following = await followDb.getFollowing(user.id);
        const followingIds = following.map(u => u.id);
        
        const suggested = allCreators
          .filter(creator => creator.id !== user.id && !followingIds.includes(creator.id))
          .slice(0, 3);
        
        setSuggestedCreators(suggested);
      } catch (error) {
        console.error('Failed to load feed data:', error);
      } finally {
        setPostsLoading(false);
      }
    };

    if (user) {
      loadFeedData();
    }
  }, [user, loading]);

  if (loading || postsLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Here's what's happening in your creator community
              </p>
            </div>

            {/* Create Post CTA for Creators */}
            {user.role === 'creator' && (
              <Card className="mb-8 border-dashed border-2 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Share something amazing with your community</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your followers are waiting to see what you create next
                  </p>
                  <Link href="/create">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      Create New Post
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">Your feed is empty</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {user.role === 'supporter' 
                      ? "Follow some creators to see their posts here"
                      : "Create your first post or follow other creators to see their content"
                    }
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/discover">
                      <Button variant="outline">Discover Creators</Button>
                    </Link>
                    {user.role === 'creator' && (
                      <Link href="/create">
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                          Create Post
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onUpdate={() => {
                      // Refresh feed
                      postDb.getFeed(user.id).then(setPosts);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* User Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Following</span>
                    <span className="font-medium">{user.followingCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Followers</span>
                    <span className="font-medium">{user.followerCount}</span>
                  </div>
                  {user.role === 'creator' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Posts</span>
                        <span className="font-medium">
                          {posts.filter(p => p.creatorId === user.id).length}
                        </span>
                      </div>
                      <Link href="/dashboard" className="block">
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          View Dashboard
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Suggested Creators */}
              {suggestedCreators.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Discover Creators</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {suggestedCreators.map((creator) => (
                      <div key={creator.id} className="flex items-center justify-between">
                        <Link
                          href={`/profile/${creator.username}`}
                          className="flex items-center space-x-3 flex-1 hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={creator.avatar} alt={creator.name} />
                            <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium truncate">{creator.name}</p>
                              {creator.isVerified && (
                                <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {creator.followerCount.toLocaleString()} followers
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))}
                    <Link href="/discover" className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        View All
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.role === 'creator' ? (
                    <>
                      <Link href="/create" className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          ✍️ Create Post
                        </Button>
                      </Link>
                      <Link href="/dashboard/analytics" className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          📊 View Analytics
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/discover" className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          🔍 Discover Creators
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        ⭐ Your Subscriptions
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}