'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { ToastType } from './ToastContext'

interface ToastProps {
    message: string
    type: ToastType
    onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        const duration = type === 'error' ? 5000 : 3000
        const timer = setTimeout(() => {
            setIsExiting(true)
            setTimeout(onClose, 300)
        }, duration)
        return () => clearTimeout(timer)
    }, [onClose, type])

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(onClose, 300)
    }

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
        info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    }

    const bgColors = {
        success: 'bg-white dark:bg-zinc-800 border-green-300 dark:border-green-700',
        error: 'bg-white dark:bg-zinc-800 border-red-300 dark:border-red-700',
        warning: 'bg-white dark:bg-zinc-800 border-yellow-300 dark:border-yellow-700',
        info: 'bg-white dark:bg-zinc-800 border-blue-300 dark:border-blue-700',
    }

    const textColors = {
        success: 'text-green-900 dark:text-green-100',
        error: 'text-red-900 dark:text-red-100',
        warning: 'text-yellow-900 dark:text-yellow-100',
        info: 'text-blue-900 dark:text-blue-100',
    }

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${isExiting ? 'animate-fade-out' : 'animate-fade-in'} ${bgColors[type]} ${textColors[type]}`}
        >
            {icons[type]}
            <span className="text-sm font-medium">{message}</span>
            <button
                onClick={handleClose}
                className="ml-2 hover:opacity-70 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
