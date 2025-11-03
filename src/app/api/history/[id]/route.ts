import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import GenerationHistory from '@/models/GenerationHistory'
import mongoose from 'mongoose'
import { config } from '@/lib/config'

// Request body schema for updates
const updateSchema = z.object({
  isFavorite: z.boolean().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid generation ID' },
        { status: 400 }
      )
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.database.uri)
    }

    // Find generation belonging to the user
    const generation = await GenerationHistory.findOne({
      _id: id,
      userId: session.user.id,
    }).select('_id type prompt result wordCount isFavorite createdAt updatedAt')

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: generation,
    })

  } catch (error) {
    console.error('Get generation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch generation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid generation ID' },
        { status: 400 }
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

    // Find and update generation belonging to the user
    const generation = await GenerationHistory.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id,
      },
      validation.data,
      {
        new: true,
        runValidators: true,
      }
    ).select('_id type prompt result wordCount isFavorite createdAt updatedAt')

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: generation,
    })

  } catch (error) {
    console.error('Update generation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update generation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid generation ID' },
        { status: 400 }
      )
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.database.uri)
    }

    // Find and delete generation belonging to the user
    const generation = await GenerationHistory.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!generation) {
      return NextResponse.json(
        { success: false, error: 'Generation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Generation deleted successfully',
      },
      { status: 204 }
    )

  } catch (error) {
    console.error('Delete generation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete generation' },
      { status: 500 }
    )
  }
}