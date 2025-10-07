import React from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { ShoppingCart, X, CreditCard, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
  onContinueBrowsing: () => void
  bookTitle: string
  childName: string
}

export function CartModal({ 
  isOpen, 
  onClose, 
  onCheckout, 
  onContinueBrowsing, 
  bookTitle, 
  childName 
}: CartModalProps) {
  const { user } = useAuth()

  const handleCheckout = () => {
    if (!user) {
      // Save checkout intent before redirecting to login
      localStorage.setItem('redirectAfterLogin', '/checkout')
    }
    onCheckout()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
                    Added to Cart!
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>"{bookTitle}"</strong> for <strong>{childName}</strong> has been added to your cart!
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 text-center">
                    What would you like to do next?
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    ✅ Checkout Now
                  </button>
                  
                  <button
                    onClick={onContinueBrowsing}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    🎨 Continue Browsing
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}