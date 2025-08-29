"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { postDb } from "@/lib/mock-db";
import { Post } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";

export default function PostsManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'creator')) {
      router.push('/dashboard');
      return;
    }

    const loadPosts = async () => {
      if (!user) return;

      try {
        const userPosts = await postDb.findByCreatorId(user.id);
        setPosts(userPosts);
        setFilteredPosts(userPosts);
      } catch (error) {
        console.error('Failed to load posts:', error);
        toast.error("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadPosts();
    }
  }, [user, loading, router]);

  useEffect(() => {
    let filtered = posts;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedFilter === 'free') {
      filtered = filtered.filter(post => post.type === 'free');
    } else if (selectedFilter === 'premium') {
      filtered = filtered.filter(post => post.type === 'premium');
    } else if (selectedFilter === 'featured') {
      filtered = filtered.filter(post => post.featured);
    } else if (selectedFilter === 'scheduled') {
      filtered = filtered.filter(post => post.scheduledFor && !post.published);
    } else if (selectedFilter === 'drafts') {
      filtered = filtered.filter(post => !post.published);
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, selectedFilter]);

  const handleDeletePost = async (postId: string) => {
    try {
      await postDb.delete(postId);
      const updatedPosts = posts.filter(p => p.id !== postId);
      setPosts(updatedPosts);
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
      console.error('Delete post error:', error);
    }
  };

  const handleTogglePublish = async (postId: string, currentStatus: boolean) => {
    try {
      await postDb.update(postId, { published: !currentStatus });
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, published: !currentStatus } : p
      );
      setPosts(updatedPosts);
      toast.success(currentStatus ? "Post unpublished" : "Post published");
    } catch (error) {
      toast.error("Failed to update post");
      console.error('Toggle publish error:', error);
    }
  };

  const handleToggleFeatured = async (postId: string, currentStatus: boolean) => {
    try {
      await postDb.update(postId, { featured: !currentStatus });
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, featured: !currentStatus } : p
      );
      setPosts(updatedPosts);
      toast.success(currentStatus ? "Removed from featured" : "Added to featured");
    } catch (error) {
      toast.error("Failed to update post");
      console.error('Toggle featured error:', error);
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

  if (!user || user.role !== 'creator') return null;

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.published).length,
    drafts: posts.filter(p => !p.published).length,
    premium: posts.filter(p => p.type === 'premium').length,
    featured: posts.filter(p => p.featured).length,
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Posts</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create, edit, and organize your content
            </p>
          </div>
          <Link href="/create">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              ✍️ Create New Post
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Published</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Drafts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.premium}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Premium</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.featured}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search posts by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('all')}
                  size="sm"
                >
                  All ({stats.total})
                </Button>
                <Button
                  variant={selectedFilter === 'free' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('free')}
                  size="sm"
                >
                  Free
                </Button>
                <Button
                  variant={selectedFilter === 'premium' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('premium')}
                  size="sm"
                >
                  Premium ({stats.premium})
                </Button>
                <Button
                  variant={selectedFilter === 'featured' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('featured')}
                  size="sm"
                >
                  Featured ({stats.featured})
                </Button>
                <Button
                  variant={selectedFilter === 'drafts' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('drafts')}
                  size="sm"
                >
                  Drafts ({stats.drafts})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Posts ({filteredPosts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery || selectedFilter !== 'all' 
                    ? "No posts found" 
                    : "No posts yet"
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery || selectedFilter !== 'all'
                    ? "Try adjusting your search or filters"
                    : "Create your first post to start building your audience"
                  }
                </p>
                {(!searchQuery && selectedFilter === 'all') && (
                  <Link href="/create">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                      Create Your First Post
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link 
                          href={`/post/${post.id}`}
                          className="font-semibold text-lg hover:text-purple-600 transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <div className="flex gap-2">
                          {post.type === 'premium' && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs">
                              Premium
                            </Badge>
                          )}
                          {post.featured && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                              ⭐ Featured
                            </Badge>
                          )}
                          {!post.published && (
                            <Badge variant="secondary" className="text-xs">
                              Draft
                            </Badge>
                          )}
                          {post.scheduledFor && !post.published && (
                            <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                              Scheduled
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                        {post.excerpt || post.content.substring(0, 150) + "..."}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <span>👁️ {post.views.toLocaleString()}</span>
                        <span>❤️ {post.likes.toLocaleString()}</span>
                        <span>💬 {post.comments.toLocaleString()}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.scheduledFor && (
                          <span className="text-blue-600">
                            📅 {new Date(post.scheduledFor).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
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
                    </div>

                    <div className="flex items-center gap-2 ml-6">
                      <Link href={`/post/${post.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            ⋯
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/create?edit=${post.id}`}>
                              ✏️ Edit Post
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTogglePublish(post.id, post.published)}
                          >
                            {post.published ? '📤 Unpublish' : '🚀 Publish'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleFeatured(post.id, post.featured)}
                          >
                            {post.featured ? '⭐ Remove Featured' : '⭐ Make Featured'}
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/post/${post.id}`}>
                              📊 View Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600"
                          >
                            🗑️ Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}