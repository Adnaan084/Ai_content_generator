import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IGenerationHistory extends Document {
  userId: mongoose.Types.ObjectId
  type: 'blog-title' | 'product-description' | 'tagline' | 'code-snippet' | 'image'
  prompt: string
  result: string
  wordCount: number
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

const GenerationHistorySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Generation type is required'],
    enum: ['blog-title', 'product-description', 'tagline', 'code-snippet', 'image'],
    index: true
  },
  prompt: {
    type: String,
    required: [true, 'Prompt is required'],
    trim: true,
    minlength: [3, 'Prompt must be at least 3 characters long'],
    maxlength: [2000, 'Prompt cannot exceed 2000 characters']
  },
  result: {
    type: String,
    required: [true, 'Result is required'],
    minlength: [1, 'Result cannot be empty']
  },
  wordCount: {
    type: Number,
    required: true,
    min: [0, 'Word count cannot be negative'],
    default: function(this: IGenerationHistory) {
      return this.result.split(/\s+/).filter(word => word.length > 0).length
    }
  },
  isFavorite: {
    type: Boolean,
    default: false,
    index: true
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

// Create indexes for performance
GenerationHistorySchema.index({ userId: 1, createdAt: -1 })
GenerationHistorySchema.index({ type: 1 })
GenerationHistorySchema.index({ isFavorite: 1 })
GenerationHistorySchema.index({ userId: 1, type: 1, createdAt: -1 })

// Pre-save middleware to calculate word count
GenerationHistorySchema.pre('save', function(next) {
  if (this.isModified('result')) {
    this.wordCount = this.result.split(/\s+/).filter(word => word.length > 0).length
  }
  next()
})

// Static methods
GenerationHistorySchema.statics.findByUser = function(
  userId: string,
  options: {
    page?: number
    limit?: number
    type?: string
    search?: string
    dateFrom?: Date
    dateTo?: Date
    favorites?: boolean
  } = {}
) {
  const {
    page = 1,
    limit = 20,
    type,
    search,
    dateFrom,
    dateTo,
    favorites
  } = options

  const query: any = { userId }

  if (type) {
    query.type = type
  }

  if (search) {
    query.$or = [
      { prompt: { $regex: search, $options: 'i' } },
      { result: { $regex: search, $options: 'i' } }
    ]
  }

  if (favorites) {
    query.isFavorite = true
  }

  if (dateFrom || dateTo) {
    query.createdAt = {}
    if (dateFrom) query.createdAt.$gte = dateFrom
    if (dateTo) query.createdAt.$lte = dateTo
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec()
}

GenerationHistorySchema.statics.countByUser = function(
  userId: string,
  filters: any = {}
) {
  const query = { userId, ...filters }
  return this.countDocuments(query)
}

GenerationHistorySchema.statics.getUserStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalGenerations: { $sum: 1 },
        totalWords: { $sum: '$wordCount' },
        favoriteCount: { $sum: { $cond: ['$isFavorite', 1, 0] } },
        blogTitles: { $sum: { $cond: [{ $eq: ['$type', 'blog-title'] }, 1, 0] } },
        productDescriptions: { $sum: { $cond: [{ $eq: ['$type', 'product-description'] }, 1, 0] } },
        taglines: { $sum: { $cond: [{ $eq: ['$type', 'tagline'] }, 1, 0] } },
        codeSnippets: { $sum: { $cond: [{ $eq: ['$type', 'code-snippet'] }, 1, 0] } },
        images: { $sum: { $cond: [{ $eq: ['$type', 'image'] }, 1, 0] } }
      }
    }
  ])
}

GenerationHistorySchema.statics.getUsageByDateRange = function(
  userId: string,
  dateFrom: Date,
  dateTo: Date
) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: dateFrom, $lte: dateTo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        count: { $sum: 1 },
        words: { $sum: '$wordCount' },
        types: {
          $push: '$type'
        }
      }
    },
    { $sort: { _id: 1 } }
  ])
}

// Instance methods
GenerationHistorySchema.methods.toggleFavorite = function() {
  this.isFavorite = !this.isFavorite
  return this.save()
}

export interface IGenerationHistoryModel extends Model<IGenerationHistory> {
  findByUser(
    userId: string,
    options?: {
      page?: number
      limit?: number
      type?: string
      search?: string
      dateFrom?: Date
      dateTo?: Date
      favorites?: boolean
    }
  ): Promise<IGenerationHistory[]>
  countByUser(userId: string, filters?: any): Promise<number>
  getUserStats(userId: string): Promise<any[]>
  getUsageByDateRange(userId: string, dateFrom: Date, dateTo: Date): Promise<any[]>
}

// Create and export the model
let GenerationHistory: IGenerationHistoryModel

try {
  GenerationHistory = mongoose.model<IGenerationHistory, IGenerationHistoryModel>(
    'GenerationHistory',
    GenerationHistorySchema
  ) as IGenerationHistoryModel
} catch (error) {
  GenerationHistory = mongoose.model<IGenerationHistory>('GenerationHistory') as IGenerationHistoryModel
}

export default GenerationHistory