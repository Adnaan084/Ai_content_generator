'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  ShoppingBagIcon,
  LightBulbIcon,
  CodeBracketIcon,
  PhotoIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      },
    },
  }

  const contentTypes = [
    {
      icon: DocumentTextIcon,
      title: 'Blog Titles',
      description: 'Generate compelling, SEO-friendly blog post titles that attract readers and improve click-through rates.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: ShoppingBagIcon,
      title: 'Product Descriptions',
      description: 'Create persuasive product descriptions that highlight features, benefits, and drive conversions.',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: LightBulbIcon,
      title: 'Taglines & Slogans',
      description: 'Develop memorable taglines and slogans that capture your brand essence and resonate with audiences.',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: CodeBracketIcon,
      title: 'Code Snippets',
      description: 'Generate clean, well-commented code examples in multiple programming languages.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: PhotoIcon,
      title: 'Image Generation',
      description: 'Create stunning visuals and images from detailed text descriptions using advanced AI.',
      color: 'bg-pink-100 text-pink-600',
    },
  ]

  const features = [
    {
      icon: ChartBarIcon,
      title: 'Usage Analytics',
      description: 'Track your content generation history with detailed analytics and insights.',
    },
    {
      icon: ClockIcon,
      title: 'Generation History',
      description: 'Access all your previous generations with search, filter, and organization tools.',
    },
    {
      icon: StarIcon,
      title: 'Favorites System',
      description: 'Save and organize your favorite generations for quick access and reference.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We never share your content with third parties.',
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Create Amazing Content
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered tools help you generate high-quality content across multiple formats,
            all with a simple and intuitive interface.
          </p>
        </motion.div>

        {/* Content Types Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Content Generation Types
            </h3>
            <p className="text-gray-600">
              Choose from various content types tailored to your specific needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contentTypes.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`w-16 h-16 ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Platform Features
            </h3>
            <p className="text-gray-600">
              Tools and capabilities designed to enhance your content creation workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}