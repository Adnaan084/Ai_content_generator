import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from '@/lib/mongodb'
import { config } from '@/lib/config'
import User from '@/models/User'
import mongoose from 'mongoose'

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: config.auth.providers.google.clientId,
      clientSecret: config.auth.providers.google.clientSecret,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    // Email provider can be configured if SMTP settings are available
    ...(process.env.SMTP_HOST
      ? [
          EmailProvider({
            server: {
              host: process.env.SMTP_HOST,
              port: process.env.SMTP_PORT,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            },
            from: process.env.SMTP_USER,
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'database',
    maxAge: config.auth.session.maxAge,
    updateAge: config.auth.session.updateAge,
  },
  secret: config.auth.secret,
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/welcome',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Connect to database
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(config.database.uri)
        }

        // Create or update user in our custom User model
        const userData = {
          name: user.name || '',
          email: user.email || '',
          image: user.image,
          provider: account?.provider || 'email',
        }

        await User.createOrUpdate(userData)
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      // Persist additional user data to token
      if (user) {
        token.id = user.id
        token.provider = account?.provider
      }
      return token
    },

    async session({ session, token, user }) {
      // Send additional user data to client
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email, 'Provider:', account?.provider)

      if (isNewUser) {
        console.log('New user registered:', user.email)
        // TODO: Send welcome email, create initial analytics, etc.
      }
    },

    async signOut({ session, token }) {
      console.log('User signed out:', session?.user?.email)
    },

    async createUser({ user }) {
      console.log('New user created in database:', user.email)
    },
  },
  debug: config.app.env === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }