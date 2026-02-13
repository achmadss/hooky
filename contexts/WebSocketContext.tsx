'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketContextType {
    socket: Socket | null
    isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
    socket: null,
    isConnected: false,
})

export function useWebSocket() {
    return useContext(WebSocketContext)
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const initialized = useRef(false)

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true

        // Task 10.4 / 20.2: Initialize Socket.io client with auto-reconnect
        const socketInstance = io({
            path: '/socket.io',
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        })

        socketInstance.on('connect', () => {
            setIsConnected(true)
        })

        socketInstance.on('disconnect', () => {
            setIsConnected(false)
        })

        socketInstance.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err)
            setIsConnected(false)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    return (
        <WebSocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    )
}
