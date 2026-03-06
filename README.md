# AI Content Generator

A modern, full-stack web application that allows users to generate AI-powered content including blog titles, product descriptions, taglines, code snippets, and images using OpenAI's API.

## Features

- 🤖 **AI-Powered Content Generation**: Support for multiple content types using advanced AI models
- 🔐 **Secure Authentication**: Google OAuth and email-based authentication with NextAuth.js
- 📊 **Analytics Dashboard**: Track usage patterns, generation history, and insights
- 📝 **Generation History**: Save, organize, and search through all your generated content
- 🎨 **Modern UI**: Responsive design built with Tailwind CSS and shadcn/ui components
- ⚡ **Real-time Updates**: Live content generation with loading states and error handling
- 📱 **Mobile Responsive**: Optimized experience across all devices

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Notifications**: react-hot-toast

### Backend
- **API**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: OpenAI API
- **Validation**: Zod schemas

### Deployment
- **Platform**: Vercel
- **Database**: MongoDB Atlas
- **Monitoring**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or MongoDB Atlas)
- OpenAI API key
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-content-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-content-generator

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secure-secret-key-here

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # OpenAI
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── generate/      # Content generation API
│   │   ├── history/       # Generation history API
│   │   ├── analytics/     # Analytics API
│   │   └── user/          # User profile API
│   ├── generator/         # Content generator page
│   ├── dashboard/         # Analytics dashboard
│   ├── history/           # Generation history page
│   └── profile/           # User profile page
├── components/            # React components
│   ├── landing/           # Landing page components
│   ├── navigation/        # Navigation components
│   ├── ui/               # Reusable UI components
│   ├── generator/        # Generator-specific components
│   ├── dashboard/        # Dashboard components
│   └── history/          # History page components
├── lib/                  # Utility libraries
│   ├── mongodb.ts        # Database connection
│   ├── openai.ts         # OpenAI integration
│   ├── config.ts         # App configuration
│   └── utils.ts          # Utility functions
├── models/               # Database models
│   ├── User.ts           # User model
│   ├── GenerationHistory.ts # Generation history model
│   └── UserAnalytics.ts  # User analytics model
├── store/                # Zustand state stores
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## API Documentation

### Authentication

#### `GET /api/auth/session`
Get current user session

#### `POST /api/auth/signin/google`
Initiate Google OAuth flow

### Content Generation

#### `POST /api/generate`
Generate AI content

**Request:**
```json
{
  "type": "blog-title" | "product-description" | "tagline" | "code-snippet" | "image",
  "prompt": "Your prompt here",
  "options": {
    "temperature": 0.7,
    "maxTokens": 500,
    "style": "vivid" | "natural"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": "Generated content",
  "type": "blog-title",
  "id": "generation_id",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 20,
    "totalTokens": 30
  }
}
```

### History Management

#### `GET /api/history`
Get generation history with pagination and filters

#### `PUT /api/history/[id]`
Update generation (favorite status)

#### `DELETE /api/history/[id]`
Delete generation

### Analytics

#### `GET /api/analytics`
Get user analytics and usage statistics

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NEXTAUTH_URL` | NextAuth URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `OPENAI_ORG_ID` | OpenAI organization ID | ❌ |
| `SMTP_HOST` | Email SMTP host | ❌ |
| `SMTP_PORT` | Email SMTP port | ❌ |
| `SMTP_USER` | Email SMTP username | ❌ |
| `SMTP_PASS` | Email SMTP password | ❌ |

## Deployment

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Environment Setup for Production

```env
# Production
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.vercel.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

## Rate Limiting

- **Free users**: 10 generations per day
- **API requests**: 100 requests per hour per IP
- **Concurrent generations**: 3 per user

## Security Features

- CSRF protection via NextAuth
- Secure HTTP-only session cookies
- Input validation and sanitization
- Rate limiting on all endpoints
- Content policy enforcement
- HTTPS enforcement in production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
