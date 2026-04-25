import express from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
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

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        const user = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            token,
        }

        // Redirect to frontend with user data as query params
        res.redirect(`${process.env.CLIENT_URL}/oauth-success?user=${encodeURIComponent(JSON.stringify(user))}`)
    }
)

export default router