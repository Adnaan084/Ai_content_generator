import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserAnalytics extends Document {
  userId: mongoose.Types.ObjectId
  date: Date
  generationsCount: number
  wordsGenerated: number
  imagesGenerated: number
  codeSnippetsGenerated: number
  createdAt: Date
  updatedAt: Date
}

const UserAnalyticsSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true,
    validate: {
      validator: function(this: IUserAnalytics, date: Date) {
        return date <= new Date()
      },
      message: 'Date cannot be in the future'
    }
  },
  generationsCount: {
    type: Number,
    required: true,
    min: [0, 'Generation count cannot be negative'],
    default: 0
  },
  wordsGenerated: {
    type: Number,
    required: true,
    min: [0, 'Word count cannot be negative'],
    default: 0
  },
  imagesGenerated: {
    type: Number,
    required: true,
    min: [0, 'Image count cannot be negative'],
    default: 0
  },
  codeSnippetsGenerated: {
    type: Number,
    required: true,
    min: [0, 'Code snippet count cannot be negative'],
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Create compound unique index on userId + date
UserAnalyticsSchema.index({ userId: 1, date: 1 }, { unique: true })
UserAnalyticsSchema.index({ date: 1 })

// Static methods
UserAnalyticsSchema.statics.upsertDailyStats = function(
  userId: string,
  date: Date,
  stats: {
    generationsCount?: number
    wordsGenerated?: number
    imagesGenerated?: number
    codeSnippetsGenerated?: number
  }
) {
  const query = {
    userId: new mongoose.Types.ObjectId(userId),
    date: date
  }

  const update = {
    $inc: stats,
    $setOnInsert: {
      userId: new mongoose.Types.ObjectId(userId),
      date: date
    }
  }

  return this.findOneAndUpdate(
    query,
    update,
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  )
}

UserAnalyticsSchema.statics.getUserAnalytics = function(
  userId: string,
  period: '7d' | '30d' | '90d' | '1y' = '30d'
) {
  const now = new Date()
  let dateFrom: Date

  switch (period) {
    case '7d':
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case '1y':
      dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
  }

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: dateFrom, $lte: now }
      }
    },
    {
      $group: {
        _id: null,
        totalGenerations: { $sum: '$generationsCount' },
        totalWords: { $sum: '$wordsGenerated' },
        totalImages: { $sum: '$imagesGenerated' },
        totalCodeSnippets: { $sum: '$codeSnippetsGenerated' },
        dailyAverage: { $avg: '$generationsCount' },
        maxDailyGenerations: { $max: '$generationsCount' },
        activeDays: { $sum: 1 }
      }
    }
  ])
}

UserAnalyticsSchema.statics.getDailyUsage = function(
  userId: string,
  days: number = 30
) {
  const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: dateFrom }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$date'
          }
        },
        generations: { $sum: '$generationsCount' },
        words: { $sum: '$wordsGenerated' },
        images: { $sum: '$imagesGenerated' },
        codeSnippets: { $sum: '$codeSnippetsGenerated' }
      }
    },
    { $sort: { _id: 1 } }
  ])
}

UserAnalyticsSchema.statics.getTypeDistribution = function(userId: string) {
  const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: dateFrom }
      }
    },
    {
      $group: {
        _id: null,
        blogTitles: { $sum: '$generationsCount' }, // Simplified - should track by type
        productDescriptions: { $sum: '$generationsCount' },
        taglines: { $sum: '$generationsCount' },
        codeSnippets: { $sum: '$codeSnippetsGenerated' },
        images: { $sum: '$imagesGenerated' }
      }
    }
  ])
}

UserAnalyticsSchema.statics.getStreakDays = function(userId: string) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        generationsCount: { $gt: 0 }
      }
    },
    { $sort: { date: -1 } },
    {
      $group: {
        _id: null,
        dates: { $push: '$date' },
        count: { $sum: 1 }
      }
    }
  ])
}

UserAnalyticsSchema.statics.checkDailyLimit = function(userId: string, limit: number = 10) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    date: { $gte: today }
  })
}

export interface IUserAnalyticsModel extends Model<IUserAnalytics> {
  upsertDailyStats(
    userId: string,
    date: Date,
    stats: {
      generationsCount?: number
      wordsGenerated?: number
      imagesGenerated?: number
      codeSnippetsGenerated?: number
    }
  ): Promise<IUserAnalytics>
  getUserAnalytics(userId: string, period?: '7d' | '30d' | '90d' | '1y'): Promise<any[]>
  getDailyUsage(userId: string, days?: number): Promise<any[]>
  getTypeDistribution(userId: string): Promise<any[]>
  getStreakDays(userId: string): Promise<any[]>
  checkDailyLimit(userId: string, limit?: number): Promise<IUserAnalytics | null>
}

// Create and export the model
let UserAnalytics: IUserAnalyticsModel

try {
  UserAnalytics = mongoose.model<IUserAnalytics, IUserAnalyticsModel>(
    'UserAnalytics',
    UserAnalyticsSchema
  ) as IUserAnalyticsModel
} catch (error) {
  UserAnalytics = mongoose.model<IUserAnalytics>('UserAnalytics') as IUserAnalyticsModel
}

export default UserAnalytics