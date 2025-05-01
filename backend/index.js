import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import authRoutes from './routes/authRoutes.js'
import alertRoutes from './routes/alertRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import messageRoutes from  './routes/messageRoutes.js'
import { connection } from './lib/connection.js'
import { initSocket } from './lib/socket.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config()

const app = express()
const server = http.createServer(app)

initSocket(server)

const PORT = process.env.PORT || 3001

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://landslidedisasterriskmanagmentfrontend.onrender.com'
  ],
  credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/alerts", alertRoutes);
app.use('/api/reports',reportRoutes)
app.use('/api/messages',messageRoutes)
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  connection()
})
