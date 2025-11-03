'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import {
  SparklesIcon,
  ArrowDownIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

export function Hero() {
  const { data: session } = useSession()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Blog Titles',
      description: 'Generate compelling blog post titles that capture attention',
    },
    {
      icon: CodeBracketIcon,
      title: 'Code Snippets',
      description: 'Create clean, commented code examples for any language',
    },
    {
      icon: PhotoIcon,
      title: 'Images',
      description: 'Generate stunning visuals from text descriptions',
    },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Powered by Advanced AI Technology
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Generate AI-Powered
            <span className="text-primary-600"> Content</span>
            <br />
            in Seconds
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Create blog titles, product descriptions, taglines, and code snippets
            with advanced artificial intelligence. Transform your ideas into compelling content instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            {session ? (
              <Link href="/generator">
                <Button size="lg" className="text-lg px-8 py-4">
                  Start Creating
                  <SparklesIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-4">
                  Start Generating Free
                  <SparklesIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link href="#features">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
                View Features
              </Button>
            </Link>
          </motion.div>

          {/* Quick features showcase */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4 mx-auto">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={itemVariants}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <a href="#features" className="text-gray-400 hover:text-primary-600 transition-colors">
              <ArrowDownIcon className="h-6 w-6" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}