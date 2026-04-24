import Order from '../models/Order.js'

// @desc    Create a new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingPrice,
            total,
        } = req.body

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' })
        }

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingPrice,
            total,
        })

        res.status(201).json(order)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
        res.json(orders)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get single order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email')
        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }
        res.json(order)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get all orders (admin)
// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
        res.json(orders)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id
export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }

        order.orderStatus = req.body.orderStatus || order.orderStatus
        order.paymentStatus = req.body.paymentStatus || order.paymentStatus

        const updated = await order.save()
        res.json(updated)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}