import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import userRoutes from './routes/userRoutes'
import depositRoutes from './routes/depositRoutes'
import withdrawalRoutes from './routes/withdrawalRoutes'
import itemRoutes from './routes/itemRoutes'
import transferRoutes from './routes/transferRoutes'
import depositRateRoutes from './routes/depositRateRoutes'
import giftRoutes from './routes/giftRoutes'
const app: Express = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/users', userRoutes)
app.use('/api/deposits', depositRoutes)
app.use('/api/withdrawals', withdrawalRoutes)
app.use('/api/items', itemRoutes)
app.use('/api/transfers', transferRoutes)
app.use('/api/deposit-rates', depositRateRoutes)
app.use('/api/gifts', giftRoutes)

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  })
})

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/health`)
  })
}

export default app
