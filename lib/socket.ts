import type { Server as SocketIOServer } from 'socket.io'

// Task 7.1: Global Socket.io singleton — shared between custom server and API routes
declare global {
  var __io: SocketIOServer | undefined
}

export function getIO(): SocketIOServer | null {
  return globalThis.__io ?? null
}

export function setIO(io: SocketIOServer) {
  globalThis.__io = io
}
