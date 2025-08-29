import { NextRequest, NextResponse } from 'next/server';
import { authDb, userDb } from '@/lib/mock-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, userData } = body;

    switch (action) {
      case 'login': {
        const user = await authDb.login(email, password);
        if (user) {
          return NextResponse.json({ 
            success: true, 
            user,
            message: 'Login successful' 
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'Invalid credentials' 
          }, { status: 401 });
        }
      }

      case 'signup': {
        // Check if user already exists
        const existingUser = await userDb.findByEmail(userData.email);
        if (existingUser) {
          return NextResponse.json({ 
            success: false, 
            message: 'User already exists' 
          }, { status: 400 });
        }

        const newUser = await userDb.create(userData);
        await authDb.setCurrentUser(newUser);
        
        return NextResponse.json({ 
          success: true, 
          user: newUser,
          message: 'Account created successfully' 
        });
      }

      case 'logout': {
        await authDb.logout();
        return NextResponse.json({ 
          success: true, 
          message: 'Logged out successfully' 
        });
      }

      case 'me': {
        const currentUser = await authDb.getCurrentUser();
        return NextResponse.json({ 
          success: true, 
          user: currentUser 
        });
      }

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}