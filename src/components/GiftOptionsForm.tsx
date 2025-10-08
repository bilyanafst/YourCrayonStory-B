import React from 'react'
import { Gift, Mail, User, MessageSquare, Calendar } from 'lucide-react'
import { GiftInfo } from '../types/database'

interface GiftOptionsFormProps {
  isGift: boolean
  onToggleGift: (checked: boolean) => void
  giftInfo: GiftInfo
  onGiftInfoChange: (info: GiftInfo) => void
}

export function GiftOptionsForm({
  isGift,
  onToggleGift,
  giftInfo,
  onGiftInfoChange,
}: GiftOptionsFormProps) {
  const handleChange = (field: keyof GiftInfo, value: string) => {
    onGiftInfoChange({
      ...giftInfo,
      [field]: value,
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isGift}
            onChange={(e) => onToggleGift(e.target.checked)}
            className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
          />
          <div className="flex items-center space-x-2">
            <Gift className="h-6 w-6 text-pink-600" />
            <span className="text-lg font-semibold text-gray-900">
              Send as a Gift
            </span>
          </div>
        </label>
      </div>

      {isGift && (
        <div className="mt-4 space-y-4 pl-8 border-l-4 border-pink-300">
          <p className="text-sm text-gray-600 mb-4">
            The personalized story will be sent directly to your recipient's email with a special gift message!
          </p>

          <div>
            <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="recipientName"
                type="text"
                value={giftInfo.recipientName}
                onChange={(e) => handleChange('recipientName', e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Enter recipient's name"
                required={isGift}
              />
              <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="recipientEmail"
                type="email"
                value={giftInfo.recipientEmail}
                onChange={(e) => handleChange('recipientEmail', e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="recipient@example.com"
                required={isGift}
              />
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (Optional)
            </label>
            <div className="relative">
              <textarea
                id="message"
                value={giftInfo.message || ''}
                onChange={(e) => handleChange('message', e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
                placeholder="Add a personal message to your gift..."
                rows={3}
              />
              <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This message will be included in the gift email
            </p>
          </div>

          <div>
            <label htmlFor="sendAt" className="block text-sm font-medium text-gray-700 mb-2">
              Send Date (Optional)
            </label>
            <div className="relative">
              <input
                id="sendAt"
                type="date"
                value={giftInfo.sendAt || today}
                onChange={(e) => handleChange('sendAt', e.target.value)}
                min={today}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave as today to send immediately after purchase
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-2">
              <Gift className="h-5 w-5 text-pink-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Complete your purchase as normal</li>
                  <li>We'll send the personalized story to {giftInfo.recipientEmail || 'the recipient'}</li>
                  <li>Your gift message will be included</li>
                  <li>You'll receive a confirmation of the gift delivery</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
