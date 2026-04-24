import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            name: String,
            price: Number,
            quantity: Number,
            size: String,
            color: String,
            image: String,
        }
    ],
    shippingAddress: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String,
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'cod'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'shipped', 'delivered', 'cancelled'],
        default: 'processing',
    },
    subtotal: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    total: { type: Number, required: true },
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)