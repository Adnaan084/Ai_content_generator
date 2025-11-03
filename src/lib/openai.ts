import OpenAI from 'openai'
import { config } from './config'
import { GenerationRequest, GenerationResponse } from '@/types'

class OpenAIService {
  private client: OpenAI

  constructor() {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is not configured')
    }

    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
      organization: config.openai.orgId,
    })
  }

  async generateContent(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const contentType = config.contentTypes[request.type]
      if (!contentType) {
        throw new Error(`Invalid content type: ${request.type}`)
      }

      // Check rate limits (implement rate limiting here)
      // await this.checkRateLimit(userId)

      let result: string
      let usage: {
        promptTokens: number
        completionTokens: number
        totalTokens: number
      }

      if (request.type === 'image') {
        const imageResult = await this.generateImage(request)
        result = imageResult.url
        usage = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        }
      } else {
        const textResult = await this.generateText(request, contentType)
        result = textResult.content
        usage = textResult.usage
      }

      // Generate a unique ID for this generation
      const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return {
        success: true,
        result,
        type: request.type,
        id: generationId,
        usage,
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw this.handleError(error)
    }
  }

  private async generateText(
    request: GenerationRequest,
    contentType: any
  ): Promise<{ content: string; usage: any }> {
    const prompt = contentType.promptTemplate.replace('{prompt}', request.prompt)

    const completion = await this.client.chat.completions.create({
      model: contentType.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: request.options?.maxTokens || contentType.maxTokens,
      temperature: request.options?.temperature || contentType.temperature,
      n: 1,
      stream: false,
    })

    const content = completion.choices[0]?.message?.content || ''
    if (!content) {
      throw new Error('No content generated')
    }

    return {
      content: content.trim(),
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    }
  }

  private async generateImage(request: GenerationRequest): Promise<{ url: string }> {
    const prompt = request.prompt.trim()
    if (!prompt) {
      throw new Error('Image prompt cannot be empty')
    }

    const response = await this.client.images.generate({
      model: config.openai.models.image,
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: request.options?.style || 'vivid',
      response_format: 'url',
    })

    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      throw new Error('No image generated')
    }

    return { url: imageUrl }
  }

  private handleError(error: any): Error {
    if (error?.status === 401) {
      return new Error('Invalid API key. Please check your OpenAI configuration.')
    }

    if (error?.status === 429) {
      const resetTime = error?.headers?.['retry-after'] || '60'
      return new Error(
        `Rate limit exceeded. Please try again in ${resetTime} seconds.`
      )
    }

    if (error?.status === 400) {
      return new Error(
        'Invalid request. Please check your prompt and try again.'
      )
    }

    if (error?.status === 403) {
      return new Error(
        'Access forbidden. Your API key may not have the required permissions.'
      )
    }

    if (error?.status === 500 || error?.status === 502 || error?.status === 503) {
      return new Error(
        'OpenAI service is temporarily unavailable. Please try again later.'
      )
    }

    if (error?.code === 'insufficient_quota') {
      return new Error(
        'You have exceeded your OpenAI API quota. Please check your billing settings.'
      )
    }

    if (error?.code === 'model_not_found') {
      return new Error(
        'The requested AI model is not available. Please try again later.'
      )
    }

    if (error?.code === 'content_policy_violation') {
      return new Error(
        'The request was rejected due to content policy violations. Please modify your prompt and try again.'
      )
    }

    // Network or other errors
    if (error?.code === 'ENOTFOUND' || error?.code === 'ETIMEDOUT') {
      return new Error(
        'Unable to connect to OpenAI. Please check your internet connection and try again.'
      )
    }

    // Generic error
    return new Error(
      error?.message || 'An unexpected error occurred while generating content.'
    )
  }

  async validatePrompt(prompt: string, type: string): Promise<{ valid: boolean; error?: string }> {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt cannot be empty' }
    }

    if (prompt.length > config.limits.freeUser.maxPromptLength) {
      return {
        valid: false,
        error: `Prompt cannot exceed ${config.limits.freeUser.maxPromptLength} characters`,
      }
    }

    // Basic content filtering
    const prohibitedWords = [
      'password', 'credit card', 'social security', 'ssn', 'bank account',
      'illegal', 'hack', 'exploit', 'virus', 'malware', 'weapon', 'bomb',
    ]

    const lowerPrompt = prompt.toLowerCase()
    for (const word of prohibitedWords) {
      if (lowerPrompt.includes(word)) {
        return {
          valid: false,
          error: 'Prompt contains prohibited content. Please modify and try again.',
        }
      }
    }

    return { valid: true }
  }

  async estimateTokens(text: string): Promise<number> {
    // Rough estimation: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4)
  }

  async getModelInfo(model: string): Promise<{
    name: string
    maxTokens: number
    costPer1kTokens: number
  }> {
    const models: Record<string, any> = {
      'gpt-4-turbo-preview': {
        name: 'GPT-4 Turbo',
        maxTokens: 128000,
        costPer1kTokens: 0.01,
      },
      'gpt-4': {
        name: 'GPT-4',
        maxTokens: 8192,
        costPer1kTokens: 0.03,
      },
      'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        maxTokens: 4096,
        costPer1kTokens: 0.002,
      },
      'dall-e-3': {
        name: 'DALL-E 3',
        maxTokens: 0,
        costPer1kTokens: 0.04, // per image
      },
    }

    return models[model] || models['gpt-4-turbo-preview']
  }
}

// Create singleton instance
const openaiService = new OpenAIService()

export default openaiService