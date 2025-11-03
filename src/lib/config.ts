import { z } from 'zod'

// Environment variable validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),

  // NextAuth
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'Google Client Secret is required'),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  OPENAI_ORG_ID: z.string().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
})

// Validate environment variables
const envValidation = envSchema.safeParse(process.env)

if (!envValidation.success) {
  console.error('❌ Invalid environment variables:', envValidation.error.format())
  throw new Error('Invalid environment variables')
}

export const env = envValidation.data

// App configuration
export const config = {
  app: {
    name: 'AI Content Generator',
    description: 'Generate AI-powered content in seconds',
    url: env.NEXTAUTH_URL,
    env: env.NODE_ENV,
  },

  auth: {
    secret: env.NEXTAUTH_SECRET,
    providers: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    session: {
      strategy: 'database' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      updateAge: 24 * 60 * 60, // 1 day
    },
  },

  openai: {
    apiKey: env.OPENAI_API_KEY,
    orgId: env.OPENAI_ORG_ID,
    models: {
      text: 'gpt-4-turbo-preview',
      image: 'dall-e-3',
      code: 'gpt-4-turbo-preview',
    },
    defaults: {
      maxTokens: 500,
      temperature: 0.7,
    },
  },

  database: {
    uri: env.MONGODB_URI,
  },

  limits: {
    freeUser: {
      dailyGenerations: 10,
      monthlyGenerations: 100,
      maxPromptLength: 2000,
    },
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },

  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  contentTypes: {
    'blog-title': {
      id: 'blog-title',
      name: 'Blog Titles',
      description: 'Generate compelling blog post titles',
      icon: '📝',
      model: 'gpt-4-turbo-preview',
      maxTokens: 50,
      temperature: 0.7,
      promptTemplate: 'Generate 5 compelling blog titles about: {prompt}',
    },
    'product-description': {
      id: 'product-description',
      name: 'Product Descriptions',
      description: 'Write compelling product descriptions',
      icon: '🛍️',
      model: 'gpt-4-turbo-preview',
      maxTokens: 200,
      temperature: 0.6,
      promptTemplate: 'Write a compelling product description for: {prompt}',
    },
    'tagline': {
      id: 'tagline',
      name: 'Taglines/Slogans',
      description: 'Create catchy taglines and slogans',
      icon: '💡',
      model: 'gpt-4-turbo-preview',
      maxTokens: 30,
      temperature: 0.8,
      promptTemplate: 'Create 5 catchy taglines for: {prompt}',
    },
    'code-snippet': {
      id: 'code-snippet',
      name: 'Code Snippets',
      description: 'Generate code snippets with comments',
      icon: '💻',
      model: 'gpt-4-turbo-preview',
      maxTokens: 500,
      temperature: 0.2,
      promptTemplate: 'Generate a code snippet for: {prompt}. Include comments and explanations.',
    },
    'image': {
      id: 'image',
      name: 'Image Generation',
      description: 'Generate images from text descriptions',
      icon: '🎨',
      model: 'dall-e-3',
      maxTokens: 0,
      temperature: 0,
      promptTemplate: '{prompt}',
    },
  },
}

export default config