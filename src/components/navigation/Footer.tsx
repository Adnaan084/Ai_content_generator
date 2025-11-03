import React from 'react'
import Link from 'next/link'
import { SparklesIcon, EnvelopeIcon, ShieldCheckIcon as ShieldIcon } from '@heroicons/react/24/outline'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <SparklesIcon className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">AI Content Generator</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Create compelling content in seconds with our advanced AI-powered tools.
              From blog titles to code snippets, we've got you covered.
            </p>
            <div className="flex space-x-4">
              <a
                href="mailto:support@aicontentgen.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <EnvelopeIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/generator" className="text-gray-400 hover:text-white transition-colors">
                  Content Generator
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-gray-400 hover:text-white transition-colors">
                  Generation History
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AI Content Generator. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <ShieldIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400 text-sm">
                Built with security and privacy in mind
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}