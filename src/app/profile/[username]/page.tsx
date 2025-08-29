"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userDb, postDb, followDb, subscriptionDb } from "@/lib/mock-db";
import { User, Post } from "@/lib/types";
import { toast } from "sonner";

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const username = params.username as string;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Load profile user
        const user = await userDb.findByUsername(username);
        if (!user) {
          toast.error("User not found");
          return;
        }
        setProfileUser(user);

        // Load user's posts
        const userPosts = await postDb.findByCreatorId(user.id);
        // Filter posts based on access rights
        const accessiblePosts = userPosts.filter(post => {
          if (post.type === 'free') return true;
          if (currentUser?.id === user.id) return true; // Own posts
          // TODO: Check subscription status for premium posts
          return false;
        });
        setPosts(accessiblePosts);

        // Check if current user is following this profile
        if (currentUser && currentUser.id !== user.id) {
          const following = await followDb.isFollowing(currentUser.id, user.id);
          setIsFollowing(following);

          // Check subscription status
          const subscribed = await subscriptionDb.isSubscribed(currentUser.id, user.id);
          setIsSubscribed(subscribed);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadProfile();
    }
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || !profileUser || followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followDb.delete(currentUser.id, profileUser.id);
        setIsFollowing(false);
        toast.success(`Unfollowed ${profileUser.name}`);
      } else {
        await followDb.create({
          followerId: currentUser.id,
          followingId: profileUser.id,
        });
        setIsFollowing(true);
        toast.success(`Now following ${profileUser.name}!`);
      }
      
      // Refresh profile data
      const updatedUser = await userDb.findById(profileUser.id);
      if (updatedUser) {
        setProfileUser(updatedUser);
      }
    } catch (error) {
      toast.error("Failed to update follow status");
      console.error('Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser || !profileUser) return;

    try {
      if (isSubscribed) {
        toast.info("Subscription management coming soon!");
      } else {
        // Mock subscription
        await subscriptionDb.create({
          supporterId: currentUser.id,
          creatorId: profileUser.id,
          status: 'active',
          tier: 'basic',
          mockPrice: 5,
        });
        setIsSubscribed(true);
        toast.success(`Subscribed to ${profileUser.name}!`);
      }
    } catch (error) {
      toast.error("Subscription failed");
      console.error('Subscription error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">
            The user you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-32 h-32 rounded-full border-4 border-purple-200 dark:border-purple-800 mb-4"
                />
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                    {profileUser.isVerified && (
                      <Badge variant="secondary" className="px-2">✓ Verified</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">@{profileUser.username}</p>
                  <Badge variant="outline" className="capitalize">
                    {profileUser.role}
                  </Badge>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-center md:text-left">
                  {profileUser.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profileUser.followerCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profileUser.followingCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{posts.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                  </div>
                </div>

                {/* Social Links */}
                {(profileUser.socials.website || profileUser.socials.twitter || profileUser.socials.instagram) && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {profileUser.socials.website && (
                      <a
                        href={profileUser.socials.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline"
                      >
                        🌐 Website
                      </a>
                    )}
                    {profileUser.socials.twitter && (
                      <a
                        href={`https://twitter.com/${profileUser.socials.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline"
                      >
                        🐦 Twitter
                      </a>
                    )}
                    {profileUser.socials.instagram && (
                      <a
                        href={`https://instagram.com/${profileUser.socials.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline"
                      >
                        📷 Instagram
                      </a>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {!isOwnProfile && currentUser && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={!isFollowing ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : ""}
                      disabled={followLoading}
                    >
                      {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                    </Button>
                    
                    {profileUser.role === 'creator' && (
                      <Button
                        onClick={handleSubscribe}
                        variant="outline"
                        className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
                      >
                        {isSubscribed ? "Subscribed" : "Subscribe"}
                      </Button>
                    )}
                  </div>
                )}

                {isOwnProfile && (
                  <div className="flex gap-3">
                    <Button variant="outline" asChild>
                      <a href="/dashboard/settings">Edit Profile</a>
                    </Button>
                    <Button asChild>
                      <a href="/dashboard">Dashboard</a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {posts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">
                  {isOwnProfile ? "You haven't posted anything yet" : `${profileUser.name} hasn't posted anything yet`}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {isOwnProfile ? "Share your first post to start building your community" : "Check back later for updates"}
                </p>
                {isOwnProfile && (
                  <Button asChild>
                    <a href="/create">Create Your First Post</a>
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onUpdate={() => {
                      // Refresh posts
                      postDb.findByCreatorId(profileUser.id).then(setPosts);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {profileUser.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-gray-700 dark:text-gray-300">{profileUser.bio}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Joined</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(profileUser.joinedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {profileUser.role === 'creator' && (
                  <div>
                    <h4 className="font-medium mb-2">Creator Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Total Posts: {posts.length}</div>
                      <div>Total Followers: {profileUser.followerCount.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            {profileUser.role === 'creator' ? (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Support {profileUser.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg">
                      <h4 className="font-medium mb-2">Basic Subscription - $5/month</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Access to premium posts</li>
                        <li>• Early access to content</li>
                        <li>• Creator badge</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg">
                      <h4 className="font-medium mb-2">Premium Subscription - $15/month</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• All Basic features</li>
                        <li>• Direct messaging</li>
                        <li>• 1-on-1 video calls</li>
                        <li>• Exclusive Discord access</li>
                      </ul>
                    </div>
                    {!isOwnProfile && currentUser && (
                      <Button
                        onClick={handleSubscribe}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {isSubscribed ? "Manage Subscription" : "Subscribe Now"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>One-time Support</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show your appreciation with a one-time tip
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[5, 10, 25].map((amount) => (
                        <Button key={amount} variant="outline" size="sm">
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      Custom Amount
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-4xl mb-4">👤</div>
                  <h3 className="font-semibold mb-2">This is a supporter account</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {profileUser.name} supports creators and discovers amazing content
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}