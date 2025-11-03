import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import openaiService from '@/lib/openai'
import GenerationHistory from '@/models/GenerationHistory'
import UserAnalytics from '@/models/UserAnalytics'
import mongoose from 'mongoose'
import { config } from '@/lib/config'

// Request validation schema
const generateRequestSchema = z.object({
  type: z.enum(['blog-title', 'product-description', 'tagline', 'code-snippet', 'image']),
  prompt: z.string().min(3, 'Prompt must be at least 3 characters long').max(2000, 'Prompt cannot exceed 2000 characters'),
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(4000).optional(),
    style: z.enum(['vivid', 'natural']).optional(),
  }).optional(),
})

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
    const validation = generateRequestSchema.safeParse(body)

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

    const { type, prompt, options } = validation.data

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.database.uri)
    }

    // Check daily limits
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dailyUsage = await UserAnalytics.checkDailyLimit(
      session.user.id,
      config.limits.freeUser.dailyGenerations
    )

    if (dailyUsage && dailyUsage.generationsCount >= config.limits.freeUser.dailyGenerations) {
      return NextResponse.json(
        {
          success: false,
          error: `Daily limit of ${config.limits.freeUser.dailyGenerations} generations exceeded. Try again tomorrow.`,
        },
        { status: 429 }
      )
    }

    // Validate prompt content
    const promptValidation = await openaiService.validatePrompt(prompt, type)
    if (!promptValidation.valid) {
      return NextResponse.json(
        { success: false, error: promptValidation.error },
        { status: 400 }
      )
    }

    // Generate content using OpenAI
    const generationResult = await openaiService.generateContent({
      type,
      prompt,
      options,
    })

    if (!generationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate content' },
        { status: 500 }
      )
    }

    // Save generation to database
    const generation = new GenerationHistory({
      userId: session.user.id,
      type,
      prompt,
      result: generationResult.result,
      wordCount: generationResult.result.split(/\s+/).filter(word => word.length > 0).length,
      isFavorite: false,
    })

    await generation.save()

    // Update user analytics
    const analyticsData: any = {
      generationsCount: 1,
      wordsGenerated: generation.wordCount,
    }

    if (type === 'image') {
      analyticsData.imagesGenerated = 1
    } else if (type === 'code-snippet') {
      analyticsData.codeSnippetsGenerated = 1
    }

    await UserAnalytics.upsertDailyStats(
      session.user.id,
      today,
      analyticsData
    )

    // Return success response
    return NextResponse.json({
      success: true,
      result: generationResult.result,
      type,
      id: generation._id.toString(),
      usage: generationResult.usage,
    })

  } catch (error) {
    console.error('Generation API error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 429 }
        )
      }

      if (error.message.includes('prohibited')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }

      if (error.message.includes('OpenAI')) {
        return NextResponse.json(
          { success: false, error: 'AI service temporarily unavailable. Please try again later.' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

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

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20)
    const type = searchParams.get('type')

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.database.uri)
    }

    // Get recent generations
    const filter: any = { userId: session.user.id }
    if (type) {
      filter.type = type
    }

    const generations = await GenerationHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('_id type prompt result wordCount isFavorite createdAt')

    return NextResponse.json({
      success: true,
      data: generations,
    })

  } catch (error) {
    console.error('GET generations API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch generations' },
      { status: 500 }
    )
  }
}