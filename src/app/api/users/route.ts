import { NextRequest, NextResponse } from 'next/server';
import { userDb, followDb } from '@/lib/mock-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');

    switch (action) {
      case 'profile': {
        if (username) {
          const user = await userDb.findByUsername(username);
          if (user) {
            return NextResponse.json({ success: true, user });
          } else {
            return NextResponse.json({ 
              success: false, 
              message: 'User not found' 
            }, { status: 404 });
          }
        } else if (userId) {
          const user = await userDb.findById(userId);
          if (user) {
            return NextResponse.json({ success: true, user });
          } else {
            return NextResponse.json({ 
              success: false, 
              message: 'User not found' 
            }, { status: 404 });
          }
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'Username or user ID is required' 
          }, { status: 400 });
        }
      }

      case 'creators': {
        const creators = await userDb.getCreators();
        return NextResponse.json({ success: true, creators });
      }

      case 'followers': {
        if (!userId) {
          return NextResponse.json({ 
            success: false, 
            message: 'User ID is required' 
          }, { status: 400 });
        }
        const followers = await followDb.getFollowers(userId);
        return NextResponse.json({ success: true, followers });
      }

      case 'following': {
        if (!userId) {
          return NextResponse.json({ 
            success: false, 
            message: 'User ID is required' 
          }, { status: 400 });
        }
        const following = await followDb.getFollowing(userId);
        return NextResponse.json({ success: true, following });
      }

      default: {
        const users = await userDb.getAll();
        return NextResponse.json({ success: true, users });
      }
    }
  } catch (error) {
    console.error('Get users API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID is required' 
      }, { status: 400 });
    }

    const updatedUser = await userDb.update(userId, updates);
    if (updatedUser) {
      return NextResponse.json({ 
        success: true, 
        user: updatedUser,
        message: 'User updated successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Update user API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, followerId, followingId } = body;

    switch (action) {
      case 'follow': {
        if (!followerId || !followingId) {
          return NextResponse.json({ 
            success: false, 
            message: 'Follower ID and following ID are required' 
          }, { status: 400 });
        }

        if (followerId === followingId) {
          return NextResponse.json({ 
            success: false, 
            message: 'Cannot follow yourself' 
          }, { status: 400 });
        }

        const follow = await followDb.create({ followerId, followingId });
        return NextResponse.json({ 
          success: true, 
          follow,
          message: 'Successfully followed user' 
        });
      }

      case 'unfollow': {
        if (!followerId || !followingId) {
          return NextResponse.json({ 
            success: false, 
            message: 'Follower ID and following ID are required' 
          }, { status: 400 });
        }

        const unfollowed = await followDb.delete(followerId, followingId);
        if (unfollowed) {
          return NextResponse.json({ 
            success: true, 
            message: 'Successfully unfollowed user' 
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'Follow relationship not found' 
          }, { status: 404 });
        }
      }

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('User action API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}