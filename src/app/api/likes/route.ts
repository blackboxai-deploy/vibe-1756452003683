import { NextRequest, NextResponse } from 'next/server';
import { likeDb } from '@/lib/mock-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, postId, userId } = body;

    if (!postId || !userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Post ID and user ID are required' 
      }, { status: 400 });
    }

    switch (action) {
      case 'like': {
        const like = await likeDb.create({ postId, userId });
        return NextResponse.json({ 
          success: true, 
          like,
          message: 'Post liked successfully' 
        });
      }

      case 'unlike': {
        const unliked = await likeDb.delete(postId, userId);
        if (unliked) {
          return NextResponse.json({ 
            success: true, 
            message: 'Post unliked successfully' 
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'Like not found' 
          }, { status: 404 });
        }
      }

      case 'check': {
        const like = await likeDb.findByUserAndPost(userId, postId);
        return NextResponse.json({ 
          success: true, 
          isLiked: !!like,
          like 
        });
      }

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');

    if (!postId || !userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Post ID and user ID are required' 
      }, { status: 400 });
    }

    const like = await likeDb.findByUserAndPost(userId, postId);
    return NextResponse.json({ 
      success: true, 
      isLiked: !!like,
      like 
    });
  } catch (error) {
    console.error('Get like API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}