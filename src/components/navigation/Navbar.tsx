'use client'

import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
  HomeIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Generator', href: '/generator', icon: SparklesIcon, protected: true },
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon, protected: true },
    { name: 'History', href: '/history', icon: ClockIcon, protected: true },
  ]

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">
                AI Content Generator
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              if (item.protected && !session) return null

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Authentication & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ''}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  icon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              icon={isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.map((item) => {
                if (item.protected && !session) return null

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              {/* Mobile Authentication */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-3">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || ''}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <UserIcon className="h-10 w-10 text-gray-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {session.user?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      icon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 px-3">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">
                        Sign In / Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}