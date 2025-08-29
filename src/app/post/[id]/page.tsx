"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { postDb, userDb, commentDb, likeDb } from "@/lib/mock-db";
import { Post, User, Comment } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const postId = params.id as string;

  useEffect(() => {
    const loadPostData = async () => {
      try {
        // Load post
        const postData = await postDb.findById(postId);
        if (!postData) {
          toast.error("Post not found");
          router.push('/feed');
          return;
        }
        setPost(postData);
        setLikesCount(postData.likes);

        // Increment view count
        await postDb.incrementViews(postId);

        // Load creator
        const creatorData = await userDb.findById(postData.creatorId);
        setCreator(creatorData);

        // Load comments
        const postComments = await commentDb.findByPostId(postId);
        setComments(postComments);

        // Check if current user has liked this post
        if (user) {
          const like = await likeDb.findByUserAndPost(user.id, postId);
          setIsLiked(!!like);
        }
      } catch (error) {
        console.error('Failed to load post data:', error);
        toast.error("Failed to load post");
        router.push('/feed');
      } finally {
        setIsLoading(false);
      }
    };

    if (postId && !loading) {
      loadPostData();
    }
  }, [postId, user, loading, router]);

  const handleLike = async () => {
    if (!user || !post || likeLoading) return;
    
    setLikeLoading(true);
    try {
      if (isLiked) {
        await likeDb.delete(post.id, user.id);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await likeDb.create({ postId: post.id, userId: user.id });
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error("Failed to update like");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post || !newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const comment = await commentDb.create({
        postId: post.id,
        userId: user.id,
        text: newComment.trim(),
      });

      // Add user data to comment
      comment.user = user;
      setComments(prev => [comment, ...prev]);
      setNewComment("");
      
      // Update post comment count
      const updatedPost = await postDb.findById(post.id);
      if (updatedPost) {
        setPost(updatedPost);
      }
      
      toast.success("Comment added!");
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
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

  if (!post || !creator) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/feed')}>
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  const isAccessible = post.type === 'free' || 
    (user && (user.id === post.creatorId || user.role === 'creator'));

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader className="pb-4">
                {/* Creator Info */}
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

              <CardContent className="space-y-6">
                {/* Post Title */}
                <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>

                {/* Post Content */}
                <div className="relative">
                  {isAccessible ? (
                    <>
                      {post.media && (
                        <div className="mb-6 rounded-lg overflow-hidden">
                          {post.media.type === 'image' && (
                            <img
                              src={post.media.url}
                              alt={post.title}
                              className="w-full max-h-96 object-cover"
                            />
                          )}
                          {post.media.type === 'video' && (
                            <div className="relative">
                              <img
                                src={post.media.thumbnail || post.media.url}
                                alt={post.title}
                                className="w-full max-h-96 object-cover"
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
                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                          {post.content}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-8 rounded-lg text-center">
                      <div className="text-4xl mb-4">🔒</div>
                      <h3 className="text-xl font-semibold mb-3">Premium Content</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        This exclusive content is available to subscribers of {creator.name}
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
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="hover:bg-purple-50 dark:hover:bg-purple-950 cursor-pointer">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="ghost"
                      size="lg"
                      className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
                      onClick={handleLike}
                      disabled={!user || likeLoading}
                    >
                      <span className={`text-xl ${isLiked ? 'animate-pulse' : ''}`}>
                        {isLiked ? '❤️' : '🤍'}
                      </span>
                      <span className="font-medium">{likesCount.toLocaleString()}</span>
                    </Button>
                    
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <span className="text-xl">💬</span>
                      <span className="font-medium">{post.comments.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <span className="text-xl">👁️</span>
                      <span className="font-medium">{post.views.toLocaleString()}</span>
                    </div>
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

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Comments ({comments.length})
                  </h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Comment */}
                {user ? (
                  <form onSubmit={handleComment} className="space-y-4">
                    <div className="flex space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="mb-2"
                          disabled={isCommenting}
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!newComment.trim() || isCommenting}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            {isCommenting ? "Posting..." : "Post Comment"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Sign in to leave a comment
                    </p>
                    <Button asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Comments List */}
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="font-semibold mb-2">No comments yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Be the first to share your thoughts!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Link href={`/profile/${comment.user?.username}`}>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={comment.user?.avatar} alt={comment.user?.name} />
                            <AvatarFallback>{comment.user?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Link
                                href={`/profile/${comment.user?.username}`}
                                className="font-medium hover:text-purple-600 transition-colors"
                              >
                                {comment.user?.name}
                              </Link>
                              {comment.user?.isVerified && (
                                <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {comment.text}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <Button variant="ghost" size="sm" className="text-xs">
                              👍 {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Creator Card */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold">About the Creator</h3>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <Link href={`/profile/${creator.username}`}>
                    <Avatar className="w-16 h-16 mx-auto">
                      <AvatarImage src={creator.avatar} alt={creator.name} />
                      <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h4 className="font-medium">{creator.name}</h4>
                      {creator.isVerified && (
                        <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {creator.followerCount.toLocaleString()} followers
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {creator.bio}
                  </p>
                  {user && user.id !== creator.id && (
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" size="sm">
                        Follow
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600" size="sm">
                        Subscribe
                      </Button>
                    </div>
                  )}
                  <Link href={`/profile/${creator.username}`} className="block">
                    <Button variant="ghost" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Share */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="font-semibold">Share this post</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    🐦 Share on Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    📘 Share on Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    🔗 Copy Link
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}