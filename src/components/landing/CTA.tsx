'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

export function CTA() {
  const { data: session } = useSession()

  return (
    <section className="py-20 bg-primary-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Main content */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Content Creation?
          </h2>

          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of content creators, marketers, and developers who are already
            using AI to create amazing content in seconds, not hours.
          </p>

          {/* Features list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            {[
              'Free to get started',
              'No credit card required',
              '10 free generations daily',
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center justify-center text-primary-100"
              >
                <div className="w-2 h-2 bg-primary-300 rounded-full mr-3" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session ? (
              <Link href="/generator">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4"
                >
                  Start Creating Now
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4"
                >
                  Start Generating Free
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link href="#features">
              <Button
                variant="secondary"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4"
              >
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-primary-500">
            <p className="text-primary-200 text-sm">
              Trusted by content creators at startups, agencies, and Fortune 500 companies
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}