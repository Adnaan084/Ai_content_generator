import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Content Generator - Create Compelling Content in Seconds',
  description: 'Generate blog titles, product descriptions, taglines, and code snippets with advanced AI. Create compelling content in seconds with our powerful AI tools.',
  keywords: ['AI content generator', 'blog titles', 'product descriptions', 'taglines', 'code snippets', 'artificial intelligence', 'content creation'],
  authors: [{ name: 'AI Content Generator' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1976d2',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4caf50',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#f44336',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}