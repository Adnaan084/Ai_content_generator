import { Suspense } from 'react'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Testimonials from '@/components/landing/Testimonials'
import CTA from '@/components/landing/CTA'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/navigation/Footer'
import { LoadingSpinner } from '@/components/ui/Loading'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <Navbar />
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <Hero />
          <Features />
          <Testimonials />
          <CTA />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}