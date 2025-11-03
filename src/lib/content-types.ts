import { ContentType } from '@/types'
import { config } from './config'

export const contentTypes: Record<string, ContentType> = config.contentTypes

export function getContentType(type: string): ContentType | null {
  return contentTypes[type] || null
}

export function getAllContentTypes(): ContentType[] {
  return Object.values(contentTypes)
}

export function getContentTypesByCategory(category?: string): ContentType[] {
  if (!category) return getAllContentTypes()

  const categories: Record<string, string[]> = {
    text: ['blog-title', 'product-description', 'tagline'],
    code: ['code-snippet'],
    visual: ['image'],
  }

  const types = categories[category] || []
  return types.map(type => contentTypes[type]).filter(Boolean)
}

export function validateContentType(type: string): boolean {
  return type in contentTypes
}

export function getContentTypeIcon(type: string): string {
  const contentType = getContentType(type)
  return contentType?.icon || '📄'
}

export function getContentTypePrompt(type: string, prompt: string): string {
  const contentType = getContentType(type)
  if (!contentType) return prompt

  return contentType.promptTemplate.replace('{prompt}', prompt)
}