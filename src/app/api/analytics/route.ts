import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import GenerationHistory from '@/models/GenerationHistory'
import UserAnalytics from '@/models/UserAnalytics'
import mongoose from 'mongoose'
import { config } from '@/lib/config'

// Query validation schema
const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  type: z.enum(['overview', 'usage', 'charts', 'limits']).default('overview'),
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
    const queryValidation = analyticsQuerySchema.safeParse(Object.fromEntries(searchParams))

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

    const { period, type } = queryValidation.data

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.database.uri)
    }

    // Calculate date ranges
    const now = new Date()
    let dateFrom: Date
    let daysToAnalyze: number

    switch (period) {
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        daysToAnalyze = 7
        break
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        daysToAnalyze = 30
        break
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        daysToAnalyze = 90
        break
      case '1y':
        dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        daysToAnalyze = 365
        break
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const response: any = {}

    if (type === 'overview' || type === 'all') {
      // Get overview statistics
      const [overviewStats] = await GenerationHistory.getUserStats(session.user.id)

      response.overview = {
        totalGenerations: overviewStats?.totalGenerations || 0,
        totalWords: overviewStats?.totalWords || 0,
        favoriteCount: overviewStats?.favoriteCount || 0,
        streakDays: await calculateStreakDays(session.user.id),
      }
    }

    if (type === 'usage' || type === 'all') {
      // Get detailed usage data
      const dailyUsage = await UserAnalytics.getDailyUsage(session.user.id, daysToAnalyze)
      const typeDistribution = await getTypeDistribution(session.user.id, dateFrom)
      const timeDistribution = await getTimeDistribution(session.user.id, dateFrom)

      response.usage = {
        dailyGenerations: dailyUsage,
        typeDistribution,
        timeDistribution,
      }
    }

    if (type === 'limits' || type === 'all') {
      // Get current usage and limits
      const todayUsage = await UserAnalytics.checkDailyLimit(
        session.user.id,
        config.limits.freeUser.dailyGenerations
      )

      const dailyUsed = todayUsage?.generationsCount || 0
      const dailyRemaining = Math.max(0, config.limits.freeUser.dailyGenerations - dailyUsed)

      // Calculate monthly usage (last 30 days)
      const monthlyUsage = await GenerationHistory.find({
        userId: session.user.id,
        createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
      }).countDocuments()

      const monthlyRemaining = Math.max(0, config.limits.freeUser.monthlyGenerations - monthlyUsage)

      response.limits = {
        dailyLimit: config.limits.freeUser.dailyGenerations,
        dailyUsed,
        dailyRemaining,
        monthlyLimit: config.limits.freeUser.monthlyGenerations,
        monthlyUsed: monthlyUsage,
        monthlyRemaining,
      }
    }

    return NextResponse.json({
      success: true,
      data: response,
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

// Helper functions
async function calculateStreakDays(userId: string): Promise<number> {
  try {
    const streakData = await UserAnalytics.getStreakDays(userId)

    if (!streakData.length) {
      return 0
    }

    const dates = streakData[0].dates.sort((a: Date, b: Date) => b.getTime() - a.getTime())
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const date of dates) {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)

      const dayDiff = Math.floor((currentDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24))

      if (dayDiff === streak) {
        streak++
      } else {
        break
      }
    }

    return streak
  } catch (error) {
    console.error('Error calculating streak days:', error)
    return 0
  }
}

async function getTypeDistribution(userId: string, dateFrom: Date): Promise<any[]> {
  try {
    const distribution = await GenerationHistory.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    return distribution.map(item => ({
      type: item._id,
      count: item.count,
    }))
  } catch (error) {
    console.error('Error getting type distribution:', error)
    return []
  }
}

async function getTimeDistribution(userId: string, dateFrom: Date): Promise<any[]> {
  try {
    const distribution = await GenerationHistory.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Fill in missing hours with 0 count
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const result = []

    for (const hour of hours) {
      const found = distribution.find(item => item._id === hour)
      result.push({
        hour,
        count: found ? found.count : 0,
      })
    }

    return result
  } catch (error) {
    console.error('Error getting time distribution:', error)
    return []
  }
}