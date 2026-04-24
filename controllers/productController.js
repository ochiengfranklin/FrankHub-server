import Product from '../models/Product.js'
import cloudinary from '../config/cloudinary.js'

// Get all products
export const getProducts = async (req, res) => {
    try {
        const { category, sort, search } = req.query

        let query = {}

        if (category) query.category = category
        if (search) query.name = { $regex: search, $options: 'i' }

        let products = Product.find(query)

        if (sort === 'lowToHigh') products = products.sort({ price: 1 })
        else if (sort === 'highToLow') products = products.sort({ price: -1 })
        else if (sort === 'name') products = products.sort({ name: 1 })

        const result = await products
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//Get single product
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
        res.json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// Create a product
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, sizes, colors, isFeatured, isNewArrival } = req.body

        const images = []
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'frankhub/products',
                })
                images.push({ url: result.secure_url, publicId: result.public_id })
            }
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            sizes: JSON.parse(sizes),
            colors: JSON.parse(colors),
            images,
            isFeatured,
            isNewArrival,
        })

        res.status(201).json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//Update a product
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const { name, description, price, category, sizes, colors, isFeatured, isNewArrival } = req.body

        product.name = name || product.name
        product.description = description || product.description
        product.price = price || product.price
        product.category = category || product.category
        product.sizes = sizes ? JSON.parse(sizes) : product.sizes
        product.colors = colors ? JSON.parse(colors) : product.colors
        product.isFeatured = isFeatured ?? product.isFeatured
        product.isNewArrival = isNewArrival ?? product.isNewArrival

        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            for (const image of product.images) {
                await cloudinary.uploader.destroy(image.publicId)
            }
            // Upload new images
            const images = []
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'frankhub/products',
                })
                images.push({ url: result.secure_url, publicId: result.public_id })
            }
            product.images = images
        }

        const updated = await product.save()
        res.json(updated)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        // Delete images from Cloudinary
        for (const image of product.images) {
            await cloudinary.uploader.destroy(image.publicId)
        }

        await product.deleteOne()
        res.json({ message: 'Product deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}