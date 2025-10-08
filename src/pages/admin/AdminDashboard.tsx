import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Navbar } from '../../components/Navbar'
import {
  BarChart3,
  Users,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  BookOpen,
  Package,
  Activity
} from 'lucide-react'

export function AdminDashboard() {
  const { user } = useAuth()

  const stats = [
    {
      label: 'Total Revenue',
      value: '€0.00',
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+0%',
    },
    {
      label: 'Total Orders',
      value: '0',
      icon: ShoppingBag,
      color: 'bg-blue-500',
      change: '+0%',
    },
    {
      label: 'Active Users',
      value: '0',
      icon: Users,
      color: 'bg-purple-500',
      change: '+0%',
    },
    {
      label: 'Stories Created',
      value: '0',
      icon: BookOpen,
      color: 'bg-orange-500',
      change: '+0%',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
              <Activity className="h-5 w-5" />
              <span className="font-semibold">Admin Access</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Revenue Overview
              </h2>
            </div>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Revenue chart will be displayed here</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Recent Orders
              </h2>
            </div>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Package className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Recent orders will be displayed here</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              User Activity
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">User activity metrics will be displayed here</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Coming Soon</h3>
          <p className="text-blue-700">
            This dashboard will display comprehensive business metrics including revenue charts,
            order analytics, user engagement statistics, and more. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  )
}
