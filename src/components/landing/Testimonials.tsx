'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { StarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  }

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Content Marketing Manager',
      company: 'TechStart Inc.',
      content: 'This AI content generator has revolutionized our content creation process. What used to take hours now takes minutes. The quality is consistently excellent!',
      rating: 5,
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Developer & Tech Blogger',
      company: 'CodeCraft',
      content: 'As a developer, I love the code snippet generation feature. It helps me create examples and documentation quickly. The code is clean and well-commented.',
      rating: 5,
      avatar: 'MC',
    },
    {
      name: 'Emily Rodriguez',
      role: 'E-commerce Store Owner',
      company: 'Boutique Finds',
      content: 'The product descriptions have significantly improved our conversion rates. The AI understands our brand voice and creates compelling copy that sells.',
      rating: 5,
      avatar: 'ER',
    },
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <React.Fragment key={i}>
        {i < rating ? (
          <StarIconSolid className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarIcon className="h-5 w-5 text-gray-300" />
        )}
      </React.Fragment>
    ))
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-500 mr-2" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Loved by Content Creators
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what our users are saying about their experience with our AI content generator
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary-600 font-semibold">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-primary-600">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  10K+
                </div>
                <div className="text-gray-600 text-sm">
                  Active Users
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  500K+
                </div>
                <div className="text-gray-600 text-sm">
                  Content Generated
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  99.9%
                </div>
                <div className="text-gray-600 text-sm">
                  Uptime
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  4.9★
                </div>
                <div className="text-gray-600 text-sm">
                  User Rating
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}