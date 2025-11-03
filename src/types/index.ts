import { User } from 'next-auth'

export interface ContentType {
  id: string
  name: string
  description: string
  icon: string
  model: string
  maxTokens: number
  temperature: number
  promptTemplate: string
}

export interface GenerationRequest {
  type: 'blog-title' | 'product-description' | 'tagline' | 'code-snippet' | 'image'
  prompt: string
  options?: {
    temperature?: number
    maxTokens?: number
    style?: 'vivid' | 'natural'
  }
}

export interface GenerationResponse {
  success: boolean
  result: string
  type: string
  id: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface GenerationHistory {
  _id: string
  userId: string
  type: string
  prompt: string
  result: string
  wordCount: number
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserAnalytics {
  _id: string
  userId: string
  date: Date
  generationsCount: number
  wordsGenerated: number
  imagesGenerated: number
  codeSnippetsGenerated: number
  createdAt: Date
  updatedAt: Date
}

export interface AnalyticsOverview {
  totalGenerations: number
  totalWords: number
  favoriteCount: number
  streakDays: number
}

export interface UsageData {
  dailyGenerations: { date: string; count: number }[]
  typeDistribution: { type: string; count: number }[]
  timeDistribution: { hour: number; count: number }[]
}

export interface UsageLimits {
  dailyLimit: number
  dailyUsed: number
  dailyRemaining: number
  monthlyLimit: number
  monthlyUsed: number
  monthlyRemaining: number
}

export interface AnalyticsData {
  overview: AnalyticsOverview
  usage: UsageData
  limits: UsageLimits
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  defaultContentType: string
  notifications: {
    email: boolean
    browser: boolean
  }
}

export interface UserProfile {
  id: string
  name: string
  email: string
  image: string | null
  createdAt: string
  preferences: UserPreferences
}

export interface HistoryFilters {
  type?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  favorites?: boolean
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthUser extends User {
  id: string
}