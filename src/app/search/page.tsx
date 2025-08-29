"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userDb, postDb } from "@/lib/mock-db";
import { User, Post } from "@/lib/types";
import Link from "next/link";

function SearchContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<{
    users: User[];
    posts: Post[];
    tags: string[];
  }>({
    users: [],
    posts: [],
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], posts: [], tags: [] });
      return;
    }

    setIsLoading(true);
    try {
      const [allUsers, allPosts] = await Promise.all([
        userDb.getAll(),
        postDb.getAll(),
      ]);

      // Search users
      const matchingUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      // Search posts
      const matchingPosts = allPosts.filter(post =>
        post.published && (
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );

      // Extract matching tags
      const allTags = allPosts.flatMap(post => post.tags);
      const matchingTags = [...new Set(allTags.filter(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ))];

      setResults({
        users: matchingUsers.slice(0, 20),
        posts: matchingPosts.slice(0, 50),
        tags: matchingTags.slice(0, 10),
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      window.history.pushState({}, '', `?${params.toString()}`);
      performSearch(query.trim());
    }
  };

  const totalResults = results.users.length + results.posts.length + results.tags.length;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Results</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <Input
                type="search"
                placeholder="Search creators, posts, tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-lg py-3"
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>

          {/* Results Summary */}
          {query && (
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                {totalResults} results for <strong>"{query}"</strong>
              </span>
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              )}
            </div>
          )}
        </div>

        {/* No Query State */}
        {!query && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Search CreatorHub</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Find creators, posts, and topics you're interested in
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['design', 'fitness', 'writing', 'technology', 'cooking'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(suggestion);
                      performSearch(suggestion);
                    }}
                  >
                    #{suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {query && totalResults === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find anything matching "<strong>{query}</strong>". 
                Try different keywords or browse our popular content.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/discover">
                  <Button variant="outline">Browse Creators</Button>
                </Link>
                <Link href="/feed">
                  <Button>View Feed</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Tabs */}
        {query && totalResults > 0 && (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({totalResults})
              </TabsTrigger>
              <TabsTrigger value="creators">
                Creators ({results.users.length})
              </TabsTrigger>
              <TabsTrigger value="posts">
                Posts ({results.posts.length})
              </TabsTrigger>
              <TabsTrigger value="tags">
                Tags ({results.tags.length})
              </TabsTrigger>
            </TabsList>

            {/* All Results */}
            <TabsContent value="all" className="space-y-8">
              {/* Creators Section */}
              {results.users.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Creators</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.users.slice(0, 6).map((creator) => (
                      <Card key={creator.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Link href={`/profile/${creator.username}`}>
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={creator.avatar} alt={creator.name} />
                                <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Link 
                                  href={`/profile/${creator.username}`}
                                  className="font-medium truncate hover:text-purple-600 transition-colors"
                                >
                                  {creator.name}
                                </Link>
                                {creator.isVerified && (
                                  <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                @{creator.username}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {creator.followerCount.toLocaleString()} followers
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 line-clamp-2">
                            {creator.bio}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {results.users.length > 6 && (
                    <div className="text-center mt-4">
                      <Button variant="outline">View All Creators</Button>
                    </div>
                  )}
                </div>
              )}

              {/* Posts Section */}
              {results.posts.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Posts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.posts.slice(0, 4).map((post) => {
                      const creator = results.users.find(u => u.id === post.creatorId);
                      return (
                        <Card key={post.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            {/* Creator info */}
                            {creator && (
                              <div className="flex items-center space-x-2 mb-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={creator.avatar} alt={creator.name} />
                                  <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Link 
                                  href={`/profile/${creator.username}`}
                                  className="text-sm font-medium hover:text-purple-600 transition-colors"
                                >
                                  {creator.name}
                                </Link>
                                {creator.isVerified && (
                                  <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                                )}
                              </div>
                            )}

                            {/* Post content */}
                            <Link 
                              href={`/post/${post.id}`}
                              className="block mb-3"
                            >
                              <h3 className="font-semibold text-lg line-clamp-2 hover:text-purple-600 transition-colors">
                                {post.title}
                              </h3>
                            </Link>

                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                              {post.excerpt || post.content.substring(0, 150) + "..."}
                            </p>

                            {/* Post meta */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>👁️ {post.views}</span>
                                <span>❤️ {post.likes}</span>
                                <span>💬 {post.comments}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {post.type === 'premium' && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs">
                                    Premium
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Tags */}
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  {results.posts.length > 4 && (
                    <div className="text-center mt-4">
                      <Button variant="outline">View All Posts</Button>
                    </div>
                  )}
                </div>
              )}

              {/* Tags Section */}
              {results.tags.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Popular Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {results.tags.map((tag) => (
                      <Button
                        key={tag}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuery(tag);
                          performSearch(tag);
                        }}
                        className="hover:bg-purple-50 dark:hover:bg-purple-950"
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Individual Tab Content */}
            <TabsContent value="creators" className="space-y-4">
              {results.users.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No creators found for "{query}"</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.users.map((creator) => (
                    <Card key={creator.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 text-center">
                        <Link href={`/profile/${creator.username}`}>
                          <Avatar className="h-16 w-16 mx-auto mb-4">
                            <AvatarImage src={creator.avatar} alt={creator.name} />
                            <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h3 className="font-semibold">{creator.name}</h3>
                          {creator.isVerified && (
                            <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          @{creator.username}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {creator.bio}
                        </p>
                        <div className="text-sm text-gray-500 mb-4">
                          {creator.followerCount.toLocaleString()} followers
                        </div>
                        <Link href={`/profile/${creator.username}`}>
                          <Button size="sm" className="w-full">
                            View Profile
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              {results.posts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No posts found for "{query}"</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {results.posts.map((post) => {
                    const creator = results.users.find(u => u.id === post.creatorId);
                    return (
                      <Card key={post.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            {creator && (
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={creator.avatar} alt={creator.name} />
                                  <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <Link 
                                    href={`/profile/${creator.username}`}
                                    className="font-medium hover:text-purple-600 transition-colors"
                                  >
                                    {creator.name}
                                  </Link>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            )}
                            {post.type === 'premium' && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                                Premium
                              </Badge>
                            )}
                          </div>

                          <Link href={`/post/${post.id}`}>
                            <h3 className="text-xl font-semibold mb-3 hover:text-purple-600 transition-colors">
                              {post.title}
                            </h3>
                          </Link>

                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                            {post.excerpt || post.content.substring(0, 200) + "..."}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>👁️ {post.views.toLocaleString()}</span>
                              <span>❤️ {post.likes.toLocaleString()}</span>
                              <span>💬 {post.comments.toLocaleString()}</span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {post.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{post.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="tags" className="space-y-4">
              {results.tags.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No tags found for "{query}"</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {results.tags.map((tag) => (
                        <Button
                          key={tag}
                          variant="outline"
                          className="justify-start hover:bg-purple-50 dark:hover:bg-purple-950"
                          onClick={() => {
                            setQuery(tag);
                            performSearch(tag);
                          }}
                        >
                          #{tag}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}