import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        className={cn('animate-spin', sizes[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

interface LoadingSkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function LoadingSkeleton({ className, children }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-gray-100', className)}>
      {children}
    </div>
  )
}

export function LoadingCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      <LoadingSkeleton className="h-4 w-3/4" />
      {Array.from({ length: lines - 1 }, (_, i) => (
        <LoadingSkeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}