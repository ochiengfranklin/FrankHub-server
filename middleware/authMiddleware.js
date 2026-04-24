import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
    try {
        let token

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            // ensures that the user's hashed password is NOT attached to the request object.
            req.user = await User.findById(decoded.id).select('-password')

            next()
        } else {
            res.status(401).json({ message: 'Not authorized, no token' })
        }
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' })
    }
}

export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next()
    } else {
        res.status(403).json({ message: 'Not authorized as admin' })
    }
}