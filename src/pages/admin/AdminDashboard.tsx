import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Navbar } from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Users,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  BookOpen,
  Package,
  Activity,
  Loader2,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Order } from '../../types/database'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts'

interface MonthlySales {
  month: string
  sales: number
}

interface TemplatePopularity {
  title: string
  purchases: number
}

interface StoryTemplate {
  id: string
  slug: string
  title: string
  description: string
  cover_image_url: string | null
  price_eur: number
  gender: string
  tags: string[] | null
  is_published: boolean
  json_url_boy: string | null
  json_url_girl: string | null
  created_at: string
}

export function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlySalesData, setMonthlySalesData] = useState<MonthlySales[]>([])
  const [templatePopularityData, setTemplatePopularityData] = useState<TemplatePopularity[]>([])
  const [templates, setTemplates] = useState<StoryTemplate[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<StoryTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    storiesCreated: 0,
  })
  const [conversionRate, setConversionRate] = useState(0)
  const [abandonmentRate, setAbandonmentRate] = useState(0)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: true })

      if (ordersError) throw ordersError

      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id')

      if (usersError) throw usersError

      const { data: storiesData, error: storiesError } = await supabase
        .from('saved_stories')
        .select('id')

      if (storiesError) throw storiesError

      const { data: templatesData, error: templatesError } = await supabase
        .from('story_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (templatesError) throw templatesError

      setOrders(ordersData || [])
      setTemplates(templatesData || [])

      const totalRevenue = (ordersData || []).reduce(
        (sum, order) => sum + Number(order.total_amount),
        0
      )

      setStats({
        totalRevenue,
        totalOrders: ordersData?.length || 0,
        activeUsers: usersData?.length || 0,
        storiesCreated: storiesData?.length || 0,
      })

      const salesByMonth = aggregateSalesByMonth(ordersData || [])
      setMonthlySalesData(salesByMonth)

      const templatePopularity = aggregateTemplatePopularity(ordersData || [])
      setTemplatePopularityData(templatePopularity)

      const { data: analyticsData } = await supabase
        .from('analytics_events')
        .select('event_type, session_id')

      const uniqueVisitors = new Set(
        (analyticsData || [])
          .filter((e) => e.event_type === 'page_view')
          .map((e) => e.session_id)
      ).size

      const completedOrdersCount = ordersData?.length || 0
      const totalStoriesCreated = storiesData?.length || 0

      let calculatedConversionRate = 0
      let calculatedAbandonmentRate = 0

      if (uniqueVisitors > 0) {
        calculatedConversionRate = (completedOrdersCount / uniqueVisitors) * 100
      } else if (usersData && usersData.length > 0) {
        calculatedConversionRate = (completedOrdersCount / usersData.length) * 100
      }

      if (totalStoriesCreated > 0) {
        calculatedAbandonmentRate =
          ((totalStoriesCreated - completedOrdersCount) / totalStoriesCreated) * 100
      }

      setConversionRate(calculatedConversionRate)
      setAbandonmentRate(Math.max(0, calculatedAbandonmentRate))
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const aggregateSalesByMonth = (orders: Order[]): MonthlySales[] => {
    const monthlyMap = new Map<string, number>()

    orders.forEach((order) => {
      const date = new Date(order.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })

      const currentTotal = monthlyMap.get(monthLabel) || 0
      monthlyMap.set(monthLabel, currentTotal + Number(order.total_amount))
    })

    const sortedMonths = Array.from(monthlyMap.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0])
        const dateB = new Date(b[0])
        return dateA.getTime() - dateB.getTime()
      })
      .map(([month, sales]) => ({
        month,
        sales: Number(sales.toFixed(2)),
      }))

    if (sortedMonths.length === 0) {
      const currentMonth = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      return [{ month: currentMonth, sales: 0 }]
    }

    return sortedMonths
  }

  const aggregateTemplatePopularity = (orders: Order[]): TemplatePopularity[] => {
    const templateMap = new Map<string, { title: string; count: number }>()

    orders.forEach((order) => {
      order.cart_data.forEach((item) => {
        const existing = templateMap.get(item.slug)
        if (existing) {
          templateMap.set(item.slug, {
            title: existing.title,
            count: existing.count + 1,
          })
        } else {
          templateMap.set(item.slug, {
            title: item.title,
            count: 1,
          })
        }
      })
    })

    const sortedTemplates = Array.from(templateMap.values())
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        title: item.title,
        purchases: item.count,
      }))

    return sortedTemplates
  }

  const handleDeleteClick = (template: StoryTemplate) => {
    setTemplateToDelete(template)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('story_templates')
        .delete()
        .eq('id', templateToDelete.id)

      if (error) throw error

      setTemplates(templates.filter(t => t.id !== templateToDelete.id))
      toast.success('Template deleted')
      setDeleteModalOpen(false)
      setTemplateToDelete(null)
    } catch (err) {
      console.error('Error deleting template:', err)
      toast.error('Failed to delete template')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setTemplateToDelete(null)
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `€${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+0%',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'bg-blue-500',
      change: '+0%',
    },
    {
      label: 'Active Users',
      value: stats.activeUsers.toString(),
      icon: Users,
      color: 'bg-purple-500',
      change: '+0%',
    },
    {
      label: 'Stories Created',
      value: stats.storiesCreated.toString(),
      icon: BookOpen,
      color: 'bg-orange-500',
      change: '+0%',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

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
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/new-template')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                <span>Add New Template</span>
              </button>
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
                <Activity className="h-5 w-5" />
                <span className="font-semibold">Admin Access</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border-2 border-green-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wide">
                    Conversion Rate
                  </h3>
                </div>
                <p className="text-6xl font-bold text-green-700 mb-2">
                  {conversionRate.toFixed(1)}%
                </p>
                <p className="text-sm text-green-600">
                  {stats.totalOrders} orders from {stats.activeUsers} visitors
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-green-700">
                Percentage of visitors who completed a purchase
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-sm border-2 border-orange-200 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <h3 className="text-sm font-semibold text-orange-900 uppercase tracking-wide">
                    Cart Abandonment
                  </h3>
                </div>
                <p className="text-6xl font-bold text-orange-700 mb-2">
                  {abandonmentRate.toFixed(1)}%
                </p>
                <p className="text-sm text-orange-600">
                  {stats.storiesCreated - stats.totalOrders} carts abandoned
                </p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-200">
              <p className="text-xs text-orange-700">
                Stories created but not purchased
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Sales Over Time
            </h2>
          </div>
          {monthlySalesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  formatter={(value: number) => [`€${value.toFixed(2)}`, 'Sales']}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Total Sales (EUR)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No sales data available yet</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Top Selling Templates
            </h2>
          </div>
          {templatePopularityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={templatePopularityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="title"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  formatter={(value: number) => [value, 'Purchases']}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar
                  dataKey="purchases"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="Number of Purchases"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No template sales data available yet</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Recent Orders
              </h2>
            </div>
            {orders.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      €{Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Package className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No orders yet</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Quick Stats
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Average Order Value</p>
                    <p className="text-lg font-bold text-gray-900">
                      €{stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Stories per User</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.activeUsers > 0 ? (stats.storiesCreated / stats.activeUsers).toFixed(1) : '0.0'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Conversion Rate</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.storiesCreated > 0 ? ((stats.totalOrders / stats.storiesCreated) * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
              Story Templates
            </h2>
            <span className="text-sm text-gray-600">
              {templates.length} {templates.length === 1 ? 'template' : 'templates'}
            </span>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No templates yet</p>
              <button
                onClick={() => navigate('/admin/new-template')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Add Your First Template</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="relative h-48 bg-gray-100">
                    {template.cover_image_url ? (
                      <img
                        src={template.cover_image_url}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex items-center space-x-2">
                      {template.is_published ? (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <XCircle className="h-3 w-3" />
                          <span>Draft</span>
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                        {template.gender}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-xl font-bold text-gray-900">
                          €{template.price_eur.toFixed(2)}
                        </span>
                      </div>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {template.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{template.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/admin/edit-template/${template.slug}`)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(template)}
                        className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Delete Template
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{templateToDelete?.title}"? This action cannot be undone.
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
