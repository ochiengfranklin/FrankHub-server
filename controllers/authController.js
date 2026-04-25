import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Newsletter from '../models/Newsletter.js'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Subscribe to newsletter
// @route   POST /api/auth/newsletter
export const subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ message: 'Email is required' })

        const existing = await Newsletter.findOne({ email })
        if (existing) return res.status(400).json({ message: 'Email already subscribed' })

        await Newsletter.create({ email })
        res.status(201).json({ message: 'Subscribed successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: 'No account found with that email' })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')

        // Hash token and save to user
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000 // 15 minutes

        await user.save()

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

        // Send email via Resend
        await resend.emails.send({
            from: 'FrankHub <onboarding@resend.dev>',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #ea2e0e;">FrankHub Password Reset</h2>
                    <p>Hi ${user.name},</p>
                    <p>You requested a password reset. Click the button below to reset your password.</p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #ea2e0e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
                        Reset Password
                    </a>
                    <p>This link expires in <strong>15 minutes</strong>.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>— The FrankHub Team</p>
                </div>
            `,
        })

        res.json({ message: 'Password reset email sent' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        })

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' })
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(req.body.password, salt)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save()

        res.json({ message: 'Password reset successful' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}