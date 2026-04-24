import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ["Men's Top Wear", "Men's Bottom Wear", "Women's Top Wear", "Women's Bottom Wear"],
    },
    sizes: {
        type: [String],
        required: true,
    },
    colors: {
        type: [String],
        required: true,
    },
    images: [
        {
            url: { type: String, required: true },
            publicId: { type: String, required: true },
        }
    ],
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isNewArrival: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true })

export default mongoose.model('Product', productSchema)