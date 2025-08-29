"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userDb, postDb, followDb } from "@/lib/mock-db";
import { User, Post } from "@/lib/types";
import Link from "next/link";

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const [creators, setCreators] = useState<User[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCreators, setFilteredCreators] = useState<User[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDiscoverData = async () => {
      try {
        // Load all creators
        const allCreators = await userDb.getCreators();
        setCreators(allCreators);
        setFilteredCreators(allCreators);

        // Load trending posts
        const trending = await postDb.getTrending();
        setTrendingPosts(trending);

        // Load following status if user is logged in
        if (user) {
          const following = await followDb.getFollowing(user.id);
          setFollowingIds(following.map(u => u.id));
        }
      } catch (error) {
        console.error('Failed to load discover data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      loadDiscoverData();
    }
  }, [user, loading]);

  useEffect(() => {
    // Filter creators based on search query
    if (searchQuery.trim()) {
      const filtered = creators.filter(creator =>
        creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCreators(filtered);
    } else {
      setFilteredCreators(creators);
    }
  }, [searchQuery, creators]);

  const handleFollow = async (creatorId: string) => {
    if (!user) return;
    
    try {
      const isCurrentlyFollowing = followingIds.includes(creatorId);
      
      if (isCurrentlyFollowing) {
        await followDb.delete(user.id, creatorId);
        setFollowingIds(prev => prev.filter(id => id !== creatorId));
      } else {
        await followDb.create({
          followerId: user.id,
          followingId: creatorId,
        });
        setFollowingIds(prev => [...prev, creatorId]);
      }
      
      // Refresh creators data to update follower counts
      const updatedCreators = await userDb.getCreators();
      setCreators(updatedCreators);
      setFilteredCreators(updatedCreators.filter(creator =>
        searchQuery.trim() ? (
          creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          creator.bio?.toLowerCase().includes(searchQuery.toLowerCase())
        ) : true
      ));
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Discover Amazing <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Creators</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Find creators who inspire you and support their journey
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <Input
              type="search"
              placeholder="Search creators by name, username, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="creators" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="creators">Creators</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value="creators" className="space-y-6">
            {/* Featured Creators */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Featured Creators</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {creators
                  .filter(creator => creator.isVerified)
                  .slice(0, 3)
                  .map((creator) => (
                    <Card key={creator.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                      <CardHeader className="text-center pb-3">
                        <Link href={`/profile/${creator.username}`}>
                          <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-purple-200 dark:ring-purple-800 group-hover:ring-purple-300 dark:group-hover:ring-purple-700 transition-all">
                            <AvatarImage src={creator.avatar} alt={creator.name} />
                            <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <CardTitle className="text-lg">{creator.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs px-2">✓</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">@{creator.username}</p>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {creator.bio}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {creator.followerCount.toLocaleString()} followers
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/profile/${creator.username}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              View Profile
                            </Button>
                          </Link>
                          {user && user.id !== creator.id && (
                            <Button
                              size="sm"
                              variant={followingIds.includes(creator.id) ? "outline" : "default"}
                              onClick={() => handleFollow(creator.id)}
                              className={!followingIds.includes(creator.id) ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : ""}
                            >
                              {followingIds.includes(creator.id) ? "Following" : "Follow"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* All Creators */}
            <div>
              <h2 className="text-2xl font-bold mb-4">
                All Creators {searchQuery && `(${filteredCreators.length} results)`}
              </h2>
              
              {filteredCreators.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No creators found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try searching with different keywords
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCreators.map((creator) => (
                    <Card key={creator.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <Link href={`/profile/${creator.username}`}>
                            <Avatar className="h-12 w-12 group-hover:scale-105 transition-transform">
                              <AvatarImage src={creator.avatar} alt={creator.name} />
                              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{creator.name}</h3>
                              {creator.isVerified && (
                                <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              @{creator.username}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {creator.bio}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {creator.followerCount.toLocaleString()} followers
                          </span>
                          <div className="flex gap-2">
                            <Link href={`/profile/${creator.username}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            {user && user.id !== creator.id && (
                              <Button
                                size="sm"
                                variant={followingIds.includes(creator.id) ? "outline" : "default"}
                                onClick={() => handleFollow(creator.id)}
                                className={!followingIds.includes(creator.id) ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : ""}
                              >
                                {followingIds.includes(creator.id) ? "Following" : "Follow"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Trending Posts</h2>
              
              {trendingPosts.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="text-6xl mb-4">📈</div>
                  <h3 className="text-xl font-semibold mb-2">No trending posts yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later for popular content
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingPosts.map((post) => {
                    const creator = creators.find(c => c.id === post.creatorId);
                    return (
                      <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
                        {post.media && (
                          <div className="aspect-video overflow-hidden rounded-t-lg">
                            <img
                              src={post.media.url}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            {post.type === 'premium' && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs">
                                Premium
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              Trending
                            </Badge>
                          </div>
                          <Link href={`/post/${post.id}`}>
                            <h3 className="font-semibold line-clamp-2 group-hover:text-purple-600 transition-colors">
                              {post.title}
                            </h3>
                          </Link>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2 mb-3">
                            {creator && (
                              <Link href={`/profile/${creator.username}`} className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-slate-800 p-1 rounded transition-colors">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={creator.avatar} alt={creator.name} />
                                  <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{creator.name}</span>
                              </Link>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-4">
                              <span>❤️ {post.likes}</span>
                              <span>💬 {post.comments}</span>
                            </div>
                            <span>👁️ {post.views}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}