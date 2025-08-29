import { NextRequest, NextResponse } from 'next/server';
import { commentDb } from '@/lib/mock-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Post ID is required' 
      }, { status: 400 });
    }

    const comments = await commentDb.findByPostId(postId);
    return NextResponse.json({ 
      success: true, 
      comments 
    });
  } catch (error) {
    console.error('Get comments API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, userId, text } = body;

    if (!postId || !userId || !text) {
      return NextResponse.json({ 
        success: false, 
        message: 'Post ID, user ID, and text are required' 
      }, { status: 400 });
    }

    if (text.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Comment text cannot be empty' 
      }, { status: 400 });
    }

    const comment = await commentDb.create({
      postId,
      userId,
      text: text.trim(),
    });

    return NextResponse.json({ 
      success: true, 
      comment,
      message: 'Comment added successfully' 
    });
  } catch (error) {
    console.error('Create comment API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Comment ID is required' 
      }, { status: 400 });
    }

    const deleted = await commentDb.delete(commentId);
    if (deleted) {
      return NextResponse.json({ 
        success: true, 
        message: 'Comment deleted successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Comment not found' 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Delete comment API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}