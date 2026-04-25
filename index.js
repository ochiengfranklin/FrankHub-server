import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'
import session from 'express-session'
import passport from './config/passport.js'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

connectDB()

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}))

app.use(express.json())

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per 15 minutes
    message: { message: 'Too many requests, please try again later.' },
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max 10 login/register attempts per 15 minutes
    message: { message: 'Too many attempts, please try again later.' },
})

// Apply rate limiting
app.use('/api', limiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)

// Sanitization
app.use(mongoSanitize()) // prevent MongoDB operator injection
app.use(xss()) // prevent XSS attacks

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
    res.send('FrankHub API is running...')
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})