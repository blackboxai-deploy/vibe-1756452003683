import { NextRequest, NextResponse } from 'next/server';
import { postDb, authDb } from '@/lib/mock-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');

    switch (action) {
      case 'feed': {
        const currentUser = await authDb.getCurrentUser();
        const posts = await postDb.getFeed(currentUser?.id);
        return NextResponse.json({ success: true, posts });
      }

      case 'user-posts': {
        if (!userId) {
          return NextResponse.json({ 
            success: false, 
            message: 'User ID required' 
          }, { status: 400 });
        }
        const posts = await postDb.findByCreatorId(userId);
        return NextResponse.json({ success: true, posts });
      }

      case 'trending': {
        const posts = await postDb.getTrending();
        return NextResponse.json({ success: true, posts });
      }

      case 'single': {
        if (!postId) {
          return NextResponse.json({ 
            success: false, 
            message: 'Post ID required' 
          }, { status: 400 });
        }
        const post = await postDb.findById(postId);
        if (post) {
          await postDb.incrementViews(postId);
          return NextResponse.json({ success: true, post });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'Post not found' 
          }, { status: 404 });
        }
      }

      default: {
        const posts = await postDb.getAll();
        return NextResponse.json({ success: true, posts });
      }
    }
  } catch (error) {
    console.error('Posts GET API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await authDb.getCurrentUser();
    if (!currentUser || currentUser.role !== 'creator') {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized - Creator access required' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { action, postData, postId, updates } = body;

    switch (action) {
      case 'create': {
        const newPost = await postDb.create({
          ...postData,
          creatorId: currentUser.id,
        });
        return NextResponse.json({ 
          success: true, 
          post: newPost,
          message: 'Post created successfully' 
        });
      }

      case 'update': {
        if (!postId) {
          return NextResponse.json({ 
            success: false, 
            message: 'Post ID required' 
          }, { status: 400 });
        }

        const post = await postDb.findById(postId);
        if (!post || post.creatorId !== currentUser.id) {
          return NextResponse.json({ 
            success: false, 
            message: 'Post not found or unauthorized' 
          }, { status: 404 });
        }

        const updatedPost = await postDb.update(postId, updates);
        return NextResponse.json({ 
          success: true, 
          post: updatedPost,
          message: 'Post updated successfully' 
        });
      }

      case 'delete': {
        if (!postId) {
          return NextResponse.json({ 
            success: false, 
            message: 'Post ID required' 
          }, { status: 400 });
        }

        const post = await postDb.findById(postId);
        if (!post || post.creatorId !== currentUser.id) {
          return NextResponse.json({ 
            success: false, 
            message: 'Post not found or unauthorized' 
          }, { status: 404 });
        }

        const deleted = await postDb.delete(postId);
        return NextResponse.json({ 
          success: deleted, 
          message: deleted ? 'Post deleted successfully' : 'Failed to delete post' 
        });
      }

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Posts POST API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}