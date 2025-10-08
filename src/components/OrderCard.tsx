import React, { useState } from 'react'
import { Download, Calendar, Package, AlertCircle, Loader2 } from 'lucide-react'
import { Order, ChildProfile } from '../types/database'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface OrderCardProps {
  order: Order
  childProfile?: ChildProfile | null
}

export function OrderCard({ order, childProfile }: OrderCardProps) {
  const [downloading, setDownloading] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleDownload = async () => {
    if (!order.download_url) {
      toast.error('Download unavailable. Contact support if this is an error.')
      return
    }

    setDownloading(true)
    toast.loading('Preparing your download...', { id: 'download' })

    try {
      const userId = order.user_id
      const filePath = `${userId}/${order.id}.pdf`

      const { data, error } = await supabase.storage
        .from('purchases')
        .createSignedUrl(filePath, 3600)

      if (error) {
        console.error('Error creating signed URL:', error)

        const response = await fetch(order.download_url)
        if (!response.ok) throw new Error('Failed to download')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `story-${order.id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else if (data) {
        const a = document.createElement('a')
        a.href = data.signedUrl
        a.download = `story-${order.id}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }

      toast.success('Your coloring book is downloading!', { id: 'download' })
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download. Please try again.', { id: 'download' })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {childProfile && (
              <span className="text-3xl">{childProfile.avatar}</span>
            )}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{formatDate(order.created_at)}</span>
              </div>
              {order.is_gift && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                  Gift Order
                </span>
              )}
            </div>
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              order.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : order.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {order.status === 'completed' ? '✓ Paid' : order.status}
          </span>
        </div>

        <div className="space-y-2">
          {order.cart_data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-t border-gray-100">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600">
                  For: <span className="font-medium">{item.childName}</span>
                  <span className="mx-2">•</span>
                  {item.gender === 'boy' ? '👦 Boy' : '👧 Girl'}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-700">€{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Total: €{order.total_amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {order.cart_data.length} item{order.cart_data.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {order.status === 'completed' && order.download_url ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          ) : order.status === 'completed' && !order.download_url ? (
            <div className="flex items-center space-x-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Processing...</span>
            </div>
          ) : null}
        </div>

        {order.delivery_email && (
          <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            Delivered to: {order.delivery_email}
          </p>
        )}
      </div>
    </div>
  )
}
