import express from 'express'
import {
    registerUser,
    loginUser,
    getUserProfile,
    subscribeNewsletter,
    forgotPassword,
    resetPassword,
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', protect, getUserProfile)
router.post('/newsletter', subscribeNewsletter)
router.post('/forgot-password', forgotPassword)
router.put('/reset-password/:token', resetPassword)

export default router