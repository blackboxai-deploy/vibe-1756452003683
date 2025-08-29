"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { userDb, postDb } from "@/lib/mock-db";
import { User, Post } from "@/lib/types";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ creators: 0, posts: 0, supporters: 0 });
  const [featuredCreators, setFeaturedCreators] = useState<User[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (user && !loading) {
      // Redirect authenticated users to feed
      router.push('/feed');
      return;
    }

    // Load public data for landing page
    const loadLandingData = async () => {
      try {
        const allUsers = await userDb.getAll();
        const creators = allUsers.filter(u => u.role === 'creator');
        const supporters = allUsers.filter(u => u.role === 'supporter');
        const allPosts = await postDb.getAll();
        const trending = await postDb.getTrending();
        
        setStats({
          creators: creators.length,
          supporters: supporters.length,
          posts: allPosts.length,
        });
        
        setFeaturedCreators(creators.slice(0, 3));
        setTrendingPosts(trending.slice(0, 3));
      } catch (error) {
        console.error('Failed to load landing data:', error);
      }
    };

    if (!loading) {
      loadLandingData();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                CreatorHub
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-3xl -z-10"></div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
              Creator Economy
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Reimagined</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Connect with amazing creators, discover exclusive content, and support your favorite artists, 
            writers, and innovators in the ultimate creator economy platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 text-lg">
                Start Creating
              </Button>
            </Link>
            <Link href="/discover">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950">
                Discover Creators
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.creators}</div>
              <div className="text-gray-600 dark:text-gray-400">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.posts}</div>
              <div className="text-gray-600 dark:text-gray-400">Posts Published</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-500">{stats.supporters}</div>
              <div className="text-gray-600 dark:text-gray-400">Happy Supporters</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Creators</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover amazing creators sharing their expertise and passion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCreators.map((creator) => (
              <Card key={creator.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-purple-100 dark:ring-purple-900 group-hover:ring-purple-200 dark:group-hover:ring-purple-800 transition-all"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-lg">{creator.name}</CardTitle>
                    {creator.isVerified && (
                      <Badge variant="secondary" className="text-xs px-2">✓</Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">@{creator.username}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-4">{creator.bio}</p>
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    {creator.followerCount.toLocaleString()} followers
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Posts */}
      {trendingPosts.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Trending Content</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Check out the most popular posts from our community
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trendingPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300">
                  {post.media && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={post.media.url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      {post.type === 'premium' && (
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                          Premium
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {post.tags[0]}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{post.likes} likes</span>
                      <span>{post.views} views</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Creator Journey?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of creators who are already building their community and earning from their passion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg bg-white text-purple-600 hover:bg-gray-100">
                  Join as Creator
                </Button>
              </Link>
              <Link href="/discover">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white/10">
                  Explore Content
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                CreatorHub
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 CreatorHub. Built for creators, by creators.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}