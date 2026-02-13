import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { setIO } from '@/lib/socket'
import { startCleanupJob } from '@/lib/cleanup'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT ?? '3000', 10)

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? '/', true)
    handle(req, res, parsedUrl)
  })

  // Task 7.1: Attach Socket.io to the HTTP server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  setIO(io)

  // Task 7.2: Connection handling
  io.on('connection', (socket) => {
    // Task 7.3: Client joins a webhook room to receive real-time updates
    socket.on('join', (webhookId: string) => {
      socket.join(`webhook:${webhookId}`)
    })

    // Task 7.4: Client leaves a webhook room
    socket.on('leave', (webhookId: string) => {
      socket.leave(`webhook:${webhookId}`)
    })

    // Task 7.6: Emit connection status
    socket.emit('connected', { id: socket.id })

    // Task 7.7: Handle disconnection cleanup (Socket.io handles room cleanup automatically)
    socket.on('disconnect', () => {
      // Rooms are cleaned up automatically by Socket.io on disconnect
    })
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
    // Task 8.1: Start cleanup job after server is ready
    startCleanupJob()
  })
})
