import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import User from '@/models/User'
import mongoose from 'mongoose'
import { config } from '@/lib/config'

// Request body schema for user updates
const updateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').optional(),
  image: z.string().url().optional(),
})

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.database.uri)
    }

    // Get user from database
    const user = await User.findOne({ email: session.user.email }).select('name email image provider createdAt')

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data with default preferences
    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        provider: user.provider,
        createdAt: user.createdAt,
        preferences: {
          theme: 'light',
          defaultContentType: 'blog-title',
          notifications: {
            email: true,
            browser: true,
          },
        },
      },
    })

  } catch (error) {
    console.error('Get user API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validation.error.errors.map(e => e.message).join(', ')
        },
        { status: 400 }
      )
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.database.uri)
    }

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      validation.data,
      {
        new: true,
        runValidators: true,
      }
    ).select('name email image provider createdAt updatedAt')

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })

  } catch (error) {
    console.error('Update user API error:', error)

    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}