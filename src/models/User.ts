import mongoose, { Schema, Document, Model } from 'mongoose'
import { getDatabase } from '@/lib/mongodb'

export interface IUser extends Document {
  name: string
  email: string
  image?: string
  provider: 'email' | 'google'
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  image: {
    type: String,
    default: null
  },
  provider: {
    type: String,
    required: [true, 'Provider is required'],
    enum: ['email', 'google'],
    default: 'email'
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

// Create indexes
UserSchema.index({ email: 1 }, { unique: true })

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

UserSchema.statics.createOrUpdate = function(userData: {
  name: string
  email: string
  image?: string
  provider: string
}) {
  const { email, ...updateData } = userData
  return this.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      ...updateData,
      email: email.toLowerCase()
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  )
}

// Instance methods
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  userObject.id = userObject._id
  delete userObject._id
  delete userObject.__v
  return userObject
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>
  createOrUpdate(userData: {
    name: string
    email: string
    image?: string
    provider: string
  }): Promise<IUser>
}

// Create and export the model
let User: IUserModel

try {
  User = mongoose.model<IUser, IUserModel>('User', UserSchema) as IUserModel
} catch (error) {
  // Model already exists, get it
  User = mongoose.model<IUser>('User') as IUserModel
}

export default User