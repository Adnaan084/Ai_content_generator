import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import GenerationHistory from '@/models/GenerationHistory'
import mongoose from 'mongoose'
import { config } from '@/lib/config'

// Query validation schema
const historyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(config.pagination.maxLimit).default(config.pagination.defaultLimit),
  type: z.enum(['blog-title', 'product-description', 'tagline', 'code-snippet', 'image']).optional(),
  search: z.string().max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  favorites: z.enum(['true', 'false']).optional(),
})

// Request body schema for bulk operations
const bulkOperationSchema = z.object({
  action: z.enum(['delete', 'favorite', 'unfavorite']),
  ids: z.array(z.string()).min(1).max(50),
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

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url)
    const queryValidation = historyQuerySchema.safeParse(Object.fromEntries(searchParams))

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: queryValidation.error.errors.map(e => e.message).join(', ')
        },
        { status: 400 }
      )
    }

    const { page, limit, type, search, dateFrom, dateTo, favorites } = queryValidation.data

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.database.uri)
    }

    // Build filter object
    const filter: any = { userId: session.user.id }

    if (type) {
      filter.type = type
    }

    if (search) {
      filter.$or = [
        { prompt: { $regex: search, $options: 'i' } },
        { result: { $regex: search, $options: 'i' } }
      ]
    }

    if (favorites === 'true') {
      filter.isFavorite = true
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }

    // Get total count for pagination
    const total = await GenerationHistory.countDocuments(filter)

    // Get paginated results
    const generations = await GenerationHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('_id type prompt result wordCount isFavorite createdAt updatedAt')

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        items: generations,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
    })

  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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
    const validation = bulkOperationSchema.safeParse(body)

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

    const { action, ids } = validation.data

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.database.uri)
    }

    // Verify all IDs belong to the current user
    const userGenerations = await GenerationHistory.find({
      _id: { $in: ids },
      userId: session.user.id,
    }).select('_id')

    const validIds = userGenerations.map(gen => gen._id.toString())

    if (validIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid generations found' },
        { status: 404 }
      )
    }

    let updateResult

    switch (action) {
      case 'delete':
        updateResult = await GenerationHistory.deleteMany({
          _id: { $in: validIds },
          userId: session.user.id,
        })
        break

      case 'favorite':
        updateResult = await GenerationHistory.updateMany(
          {
            _id: { $in: validIds },
            userId: session.user.id,
          },
          { isFavorite: true }
        )
        break

      case 'unfavorite':
        updateResult = await GenerationHistory.updateMany(
          {
            _id: { $in: validIds },
            userId: session.user.id,
          },
          { isFavorite: false }
        )
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        processedCount: validIds.length,
        modifiedCount: updateResult.modifiedCount || updateResult.deletedCount || 0,
      },
    })

  } catch (error) {
    console.error('Bulk operation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}